import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import AppFooter from '@/components/layout/AppFooter';

export const metadata: Metadata = {
  title: 'Iniciar Sesión — SGRAI Municipalidad de Valdivia',
  description:
    'Portal de autenticación institucional del Sistema de Gestión de Recursos para Atención de Incidentes de la Municipalidad de Valdivia.',
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
      {/* Franja utilitaria institucional superior (Sage) */}
      <div
        style={{
          backgroundColor: 'var(--color-sage, #A9CBA4)',
          color: 'var(--color-charcoal-dark, #24272B)',
          fontSize: '12px',
          fontWeight: 600,
          padding: '6px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--container-max-width, 1400px)',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>MUNICIPALIDAD DE VALDIVIA — DIRECCIÓN DE GESTIÓN DE RIESGOS DE DESASTRES</span>
          <span>Acceso Institucional</span>
        </div>
      </div>

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

      {/* Franja institucional inferior */}
      <div
        style={{
          backgroundColor: 'var(--color-sage, #A9CBA4)',
          color: 'var(--color-charcoal-dark, #24272B)',
          padding: '8px 24px',
          fontSize: '12px',
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 'var(--container-max-width, 1400px)', margin: '0 auto' }}>
          I. Municipalidad de Valdivia &bull; Dirección de Gestión de Riesgos de Desastres (DGRD)
        </div>
      </div>
      <AppFooter />
    </main>
  );
}
