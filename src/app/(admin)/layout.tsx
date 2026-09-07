import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Administración — SGRAI Municipalidad de Valdivia',
  description: 'Panel de Administración y Gestión de Recursos para Atención de Incidentes',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ECEFF3' }}>
      {/* Franja superior institucional utilitaria (Sage) */}
      <div
        style={{
          backgroundColor: '#A9CBA4',
          color: '#24272B',
          fontSize: '12px',
          fontWeight: 600,
          padding: '6px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>MUNICIPALIDAD DE VALDIVIA — DIRECCIÓN DE GESTIÓN DE RIESGOS DE DESASTRES</span>
        <span>Entorno: Sistema On-Premise</span>
      </div>

      {/* Barra de navegación principal (Teal Dark) */}
      <header
        style={{
          backgroundColor: '#14505A',
          color: '#FFFFFF',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '3px solid #4FAE9B',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            href="/"
            style={{
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '20px',
              letterSpacing: '0.5px',
              textDecoration: 'none',
            }}
          >
            SGRAI
          </Link>
          <span style={{ color: '#A9CBA4', fontSize: '18px' }}>|</span>
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#ECEFF3' }}>
            Panel Administrador
          </span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link
            href="/recursos"
            style={{
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              padding: '6px 12px',
              backgroundColor: '#1B6F7D',
            }}
          >
            Inventario Logístico
          </Link>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              backgroundColor: '#24272B',
              padding: '6px 12px',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: 0, backgroundColor: '#4FAE9B' }} />
            <span>Administrador (00000000-0000...0001)</span>
          </div>
        </nav>
      </header>

      {/* Contenido Principal */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        {children}
      </main>

      {/* Footer Institucional */}
      <footer
        style={{
          backgroundColor: '#24272B',
          color: '#ECEFF3',
          padding: '16px 24px',
          fontSize: '12px',
          textAlign: 'center',
          marginTop: 'auto',
          borderTop: '1px solid #3B3F45',
        }}
      >
        <p style={{ margin: 0 }}>
          SGRAI — Sistema de Gestión de Recursos para Atención de Incidentes &bull; Municipalidad de Valdivia &bull; 2026
        </p>
      </footer>
    </div>
  );
}
