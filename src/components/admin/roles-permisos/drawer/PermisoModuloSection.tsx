import React from 'react';
import PermisoItemRow from './PermisoItemRow';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

interface PermisoItemBase {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
}

interface PermisoModuloSectionProps {
  modulo: string;
  permisos: PermisoItemBase[];
  modoEdicion?: boolean;
  seleccionados?: Set<string>;
  permisosBloqueados?: Set<string>;
  onToggle?: (id: string) => void;
  onMarcarModulo?: (ids: string[]) => void;
  onDesmarcarModulo?: (ids: string[]) => void;
}

function obtenerColorModulo(modulo: string): string {
  switch (modulo.toLowerCase()) {
    case 'seguridad':
      return 'var(--color-primary-teal, #1B6F7D)';
    case 'incidentes':
      return '#0288D1';
    case 'recursos y personal':
      return '#689F38';
    case 'misiones':
      return '#E65100';
    case 'eventos atp':
      return '#7B1FA2';
    default:
      return 'var(--color-charcoal, #3B3F45)';
  }
}

export default function PermisoModuloSection({
  modulo,
  permisos,
  modoEdicion = false,
  seleccionados,
  permisosBloqueados,
  onToggle,
  onMarcarModulo,
  onDesmarcarModulo,
}: PermisoModuloSectionProps) {
  const colorModulo = obtenerColorModulo(modulo);
  const idsModulo = permisos.map((p) => p.id);
  const totalActivos = modoEdicion && seleccionados
    ? permisos.filter((p) => seleccionados.has(p.id)).length
    : permisos.length;

  return (
    <section
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)',
        border: '1px solid #DFE3E8',
        borderLeft: `4px solid ${colorModulo}`,
      }}
    >
      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#F8F9FA',
          borderBottom: '1px solid #DFE3E8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: colorModulo, display: 'inline-block' }} />
          <Heading as="h4" variant="h4" color="charcoal" noMargin style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Módulo: {modulo}
          </Heading>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              backgroundColor: '#ECEFF1',
              color: 'var(--color-charcoal, #3B3F45)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: 0,
            }}
          >
            {modoEdicion ? `${totalActivos} / ${permisos.length} activos` : `${permisos.length} permisos`}
          </span>

          {modoEdicion && onMarcarModulo && onDesmarcarModulo && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onMarcarModulo(idsModulo)}
                style={{ fontSize: '11px', padding: '2px 6px', minHeight: 'auto' }}
              >
                Marcar todos
              </Button>
              <span style={{ color: '#CCD2D9', alignSelf: 'center' }}>|</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onDesmarcarModulo(idsModulo)}
                style={{ fontSize: '11px', padding: '2px 6px', minHeight: 'auto' }}
              >
                Desmarcar
              </Button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {permisos.map((permiso, idx) => (
          <PermisoItemRow
            key={permiso.id}
            permiso={permiso}
            esUltimo={idx === permisos.length - 1}
            modoEdicion={modoEdicion}
            seleccionado={seleccionados?.has(permiso.id)}
            bloqueado={permisosBloqueados?.has(permiso.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </section>
  );
}
