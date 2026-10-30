import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import AppFooter from '@/components/layout/AppFooter';
import AppHeader from '@/components/layout/AppHeader';
import styles from '@/components/auth/LoginForm.module.css';

export const metadata: Metadata = {
  title: 'Iniciar Sesión — SGRAI',
  description:
    'Portal de autenticación del Sistema de Gestión de Recursos para Atención de Incidentes.',
};

export default function LoginPage() {
  return (
    <main className={styles.pageMain}>
      <div className={styles.desktopChrome}>
        <AppHeader />
      </div>

      {/* Contenedor central responsivo del formulario */}
      <div className={styles.pageContent}>
        <Suspense
          fallback={
            <div className={styles.suspenseFallback}>
              Cargando formulario de inicio de sesión...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>

      <div className={styles.desktopChrome}>
        <AppFooter />
      </div>
    </main>
  );
}
