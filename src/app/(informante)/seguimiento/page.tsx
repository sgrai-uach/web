import { Metadata } from 'next';
import styles from '@/styles/seguimiento.module.css';
import { MunicipalHeader } from '@/components/layout/MunicipalHeader';
import AppFooter from '@/components/layout/AppFooter';
import { SeguimientoBuscador } from '@/components/seguimiento/SeguimientoBuscador';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Consulta de Estado de Incidentes — SGRAI Municipalidad de Valdivia',
  description:
    'Ingresa tu código de seguimiento numérico para conocer el estado y avance de la atención de tu requerimiento municipal.',
};

export default function SeguimientoBusquedaPage() {
  return (
    <div className={styles.pageWrapper}>
      <MunicipalHeader />

      <main className={styles.mainContainer}>
        <div className={styles.sectionTitleBlock}>
          <Heading as="h2" variant="h2" color="teal-dark" noMargin>
            Consulta de Estado de Incidentes
          </Heading>
          <p className={styles.sectionSubtitle}>
            Ingresa el código numérico de 8 dígitos proporcionado tras registrar tu reporte para verificar el avance de su atención en tiempo real.
          </p>
        </div>

        <SeguimientoBuscador />

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '1rem' }}>
            ¿Aún no has reportado un incidente o emergencia en tu sector?
          </p>
          <Button href="/" variant="secondary">
            Reportar un incidente comunal
          </Button>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
