'use client';

import React from 'react';

export interface UsuarioSimulado {
  id: string;
  nombre: string;
  email: string;
  rut: string;
  rol: string;
  esAdmin: boolean;
}

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

export interface MetricasRoles {
  totalPerfiles: number;
  perfilesSistema: number;
  perfilesConPermisos: number;
  perfilesSinPermisos: number;
  totalPermisosUnicos: number;
}

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
    <header style={{ width: '100%', marginBottom: '1.5rem' }}>
      {/* Barra superior de acento institucional */}
      <div
        style={{
          backgroundColor: 'var(--color-primary-teal-dark, #14505A)',
          color: 'var(--color-text-light, #FFFFFF)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderBottom: '3px solid var(--color-accent-mint, #4FAE9B)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.1rem',
              color: '#FFFFFF',
            }}
          >
            V
          </div>
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                opacity: 0.9,
              }}
            >
              Municipalidad de Valdivia &bull; Panel Administrador
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.2px' }}>
              SGRAI &mdash; Visualización de Roles y Permisos por Perfil
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Badge de estado RBAC */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: usuarioActivo.esAdmin
                ? 'rgba(79, 174, 155, 0.2)'
                : 'rgba(211, 47, 47, 0.25)',
              padding: '0.35rem 0.75rem',
              fontSize: '0.8125rem',
              border: `1px solid ${
                usuarioActivo.esAdmin ? 'var(--color-accent-mint, #4FAE9B)' : '#EF5350'
              }`,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '9px',
                height: '9px',
                backgroundColor: usuarioActivo.esAdmin ? '#4FAE9B' : '#EF5350',
                borderRadius: '50%',
              }}
            />
            <span style={{ fontWeight: 600 }}>
              {usuarioActivo.esAdmin ? 'Acceso Administrador (RBAC OK)' : 'Acceso Denegado (403)'}
            </span>
          </div>

          {/* Selector interactivo de Usuario para simulación y pruebas RBAC */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <span style={{ opacity: 0.85 }}>Usuario Activo:</span>
            <select
              value={usuarioActivo.id}
              onChange={(e) => {
                const found = USUARIOS_SIMULADOS.find((u) => u.id === e.target.value);
                if (found) onCambiarUsuario(found);
              }}
              style={{
                backgroundColor: '#FFFFFF',
                color: 'var(--color-charcoal, #3B3F45)',
                border: 'none',
                padding: '0.4rem 0.65rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: 0,
              }}
              aria-label="Seleccionar usuario activo para simulación de sesión"
            >
              {USUARIOS_SIMULADOS.map((usr) => (
                <option key={usr.id} value={usr.id}>
                  {usr.nombre} ({usr.rol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Franja de Métricas / KPI del Panel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '1.25rem 1.5rem 0.5rem 1.5rem',
          backgroundColor: 'var(--color-bg-light, #ECEFF3)',
        }}
      >
        {/* Total Perfiles */}
        <div
          style={{
            backgroundColor: 'var(--color-white, #FFFFFF)',
            padding: '1rem',
            borderLeft: '4px solid var(--color-primary-teal, #1B6F7D)',
            borderTop: '1px solid #DFE3E8',
            borderRight: '1px solid #DFE3E8',
            borderBottom: '1px solid #DFE3E8',
          }}
        >
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>
            Total de Perfiles
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary-teal, #1B6F7D)' }}>
            {metricas.totalPerfiles}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#777' }}>Roles registrados en el sistema</div>
        </div>

        {/* Perfiles de Sistema */}
        <div
          style={{
            backgroundColor: 'var(--color-white, #FFFFFF)',
            padding: '1rem',
            borderLeft: '4px solid var(--color-charcoal, #3B3F45)',
            borderTop: '1px solid #DFE3E8',
            borderRight: '1px solid #DFE3E8',
            borderBottom: '1px solid #DFE3E8',
          }}
        >
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#555', fontWeight: 600 }}>
            Perfiles de Sistema
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-charcoal, #3B3F45)' }}>
            {metricas.perfilesSistema}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#777' }}>Roles protegidos por catálogo</div>
        </div>

        {/* Perfiles con Permisos */}
        <div
          style={{
            backgroundColor: 'var(--color-white, #FFFFFF)',
            padding: '1rem',
            borderLeft: '4px solid #2E7D32',
            borderTop: '1px solid #DFE3E8',
            borderRight: '1px solid #DFE3E8',
            borderBottom: '1px solid #DFE3E8',
          }}
        >
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#2E7D32', fontWeight: 700 }}>
            &bull; Con Permisos Activos
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2E7D32' }}>
            {metricas.perfilesConPermisos}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#777' }}>Con capacidades operativas</div>
        </div>

        {/* Perfiles sin Permisos */}
        <div
          style={{
            backgroundColor: 'var(--color-white, #FFFFFF)',
            padding: '1rem',
            borderLeft: '4px solid #E65100',
            borderTop: '1px solid #DFE3E8',
            borderRight: '1px solid #DFE3E8',
            borderBottom: '1px solid #DFE3E8',
          }}
        >
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#E65100', fontWeight: 700 }}>
            &bull; Sin Permisos Asignados
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#E65100' }}>
            {metricas.perfilesSinPermisos}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#777' }}>Pendientes de parametrización</div>
        </div>

        {/* Total Permisos Únicos */}
        <div
          style={{
            backgroundColor: 'var(--color-white, #FFFFFF)',
            padding: '1rem',
            borderLeft: '4px solid var(--color-accent-mint, #4FAE9B)',
            borderTop: '1px solid #DFE3E8',
            borderRight: '1px solid #DFE3E8',
            borderBottom: '1px solid #DFE3E8',
          }}
        >
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-primary-teal, #1B6F7D)', fontWeight: 700 }}>
            Acciones de Seguridad
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-accent-mint, #4FAE9B)' }}>
            {metricas.totalPermisosUnicos}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#777' }}>Permisos únicos en catálogo</div>
        </div>
      </div>
    </header>
  );
}
