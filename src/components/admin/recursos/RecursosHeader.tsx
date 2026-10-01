'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import PageTitleCard from '@/components/common/PageTitleCard';

interface RecursosHeaderProps {
  totalRecursos: number;
  usuarioActivoId?: string;
  onCambiarUsuario?: (nuevoId: string) => void;
  tieneAcceso?: boolean;
  puedeCrear?: boolean;
}

export default function RecursosHeader({
  totalRecursos,
  tieneAcceso = true,
  puedeCrear = false,
}: RecursosHeaderProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Breadcrumbs Institucionales */}
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Administración' },
          { label: 'Inventario Logístico' },
        ]}
      />

      {/* Tarjeta de Título Institucional */}
      <PageTitleCard
        title="Inventario Logístico"
        badge={tieneAcceso ? `${totalRecursos} ${totalRecursos === 1 ? 'recurso' : 'recursos'}` : undefined}
        description="Catálogo de materiales fungibles, maquinaria y vehículos para atención de incidentes."
        actionSlot={
          tieneAcceso && puedeCrear ? (
            <Button href="/admin/recursos/nuevo" variant="primary" size="md" icon={<Plus size={16} />}>
              Registrar Nuevo Recurso
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
