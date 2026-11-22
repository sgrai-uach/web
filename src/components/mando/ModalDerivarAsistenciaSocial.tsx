'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  HeartHandshake,
  Info,
  MapPin,
  Phone,
  User,
  UserCheck,
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import SelectorAsistenteSocialDisponible from '@/components/asistencia-social/SelectorAsistenteSocialDisponible';
import {
  AsistenciaSocialServiceError,
  derivarIncidenteAAsistenciaSocial,
} from '@/services/asistenciaSocialService';
import type { IncidenteDetalle, IncidenteResumen } from '@/services/incidentesService';
import { evaluarElegibilidadDerivacionSocial } from '@/lib/utils/asistenciaSocialIncidenteUtils';
import {
  derivarAsistenciaSocialSchema,
  type DerivarAsistenciaSocialResponse,
} from '@/types/asistenciaSocial';
import styles from './ModalDerivarAsistenciaSocial.module.css';

export interface ModalDerivarAsistenciaSocialProps {
  isOpen: boolean;
  onClose: () => void;
  incidente: IncidenteResumen | IncidenteDetalle | null;
  usuarioId?: string;
  onDerivado: (respuesta: DerivarAsistenciaSocialResponse) => void;
}

export function ModalDerivarAsistenciaSocial({
  isOpen,
  onClose,
  incidente,
  usuarioId,
  onDerivado,
}: ModalDerivarAsistenciaSocialProps) {
  const [asistenteSeleccionadoId, setAsistenteSeleccionadoId] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (!isOpen || !incidente) return null;

  const handleClose = () => {
    setAsistenteSeleccionadoId('');
    setObservaciones('');
    setErrorMensaje(null);
    onClose();
  };

  const elegibilidad = evaluarElegibilidadDerivacionSocial(incidente);
  const delegacionNombre =
    'delegacionNombre' in incidente && typeof incidente.delegacionNombre === 'string'
      ? incidente.delegacionNombre
      : 'delegacion' in incidente
        ? incidente.delegacion?.nombre ?? null
        : null;
  const delegacionId =
    'delegacionId' in incidente && typeof incidente.delegacionId === 'string'
      ? incidente.delegacionId
      : 'delegacion' in incidente
        ? incidente.delegacion?.id ?? null
        : null;
  const contactoNombre =
    'informante' in incidente ? incidente.informante?.nombre ?? null : null;
  const contactoTelefono =
    'informante' in incidente ? incidente.informante?.telefono ?? null : null;

  const handleConfirmar = async () => {
    setErrorMensaje(null);

    const validacion = derivarAsistenciaSocialSchema.safeParse({
      incidenteId: incidente.id,
      asistenteSocialId: asistenteSeleccionadoId,
      observaciones: observaciones.trim() ? observaciones.trim() : undefined,
    });

    if (!validacion.success) {
      setErrorMensaje(
        validacion.error.issues[0]?.message ||
          'Debe seleccionar un asistente social disponible para derivar el incidente.'
      );
      return;
    }

    setGuardando(true);
    try {
      const respuesta = await derivarIncidenteAAsistenciaSocial(
        validacion.data,
        usuarioId,
        {
          codigo: incidente.codigo,
          delegacionId,
          delegacionNombre,
          direccion: incidente.direccion,
          prioridad: incidente.prioridad,
          contactoNombre,
          contactoTelefono,
        }
      );
      onDerivado(respuesta);
      handleClose();
    } catch (err: unknown) {
      if (err instanceof AsistenciaSocialServiceError) {
        setErrorMensaje(err.message);
        if (err.statusCode === 409) {
          setAsistenteSeleccionadoId('');
          setRefreshTrigger((prev) => prev + 1);
        }
      } else {
        setErrorMensaje(
          'Ocurrió un error inesperado al derivar el incidente a Asistencia Social.'
        );
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`Derivar a Asistencia Social — ${incidente.codigo}`}
      onClose={guardando ? () => {} : handleClose}
      maxWidth="660px"
      actions={
        <div className={styles.actionsRow}>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleClose}
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
            <span>{guardando ? 'Derivando...' : 'Confirmar Derivación'}</span>
          </Button>
        </div>
      }
    >
      <div className={styles.resumenIncidente}>
        <div className={styles.resumenTop}>
          <div className={styles.codigoGrupo}>
            <span className={styles.codigoIncidente}>{incidente.codigo}</span>
            <Chip variant="success" size="sm">
              Resuelto
            </Chip>
            {elegibilidad.personasAfectadas > 0 && (
              <Chip variant="warning" size="sm">
                {elegibilidad.personasAfectadas} persona(s) damnificada(s)
              </Chip>
            )}
          </div>
          <Chip variant="teal" size="sm">
            FIBE / DGRD
          </Chip>
        </div>

        <div className={styles.metaLista}>
          <div className={styles.metaItem}>
            <MapPin size={14} color="var(--color-primary-teal, #1B6F7D)" />
            <span>
              {incidente.direccion || 'Dirección registrada en incidente'}
              {delegacionNombre ? ` (${delegacionNombre})` : ''}
            </span>
          </div>
          {(contactoNombre || contactoTelefono) && (
            <div className={styles.metaItem}>
              <User size={14} color="var(--color-primary-teal, #1B6F7D)" />
              <span>Contacto: {contactoNombre || 'Registrado en incidente'}</span>
              {contactoTelefono && (
                <>
                  <Phone size={13} color="var(--color-text-muted, #5F676E)" />
                  <span>{contactoTelefono}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.avisoInstitucional}>
        <HeartHandshake size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          Derivación exclusiva para levantamiento de Ficha Básica de Emergencia (FIBE) y gestión
          de vulnerabilidad con la DGRD. Los datos de contacto y dirección del incidente se
          copiarán automáticamente al evento de asistencia social.
        </span>
      </div>

      {elegibilidad.tieneEventoPendiente && elegibilidad.eventoSocial && (
        <div className={styles.avisoUpsert}>
          <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            Este incidente ya registra un evento social pendiente (
            <strong>{elegibilidad.eventoSocial.codigo ?? elegibilidad.eventoSocial.id}</strong>
            ). Al confirmar, se actualizará su estado a <strong>Asignado</strong>.
          </span>
        </div>
      )}

      {errorMensaje && (
        <div className={styles.alertaError} role="alert">
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{errorMensaje}</span>
        </div>
      )}

      <div className={styles.selectorSeccion}>
        <span className={styles.fieldLabel}>
          Seleccionar profesional con rol Asistente Social disponible
        </span>
        <SelectorAsistenteSocialDisponible
          value={asistenteSeleccionadoId}
          onChange={(id) => {
            setAsistenteSeleccionadoId(id);
            setErrorMensaje(null);
          }}
          disabled={guardando}
          refreshTrigger={refreshTrigger}
        />
      </div>

      <div className={styles.observacionesSeccion}>
        <label htmlFor="derivacion-social-observaciones" className={styles.fieldLabel}>
          Observaciones para el profesional (opcional)
        </label>
        <textarea
          id="derivacion-social-observaciones"
          className={styles.textarea}
          maxLength={1000}
          disabled={guardando}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Indicaciones de acceso, grupo familiar afectado o prioridad de evaluación FIBE..."
        />
        <span className={styles.helperText}>{observaciones.length}/500 caracteres</span>
      </div>
    </Modal>
  );
}

export default ModalDerivarAsistenciaSocial;
