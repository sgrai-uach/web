'use client';

import React from 'react';
import RolesKpiCards from './header/RolesKpiCards';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import PageTitleCard from '@/components/common/PageTitleCard';
import type { MetricasRoles } from '@/types/seguridad';
import {
  USUARIOS_SIMULADOS_SISTEMA as USUARIOS_SIMULADOS,
  type UsuarioSimulado,
} from '@/config/usuariosSimulados';
import styles from './RolesHeader.module.css';

export type { UsuarioSimulado, MetricasRoles };
export { USUARIOS_SIMULADOS };

interface RolesHeaderProps {
  usuarioActivo?: UsuarioSimulado;
  onCambiarUsuario?: (usuario: UsuarioSimulado) => void;
  metricas: MetricasRoles;
  tieneAcceso?: boolean;
}

export default function RolesHeader({
  metricas,
  tieneAcceso = true,
}: RolesHeaderProps) {
  return (
    <div className={styles.rolesHeaderWrapper}>
      {/* Breadcrumbs Institucionales */}
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Administración' },
          { label: 'Roles y Permisos' },
        ]}
      />

      {/* Tarjeta de Título Institucional */}
      <PageTitleCard
        title="Roles y Permisos"
        badge={tieneAcceso ? `${metricas.totalPerfiles} perfiles` : undefined}
        description="Gestión y auditoría de matriz de privilegios y niveles de acceso para el personal municipal."
      />

      {tieneAcceso && <RolesKpiCards metricas={metricas} />}
    </div>
  );
}
