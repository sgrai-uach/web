import React from 'react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import AppFooter from '@/components/layout/AppFooter';
import {
  Phone,
  Users,
  ShieldCheck,
  Bot,
  Search,
  PhoneCall,
  MapPin,
  Boxes,
  Compass,
  CheckSquare,
  HardHat,
  Navigation,
  ArrowRight,
} from 'lucide-react';
import { EMERGENCY_PHONE } from '@/lib/constants/contacto';

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-light, #ECEFF3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Franja utilitaria institucional (Sage) */}
      <div
        style={{
          backgroundColor: 'var(--color-sage, #A9CBA4)',
          color: 'var(--color-charcoal-dark, #24272B)',
          fontSize: '12px',
          fontWeight: 700,
          padding: '8px 24px',
          letterSpacing: '0.4px',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--container-max-width, 1400px)',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span>DIRECCIÓN DE GESTIÓN DE RIESGOS DE DESASTRES &bull; MUNICIPALIDAD DE VALDIVIA</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={13} />
            Mesa Central de Emergencias {EMERGENCY_PHONE}
          </span>
        </div>
      </div>

      {/* Header Institucional */}
      <header
        style={{
          backgroundColor: 'var(--color-primary-teal-dark, #14505A)',
          color: 'var(--color-text-light, #FFFFFF)',
          padding: '36px 24px',
          borderBottom: '5px solid var(--color-accent-mint, #4FAE9B)',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--container-max-width, 1400px)',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <Heading as="h1" variant="display" color="white" noMargin>
            SGRAI Valdivia
          </Heading>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '16px',
              lineHeight: 1.5,
              color: 'var(--color-bg-light, #ECEFF3)',
              maxWidth: '800px',
            }}
          >
            Sistema de Gestión de Recursos para Atención de Incidentes de la Ilustre Municipalidad
            de Valdivia. Seleccione el portal correspondiente para continuar.
          </p>
        </div>
      </header>

      {/* Selector de Portales */}
      <div
        style={{
          maxWidth: 'var(--container-max-width, 1400px)',
          width: '100%',
          margin: '40px auto',
          padding: '0 24px',
          flex: 1,
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <Heading as="h2" variant="h2" color="teal-dark" noMargin>
            Portales de Acceso
          </Heading>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: '28px',
          }}
        >
          {/* Tarjeta 1: Portal de Atención Ciudadana */}
          <div
            style={{
              backgroundColor: 'var(--color-white, #FFFFFF)',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              borderTop: '5px solid var(--color-accent-mint, #4FAE9B)',
              padding: 'clamp(20px, 4vw, 32px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08))',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
                    color: 'var(--color-charcoal-dark, #24272B)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={26} />
                </div>
                <span
                  style={{
                    backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                    color: 'var(--color-primary-teal, #1B6F7D)',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '4px 10px',
                    letterSpacing: '0.4px',
                  }}
                >
                  Canal Público y Abierto
                </span>
              </div>

              <Heading as="h3" variant="h3" color="teal" noMargin>
                Portal de Atención Ciudadana
              </Heading>

              <p
                style={{
                  margin: '12px 0 20px 0',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: 'var(--color-text-muted, #5F676E)',
                }}
              >
                Reporte emergencias comunales de
                forma guiada mediante asistente virtual o consulte el estado de avance de su
                reporte con su código numérico de 8 dígitos.
              </p>

              <div
                style={{
                  backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <Bot size={16} color="var(--color-primary-teal, #1B6F7D)" />
                  <span>Reporte asistido mediante Chatbot</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <Search size={16} color="var(--color-primary-teal, #1B6F7D)" />
                  <span>Consulta de estado por código de seguimiento</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <PhoneCall size={16} color="var(--color-primary-teal, #1B6F7D)" />
                  <span>Acceso directo a central telefónica {EMERGENCY_PHONE}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Button
                variant="primary"
                size="lg"
                href="/ciudadania"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>Ingresar al Portal Ciudadano</span>
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>

          {/* Tarjeta 2: Portal de Gestión de Recursos e Incidentes */}
          <div
            style={{
              backgroundColor: 'var(--color-white, #FFFFFF)',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              borderTop: '5px solid var(--color-primary-teal-dark, #14505A)',
              padding: 'clamp(20px, 4vw, 32px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08))',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'var(--color-primary-teal-dark, #14505A)',
                    color: 'var(--color-white, #FFFFFF)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldCheck size={26} />
                </div>
                <span
                  style={{
                    backgroundColor: 'var(--color-warning-bg, #FFF3E0)',
                    color: 'var(--color-warning, #E65100)',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '4px 10px',
                    letterSpacing: '0.4px',
                  }}
                >
                  Acceso Restringido &bull; Requiere Sesión
                </span>
              </div>

              <Heading as="h3" variant="h3" color="teal-dark" noMargin>
                Portal de Gestión de Recursos e Incidentes
              </Heading>

              <p
                style={{
                  margin: '12px 0 20px 0',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: 'var(--color-text-muted, #5F676E)',
                }}
              >
                Plataforma operacional para funcionarios municipales, operadores de central de
                emergencias, despachadores, encargados comunales y administradores del sistema.
              </p>

              <div
                style={{
                  backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <MapPin size={16} color="var(--color-primary-teal-dark, #14505A)" />
                  <span>Centro de Mando y Despacho Táctico</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <PhoneCall size={16} color="var(--color-primary-teal-dark, #14505A)" />
                  <span>Bandeja de Call Center y Verificación</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <Boxes size={16} color="var(--color-primary-teal-dark, #14505A)" />
                  <span>Inventario Logístico, Personal y Seguridad RBAC</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Button
                variant="secondary"
                size="lg"
                href="/gestion"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>Acceder al Portal de Gestión</span>
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>

          {/* Tarjeta 3: Aplicación Operativa de Terreno (PWA) */}
          <div
            style={{
              backgroundColor: 'var(--color-white, #FFFFFF)',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              borderTop: '5px solid var(--color-primary-teal, #1B6F7D)',
              padding: 'clamp(20px, 4vw, 32px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08))',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'var(--color-primary-teal, #1B6F7D)',
                    color: 'var(--color-white, #FFFFFF)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Compass size={26} />
                </div>
                <span
                  style={{
                    backgroundColor: 'var(--color-info-bg, #E0F2F1)',
                    color: 'var(--color-primary-teal-dark, #14505A)',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '4px 10px',
                    letterSpacing: '0.4px',
                  }}
                >
                  Unidades Móviles &bull; Requiere Sesión
                </span>
              </div>

              <Heading as="h3" variant="h3" color="teal" noMargin>
                Aplicación Operativa de Terreno
              </Heading>

              <p
                style={{
                  margin: '12px 0 20px 0',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: 'var(--color-text-muted, #5F676E)',
                }}
              >
                Plataforma móvil (PWA) diseñada para Patrullas Verificadoras y Delegados de
                Cuadrilla desplegados en la comuna, con soporte de operación sin conexión.
              </p>

              <div
                style={{
                  backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <CheckSquare size={16} color="var(--color-primary-teal, #1B6F7D)" />
                  <span>Verificación y triage primario de incidentes en terreno</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <HardHat size={16} color="var(--color-primary-teal, #1B6F7D)" />
                  <span>Ejecución de faenas pesadas, evidencia y cierre técnico</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <Navigation size={16} color="var(--color-primary-teal, #1B6F7D)" />
                  <span>Posicionamiento GPS y cola de sincronización offline</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Button
                variant="teal"
                size="lg"
                href="/terreno"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>Ingresar a App de Terreno</span>
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AppFooter />
    </main>
  );
}
