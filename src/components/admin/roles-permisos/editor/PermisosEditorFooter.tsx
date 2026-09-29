import React from 'react';
import Button from '@/components/ui/Button';

interface PermisosEditorFooterProps {
  totalSeleccionados: number;
  agregadosCount: number;
  revocadosCount: number;
  guardando: boolean;
  tieneCambios: boolean;
  onGuardar: () => void;
  onCancelar: () => void;
}

export default function PermisosEditorFooter({
  totalSeleccionados,
  agregadosCount,
  revocadosCount,
  guardando,
  tieneCambios,
  onGuardar,
  onCancelar,
}: PermisosEditorFooterProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
        <span style={{ fontWeight: 600, color: 'var(--color-charcoal, #3B3F45)' }}>
          Total activos: {totalSeleccionados}
        </span>
        {tieneCambios && (
          <span style={{ color: 'var(--color-text-muted, #5F676E)', fontSize: '12px' }}>
            ({agregadosCount > 0 ? `+${agregadosCount} a asignar` : ''}
            {agregadosCount > 0 && revocadosCount > 0 ? ', ' : ''}
            {revocadosCount > 0 ? `-${revocadosCount} a revocar` : ''})
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={guardando}
          onClick={onCancelar}
        >
          Cancelar
        </Button>

        <Button
          type="button"
          variant="primary"
          size="md"
          loading={guardando}
          disabled={!tieneCambios || guardando}
          onClick={onGuardar}
        >
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}
