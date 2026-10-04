import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import AppFooter from '@/components/layout/AppFooter';
import AppHeader from '@/components/layout/AppHeader';

export const metadata: Metadata = {
  title: 'Iniciar Sesión — SGRAI',
  description:
    'Portal de autenticación del Sistema de Gestión de Recursos para Atención de Incidentes.',
};

export default function LoginPage() {
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

      {/* Contenedor central del formulario */}
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
              Cargando formulario de inicio de sesión...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>

      <AppFooter />
    </main>
  );
}
