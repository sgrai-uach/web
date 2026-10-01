import React from 'react';
import { Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { TipoIncidenteOpcion } from '@/types/avisos';

interface AvisoDetalleVerificacionFormProps {
  tipoIncidenteId: string;
  onTipoIncidenteChange: (id: string) => void;
  cargandoTipos: boolean;
  tiposDisponibles: TipoIncidenteOpcion[];
  descripcionAjustada: string;
  onDescripcionChange: (desc: string) => void;
  requiereAsistenciaSocial: boolean;
  onRequiereAsistenciaSocialChange: (req: boolean) => void;
  procesandoVerificacion: boolean;
  onVerificar: () => void;
  onActivarDescarte: () => void;
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.8125rem', fontWeight: 700,
  color: 'var(--color-charcoal, #3B3F45)', marginBottom: '0.35rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.625rem', border: '1px solid #BAC7D5',
  fontSize: '0.875rem', borderRadius: 0, fontFamily: 'inherit',
};

export default function AvisoDetalleVerificacionForm({
  tipoIncidenteId,
  onTipoIncidenteChange,
  cargandoTipos,
  tiposDisponibles,
  descripcionAjustada,
  onDescripcionChange,
  requiereAsistenciaSocial,
  onRequiereAsistenciaSocialChange,
  procesandoVerificacion,
  onVerificar,
  onActivarDescarte,
}: AvisoDetalleVerificacionFormProps) {
  return (
    <div style={{ border: '2px solid var(--color-accent-mint, #4FAE9B)', padding: '1.25rem', backgroundColor: '#FFFFFF' }}>
      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-primary-teal, #1B6F7D)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Acción: Verificar y Enviar a Operaciones (Encargado)</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onActivarDescarte}
          style={{ color: 'var(--color-danger, #D32F2F)', padding: 0, minHeight: 'auto' }}
        >
          &iquest;Desea descartar este aviso?
        </Button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="tipo-incidente-select" style={labelStyle}>
          Tipología Oficial del Incidente (Catálogo SENAPRED / Municipal):
        </label>
        <select
          id="tipo-incidente-select"
          value={tipoIncidenteId}
          onChange={(e) => onTipoIncidenteChange(e.target.value)}
          disabled={cargandoTipos}
          style={{ ...inputStyle, backgroundColor: cargandoTipos ? '#F1F3F5' : '#FFFFFF' }}
        >
          {cargandoTipos && <option value="">Cargando tipos de incidente...</option>}
          {tiposDisponibles.map((cat, idx) => (
            <option key={`${cat.id}-${idx}`} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="descripcion-ajustada" style={labelStyle}>
          Descripción Formal para Centro de Mando:
        </label>
        <textarea
          id="descripcion-ajustada"
          rows={3}
          value={descripcionAjustada}
          onChange={(e) => onDescripcionChange(e.target.value)}
          placeholder="Ajuste o complemente la descripción para el personal de operaciones..."
          style={inputStyle}
        />
      </div>

      <div style={{ backgroundColor: 'var(--color-bg-light, #ECEFF3)', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '4px solid var(--color-primary-teal, #1B6F7D)' }}>
        <input
          type="checkbox"
          id="check-fibe"
          checked={requiereAsistenciaSocial}
          onChange={(e) => onRequiereAsistenciaSocialChange(e.target.checked)}
          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-primary-teal, #1B6F7D)' }}
        />
        <label htmlFor="check-fibe" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-charcoal, #3B3F45)', cursor: 'pointer' }}>
          Requiere Asistencia Social (Levantamiento Ficha FIBE)
          <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 400, color: '#555', marginTop: '0.15rem' }}>
            Activa la derivación al Panel de Asistentes Sociales según la regla de atención municipal.
          </span>
        </label>
      </div>

      <Button
        type="button"
        variant="primary"
        size="lg"
        onClick={onVerificar}
        disabled={procesandoVerificacion}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {procesandoVerificacion ? (
          'Verificando y Promoviendo a Incidente...'
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Check size={18} aria-hidden="true" />
            <span>Verificar y Enviar a Operaciones</span>
          </span>
        )}
      </Button>
    </div>
  );
}
