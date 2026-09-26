import React from 'react';

interface AvisosPaginationProps {
  paginaActual: number;
  totalPaginas: number;
  totalItems: number;
  limite: number;
  onCambiarPagina: (pagina: number) => void;
  onCambiarLimite: (limite: number) => void;
}

export default function AvisosPagination({
  paginaActual,
  totalPaginas,
  totalItems,
  limite,
  onCambiarPagina,
  onCambiarLimite,
}: AvisosPaginationProps) {
  const inicioRango = totalItems === 0 ? 0 : (paginaActual - 1) * limite + 1;
  const finRango = Math.min(paginaActual * limite, totalItems);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.875rem 1.5rem',
        borderTop: '1px solid #DFE3E8',
        backgroundColor: 'var(--color-bg-light, #ECEFF3)',
        gap: '1rem',
        fontSize: '0.875rem',
      }}
    >
      <div style={{ color: 'var(--color-charcoal, #3B3F45)' }}>
        Mostrando <strong>{inicioRango}</strong> a <strong>{finRango}</strong> de{' '}
        <strong>{totalItems}</strong> avisos
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.8125rem', color: '#555' }}>Mostrar:</span>
          <select
            value={limite}
            onChange={(e) => onCambiarLimite(Number(e.target.value))}
            style={{
              padding: '0.35rem 0.5rem',
              border: '1px solid #BAC7D5',
              fontSize: '0.8125rem',
              backgroundColor: '#FFFFFF',
              borderRadius: 0,
              cursor: 'pointer',
            }}
            aria-label="Avisos por página"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            type="button"
            disabled={paginaActual <= 1}
            onClick={() => onCambiarPagina(paginaActual - 1)}
            style={{
              backgroundColor: paginaActual <= 1 ? '#E0E0E0' : 'var(--color-charcoal, #3B3F45)',
              color: paginaActual <= 1 ? '#9E9E9E' : '#FFFFFF',
              border: 'none',
              padding: '0.35rem 0.75rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: paginaActual <= 1 ? 'not-allowed' : 'pointer',
              borderRadius: 0,
            }}
          >
            &larr; Anterior
          </button>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 0.5rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            Pág. {paginaActual} de {Math.max(1, totalPaginas)}
          </span>

          <button
            type="button"
            disabled={paginaActual >= totalPaginas}
            onClick={() => onCambiarPagina(paginaActual + 1)}
            style={{
              backgroundColor:
                paginaActual >= totalPaginas ? '#E0E0E0' : 'var(--color-charcoal, #3B3F45)',
              color: paginaActual >= totalPaginas ? '#9E9E9E' : '#FFFFFF',
              border: 'none',
              padding: '0.35rem 0.75rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: paginaActual >= totalPaginas ? 'not-allowed' : 'pointer',
              borderRadius: 0,
            }}
          >
            Siguiente &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
