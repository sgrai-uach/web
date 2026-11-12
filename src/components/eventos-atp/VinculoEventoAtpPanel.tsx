'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import InlineNotice from '@/components/ui/InlineNotice';
import SelectorEventoAtp from './SelectorEventoAtp';
import {
  desvincularEntidadesEventoAtp,
  vincularEntidadesEventoAtp,
  EventoAtpServiceError,
} from '@/services/eventosAtpService';
import type {
  TipoEntidadVinculable,
  VincularEntidadesInputParcial,
} from '@/types/eventoAtp';
import { usePuedeVincularEventoAtp } from '@/hooks/usePuedeVincularEventoAtp';

export interface VinculoEventoAtpPanelProps {
  tipoEntidad: TipoEntidadVinculable;
  entidadId: string;
  eventoAtpId: string | null;
  eventoAtpCodigo?: string | null;
  onCambio?: (nuevoEventoAtpId: string | null) => void;
}

const CLAVE_POR_TIPO: Record<
  TipoEntidadVinculable,
  keyof VincularEntidadesInputParcial
> = {
  INCIDENTE: 'incidenteIds',
  EVENTO_PREVENCION: 'eventoPrevencionIds',
  RECUPERACION: 'recuperacionIds',
  EVENTO_ASISTENCIA_SOCIAL: 'eventoAsistenciaSocialIds',
};

/**
 * Panel de vinculación/desvinculación de una entidad a un Evento ATP (H60).
 */
export const VinculoEventoAtpPanel: React.FC<VinculoEventoAtpPanelProps> = ({
  tipoEntidad,
  entidadId,
  eventoAtpId,
  eventoAtpCodigo,
  onCambio,
}) => {
  const puedeVincular = usePuedeVincularEventoAtp();
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const clave = CLAVE_POR_TIPO[tipoEntidad];

  const construirInput = (id: string): VincularEntidadesInputParcial => ({
    [clave]: [id],
  });

  const handleVincular = async () => {
    if (!seleccionado) return;

    setProcesando(true);
    setError(null);
    setMensaje(null);

    try {
      await vincularEntidadesEventoAtp(
        seleccionado,
        construirInput(entidadId)
      );
      setMensaje('Entidad vinculada al Evento ATP exitosamente.');
      onCambio?.(seleccionado);
      setSeleccionado(null);
    } catch (err: unknown) {
      setError(
        err instanceof EventoAtpServiceError
          ? err.message
          : 'No fue posible vincular la entidad al Evento ATP.'
      );
    } finally {
      setProcesando(false);
    }
  };

  const handleDesvincular = async () => {
    if (!eventoAtpId) return;

    setProcesando(true);
    setError(null);
    setMensaje(null);

    try {
      await desvincularEntidadesEventoAtp(
        eventoAtpId,
        construirInput(entidadId)
      );
      setMensaje('Entidad desvinculada del Evento ATP exitosamente.');
      onCambio?.(null);
    } catch (err: unknown) {
      setError(
        err instanceof EventoAtpServiceError
          ? err.message
          : 'No fue posible desvincular la entidad del Evento ATP.'
      );
    } finally {
      setProcesando(false);
    }
  };

  if (!puedeVincular) {
    return (
      <section aria-label="Evento ATP vinculado">
        <p style={{ margin: 0, fontSize: '13px', color: '#5F676E' }}>
          {eventoAtpId
            ? `Vinculado al Evento ATP ${eventoAtpCodigo ?? eventoAtpId}.`
            : 'Sin Evento ATP vinculado.'}
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Vinculación a Evento ATP">
      <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>
        Evento ATP
      </h3>

      <div style={{ display: 'grid', gap: '12px' }}>
        <SelectorEventoAtp
          id={`selector-atp-${tipoEntidad.toLowerCase()}-${entidadId}`}
          label="Vincular a Evento ATP activo"
          value={seleccionado}
          onChange={setSeleccionado}
          disabled={procesando}
        />

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            type="button"
            variant="primary"
            onClick={handleVincular}
            disabled={!seleccionado || procesando}
          >
            {eventoAtpId ? 'Reasignar Evento ATP' : 'Vincular Evento ATP'}
          </Button>

          {eventoAtpId && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleDesvincular}
              disabled={procesando}
            >
              Desvincular
            </Button>
          )}
        </div>

        <p style={{ margin: 0, fontSize: '13px', color: '#5F676E' }}>
          {eventoAtpId
            ? `Actualmente vinculado a ${eventoAtpCodigo ?? eventoAtpId}.`
            : 'Sin Evento ATP vinculado.'}
        </p>

        {mensaje && <InlineNotice variant="success">{mensaje}</InlineNotice>}
        {error && <InlineNotice variant="error">{error}</InlineNotice>}
      </div>
    </section>
  );
};

export default VinculoEventoAtpPanel;
