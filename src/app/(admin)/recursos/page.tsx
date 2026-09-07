import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Inventario Logístico — SGRAI',
  description: 'Gestión y control de inventario de recursos logísticos municipales.',
};

export default function RecursosListPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: '#3B3F45',
        }}
      >
        <Link href="/" style={{ color: '#1B6F7D', fontWeight: 500 }}>
          Inicio
        </Link>
        <span>&rsaquo;</span>
        <span style={{ color: '#3B3F45' }}>Administración</span>
        <span>&rsaquo;</span>
        <span style={{ fontWeight: 600, color: '#14505A' }}>Inventario Logístico</span>
      </nav>

      {/* Header con botón de acción */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          borderLeft: '5px solid #1B6F7D',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 800,
              color: '#14505A',
              letterSpacing: '-0.3px',
            }}
          >
            Inventario Logístico de Recursos
          </h1>
          <p
            style={{
              margin: '6px 0 0 0',
              fontSize: '14px',
              color: '#3B3F45',
            }}
          >
            Catálogo de materiales fungibles, maquinaria y vehículos para atención de incidentes.
          </p>
        </div>

        <Link
          href="/recursos/nuevo"
          style={{
            backgroundColor: '#4FAE9B',
            color: '#FFFFFF',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          + Registrar Nuevo Recurso
        </Link>
      </div>

      {/* Contenedor Informativo Placeholder */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '36px 24px',
          textAlign: 'center',
          border: '1px solid #ECEFF3',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#ECEFF3',
            color: '#1B6F7D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}
        >
          📦
        </div>
        <div style={{ maxWidth: '600px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#14505A', margin: '0 0 8px 0' }}>
            Listado de Recursos en Preparación
          </h2>
          <p style={{ fontSize: '14px', color: '#3B3F45', margin: 0 }}>
            El módulo de visualización tabular, filtros por delegación y búsqueda avanzada de inventario
            se integrará en la historia de usuario de listado de recursos. Por ahora, puedes ingresar y
            registrar nuevos activos en el sistema mediante el botón superior.
          </p>
        </div>

        <Link
          href="/recursos/nuevo"
          style={{
            marginTop: '8px',
            backgroundColor: '#1B6F7D',
            color: '#FFFFFF',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Ir a Registrar Recurso &rarr;
        </Link>
      </div>
    </div>
  );
}
