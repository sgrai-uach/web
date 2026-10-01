import { Metadata } from 'next';
import { MunicipalHeader } from '@/components/layout/MunicipalHeader';
import AppFooter from '@/components/layout/AppFooter';
import { SeguimientoBuscador } from '@/components/seguimiento/SeguimientoBuscador';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import { Bot, PhoneCall, ArrowRight, CheckCircle2 } from 'lucide-react';
import styles from '@/styles/seguimiento.module.css';

export const metadata: Metadata = {
  title: 'Portal de Atención Ciudadana — DGRD Municipalidad de Valdivia',
  description:
    'Canal oficial y público para reporte de emergencias comunales mediante asistente virtual y consulta del estado de atención de incidentes.',
};

export default function PortalCiudadaniaPage() {
  return (
    <div className={styles.pageWrapper}>
      <MunicipalHeader />

      <main
        style={{
          flex: 1,
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '2rem 1rem 3.5rem',
        }}
      >
        {/* Encabezado Principal del Portal Ciudadano */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Heading as="h1" variant="h1" color="teal-dark" style={{ marginBottom: '8px' }}>
            Portal de Atención Ciudadana
          </Heading>
        </div>

        {/* Grilla Responsiva Principal (2 columnas en escritorio, 1 en móviles) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            alignItems: 'stretch',
          }}
        >
          {/* Tarjeta 1: Reporte de Incidente con Asistente Virtual */}
          <section
            aria-labelledby="titulo-reporte-chatbot"
            style={{
              backgroundColor: 'var(--color-white, #FFFFFF)',
              borderTop: '5px solid var(--color-accent-mint, #4FAE9B)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08))',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--color-primary-teal, #1B6F7D)',
                  marginBottom: '12px',
                }}
              >
                <Bot size={28} />
                <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Asistente Virtual DGRD
                </span>
              </div>

              <Heading as="h2" variant="h2" color="charcoal-dark" id="titulo-reporte-chatbot" style={{ marginBottom: '12px' }}>
                Reportar Incidente o Emergencia
              </Heading>

              <p style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--color-charcoal, #3B3F45)', marginBottom: '18px' }}>
                Si presencias una situación de riesgo comunal (anegamiento, caída de árboles, postes caídos o derrumbes), nuestro asistente conversacional te guiará paso a paso para georreferenciar el incidente y derivarlo a nuestros equipos.
              </p>

              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 24px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '13px',
                  color: 'var(--color-text-muted, #5F676E)',
                }}
              >
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--color-success, #2E7D32)" />
                  <span>Reporte asistido rápido en menos de 2 minutos</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--color-success, #2E7D32)" />
                  <span>Emisión inmediata de código numérico de seguimiento</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="var(--color-success, #2E7D32)" />
                  <span>Sin necesidad de cuenta ni inicio de sesión previo</span>
                </li>
              </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Button
                href="/ciudadania/reportar"
                variant="primary"
                size="lg"
                fullWidth
                icon={<ArrowRight size={16} />}
              >
                Iniciar Reporte con Asistente
              </Button>

              <Button
                href="tel:1412"
                variant="secondary"
                size="md"
                fullWidth
                icon={<PhoneCall size={15} />}
                title="Llamada de emergencia directa al 1412"
              >
                Llamar a Emergencias (1412)
              </Button>
            </div>
          </section>

          {/* Tarjeta 2: Consulta de Estado por Código */}
          <section
            aria-labelledby="titulo-consulta-codigo"
            style={{
              backgroundColor: 'var(--color-white, #FFFFFF)',
              borderTop: '5px solid var(--color-primary-teal, #1B6F7D)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08))',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--color-primary-teal-dark, #14505A)',
                  marginBottom: '12px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Consulta Ciudadana
                </span>
              </div>

              <Heading as="h2" variant="h2" color="charcoal-dark" id="titulo-consulta-codigo" style={{ marginBottom: '12px' }}>
                Consultar Estado de tu Reporte
              </Heading>

              <p style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--color-charcoal, #3B3F45)', marginBottom: '20px' }}>
                Ingresa el código numérico de 8 dígitos entregado por el asistente al finalizar tu reporte. Podrás verificar en una página dedicada el avance de tu solicitud en tiempo real.
              </p>

              {/* Formulario de Consulta Integrado */}
              <div style={{ marginBottom: '16px' }}>
                <SeguimientoBuscador />
              </div>
            </div>
          </section>
        </div>

        {/* Sección Informativa Complementaria Responsiva */}
        <section
          style={{
            marginTop: '36px',
            backgroundColor: 'var(--color-white, #FFFFFF)',
            padding: '24px',
            border: '1px solid var(--border-color-neutral, #DFE3E8)',
          }}
          aria-label="Recomendaciones preventivas ante emergencias"
        >
          <Heading as="h3" variant="h3" color="teal-dark" style={{ marginBottom: '12px' }}>
            Recomendaciones Preventivas Comunales
          </Heading>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              fontSize: '13px',
              color: 'var(--color-charcoal, #3B3F45)',
              lineHeight: 1.45,
            }}
          >
            <div>
              <strong style={{ color: 'var(--color-primary-teal, #1B6F7D)' }}>• Temporales y Viento:</strong>
              <p style={{ margin: '4px 0 0 0' }}>Evita transitar bajo árboles frondosos o cables eléctricos expuestos durante rachas intensas.</p>
            </div>
            <div>
              <strong style={{ color: 'var(--color-primary-teal, #1B6F7D)' }}>• Anegamientos:</strong>
              <p style={{ margin: '4px 0 0 0' }}>Mantén limpias las canaletas de techumbres y sumideros domiciliarios antes de frentes de mal tiempo.</p>
            </div>
            <div>
              <strong style={{ color: 'var(--color-primary-teal, #1B6F7D)' }}>• Información Oficial:</strong>
              <p style={{ margin: '4px 0 0 0' }}>Sigue siempre las alertas preventivas emitidas por SENAPRED y la Municipalidad de Valdivia.</p>
            </div>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
