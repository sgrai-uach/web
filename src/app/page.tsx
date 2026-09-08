import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-light, #ECEFF3)' }}>
      {/* Header Institucional */}
      <header
        style={{
          backgroundColor: 'var(--color-primary-teal-dark, #14505A)',
          color: '#FFFFFF',
          padding: '1.25rem 2rem',
          borderBottom: '4px solid var(--color-accent-mint, #4FAE9B)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: '#FFFFFF',
            }}
          >
            V
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>
              Ilustre Municipalidad de Valdivia &bull; Dirección de Gestión de Riesgos de Desastres
            </div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
              SGRAI &mdash; Plataforma Integral de Gestión de Incidentes
            </h1>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
        <div
          style={{
            backgroundColor: 'var(--color-white, #FFFFFF)',
            border: '1px solid #DFE3E8',
            padding: '2rem',
            marginBottom: '2rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              color: 'var(--color-primary-teal, #1B6F7D)',
              fontWeight: 700,
              marginBottom: '0.75rem',
            }}
          >
            Acceso a Módulos y Roles Operativos
          </h2>
          <p style={{ fontSize: '0.9375rem', color: '#444', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Seleccione el portal de trabajo correspondiente a su rol institucional para la atención
            y despacho de emergencias en la comuna de Valdivia.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Tarjeta Call Center (HU-52) */}
            <div
              style={{
                border: '2px solid var(--color-primary-teal, #1B6F7D)',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ padding: '1.5rem' }}>
                <div
                  style={{
                    backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
                    color: '#FFFFFF',
                    display: 'inline-block',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                  }}
                >
                  HU-52 Disponible
                </div>
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: 'var(--color-primary-teal, #1B6F7D)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Centro Call Center
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.5 }}>
                  Bandeja de entrada de avisos ciudadanos en tiempo real, priorización por semáforo de
                  espera, verificación con mapa interactivo y derivación a incidentes formales.
                </p>
              </div>

              <Link
                href="/callcenter"
                style={{
                  backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
                  color: '#FFFFFF',
                  padding: '0.875rem 1.5rem',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  display: 'block',
                  textDecoration: 'none',
                }}
              >
                Ingresar a Call Center &rarr;
              </Link>
            </div>

            {/* Módulo Centro de Mando */}
            <div
              style={{
                border: '1px solid #DFE3E8',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: 0.85,
              }}
            >
              <div style={{ padding: '1.5rem' }}>
                <div
                  style={{
                    backgroundColor: 'var(--color-charcoal, #3B3F45)',
                    color: '#FFFFFF',
                    display: 'inline-block',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                  }}
                >
                  Rol Encargado
                </div>
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: 'var(--color-charcoal, #3B3F45)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Centro de Mando
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.5 }}>
                  Tablero Kanban de incidentes verificados, asignación de cuadrillas operativas y patrullas
                  verificadoras en terreno.
                </p>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--color-charcoal, #3B3F45)',
                  color: '#CCCCCC',
                  padding: '0.875rem 1.5rem',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                }}
              >
                Módulo de Operaciones
              </div>
            </div>

            {/* Módulo Asistente Social */}
            <div
              style={{
                border: '1px solid #DFE3E8',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: 0.85,
              }}
            >
              <div style={{ padding: '1.5rem' }}>
                <div
                  style={{
                    backgroundColor: 'var(--color-charcoal, #3B3F45)',
                    color: '#FFFFFF',
                    display: 'inline-block',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                  }}
                >
                  Rol Social
                </div>
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: 'var(--color-charcoal, #3B3F45)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Asistencia Social (FIBE)
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.5 }}>
                  Gestión y seguimiento de fichas FIBE para personas damnificadas y derivaciones desde
                  el Call Center.
                </p>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--color-charcoal, #3B3F45)',
                  color: '#CCCCCC',
                  padding: '0.875rem 1.5rem',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                }}
              >
                Módulo Social
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
