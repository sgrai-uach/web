'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import PageTitleCard from '@/components/common/PageTitleCard';
import Button from '@/components/ui/Button';
import { Plus, Users } from 'lucide-react';

interface AsistenciaSocialHeaderProps {
  totalCasos: number;
  puedeCrear: boolean;
  puedeVerPersonal?: boolean;
  basePath?: string;
}

export default function AsistenciaSocialHeader({
  totalCasos,
  puedeCrear,
  puedeVerPersonal = true,
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
        badge={`${totalCasos} ${totalCasos === 1 ? 'caso registrado' : 'casos registrados'}`}
        description="Gestión de casos excepcionales para levantamiento de Ficha Básica de Emergencia (FIBE) y asistencia a familias afectadas en Valdivia."
        actionSlot={
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-2, 8px)',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {puedeVerPersonal && (
              <Button
                href={`${basePath}/personal`}
                variant="secondary"
                size="md"
                title="Consultar disponibilidad y dotación de asistentes sociales"
              >
                <Users size={16} style={{ marginRight: '6px' }} />
                <span>Ver Asistentes Sociales</span>
              </Button>
            )}
            {puedeCrear && (
              <Button
                href={`${basePath}/nuevo`}
                variant="primary"
                size="md"
                title="Registrar nuevo caso excepcional de asistencia social"
              >
                <Plus size={16} style={{ marginRight: '6px' }} />
                <span>Nuevo Evento Social</span>
              </Button>
            )}
          </div>
        }
      />
    </div>
  );
}
