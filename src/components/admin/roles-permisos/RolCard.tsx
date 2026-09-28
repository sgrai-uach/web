'use client';

import React, { useMemo } from 'react';
import type { RolItem } from '@/types/seguridad';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

interface RolCardProps {
  rol: RolItem;
  onSeleccionar: (rol: RolItem) => void;
}

export default function RolCard({ rol, onSeleccionar }: RolCardProps) {
  const tienePermisos = rol.cantidadPermisos > 0;

  const modulosCubiertos = useMemo(() => {
    if (!rol.permisos || rol.permisos.length === 0) return [];
    const set = new Set<string>();
    rol.permisos.forEach((p) => {
      if (p.modulo) set.add(p.modulo);
    });
    return Array.from(set);
  }, [rol.permisos]);

  return (
    <article
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)', border: '1px solid #DFE3E8',
        borderTop: tienePermisos ? '4px solid var(--color-primary-teal, #1B6F7D)' : '4px solid #B0BEC5',
        padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Heading as="h3" variant="h3" color="charcoal" noMargin>
            {rol.nombre}
          </Heading>
          <span
            style={{
              backgroundColor: rol.esSistema ? '#ECEFF1' : '#E8F5E9',
              color: rol.esSistema ? 'var(--color-charcoal, #3B3F45)' : '#2E7D32',
              fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px',
              padding: '0.2rem 0.5rem', border: `1px solid ${rol.esSistema ? '#CFD8DC' : '#A5D6A7'}`,
              whiteSpace: 'nowrap',
            }}
          >
            {rol.esSistema ? 'Sistema' : 'Personalizado'}
          </span>
        </div>

        <p style={{ fontSize: '0.845rem', color: '#555555', lineHeight: '1.45', marginBottom: '1rem', minHeight: '2.6rem' }}>
          {rol.descripcion || 'Sin descripción específica para este perfil.'}
        </p>

        <div style={{ marginBottom: '1rem' }}>
          {tienePermisos ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#E8F5E9', color: '#1B5E20', border: '1px solid #A5D6A7', padding: '0.25rem 0.6rem', fontSize: '0.775rem', fontWeight: 700 }}>
              <span style={{ width: '7px', height: '7px', backgroundColor: '#2E7D32', display: 'inline-block' }} />
              {rol.cantidadPermisos} {rol.cantidadPermisos === 1 ? 'permiso asignado' : 'permisos asignados'}
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FFF8E1', color: '#F57F17', border: '1px solid #FFE082', padding: '0.25rem 0.6rem', fontSize: '0.775rem', fontWeight: 700 }}>
              <span style={{ width: '7px', height: '7px', backgroundColor: '#F57F17', display: 'inline-block' }} />
              0 permisos asignados
            </span>
          )}
        </div>

        {modulosCubiertos.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#777', fontWeight: 700, letterSpacing: '0.4px', marginBottom: '0.35rem' }}>
              Módulos con acceso:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {modulosCubiertos.map((mod) => (
                <span
                  key={mod}
                  style={{
                    backgroundColor: '#ECEFF3', color: 'var(--color-primary-teal, #1B6F7D)',
                    fontSize: '0.715rem', fontWeight: 600, padding: '0.15rem 0.45rem', border: '1px solid #DFE3E8',
                  }}
                >
                  {mod}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button
        type="button"
        variant={tienePermisos ? 'primary' : 'secondary'}
        onClick={() => onSeleccionar(rol)}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        Ver Permisos &rarr;
      </Button>
    </article>
  );
}
