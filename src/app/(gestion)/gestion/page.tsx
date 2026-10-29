'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { obtenerRutaPorRol, RUTA_INICIO_GESTION } from '@/components/auth/LoginForm';
import GestionWelcomeBanner from '@/components/gestion/GestionWelcomeBanner';
import GestionResumenEstados from '@/components/gestion/GestionResumenEstados';
import GestionModulosGrid from '@/components/gestion/GestionModulosGrid';

export default function GestionHomePage() {
  const { usuario, estaAutenticado } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (estaAutenticado && usuario?.rolCodigo) {
      const rutaRol = obtenerRutaPorRol(usuario.rolCodigo);
      if (rutaRol !== RUTA_INICIO_GESTION) {
        router.push(rutaRol);
        try {
          if (typeof window !== 'undefined' && window.location) {
            window.location.assign(rutaRol);
          }
        } catch {
          // Ignorado en pruebas unitarias
        }
      }
    }
  }, [estaAutenticado, usuario, router]);

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
