'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import SessionContextBar from '@/components/common/SessionContextBar';
import PageTitleCard from '@/components/common/PageTitleCard';
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
      {/* Breadcrumbs Institucionales */}
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Administración' },
          { label: 'Inventario Logístico' },
        ]}
      />

      {/* Franja de Simulación RBAC */}
      <SessionContextBar
        leftContent={
          <span style={{ color: 'var(--color-charcoal, #3B3F45)', fontWeight: 500 }}>
            Prueba de autorización (Administrador vs Call Center)
          </span>
        }
        selectorId="select-usuario-rbac"
      >
        <select
          id="select-usuario-rbac"
          value={usuarioActivoId}
          onChange={(e) => onCambiarUsuario(e.target.value)}
          style={{ padding: '6px 12px', border: '1px solid var(--border-color-neutral-dark, #CCD2D9)', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-text-dark)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', borderRadius: 0 }}
        >
          {USUARIOS_PRUEBA.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre} ({u.permitido ? 'Acceso 200 OK' : 'Bloqueo 403 Forbidden'})
            </option>
          ))}
        </select>
      </SessionContextBar>

      {/* Tarjeta de Título Institucional */}
      <PageTitleCard
        title="Inventario Logístico"
        badge={`${totalRecursos} ${totalRecursos === 1 ? 'recurso' : 'recursos'}`}
        description="Catálogo de materiales fungibles, maquinaria y vehículos para atención de incidentes."
        actionSlot={
          <Button href="/admin/recursos/nuevo" variant="primary" size="md" icon={<Plus size={16} />}>
            Registrar Nuevo Recurso
          </Button>
        }
      />
    </div>
  );
}
