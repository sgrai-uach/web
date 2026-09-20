import Link from 'next/link';

interface RecursosEmptyStateProps {
  esFiltroActivo: boolean;
  onLimpiarFiltros?: () => void;
}

export default function RecursosEmptyState({
  esFiltroActivo,
  onLimpiarFiltros,
}: RecursosEmptyStateProps) {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        border: '1px dashed #D5DCE4',
        margin: '24px 0',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          backgroundColor: '#ECEFF3',
          color: '#14505A',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          marginBottom: '16px',
        }}
      >
        📦
      </div>

      <h3
        style={{
          margin: '0 0 8px 0',
          color: '#14505A',
          fontSize: '18px',
          fontWeight: 700,
        }}
      >
        No hay recursos registrados
      </h3>

      <p
        style={{
          margin: '0 0 24px 0',
          color: '#3B3F45',
          fontSize: '14px',
          maxWidth: '520px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: '1.5',
        }}
      >
        {esFiltroActivo
          ? 'No se encontraron recursos logísticos que coincidan con los criterios de búsqueda o filtros aplicados.'
          : 'Actualmente no existen recursos ingresados en el inventario logístico municipal para atención de incidentes.'}
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {esFiltroActivo && onLimpiarFiltros && (
          <button
            type="button"
            onClick={onLimpiarFiltros}
            style={{
              backgroundColor: '#ECEFF3',
              color: '#14505A',
              border: '1px solid #D5DCE4',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: 0,
            }}
          >
            Limpiar Filtros
          </button>
        )}

        <Link
          href="/recursos/nuevo"
          style={{
            backgroundColor: '#4FAE9B',
            color: '#FFFFFF',
            padding: '10px 24px',
            fontSize: '14px',
            textDecoration: 'none',
            fontWeight: 700,
            borderRadius: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>+</span>
          <span>Registrar Nuevo Recurso</span>
        </Link>
      </div>
    </div>
  );
}
