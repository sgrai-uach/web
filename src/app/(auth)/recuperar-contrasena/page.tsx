import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import RecuperarContrasenaForm from '@/components/auth/RecuperarContrasenaForm';
import AppFooter from '@/components/layout/AppFooter';
import AppHeader from '@/components/layout/AppHeader';
import styles from '@/components/auth/RecuperarContrasenaForm.module.css';

export const metadata: Metadata = {
  title: 'Recuperar Contraseña — SGRAI',
  description:
    'Portal de recuperación de credenciales del Sistema de Gestión de Recursos para Atención de Incidentes.',
};

export default function RecuperarContrasenaPage() {
  return (
    <main className={styles.pageMain}>
      <div className={styles.desktopChrome}>
        <AppHeader />
      </div>

      <div className={styles.pageContent}>
        <Suspense
          fallback={
            <div className={styles.suspenseFallback}>
              Cargando formulario de recuperación de contraseña...
            </div>
          }
        >
          <RecuperarContrasenaForm />
        </Suspense>
      </div>

      <div className={styles.desktopChrome}>
        <AppFooter />
      </div>
    </main>
  );
}
