'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { Kanban, MapPin, PackageCheck } from 'lucide-react';
import styles from './KanbanViewSwitcher.module.css';

export type VistaCentroIncidentes = 'kanban' | 'mapa' | 'recuperacion';

interface KanbanViewSwitcherProps {
  vistaActiva: VistaCentroIncidentes;
  onCambiarVista: (vista: VistaCentroIncidentes) => void;
  className?: string;
}

export const KanbanViewSwitcher: React.FC<KanbanViewSwitcherProps> = ({
  vistaActiva,
  onCambiarVista,
  className = '',
}) => {
  return (
    <div className={`${styles.wrapper} ${className}`.trim()}>
      <div
        role="group"
        aria-label="Selector de visualización táctica"
        className={styles.group}
      >
        <Button
          type="button"
          variant={vistaActiva === 'kanban' ? 'secondary' : 'ghost'}
          size="sm"
          icon={<Kanban size={14} />}
          onClick={() => onCambiarVista('kanban')}
          aria-pressed={vistaActiva === 'kanban'}
          className={`${styles.tabButton} ${vistaActiva === 'kanban' ? styles.tabButtonActive : ''}`.trim()}
        >
          Tablero Kanban
        </Button>

        <Button
          type="button"
          variant={vistaActiva === 'mapa' ? 'secondary' : 'ghost'}
          size="sm"
          icon={<MapPin size={14} />}
          onClick={() => onCambiarVista('mapa')}
          aria-pressed={vistaActiva === 'mapa'}
          className={`${styles.tabButton} ${vistaActiva === 'mapa' ? styles.tabButtonActive : ''}`.trim()}
        >
          Mapa Operativo
        </Button>

        <Button
          type="button"
          variant={vistaActiva === 'recuperacion' ? 'secondary' : 'ghost'}
          size="sm"
          icon={<PackageCheck size={14} />}
          onClick={() => onCambiarVista('recuperacion')}
          aria-pressed={vistaActiva === 'recuperacion'}
          className={`${styles.tabButton} ${vistaActiva === 'recuperacion' ? styles.tabButtonActive : ''}`.trim()}
        >
          Recuperación
        </Button>
      </div>
    </div>
  );
};

export default KanbanViewSwitcher;
