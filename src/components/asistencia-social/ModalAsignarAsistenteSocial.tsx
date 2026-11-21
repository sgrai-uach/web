'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  MapPin,
  RefreshCw,
  Search,
  UserCheck,
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/ui/Button';
import { useAsistentesSociales } from '@/hooks/useAsistentesSociales';
import {
  asignarAsistenteSocial,
  AsistenciaSocialServiceError,
} from '@/services/asistenciaSocialService';
import {
  asignarAsistenteSocialSchema,
  type EventoAsistenciaSocialItem,
} from '@/types/asistenciaSocial';
import styles from './ModalAsignarAsistenteSocial.module.css';

interface ModalAsignarAsistenteSocialProps {
  isOpen: boolean;
  onClose: () => void;
  evento: EventoAsistenciaSocialItem | null;
  usuarioId?: string;
  onAsignado: (eventoActualizado: EventoAsistenciaSocialItem) => void;
}

export default function ModalAsignarAsistenteSocial({
  isOpen,
  onClose,
  evento,
  usuarioId,
  onAsignado,
}: ModalAsignarAsistenteSocialProps) {
  const [busqueda, setBusqueda] = useState('');
  const [asistenteSeleccionadoId, setAsistenteSeleccionadoId] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const { asistentes, cargando, recargar } = useAsistentesSociales({
    pagina: 1,
    limite: 50,
    estadoOperativo: 'disponible',
    busqueda,
  });

  if (!isOpen || !evento) return null;

  const disponibles = asistentes.filter((a) => a.estadoOperativo === 'disponible');

  const handleConfirmar = async () => {
    setErrorMensaje(null);

    const validacion = asignarAsistenteSocialSchema.safeParse({
      asistenteSocialId: asistenteSeleccionadoId,
    });

    if (!validacion.success) {
      setErrorMensaje(
        validacion.error.issues[0]?.message || 'Debe seleccionar un asistente social disponible.'
      );
      return;
    }

    setGuardando(true);
    try {
      const actualizado = await asignarAsistenteSocial(
        evento.id,
        validacion.data.asistenteSocialId,
        usuarioId
      );
      onAsignado(actualizado);
      onClose();
    } catch (err: unknown) {
      if (err instanceof AsistenciaSocialServiceError) {
        setErrorMensaje(err.message);
        if (err.statusCode === 409) {
          setAsistenteSeleccionadoId('');
          await recargar();
        }
      } else {
        setErrorMensaje('Ocurrió un error inesperado al asignar el asistente social.');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`Asignar Asistente Social — ${evento.codigo}`}
      onClose={guardando ? () => {} : onClose}
      maxWidth="620px"
      actions={
        <div className={styles.actionsRow}>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={guardando}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleConfirmar}
            disabled={guardando || !asistenteSeleccionadoId}
          >
            <UserCheck size={16} />
            <span>{guardando ? 'Asignando...' : 'Confirmar Asignación'}</span>
          </Button>
        </div>
      }
    >
      <div className={styles.resumenEvento}>
        <div className={styles.resumenTop}>
          <span className={styles.codigoEvento}>{evento.codigo}</span>
          <span className={styles.prioridadTag}>Prioridad {evento.prioridad}</span>
        </div>
        <div className={styles.direccionTexto}>
          <MapPin size={14} color="var(--color-primary-teal, #1B6F7D)" />
          <span>
            {evento.direccionTexto}
            {evento.delegacionNombre ? ` (${evento.delegacionNombre})` : ''}
          </span>
        </div>
      </div>

      {errorMensaje && (
        <div className={styles.alertaError} role="alert">
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{errorMensaje}</span>
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar asistente social disponible por nombre o RUT..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar asistente social disponible"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => recargar()}
          disabled={cargando || guardando}
          title="Actualizar nómina de disponibles"
        >
          <RefreshCw size={14} />
          <span>Actualizar</span>
        </Button>
      </div>

      <div className={styles.listaContainer} role="radiogroup" aria-label="Asistentes sociales disponibles">
        {cargando ? (
          <div className={styles.estadoMensaje}>
            Cargando profesionales disponibles...
          </div>
        ) : disponibles.length === 0 ? (
          <div className={styles.estadoMensaje}>
            No hay asistentes sociales con estado disponible en este momento.
          </div>
        ) : (
          disponibles.map((asistente) => {
            const seleccionado = asistenteSeleccionadoId === asistente.usuarioId;
            return (
              <label
                key={asistente.usuarioId}
                className={`${styles.opcionCard} ${seleccionado ? styles.opcionCardSeleccionada : ''}`}
              >
                <input
                  type="radio"
                  name="asistenteSocialId"
                  value={asistente.usuarioId}
                  checked={seleccionado}
                  onChange={() => setAsistenteSeleccionadoId(asistente.usuarioId)}
                  className={styles.radioInput}
                />
                <div className={styles.opcionInfo}>
                  <div className={styles.opcionHeader}>
                    <span className={styles.nombreProfesional}>{asistente.nombreCompleto}</span>
                    <span className={styles.badgeDisponible}>Disponible</span>
                  </div>
                  <div className={styles.metaProfesional}>
                    <span>RUT: {asistente.rut}</span>
                    {asistente.delegacionNombre && (
                      <span>Delegación: {asistente.delegacionNombre}</span>
                    )}
                    <span>Fichas FIBE activas: {asistente.casosFibeAsignados}</span>
                  </div>
                </div>
              </label>
            );
          })
        )}
      </div>
    </Modal>
  );
}
