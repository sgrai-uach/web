import React from 'react';
import type { RecursoItem } from '@/types/recurso';
import BadgeEstado from '../BadgeEstado';

interface RecursoDetalleResumenProps {
  recurso: RecursoItem;
}

export default function RecursoDetalleResumen({ recurso }: RecursoDetalleResumenProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
            {recurso.tipo}
          </span>
          <h4 style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-teal-dark)' }}>
            {recurso.nombre}
          </h4>
        </div>
        <BadgeEstado estado={recurso.estado} />
      </div>

      {recurso.descripcion && (
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-charcoal)' }}>
          {recurso.descripcion}
        </p>
      )}

      {/* Tarjetas de stock */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
        <div style={{ padding: '10px', backgroundColor: 'var(--color-bg-light)', borderLeft: '3px solid var(--color-charcoal)' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-charcoal)' }}>Stock Total</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-teal-dark)' }}>{recurso.cantidadInventario}</div>
        </div>
        <div style={{ padding: '10px', backgroundColor: 'var(--color-bg-light)', borderLeft: '3px solid #E3A008' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-charcoal)' }}>En Uso</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#723B10' }}>{recurso.cantidadEnUso}</div>
        </div>
        <div style={{ padding: '10px', backgroundColor: 'var(--color-bg-light)', borderLeft: '3px solid var(--color-accent-mint)' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-charcoal)' }}>Disponible</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-teal-dark)' }}>{recurso.cantidadDisponible}</div>
        </div>
        <div style={{ padding: '10px', backgroundColor: 'var(--color-bg-light)', borderLeft: '3px solid #E02424' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-charcoal)' }}>Alerta Mín.</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#9B1C1C' }}>{recurso.cantidadMinima}</div>
        </div>
      </div>
    </div>
  );
}
