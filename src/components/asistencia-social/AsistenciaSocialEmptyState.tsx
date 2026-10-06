'use client';

import React from 'react';
import { HeartHandshake, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';

interface AsistenciaSocialEmptyStateProps {
  tieneFiltros: boolean;
  onLimpiarFiltros?: () => void;
  puedeCrear?: boolean;
  basePath?: string;
}

export default function AsistenciaSocialEmptyState({
  tieneFiltros,
  onLimpiarFiltros,
  puedeCrear,
  basePath = '/gestion/asistente-social',
}: AsistenciaSocialEmptyStateProps) {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color-neutral, #DFE3E8)',
        padding: 'var(--space-12, 48px) var(--space-6, 24px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          backgroundColor: 'var(--color-bg-light, #ECEFF3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-4, 16px)',
          color: 'var(--color-primary-teal, #1B6F7D)',
        }}
      >
        <HeartHandshake size={28} />
      </div>

      <h3
        style={{
          fontSize: 'var(--font-size-lg, 1.125rem)',
          fontWeight: 700,
          color: 'var(--color-charcoal, #3B3F45)',
          margin: '0 0 var(--space-2, 8px) 0',
        }}
      >
        {tieneFiltros
          ? 'No se encontraron eventos con los filtros aplicados'
          : 'No hay eventos de asistencia social pendientes'}
      </h3>

      <p
        style={{
          fontSize: 'var(--font-size-base, 0.875rem)',
          color: 'var(--color-text-muted, #5F676E)',
          maxWidth: '480px',
          margin: '0 0 var(--space-6, 24px) 0',
          lineHeight: 1.5,
        }}
      >
        {tieneFiltros
          ? 'Intente modificar los términos de búsqueda o restablecer los filtros para visualizar los casos de emergencia social.'
          : 'Actualmente no existen casos excepcionales registrados a la espera de asignación de asistentes sociales.'}
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-3, 12px)', flexWrap: 'wrap', justifyContent: 'center' }}>
        {tieneFiltros && onLimpiarFiltros && (
          <Button type="button" variant="secondary" size="md" onClick={onLimpiarFiltros}>
            Restablecer Filtros
          </Button>
        )}

        {puedeCrear && (
          <Button href={`${basePath}/nuevo`} variant="primary" size="md">
            <Plus size={16} style={{ marginRight: '6px' }} />
            <span>Crear Primer Evento Social</span>
          </Button>
        )}
      </div>
    </div>
  );
}
