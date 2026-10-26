'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import PageTitleCard from '@/components/common/PageTitleCard';
import Button from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

interface AsistentesSocialesHeaderProps {
  totalPersonal: number;
  basePath?: string;
}

export default function AsistentesSocialesHeader({
  totalPersonal,
  basePath = '/gestion/asistente-social',
}: AsistentesSocialesHeaderProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4, 16px)' }}>
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Operaciones' },
          { label: 'Asistencia Social', href: basePath },
          { label: 'Dotación de Asistentes Sociales' },
        ]}
      />

      <PageTitleCard
        title="Dotación de Asistentes Sociales"
        badge={`${totalPersonal} ${totalPersonal === 1 ? 'profesional en nómina' : 'profesionales en nómina'}`}
        description="Supervisión en tiempo real del personal social disponible, estado de despliegue territorial y carga activa de fichas FIBE en Valdivia."
        actionSlot={
          <Button
            href={basePath}
            variant="secondary"
            size="md"
            title="Volver a la bandeja operativa de casos de asistencia social"
          >
            <ArrowLeft size={16} style={{ marginRight: '6px' }} />
            <span>Volver a Casos Sociales</span>
          </Button>
        }
      />
    </div>
  );
}
