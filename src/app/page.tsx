import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'inherit' }}>
      <h1 style={{ color: 'var(--color-primary-teal, #1B6F7D)', marginBottom: '0.5rem' }}>
        SGRAI
      </h1>
      <p style={{ marginBottom: '1.5rem', color: '#444' }}>
        Sistema de Gestión de Recursos para Atención de Incidentes &mdash;
        Municipalidad de Valdivia.
      </p>
      <div>
        <Link
          href="/callcenter"
          style={{
            display: 'inline-block',
            backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
            color: '#FFFFFF',
            padding: '0.75rem 1.5rem',
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          Ir a Centro Call Center &rarr;
        </Link>
      </div>
    </main>
  );
}
