import type { Metadata } from 'next';
import Link from 'next/link';
import RecursoForm from '@/components/admin/RecursoForm';

export const metadata: Metadata = {
  title: 'Nuevo Recurso — Inventario Logístico | SGRAI',
  description: 'Formulario de registro y alta de recursos en el inventario logístico de Valdivia.',
};

export default function NuevoRecursoPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Breadcrumb Institucional */}
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
        <Link href="/recursos" style={{ color: '#1B6F7D', fontWeight: 500 }}>
          Inventario Logístico
        </Link>
        <span>&rsaquo;</span>
        <span style={{ fontWeight: 600, color: '#14505A' }}>Nuevo Recurso</span>
      </nav>

      {/* Encabezado de Página */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '24px',
          borderLeft: '5px solid #1B6F7D',
          borderBottom: '1px solid #ECEFF3',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 800,
            color: '#14505A',
            letterSpacing: '-0.3px',
          }}
        >
          Registrar Nuevo Recurso
        </h1>
        <p
          style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            color: '#3B3F45',
            maxWidth: '800px',
          }}
        >
          Completa el formulario para dar de alta un recurso fungible a granel o un activo físico
          individual en el inventario logístico municipal de Valdivia.
        </p>
      </div>

      {/* Formulario */}
      <RecursoForm />
    </div>
  );
}
