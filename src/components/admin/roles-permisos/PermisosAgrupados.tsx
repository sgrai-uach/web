'use client';

import React from 'react';
import type { PermisosCatalogoPorModulo, PermisosPorModulo } from '@/types/seguridad';
import PermisoModuloSection from './drawer/PermisoModuloSection';

interface PermisosAgrupadosProps {
  permisosPorModulo: PermisosPorModulo | PermisosCatalogoPorModulo;
  modoEdicion?: boolean;
  seleccionados?: Set<string>;
  permisosBloqueados?: Set<string>;
  onToggle?: (id: string) => void;
  onMarcarModulo?: (ids: string[]) => void;
  onDesmarcarModulo?: (ids: string[]) => void;
}

export default function PermisosAgrupados({
  permisosPorModulo,
  modoEdicion = false,
  seleccionados,
  permisosBloqueados,
  onToggle,
  onMarcarModulo,
  onDesmarcarModulo,
}: PermisosAgrupadosProps) {
  const modulos = Object.keys(permisosPorModulo);

  if (modulos.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {modulos.map((modulo) => (
        <PermisoModuloSection
          key={modulo}
          modulo={modulo}
          permisos={permisosPorModulo[modulo] || []}
          modoEdicion={modoEdicion}
          seleccionados={seleccionados}
          permisosBloqueados={permisosBloqueados}
          onToggle={onToggle}
          onMarcarModulo={onMarcarModulo}
          onDesmarcarModulo={onDesmarcarModulo}
        />
      ))}
    </div>
  );
}
