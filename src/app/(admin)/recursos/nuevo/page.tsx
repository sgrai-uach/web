import type { Metadata } from 'next';
import Link from 'next/link';
import RecursoForm from '@/components/admin/RecursoForm';
import Heading from '@/components/ui/Heading';

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
          color: 'var(--color-charcoal)',
        }}
      >
        <Link href="/" style={{ color: 'var(--color-primary-teal)', fontWeight: 500, textDecoration: 'none' }}>
          Inicio
        </Link>
        <span>&rsaquo;</span>
        <span style={{ color: 'var(--color-charcoal)' }}>Administración</span>
        <span>&rsaquo;</span>
        <Link href="/recursos" style={{ color: 'var(--color-primary-teal)', fontWeight: 500, textDecoration: 'none' }}>
          Inventario Logístico
        </Link>
        <span>&rsaquo;</span>
        <span style={{ fontWeight: 600, color: 'var(--color-primary-teal-dark)' }}>Nuevo Recurso</span>
      </nav>

      {/* Encabezado de Página */}
      <div
        style={{
          backgroundColor: 'var(--color-white)',
          padding: '24px',
          borderLeft: '5px solid var(--color-primary-teal)',
          borderBottom: '1px solid var(--color-bg-light)',
        }}
      >
        <Heading as="h1" variant="h1" color="teal-dark" noMargin>
          Registrar Nuevo Recurso
        </Heading>
        <p
          style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            color: 'var(--color-charcoal)',
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
