import React from 'react';
import { SearchX, Inbox } from 'lucide-react';
import Button from '@/components/ui/Button';

interface AvisosTableEmptyProps {
  cargando: boolean;
  hayFiltrosActivos?: boolean;
  onLimpiarFiltros?: () => void;
}

export default function AvisosTableEmpty({
  cargando,
  hayFiltrosActivos = false,
  onLimpiarFiltros,
}: AvisosTableEmptyProps) {
  if (cargando) {
    return (
      <tr>
        <td
          colSpan={7}
          style={{
            padding: '3rem 1rem',
            textAlign: 'center',
            color: 'var(--color-charcoal, #3B3F45)',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
            Cargando avisos de emergencia...
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#666' }}>
            Conectando con la base de datos municipal...
          </div>
        </td>
      </tr>
    );
  }

  // Estado cuando la combinación de filtros no arrojó resultados
  if (hayFiltrosActivos) {
    return (
      <tr>
        <td
          colSpan={7}
          style={{
            padding: '3.5rem 1rem',
            textAlign: 'center',
            backgroundColor: '#FAFAFA',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--color-bg-light, #ECEFF3)',
              color: 'var(--color-charcoal, #3B3F45)',
              border: '1px solid #CCD2D9',
              width: '48px',
              height: '48px',
              marginBottom: '0.75rem',
            }}
          >
            <SearchX size={24} aria-hidden="true" />
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: '1.125rem',
              color: 'var(--color-charcoal, #3B3F45)',
              marginBottom: '0.35rem',
            }}
          >
            No se encontraron avisos coincidentes
          </div>
          <div
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-muted, #5F676E)',
              maxWidth: '420px',
              margin: '0 auto 1.25rem',
            }}
          >
            No existen reportes que coincidan con la totalidad de los criterios aplicados. Prueba ajustando los filtros o restableciendo la búsqueda.
          </div>
          {onLimpiarFiltros && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onLimpiarFiltros}
              title="Restablecer todos los filtros"
            >
              Limpiar filtros
            </Button>
          )}
        </td>
      </tr>
    );
  }

  // Estado bandeja vacía sin filtros
  return (
    <tr>
      <td
        colSpan={7}
        style={{
          padding: '3.5rem 1rem',
          textAlign: 'center',
          backgroundColor: '#FAFAFA',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
            color: '#FFFFFF',
            width: '44px',
            height: '44px',
            marginBottom: '0.75rem',
          }}
        >
          <Inbox size={22} aria-hidden="true" />
        </div>
        <div
          style={{
            fontWeight: 700,
            fontSize: '1rem',
            color: 'var(--color-primary-teal, #1B6F7D)',
            marginBottom: '0.25rem',
          }}
        >
          No hay avisos pendientes en la bandeja
        </div>
        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          El sistema está escuchando en tiempo real vía WebSockets para nuevos reportes de la ciudadanía.
        </div>
      </td>
    </tr>
  );
}
