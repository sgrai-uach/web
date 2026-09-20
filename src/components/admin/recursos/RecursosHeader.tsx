'use client';

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
      <nav
        aria-label="Ruta de navegación"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: '#3B3F45',
        }}
      >
        <Link href="/" style={{ color: '#1B6F7D', fontWeight: 500, textDecoration: 'none' }}>
          Inicio
        </Link>
        <span aria-hidden="true">&rsaquo;</span>
        <span style={{ color: '#3B3F45' }}>Administración</span>
        <span aria-hidden="true">&rsaquo;</span>
        <span style={{ fontWeight: 600, color: '#14505A' }}>Inventario Logístico</span>
      </nav>

      {/* Franja de Simulación RBAC para QA */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #D5DCE4',
          borderLeft: '4px solid #1B6F7D',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '13px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, color: '#14505A' }}>Simulador de Perfil (RBAC):</span>
          <span style={{ color: '#3B3F45' }}>
            Prueba de autorización según criterios de aceptación (Administrador vs Call Center)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="select-usuario-rbac" style={{ fontWeight: 600, color: '#3B3F45' }}>
            Sesión:
          </label>
          <select
            id="select-usuario-rbac"
            value={usuarioActivoId}
            onChange={(e) => onCambiarUsuario(e.target.value)}
            style={{
              padding: '6px 12px',
              border: '1px solid #D5DCE4',
              borderRadius: 0,
              backgroundColor: '#ECEFF3',
              color: '#2B2B2B',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {USUARIOS_PRUEBA.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre} ({u.permitido ? 'Acceso 200 OK' : 'Bloqueo 403 Forbidden'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Header Principal con Título, Contador y Botón de Acción */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          borderLeft: '5px solid #14505A',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: 800,
                color: '#14505A',
                letterSpacing: '-0.3px',
              }}
            >
              Inventario Logístico de Recursos
            </h1>
            <span
              style={{
                backgroundColor: '#ECEFF3',
                color: '#14505A',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: 0,
                border: '1px solid #D5DCE4',
              }}
            >
              {totalRecursos} {totalRecursos === 1 ? 'recurso' : 'recursos'}
            </span>
          </div>
          <p
            style={{
              margin: '6px 0 0 0',
              fontSize: '14px',
              color: '#3B3F45',
            }}
          >
            Catálogo de materiales fungibles, maquinaria y vehículos para atención de incidentes.
          </p>
        </div>

        <Link
          href="/recursos/nuevo"
          style={{
            backgroundColor: '#4FAE9B',
            color: '#FFFFFF',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: 0,
            transition: 'background-color 0.15s ease',
          }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
          <span>Registrar Nuevo Recurso</span>
        </Link>
      </div>
    </div>
  );
}
