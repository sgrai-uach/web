'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

interface AccesoDenegadoStateProps {
  rolUsuario?: string;
  onCambiarAAdmin: () => void;
}

export default function AccesoDenegadoState({
  rolUsuario = 'Operador Call Center',
  onCambiarAAdmin,
}: AccesoDenegadoStateProps) {
  return (
    <div
      style={{
        maxWidth: '720px',
        margin: '40px auto',
        backgroundColor: 'var(--color-white)',
        borderTop: '5px solid #C62828',
        borderLeft: '1px solid #D5DCE4',
        borderRight: '1px solid #D5DCE4',
        borderBottom: '1px solid #D5DCE4',
        padding: '36px 28px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-sm)',
      }}
      role="alert"
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', backgroundColor: '#FFEBEE', color: '#C62828', marginBottom: '16px' }}>
        <Lock size={26} aria-hidden="true" />
      </div>

      <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 800, color: '#C62828', letterSpacing: '0.8px', marginBottom: '6px' }}>
        HTTP 403 &bull; Acceso Denegado (RBAC)
      </div>

      <Heading as="h2" variant="h2" color="charcoal-dark" align="center" style={{ margin: '0 0 12px 0' }}>
        Acceso restringido: Vista exclusiva para Administradores
      </Heading>

      <p style={{ fontSize: '14px', color: 'var(--color-charcoal)', lineHeight: '1.6', marginBottom: '24px', maxWidth: '580px', margin: '0 auto 24px auto' }}>
        La sesión actual tiene asignado el perfil <strong>&ldquo;{rolUsuario}&rdquo;</strong>.
        La consulta y gestión del inventario logístico y la disponibilidad de recursos
        está restringida exclusivamente a usuarios con el perfil de <strong>Administrador</strong>.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <Button
          type="button"
          variant="primary"
          onClick={onCambiarAAdmin}
        >
          Simular como Administrador General &rarr;
        </Button>
        <Button
          href="/callcenter"
          variant="secondary"
        >
          Ir a Centro Call Center
        </Button>
        <Button
          href="/"
          variant="outline"
        >
          Volver al Inicio
        </Button>
      </div>
    </div>
  );
}
