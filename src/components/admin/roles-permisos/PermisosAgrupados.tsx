'use client';

import React from 'react';
import type { PermisosPorModulo } from '@/types/seguridad';
import PermisoModuloSection from './drawer/PermisoModuloSection';

interface PermisosAgrupadosProps {
  permisosPorModulo: PermisosPorModulo;
}

export default function PermisosAgrupados({
  permisosPorModulo,
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
        />
      ))}
    </div>
  );
}
