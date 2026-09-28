import React from 'react';
import type { RolItem } from '@/types/seguridad';

interface RolDetalleInfoProps {
  rol: RolItem;
}

function formatearFecha(fechaIso?: string) {
  if (!fechaIso) return 'N/A';
  try {
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(fechaIso));
  } catch {
    return fechaIso;
  }
}

export default function RolDetalleInfo({ rol }: RolDetalleInfoProps) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #DFE3E8', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span
            style={{
              backgroundColor: rol.esSistema ? '#ECEFF1' : '#E8F5E9',
              color: rol.esSistema ? 'var(--color-charcoal, #3B3F45)' : '#2E7D32',
              fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase',
              padding: '0.25rem 0.55rem', border: `1px solid ${rol.esSistema ? '#CFD8DC' : '#A5D6A7'}`,
            }}
          >
            {rol.esSistema ? 'Perfil del Sistema' : 'Perfil Personalizado'}
          </span>

          <span
            style={{
              backgroundColor: rol.activo ? '#E8F5E9' : '#FFEBEE',
              color: rol.activo ? '#2E7D32' : '#C62828',
              fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase',
              padding: '0.25rem 0.55rem', border: `1px solid ${rol.activo ? '#A5D6A7' : '#FFCDD2'}`,
            }}
          >
            {rol.activo ? 'Estado Activo' : 'Inactivo'}
          </span>
        </div>

        <span style={{ fontSize: '0.75rem', color: '#777', fontFamily: 'monospace' }}>
          ID: {rol.id.substring(0, 8)}...
        </span>
      </div>

      <p style={{ fontSize: '0.875rem', color: '#444', lineHeight: '1.5', marginBottom: '1rem' }}>
        {rol.descripcion || 'Sin descripción detallada registrada para este perfil.'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', backgroundColor: '#F8F9FA', padding: '0.75rem', border: '1px solid #EDF1F5', fontSize: '0.75rem' }}>
        <div>
          <span style={{ color: '#777', display: 'block' }}>Permisos asignados:</span>
          <strong style={{ fontSize: '0.875rem', color: 'var(--color-primary-teal, #1B6F7D)' }}>
            {rol.cantidadPermisos} {rol.cantidadPermisos === 1 ? 'permiso' : 'permisos'}
          </strong>
        </div>

        <div>
          <span style={{ color: '#777', display: 'block' }}>Última actualización:</span>
          <strong style={{ fontSize: '0.8125rem', color: '#333' }}>
            {formatearFecha(rol.actualizadoEn)}
          </strong>
        </div>
      </div>
    </div>
  );
}
