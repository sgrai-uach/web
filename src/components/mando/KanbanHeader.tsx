'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import ConnectionStatusBadge from '@/components/common/ConnectionStatusBadge';
import PageTitleCard from '@/components/common/PageTitleCard';
import Button from '@/components/ui/Button';
import { PackagePlus, Kanban, MapPin } from 'lucide-react';
import styles from '@/styles/mando.module.css';

interface KanbanHeaderProps {
  totalIncidentesVisibles: number;
  conectado: boolean;
  userId?: string;
  setUserId?: (id: string) => void;
  onOpenCrearRecuperacion?: () => void;
  vistaActiva?: 'kanban' | 'mapa';
  onCambiarVista?: (vista: 'kanban' | 'mapa') => void;
}

export const KanbanHeader: React.FC<KanbanHeaderProps> = ({
  totalIncidentesVisibles,
  conectado,
  onOpenCrearRecuperacion,
  vistaActiva = 'kanban',
  onCambiarVista,
}) => {
  return (
    <div className={styles.mandoHeaderWrapper}>
      {/* Breadcrumbs Institucionales */}
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Operaciones' },
          { label: 'Centro de Mando' },
        ]}
      />

      {/* Tarjeta de Título Institucional */}
      <PageTitleCard
        title="Centro de Mando"
        badge={
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span>{`${totalIncidentesVisibles} ${totalIncidentesVisibles === 1 ? 'incidente' : 'incidentes'}`}</span>
            <ConnectionStatusBadge connected={conectado} />
          </div>
        }
        description={`Dirección de Gestión de Riesgos de Desastres — Tablero Táctico ICS (${totalIncidentesVisibles} ${totalIncidentesVisibles === 1 ? 'incidente cargado' : 'incidentes cargados'})`}
        actionSlot={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {onCambiarVista && (
              <div
                style={{
                  display: 'inline-flex',
                  border: '1px solid var(--border-color-neutral-dark, #CCD2D9)',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <Button
                  type="button"
                  variant={vistaActiva === 'kanban' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onCambiarVista('kanban')}
                  aria-pressed={vistaActiva === 'kanban'}
                  style={{
                    backgroundColor: vistaActiva === 'kanban' ? 'var(--color-charcoal, #3B3F45)' : 'transparent',
                    color: vistaActiva === 'kanban' ? '#FFFFFF' : 'var(--color-charcoal, #3B3F45)',
                  }}
                >
                  <Kanban size={14} style={{ marginRight: '4px' }} />
                  <span>Tablero Kanban</span>
                </Button>
                <Button
                  type="button"
                  variant={vistaActiva === 'mapa' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onCambiarVista('mapa')}
                  aria-pressed={vistaActiva === 'mapa'}
                  style={{
                    backgroundColor: vistaActiva === 'mapa' ? 'var(--color-charcoal, #3B3F45)' : 'transparent',
                    color: vistaActiva === 'mapa' ? '#FFFFFF' : 'var(--color-charcoal, #3B3F45)',
                  }}
                >
                  <MapPin size={14} style={{ marginRight: '4px' }} />
                  <span>Mapa Operativo</span>
                </Button>
              </div>
            )}

            {onOpenCrearRecuperacion && (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={onOpenCrearRecuperacion}
                title="Generar un nuevo evento de recuperación territorial y despachar patrulla con insumos"
              >
                <PackagePlus size={16} style={{ marginRight: '6px' }} />
                <span>Nuevo Evento de Recuperación</span>
              </Button>
            )}
          </div>
        }
      />
    </div>
  );
};

