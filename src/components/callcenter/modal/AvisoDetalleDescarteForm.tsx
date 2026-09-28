import React from 'react';
import Button from '@/components/ui/Button';

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
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancelarDescarte}
          style={{ padding: 0, minHeight: 'auto', textDecoration: 'underline' }}
        >
          Volver al flujo de verificación
        </Button>
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
        <Button
          type="button"
          variant="destructive"
          onClick={onDescartar}
          disabled={procesandoDescarte || !esValido}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          {procesandoDescarte ? 'Descartando...' : 'Confirmar Descarte de Aviso'}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={onCancelarDescarte}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
