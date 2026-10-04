'use client';

import React from 'react';
import GestionWelcomeBanner from '@/components/gestion/GestionWelcomeBanner';
import GestionResumenEstados from '@/components/gestion/GestionResumenEstados';
import GestionModulosGrid from '@/components/gestion/GestionModulosGrid';

export default function GestionHomePage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-8, 32px)',
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
      <GestionWelcomeBanner />
      <GestionResumenEstados />
      <GestionModulosGrid />
    </div>
  );
}
