'use client';

import React from 'react';
import type { AvisoItem, TipoIncidenteOpcion } from '@/types/avisos';
import { useAvisoDetalleModal } from '@/hooks/useAvisoDetalleModal';
import AvisoDetalleHeader from './modal/AvisoDetalleHeader';
import AvisoDetalleInformante from './modal/AvisoDetalleInformante';
import AvisoDetalleUbicacion from './modal/AvisoDetalleUbicacion';
import AvisoDetalleEvidencia from './modal/AvisoDetalleEvidencia';
import AvisoDetalleVerificacionForm from './modal/AvisoDetalleVerificacionForm';
import AvisoDetalleDescarteForm from './modal/AvisoDetalleDescarteForm';

export type { TipoIncidenteOpcion };
export const CATALOGO_TIPOS_INCIDENTE: TipoIncidenteOpcion[] = [];

interface AvisoDetalleModalProps {
  aviso: AvisoItem | null;
  operadorId: string;
  onClose: () => void;
  onAccionCompletada: () => void;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(20, 40, 45, 0.65)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 9000, padding: '1rem',
};

const containerStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-white, #FFFFFF)', width: '100%', maxWidth: '920px',
  maxHeight: '90vh', display: 'flex', flexDirection: 'column',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: '1px solid #DFE3E8', position: 'relative',
};

const bodyStyle: React.CSSProperties = {
  padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex',
  flexDirection: 'column', gap: '1.25rem',
};

function AvisoDetalleModalContent({
  aviso,
  operadorId,
  onClose,
  onAccionCompletada,
}: {
  aviso: AvisoItem;
  operadorId: string;
  onClose: () => void;
  onAccionCompletada: () => void;
}) {
  const m = useAvisoDetalleModal({ aviso, operadorId, onClose, onAccionCompletada });
  const datosInf = m.detalle?.datosInformante || {};
  const adjuntos = m.detalle?.adjuntos || [];

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-titulo" style={overlayStyle}>
      <div style={containerStyle}>
        <AvisoDetalleHeader aviso={aviso} onClose={onClose} />
        <div style={bodyStyle}>
          {m.cargandoDetalle && !m.detalle && (
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-light, #ECEFF3)', fontSize: '0.875rem', color: '#555', textAlign: 'center' }}>
              Cargando evidencia adjunta e información del informante...
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
            <AvisoDetalleInformante datosInf={datosInf} aviso={aviso} />
            <AvisoDetalleUbicacion aviso={aviso} datosInf={datosInf} />
          </div>

          <AvisoDetalleEvidencia adjuntos={adjuntos} />

          {!m.modoDescarte ? (
            <AvisoDetalleVerificacionForm
              tipoIncidenteId={m.tipoIncidenteId}
              onTipoIncidenteChange={m.setTipoIncidenteId}
              cargandoTipos={m.cargandoTipos}
              tiposDisponibles={m.tiposDisponibles}
              descripcionAjustada={m.descripcionAjustada}
              onDescripcionChange={m.setDescripcionAjustada}
              requiereAsistenciaSocial={m.requiereAsistenciaSocial}
              onRequiereAsistenciaSocialChange={m.setRequiereAsistenciaSocial}
              procesandoVerificacion={m.procesandoVerificacion}
              onVerificar={m.handleVerificar}
              onActivarDescarte={() => m.setModoDescarte(true)}
            />
          ) : (
            <AvisoDetalleDescarteForm
              motivoDescarte={m.motivoDescarte}
              onMotivoChange={m.setMotivoDescarte}
              procesandoDescarte={m.procesandoDescarte}
              onDescartar={m.handleDescartar}
              onCancelarDescarte={() => m.setModoDescarte(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function AvisoDetalleModal(props: AvisoDetalleModalProps) {
  if (!props.aviso) return null;
  return <AvisoDetalleModalContent key={props.aviso.id} {...props} aviso={props.aviso} />;
}
