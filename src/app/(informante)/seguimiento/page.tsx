import { Metadata } from 'next';
import Link from 'next/link';
import styles from '@/styles/seguimiento.module.css';
import { MunicipalHeader } from '@/components/layout/MunicipalHeader';
import { SeguimientoBuscador } from '@/components/seguimiento/SeguimientoBuscador';

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
          <h2 className={styles.sectionTitle}>Consulta de Estado de Incidentes</h2>
          <p className={styles.sectionSubtitle}>
            Ingresa el código numérico de 8 dígitos proporcionado tras registrar tu reporte para verificar el avance de su atención en tiempo real.
          </p>
        </div>

        <SeguimientoBuscador />

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '1rem' }}>
            ¿Aún no has reportado un incidente o emergencia en tu sector?
          </p>
          <Link href="/" className={styles.btnSecondary}>
            Reportar un incidente comunal
          </Link>
        </div>
      </main>

      <footer className={styles.municipalFooter}>
        <div className={styles.footerContainer}>
          <span className={styles.footerAgencyText}>
            Municipalidad de Valdivia — Dirección de Gestión de Riesgos de Desastres (DGRD)
          </span>
          <span>
            Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI)
          </span>
        </div>
      </footer>
    </div>
  );
}
