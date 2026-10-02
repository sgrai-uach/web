import React from 'react';
import Button from '@/components/ui/Button';
import { Edit3, Check } from 'lucide-react';

interface RolDetalleFooterProps {
  onClose: () => void;
  modoEdicion?: boolean;
  guardando?: boolean;
  tieneCambios?: boolean;
  totalSeleccionados?: number;
  agregadosCount?: number;
  revocadosCount?: number;
  onIniciarEdicion?: () => void;
  onCancelarEdicion?: () => void;
  onGuardarCambios?: () => void;
}

export default function RolDetalleFooter({
  onClose,
  modoEdicion = false,
  guardando = false,
  tieneCambios = false,
  totalSeleccionados = 0,
  agregadosCount = 0,
  revocadosCount = 0,
  onIniciarEdicion,
  onCancelarEdicion,
  onGuardarCambios,
}: RolDetalleFooterProps) {
  if (modoEdicion) {
    return (
      <footer
        style={{
          padding: '1rem 1.5rem',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #DFE3E8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-charcoal, #3B3F45)' }}>
            Total activos: {totalSeleccionados}
          </span>
          {tieneCambios && (
            <span style={{ color: 'var(--color-text-muted, #5F676E)', fontSize: '12px' }}>
              ({agregadosCount > 0 ? `+${agregadosCount}` : ''}
              {agregadosCount > 0 && revocadosCount > 0 ? ', ' : ''}
              {revocadosCount > 0 ? `-${revocadosCount}` : ''})
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={guardando}
            onClick={onCancelarEdicion}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={guardando}
            disabled={!tieneCambios || guardando}
            onClick={onGuardarCambios}
          >
            <Check size={14} aria-hidden="true" />
            <span>Guardar Cambios</span>
          </Button>
        </div>
      </footer>
    );
  }

  return (
    <footer
      style={{
        padding: '1rem 1.5rem',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #DFE3E8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={onIniciarEdicion}
        disabled={!onIniciarEdicion}
        title="Asignar o revocar permisos a este perfil"
      >
        <Edit3 size={14} aria-hidden="true" />
        <span>Modificar Permisos</span>
      </Button>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onClose}
      >
        Cerrar Detalle
      </Button>
    </footer>
  );
}
