'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import PageTitleCard from '@/components/common/PageTitleCard';
import Button from '@/components/ui/Button';
import { HeartHandshake, Plus } from 'lucide-react';

interface AsistenciaSocialHeaderProps {
  totalCasos: number;
  puedeCrear: boolean;
  basePath?: string;
}

export default function AsistenciaSocialHeader({
  totalCasos,
  puedeCrear,
  basePath = '/gestion/asistente-social',
}: AsistenciaSocialHeaderProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4, 16px)' }}>
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Operaciones' },
          { label: 'Asistencia Social' },
        ]}
      />

      <PageTitleCard
        title="Asistencia Social"
        badge={
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <HeartHandshake size={14} />
            <span>{`${totalCasos} ${totalCasos === 1 ? 'caso registrado' : 'casos registrados'}`}</span>
          </div>
        }
        description="Gestión de casos excepcionales para levantamiento de Ficha Básica de Emergencia (FIBE) y asistencia a familias afectadas en Valdivia."
        actionSlot={
          puedeCrear ? (
            <Button
              href={`${basePath}/nuevo`}
              variant="primary"
              size="md"
              title="Registrar nuevo caso excepcional de asistencia social"
            >
              <Plus size={16} style={{ marginRight: '6px' }} />
              <span>Nuevo Evento Social</span>
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
