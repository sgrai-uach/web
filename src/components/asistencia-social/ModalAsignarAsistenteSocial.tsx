'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  MapPin,
  UserCheck,
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/ui/Button';
import SelectorAsistenteSocialDisponible from './SelectorAsistenteSocialDisponible';
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
  const [asistenteSeleccionadoId, setAsistenteSeleccionadoId] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (!isOpen || !evento) return null;

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
          setRefreshTrigger((prev) => prev + 1);
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

      <SelectorAsistenteSocialDisponible
        value={asistenteSeleccionadoId}
        onChange={(id) => {
          setAsistenteSeleccionadoId(id);
          setErrorMensaje(null);
        }}
        disabled={guardando}
        refreshTrigger={refreshTrigger}
      />
    </Modal>
  );
}
