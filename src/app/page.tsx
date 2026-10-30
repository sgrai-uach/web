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
import styles from './HomePage.module.css';

export default function Home() {
  return (
    <main className={styles.pageMain}>
      {/* Franja utilitaria institucional (Sage) */}
      <div className={styles.utilityBar}>
        <div className={styles.utilityBarInner}>
          <span className={styles.utilityDeptText}>
            DIRECCIÓN DE GESTIÓN DE RIESGOS DE DESASTRES &bull; MUNICIPALIDAD DE VALDIVIA
          </span>
          <span className={styles.utilityPhone}>
            <Phone size={13} className={styles.utilityPhoneIcon} />
            Mesa Central de Emergencias {EMERGENCY_PHONE}
          </span>
        </div>
      </div>

      {/* Header Institucional */}
      <header className={styles.heroHeader}>
        <div className={styles.heroInner}>
          <Heading as="h1" variant="display" color="white" noMargin className={styles.heroTitle}>
            SGRAI Valdivia
          </Heading>
          <p className={styles.heroDescription}>
            Sistema de Gestión de Recursos para Atención de Incidentes de la Ilustre Municipalidad
            de Valdivia. Seleccione el portal correspondiente para continuar.
          </p>
        </div>
      </header>

      {/* Selector de Portales */}
      <div className={styles.portalsContainer}>
        <div className={styles.sectionHeadingWrapper}>
          <Heading as="h2" variant="h2" color="teal-dark" noMargin className={styles.sectionTitle}>
            Portales de Acceso
          </Heading>
        </div>

        <div className={styles.portalsGrid}>
          {/* Tarjeta 1: Portal de Atención Ciudadana */}
          <div className={`${styles.portalCard} ${styles.cardCitizen}`}>
            <div>
              <div className={styles.cardTopRow}>
                <div className={`${styles.cardIconBox} ${styles.iconCitizen}`}>
                  <Users size={24} />
                </div>
                <span className={`${styles.cardBadge} ${styles.badgeCitizen}`}>
                  Canal Público y Abierto
                </span>
              </div>

              <Heading as="h3" variant="h3" color="teal" noMargin className={styles.cardTitle}>
                Portal de Atención Ciudadana
              </Heading>

              <p className={styles.cardDescription}>
                Reporte emergencias comunales de forma guiada mediante asistente virtual o consulte
                el estado de avance de su reporte con su código numérico de 8 dígitos.
              </p>

              <div className={styles.featureList}>
                <div className={styles.featureItem}>
                  <Bot
                    size={16}
                    color="var(--color-primary-teal, #1B6F7D)"
                    className={styles.featureIcon}
                  />
                  <span>Reporte asistido mediante Chatbot</span>
                </div>
                <div className={styles.featureItem}>
                  <Search
                    size={16}
                    color="var(--color-primary-teal, #1B6F7D)"
                    className={styles.featureIcon}
                  />
                  <span>Consulta de estado por código de seguimiento</span>
                </div>
                <div className={styles.featureItem}>
                  <PhoneCall
                    size={16}
                    color="var(--color-primary-teal, #1B6F7D)"
                    className={styles.featureIcon}
                  />
                  <span>Acceso directo a central telefónica {EMERGENCY_PHONE}</span>
                </div>
              </div>
            </div>

            <div className={styles.cardActions}>
              <Button
                variant="primary"
                size="lg"
                href="/ciudadania"
                className={styles.ctaButton}
              >
                <span>Ingresar al Portal Ciudadano</span>
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>

          {/* Tarjeta 2: Portal de Gestión de Recursos e Incidentes */}
          <div className={`${styles.portalCard} ${styles.cardManagement}`}>
            <div>
              <div className={styles.cardTopRow}>
                <div className={`${styles.cardIconBox} ${styles.iconManagement}`}>
                  <ShieldCheck size={24} />
                </div>
                <span className={`${styles.cardBadge} ${styles.badgeManagement}`}>
                  Acceso Restringido &bull; Requiere Sesión
                </span>
              </div>

              <Heading as="h3" variant="h3" color="teal-dark" noMargin className={styles.cardTitle}>
                Portal de Gestión de Recursos e Incidentes
              </Heading>

              <p className={styles.cardDescription}>
                Plataforma operacional para funcionarios municipales, operadores de central de
                emergencias, despachadores, encargados comunales y administradores del sistema.
              </p>

              <div className={styles.featureList}>
                <div className={styles.featureItem}>
                  <MapPin
                    size={16}
                    color="var(--color-primary-teal-dark, #14505A)"
                    className={styles.featureIcon}
                  />
                  <span>Centro de Mando y Despacho Táctico</span>
                </div>
                <div className={styles.featureItem}>
                  <PhoneCall
                    size={16}
                    color="var(--color-primary-teal-dark, #14505A)"
                    className={styles.featureIcon}
                  />
                  <span>Bandeja de Call Center y Verificación</span>
                </div>
                <div className={styles.featureItem}>
                  <Boxes
                    size={16}
                    color="var(--color-primary-teal-dark, #14505A)"
                    className={styles.featureIcon}
                  />
                  <span>Inventario Logístico, Personal y Seguridad RBAC</span>
                </div>
              </div>
            </div>

            <div className={styles.cardActions}>
              <Button
                variant="secondary"
                size="lg"
                href="/gestion"
                className={styles.ctaButton}
              >
                <span>Acceder al Portal de Gestión</span>
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>

          {/* Tarjeta 3: Aplicación Operativa de Terreno (PWA) */}
          <div className={`${styles.portalCard} ${styles.cardTerreno}`}>
            <div>
              <div className={styles.cardTopRow}>
                <div className={`${styles.cardIconBox} ${styles.iconTerreno}`}>
                  <Compass size={24} />
                </div>
                <span className={`${styles.cardBadge} ${styles.badgeTerreno}`}>
                  Unidades Móviles &bull; Requiere Sesión
                </span>
              </div>

              <Heading as="h3" variant="h3" color="teal" noMargin className={styles.cardTitle}>
                Aplicación Operativa de Terreno
              </Heading>

              <p className={styles.cardDescription}>
                Plataforma móvil (PWA) diseñada para Patrullas Verificadoras y Delegados de
                Cuadrilla desplegados en la comuna, con soporte de operación sin conexión.
              </p>

              <div className={styles.featureList}>
                <div className={styles.featureItem}>
                  <CheckSquare
                    size={16}
                    color="var(--color-primary-teal, #1B6F7D)"
                    className={styles.featureIcon}
                  />
                  <span>Verificación y triage primario de incidentes en terreno</span>
                </div>
                <div className={styles.featureItem}>
                  <HardHat
                    size={16}
                    color="var(--color-primary-teal, #1B6F7D)"
                    className={styles.featureIcon}
                  />
                  <span>Ejecución de faenas pesadas, evidencia y cierre técnico</span>
                </div>
                <div className={styles.featureItem}>
                  <Navigation
                    size={16}
                    color="var(--color-primary-teal, #1B6F7D)"
                    className={styles.featureIcon}
                  />
                  <span>Posicionamiento GPS y cola de sincronización offline</span>
                </div>
              </div>
            </div>

            <div className={styles.cardActions}>
              <Button
                variant="teal"
                size="lg"
                href="/terreno"
                className={styles.ctaButton}
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
