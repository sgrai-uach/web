import Link from 'next/link';

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#ECEFF3',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Franja utilitaria institucional (Sage) */}
      <div
        style={{
          backgroundColor: '#A9CBA4',
          color: '#24272B',
          fontSize: '12px',
          fontWeight: 600,
          padding: '6px 24px',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>MUNICIPALIDAD DE VALDIVIA — DIRECCIÓN DE GESTIÓN DE RIESGOS DE DESASTRES</span>
        <span>Plataforma Web SGRAI</span>
      </div>

      {/* Header Principal */}
      <header
        style={{
          backgroundColor: '#14505A',
          color: '#FFFFFF',
          padding: '24px',
          borderBottom: '4px solid #4FAE9B',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            SGRAI
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '15px', color: '#ECEFF3' }}>
            Sistema de Gestión de Recursos para Atención de Incidentes — Municipalidad de Valdivia
          </p>
        </div>
      </header>

      {/* Grid de Módulos */}
      <div style={{ maxWidth: '1200px', width: '100%', margin: '32px auto', padding: '0 24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#14505A', marginBottom: '20px' }}>
          Módulos y Portales del Sistema
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Card Administrador */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderTop: '4px solid #1B6F7D',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#1B6F7D', textTransform: 'uppercase' }}>
                Rol Administrador
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#24272B', margin: '8px 0 4px 0' }}>
                Inventario Logístico y Recursos
              </h3>
              <p style={{ fontSize: '13px', color: '#3B3F45', margin: 0 }}>
                Alta de nuevos recursos fungibles y activos individuales, control de stock y parametrización de auditoría.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                href="/recursos/nuevo"
                style={{
                  backgroundColor: '#4FAE9B',
                  color: '#FFFFFF',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                + Registrar Nuevo Recurso
              </Link>
              <Link
                href="/recursos"
                style={{
                  backgroundColor: '#3B3F45',
                  color: '#FFFFFF',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                Ver Inventario
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
