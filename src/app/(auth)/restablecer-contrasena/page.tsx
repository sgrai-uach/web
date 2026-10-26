import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import RestablecerContrasenaForm from '@/components/auth/RestablecerContrasenaForm';
import AppFooter from '@/components/layout/AppFooter';
import AppHeader from '@/components/layout/AppHeader';

export const metadata: Metadata = {
  title: 'Restablecer Contraseña — SGRAI',
  description:
    'Portal de restablecimiento seguro de contraseñas del Sistema de Gestión de Recursos para Atención de Incidentes.',
};

export default function RestablecerContrasenaPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-light, #ECEFF3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppHeader />

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 16px',
        }}
      >
        <Suspense
          fallback={
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Cargando formulario de restablecimiento de contraseña...
            </div>
          }
        >
          <RestablecerContrasenaForm />
        </Suspense>
      </div>

      <AppFooter />
    </main>
  );
}
