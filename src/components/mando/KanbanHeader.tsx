'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import ConnectionStatusBadge from '@/components/common/ConnectionStatusBadge';
import PageTitleCard from '@/components/common/PageTitleCard';
import Button from '@/components/ui/Button';
import { ClipboardList } from 'lucide-react';
import styles from '@/styles/mando.module.css';

interface KanbanHeaderProps {
  totalIncidentesVisibles: number;
  conectado: boolean;
  userId?: string;
  setUserId?: (id: string) => void;
  onAbrirMisiones?: () => void;
}

export const KanbanHeader: React.FC<KanbanHeaderProps> = ({
  totalIncidentesVisibles,
  conectado,
  onAbrirMisiones,
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
          onAbrirMisiones ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              icon={<ClipboardList size={16} />}
              onClick={onAbrirMisiones}
              title="Abrir panel de misiones operativas"
            >
              Misiones Operativas
            </Button>
          ) : undefined
        }
      />
    </div>
  );
};
