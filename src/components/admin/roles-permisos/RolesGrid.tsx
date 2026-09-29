'use client';

import React from 'react';
import type { RolItem } from '@/types/api';
import RolCard from './RolCard';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/common/EmptyState';
import { SearchX } from 'lucide-react';

interface RolesGridProps {
  roles: RolItem[];
  onSeleccionarRol: (rol: RolItem) => void;
  busquedaActiva: boolean;
  onLimpiarFiltros: () => void;
}

export default function RolesGrid({
  roles,
  onSeleccionarRol,
  busquedaActiva,
  onLimpiarFiltros,
}: RolesGridProps) {
  if (roles.length === 0) {
    return (
      <EmptyState
        icon={<SearchX size={28} aria-hidden="true" />}
        title="No se encontraron perfiles coincidentes"
        description={
          busquedaActiva
            ? 'Ningún rol coincide con el texto o los filtros seleccionados.'
            : 'No hay perfiles registrados en el sistema.'
        }
        action={
          busquedaActiva && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onLimpiarFiltros}
            >
              Restablecer Filtros
            </Button>
          )
        }
      />
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.25rem',
      }}
    >
      {roles.map((rol) => (
        <RolCard key={rol.id} rol={rol} onSeleccionar={onSeleccionarRol} />
      ))}
    </div>
  );
}
