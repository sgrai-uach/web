import React from 'react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import PermisoCheckboxItem from './PermisoCheckboxItem';
import type { PermisoCatalogoItem } from '@/types/seguridad';

interface PermisosEditorModuloSectionProps {
  modulo: string;
  permisos: PermisoCatalogoItem[];
  seleccionados: Set<string>;
  permisosBloqueados: Set<string>;
  onTogglePermiso: (permisoId: string) => void;
  onMarcarModulo: (permisoIds: string[]) => void;
  onDesmarcarModulo: (permisoIds: string[]) => void;
}

export default function PermisosEditorModuloSection({
  modulo,
  permisos,
  seleccionados,
  permisosBloqueados,
  onTogglePermiso,
  onMarcarModulo,
  onDesmarcarModulo,
}: PermisosEditorModuloSectionProps) {
  const idsModulo = permisos.map((p) => p.id);
  const totalActivos = permisos.filter((p) => seleccionados.has(p.id)).length;
  const todosMarcados = totalActivos === permisos.length;
  const ningunoMarcado = totalActivos === 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color-neutral, #DFE3E8)',
        padding: '14px 16px',
        borderRadius: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          borderBottom: '1px solid var(--color-bg-light, #ECEFF3)',
          paddingBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heading as="h4" variant="h4" color="teal" noMargin>
            {modulo}
          </Heading>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              backgroundColor: totalActivos > 0 ? 'var(--color-info-bg, #E0F2F1)' : '#F1F5F9',
              color: totalActivos > 0 ? 'var(--color-primary-teal, #1B6F7D)' : '#64748B',
              borderRadius: 0,
            }}
          >
            {totalActivos} / {permisos.length} activos
          </span>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={todosMarcados}
            onClick={() => onMarcarModulo(idsModulo)}
            style={{ fontSize: '11px', padding: '2px 8px' }}
          >
            Marcar todos
          </Button>
          <span style={{ color: '#CCD2D9', alignSelf: 'center' }}>|</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={ningunoMarcado}
            onClick={() => onDesmarcarModulo(idsModulo)}
            style={{ fontSize: '11px', padding: '2px 8px' }}
          >
            Desmarcar
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {permisos.map((permiso) => {
          const isSelected = seleccionados.has(permiso.id);
          const isBlocked = permisosBloqueados.has(permiso.id);

          return (
            <PermisoCheckboxItem
              key={permiso.id}
              permiso={permiso}
              seleccionado={isSelected}
              bloqueado={isBlocked}
              onToggle={onTogglePermiso}
            />
          );
        })}
      </div>
    </div>
  );
}
