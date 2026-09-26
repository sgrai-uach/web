'use client';

import React from 'react';
import Link from 'next/link';
import { USUARIOS_PRUEBA } from '@/hooks/useRecursos';

interface RecursosHeaderProps {
  totalRecursos: number;
  usuarioActivoId: string;
  onCambiarUsuario: (nuevoId: string) => void;
}

export default function RecursosHeader({
  totalRecursos,
  usuarioActivoId,
  onCambiarUsuario,
}: RecursosHeaderProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Breadcrumbs */}
      <nav aria-label="Ruta de navegación" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-charcoal)' }}>
        <Link href="/" style={{ color: 'var(--color-primary-teal)', fontWeight: 500, textDecoration: 'none' }}>Inicio</Link>
        <span aria-hidden="true">&rsaquo;</span>
        <span style={{ color: 'var(--color-charcoal)' }}>Administración</span>
        <span aria-hidden="true">&rsaquo;</span>
        <span style={{ fontWeight: 600, color: 'var(--color-primary-teal-dark)' }}>Inventario Logístico</span>
      </nav>

      {/* Franja de Simulación RBAC */}
      <div style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-bg-light)', borderLeft: '4px solid var(--color-primary-teal)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '13px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, color: 'var(--color-primary-teal-dark)' }}>Simulador de Perfil (RBAC):</span>
          <span style={{ color: 'var(--color-charcoal)' }}>Prueba de autorización (Administrador vs Call Center)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="select-usuario-rbac" style={{ fontWeight: 600, color: 'var(--color-charcoal)' }}>Sesión:</label>
          <select
            id="select-usuario-rbac"
            value={usuarioActivoId}
            onChange={(e) => onCambiarUsuario(e.target.value)}
            style={{ padding: '6px 12px', border: '1px solid #D5DCE4', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-text-dark)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            {USUARIOS_PRUEBA.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre} ({u.permitido ? 'Acceso 200 OK' : 'Bloqueo 403 Forbidden'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Header Principal */}
      <div style={{ backgroundColor: 'var(--color-white)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderLeft: '5px solid var(--color-primary-teal-dark)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--color-primary-teal-dark)', letterSpacing: '-0.3px' }}>
              Inventario Logístico de Recursos
            </h1>
            <span style={{ backgroundColor: 'var(--color-bg-light)', color: 'var(--color-primary-teal-dark)', padding: '4px 10px', fontSize: '12px', fontWeight: 700, border: '1px solid #D5DCE4' }}>
              {totalRecursos} {totalRecursos === 1 ? 'recurso' : 'recursos'}
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: 'var(--color-charcoal)' }}>
            Catálogo de materiales fungibles, maquinaria y vehículos para atención de incidentes.
          </p>
        </div>

        <Link
          href="/recursos/nuevo"
          style={{ backgroundColor: 'var(--color-accent-mint)', color: 'var(--color-white)', padding: '12px 24px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
          <span>Registrar Nuevo Recurso</span>
        </Link>
      </div>
    </div>
  );
}
