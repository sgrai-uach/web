'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { Kanban, MapPin, PackageCheck } from 'lucide-react';

export type VistaCentroIncidentes = 'kanban' | 'mapa' | 'recuperacion';

interface KanbanViewSwitcherProps {
  vistaActiva: VistaCentroIncidentes;
  onCambiarVista: (vista: VistaCentroIncidentes) => void;
  className?: string;
}

export const KanbanViewSwitcher: React.FC<KanbanViewSwitcherProps> = ({
  vistaActiva,
  onCambiarVista,
  className,
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 'var(--space-2, 8px)',
        marginBottom: 'var(--space-1, 4px)',
      }}
    >
      <div
        role="group"
        aria-label="Selector de visualización táctica"
        style={{
          display: 'inline-flex',
          border: '1px solid var(--border-color-neutral-dark, #CCD2D9)',
          backgroundColor: '#FFFFFF',
          boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.08))',
        }}
      >
        <Button
          type="button"
          variant={vistaActiva === 'kanban' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onCambiarVista('kanban')}
          aria-pressed={vistaActiva === 'kanban'}
          style={{
            backgroundColor:
              vistaActiva === 'kanban'
                ? 'var(--color-charcoal, #3B3F45)'
                : 'transparent',
            color:
              vistaActiva === 'kanban'
                ? '#FFFFFF'
                : 'var(--color-charcoal, #3B3F45)',
            borderRadius: 0,
            border: 'none',
          }}
        >
          <Kanban size={14} style={{ marginRight: '6px' }} />
          <span>Tablero Kanban</span>
        </Button>

        <Button
          type="button"
          variant={vistaActiva === 'mapa' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onCambiarVista('mapa')}
          aria-pressed={vistaActiva === 'mapa'}
          style={{
            backgroundColor:
              vistaActiva === 'mapa'
                ? 'var(--color-charcoal, #3B3F45)'
                : 'transparent',
            color:
              vistaActiva === 'mapa'
                ? '#FFFFFF'
                : 'var(--color-charcoal, #3B3F45)',
            borderRadius: 0,
            border: 'none',
          }}
        >
          <MapPin size={14} style={{ marginRight: '6px' }} />
          <span>Mapa Operativo</span>
        </Button>

        <Button
          type="button"
          variant={vistaActiva === 'recuperacion' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onCambiarVista('recuperacion')}
          aria-pressed={vistaActiva === 'recuperacion'}
          style={{
            backgroundColor:
              vistaActiva === 'recuperacion'
                ? 'var(--color-charcoal, #3B3F45)'
                : 'transparent',
            color:
              vistaActiva === 'recuperacion'
                ? '#FFFFFF'
                : 'var(--color-charcoal, #3B3F45)',
            borderRadius: 0,
            border: 'none',
          }}
        >
          <PackageCheck size={14} style={{ marginRight: '6px' }} />
          <span>Recuperación</span>
        </Button>
      </div>
    </div>
  );
};

export default KanbanViewSwitcher;
