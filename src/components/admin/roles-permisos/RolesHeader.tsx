'use client';

import React from 'react';
import RolesKpiCards from './header/RolesKpiCards';
import type { MetricasRoles, UsuarioSimulado } from '@/types/seguridad';

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
    <header style={{ width: '100%', marginBottom: '1.5rem' }}>
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
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.9 }}>
              Municipalidad de Valdivia &bull; Panel Administrador
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.2px' }}>
              SGRAI &mdash; Visualización de Roles y Permisos por Perfil
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: usuarioActivo.esAdmin ? 'rgba(79, 174, 155, 0.2)' : 'rgba(211, 47, 47, 0.25)',
              padding: '0.35rem 0.75rem',
              fontSize: '0.8125rem',
              border: `1px solid ${usuarioActivo.esAdmin ? 'var(--color-accent-mint, #4FAE9B)' : '#EF5350'}`,
            }}
          >
            <span style={{ display: 'inline-block', width: '9px', height: '9px', backgroundColor: usuarioActivo.esAdmin ? '#4FAE9B' : '#EF5350', borderRadius: '50%' }} />
            <span style={{ fontWeight: 600 }}>
              {usuarioActivo.esAdmin ? 'Acceso Administrador (RBAC OK)' : 'Acceso Denegado (403)'}
            </span>
          </div>

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

      <RolesKpiCards metricas={metricas} />
    </header>
  );
}
