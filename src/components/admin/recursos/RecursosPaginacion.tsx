'use client';

interface RecursosPaginacionProps {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
  onCambiarPagina: (nuevaPagina: number) => void;
  onCambiarLimite: (nuevoLimite: number) => void;
}

export default function RecursosPaginacion({
  pagina,
  limite,
  total,
  totalPaginas,
  onCambiarPagina,
  onCambiarLimite,
}: RecursosPaginacionProps) {
  if (total === 0) return null;

  const desde = Math.min((pagina - 1) * limite + 1, total);
  const hasta = Math.min(pagina * limite, total);

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        padding: '12px 20px',
        border: '1px solid #D5DCE4',
        borderTop: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        fontSize: '13px',
      }}
    >
      {/* Información de rango */}
      <div style={{ color: '#3B3F45' }}>
        Mostrando <strong>{desde}</strong> a <strong>{hasta}</strong> de{' '}
        <strong>{total}</strong> recursos registrados
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {/* Selector de límite de elementos por página */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="select-limite-pagina" style={{ color: '#3B3F45', fontWeight: 600 }}>
            Por página:
          </label>
          <select
            id="select-limite-pagina"
            value={limite}
            onChange={(e) => onCambiarLimite(Number(e.target.value))}
            style={{
              padding: '6px 10px',
              border: '1px solid #D5DCE4',
              borderRadius: 0,
              backgroundColor: '#F8FAFC',
              color: '#2B2B2B',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Controles de Navegación de Páginas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => onCambiarPagina(pagina - 1)}
            disabled={pagina <= 1}
            style={{
              padding: '6px 14px',
              backgroundColor: pagina <= 1 ? '#ECEFF3' : '#1B6F7D',
              color: pagina <= 1 ? '#9CA3AF' : '#FFFFFF',
              border: 'none',
              borderRadius: 0,
              fontWeight: 600,
              cursor: pagina <= 1 ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            &larr; Anterior
          </button>

          <span style={{ color: '#14505A', fontWeight: 700, padding: '0 4px' }}>
            Página {pagina} de {Math.max(1, totalPaginas)}
          </span>

          <button
            type="button"
            onClick={() => onCambiarPagina(pagina + 1)}
            disabled={pagina >= totalPaginas || totalPaginas === 0}
            style={{
              padding: '6px 14px',
              backgroundColor:
                pagina >= totalPaginas || totalPaginas === 0 ? '#ECEFF3' : '#1B6F7D',
              color:
                pagina >= totalPaginas || totalPaginas === 0 ? '#9CA3AF' : '#FFFFFF',
              border: 'none',
              borderRadius: 0,
              fontWeight: 600,
              cursor:
                pagina >= totalPaginas || totalPaginas === 0 ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            Siguiente &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
