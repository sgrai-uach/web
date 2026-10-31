import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import RestablecerContrasenaForm from '@/components/auth/RestablecerContrasenaForm';
import AppFooter from '@/components/layout/AppFooter';
import AppHeader from '@/components/layout/AppHeader';
import styles from '@/components/auth/RestablecerContrasenaForm.module.css';

export const metadata: Metadata = {
  title: 'Restablecer Contraseña — SGRAI',
  description:
    'Portal de restablecimiento seguro de contraseñas del Sistema de Gestión de Recursos para Atención de Incidentes.',
};

export default function RestablecerContrasenaPage() {
  return (
    <main className={styles.pageMain}>
      <div className={styles.desktopChrome}>
        <AppHeader />
      </div>

      <div className={styles.pageContent}>
        <Suspense
          fallback={
            <div className={styles.suspenseFallback}>
              Cargando formulario de restablecimiento de contraseña...
            </div>
          }
        >
          <RestablecerContrasenaForm />
        </Suspense>
      </div>

      <div className={styles.desktopChrome}>
        <AppFooter />
      </div>
    </main>
  );
}
