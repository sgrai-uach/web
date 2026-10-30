import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, HardHat } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Cuadrillas Operativas — Administración | SGRAI',
  description: 'Gestión y administración de cuadrillas operativas municipales de Valdivia.',
};

export default function CuadrillasIndexPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Breadcrumb */}
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
        <Link href="/gestion" style={{ color: 'var(--color-primary-teal)', fontWeight: 500, textDecoration: 'none' }}>
          Inicio
        </Link>
        <span>&rsaquo;</span>
        <span style={{ color: 'var(--color-charcoal)' }}>Administración</span>
        <span>&rsaquo;</span>
        <span style={{ fontWeight: 600, color: 'var(--color-primary-teal-dark)' }}>Cuadrillas Operativas</span>
      </nav>

      {/* Cabecera */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--color-white)',
          padding: '24px',
          borderLeft: '5px solid var(--color-primary-teal)',
          borderBottom: '1px solid var(--color-bg-light)',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <Heading as="h1" variant="h1" color="teal-dark" noMargin>
            Cuadrillas Operativas
          </Heading>
          <p
            style={{
              margin: '8px 0 0 0',
              fontSize: '14px',
              color: 'var(--color-charcoal)',
            }}
          >
            Gestión de unidades pesadas para despeje, vialidad y mitigación ante emergencias en la comuna.
          </p>
        </div>

        <Link href="/gestion/admin/cuadrillas/nuevo" style={{ textDecoration: 'none' }}>
          <Button variant="primary" icon={<Plus size={16} />}>
            Registrar Nueva Cuadrilla
          </Button>
        </Link>
      </div>

      {/* Tarjeta de Resumen / Estado */}
      <div
        style={{
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--border-color-neutral)',
          padding: '32px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <HardHat size={48} style={{ color: 'var(--color-primary-teal)' }} />
        <Heading as="h3" variant="h3" color="teal-dark" noMargin>
          Administración de Cuadrillas y Misiones
        </Heading>
        <p style={{ maxWidth: '600px', fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>
          Las cuadrillas registradas se visualizan y coordinan tácticamente a través del{' '}
          <Link href="/gestion/centro-incidentes" style={{ color: 'var(--color-primary-teal)', fontWeight: 600 }}>
            Centro de Mando
          </Link>
          . Puede dar de alta nuevas unidades operativas asignándoles una delegación municipal base y un delegado de terreno responsable.
        </p>

        <div style={{ marginTop: '8px' }}>
          <Link href="/gestion/admin/cuadrillas/nuevo" style={{ textDecoration: 'none' }}>
            <Button variant="primary" icon={<Plus size={16} />}>
              Registrar Nueva Cuadrilla
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
