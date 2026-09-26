import React from 'react';

interface AvisoDetalleDescarteFormProps {
  motivoDescarte: string;
  onMotivoChange: (val: string) => void;
  procesandoDescarte: boolean;
  onDescartar: () => void;
  onCancelarDescarte: () => void;
}

export default function AvisoDetalleDescarteForm({
  motivoDescarte,
  onMotivoChange,
  procesandoDescarte,
  onDescartar,
  onCancelarDescarte,
}: AvisoDetalleDescarteFormProps) {
  const esValido = motivoDescarte.trim().length >= 5;

  return (
    <div
      style={{
        border: '2px solid #D32F2F',
        padding: '1.25rem',
        backgroundColor: '#FFF8F8',
      }}
    >
      <div
        style={{
          fontSize: '0.9375rem',
          fontWeight: 700,
          color: '#D32F2F',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>Descartar Aviso Preliminar</span>
        <button
          type="button"
          onClick={onCancelarDescarte}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--color-primary-teal, #1B6F7D)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          Volver al flujo de verificación
        </button>
      </div>

      <p style={{ fontSize: '0.8125rem', color: '#555', marginBottom: '0.75rem' }}>
        Indique la razón fundada por la cual se descarta el aviso (ej. reporte falso comprobado, duplicado de aviso anterior o llamada de broma). Mínimo 5 caracteres.
      </p>

      <div style={{ marginBottom: '1rem' }}>
        <textarea
          rows={3}
          value={motivoDescarte}
          onChange={(e) => onMotivoChange(e.target.value)}
          placeholder="Escriba el motivo justificado del descarte (mínimo 5 caracteres)..."
          style={{
            width: '100%',
            padding: '0.625rem',
            border: '1px solid #BAC7D5',
            fontSize: '0.875rem',
            borderRadius: 0,
            fontFamily: 'inherit',
          }}
        />
        <div
          style={{
            fontSize: '0.75rem',
            color: esValido ? '#2E7D32' : '#D32F2F',
            marginTop: '0.25rem',
            textAlign: 'right',
          }}
        >
          {motivoDescarte.trim().length} / 5 caracteres mínimos requeridos
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={onDescartar}
          disabled={procesandoDescarte || !esValido}
          style={{
            flex: 1,
            backgroundColor: '#D32F2F',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: procesandoDescarte || !esValido ? 'not-allowed' : 'pointer',
            opacity: procesandoDescarte || !esValido ? 0.6 : 1,
            borderRadius: 0,
          }}
        >
          {procesandoDescarte ? 'Descartando...' : 'Confirmar Descarte de Aviso'}
        </button>

        <button
          type="button"
          onClick={onCancelarDescarte}
          style={{
            backgroundColor: 'var(--color-charcoal, #3B3F45)',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.75rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            borderRadius: 0,
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
