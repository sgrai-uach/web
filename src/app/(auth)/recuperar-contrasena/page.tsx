import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import RecuperarContrasenaForm from '@/components/auth/RecuperarContrasenaForm';
import AppFooter from '@/components/layout/AppFooter';
import AppHeader from '@/components/layout/AppHeader';

export const metadata: Metadata = {
  title: 'Recuperar Contraseña — SGRAI',
  description:
    'Portal de recuperación de credenciales del Sistema de Gestión de Recursos para Atención de Incidentes.',
};

export default function RecuperarContrasenaPage() {
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
              Cargando formulario de recuperación de contraseña...
            </div>
          }
        >
          <RecuperarContrasenaForm />
        </Suspense>
      </div>

      <AppFooter />
    </main>
  );
}
