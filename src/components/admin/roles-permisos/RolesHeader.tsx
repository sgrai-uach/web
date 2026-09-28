'use client';

import React from 'react';
import RolesKpiCards from './header/RolesKpiCards';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import SessionContextBar from '@/components/common/SessionContextBar';
import PageTitleCard from '@/components/common/PageTitleCard';
import type { MetricasRoles, UsuarioSimulado } from '@/types/seguridad';
import styles from './RolesHeader.module.css';

export type { UsuarioSimulado, MetricasRoles };

export const USUARIOS_SIMULADOS: UsuarioSimulado[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    nombre: 'Administrador General (Mesa Central)',
    email: 'admin@valdivia.cl',
    rut: '11111111-1',
    rol: 'Administrador',
    esAdmin: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    nombre: 'Operador Call Center (Prueba 403)',
    email: 'callcenter@valdivia.cl',
    rut: '22222222-2',
    rol: 'Call Center',
    esAdmin: false,
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    nombre: 'Encargado de Operaciones (Prueba 403)',
    email: 'encargado@valdivia.cl',
    rut: '33333333-3',
    rol: 'Encargado',
    esAdmin: false,
  },
];

interface RolesHeaderProps {
  usuarioActivo: UsuarioSimulado;
  onCambiarUsuario: (usuario: UsuarioSimulado) => void;
  metricas: MetricasRoles;
}

export default function RolesHeader({
  usuarioActivo,
  onCambiarUsuario,
  metricas,
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

      {/* Barra de contexto RBAC */}
      <SessionContextBar
        leftContent={
          <div
            className={usuarioActivo.esAdmin ? styles.rbacBadgeAdmin : styles.rbacBadgeBlocked}
          >
            <span className={usuarioActivo.esAdmin ? styles.statusDotAdmin : styles.statusDotBlocked} />
            <span>
              {usuarioActivo.esAdmin ? 'Acceso Administrador (RBAC OK)' : 'Acceso Denegado (403)'}
            </span>
          </div>
        }
        selectorId="select-usuario-rbac-roles"
      >
        <select
          id="select-usuario-rbac-roles"
          value={usuarioActivo.id}
          onChange={(e) => {
            const found = USUARIOS_SIMULADOS.find((u) => u.id === e.target.value);
            if (found) onCambiarUsuario(found);
          }}
          className={styles.sessionSelect}
          aria-label="Seleccionar usuario activo para simulación de sesión"
        >
          {USUARIOS_SIMULADOS.map((usr) => (
            <option key={usr.id} value={usr.id}>
              {usr.nombre} ({usr.rol})
            </option>
          ))}
        </select>
      </SessionContextBar>

      {/* Tarjeta de Título Institucional */}
      <PageTitleCard
        title="Roles y Permisos"
        badge={`${metricas.totalPerfiles} perfiles`}
        description="Gestión y auditoría de matriz de privilegios y niveles de acceso RBAC para el personal municipal."
      />

      <RolesKpiCards metricas={metricas} />
    </div>
  );
}
