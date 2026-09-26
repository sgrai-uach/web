'use client';

import React from 'react';
import Link from 'next/link';

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
        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
      }}
      role="alert"
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', backgroundColor: '#FFEBEE', color: '#C62828', fontSize: '26px', marginBottom: '16px' }}>
        <span aria-hidden="true">🔒</span>
      </div>

      <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 800, color: '#C62828', letterSpacing: '0.8px', marginBottom: '6px' }}>
        HTTP 403 &bull; Acceso Denegado (RBAC)
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-charcoal-dark)', margin: '0 0 12px 0' }}>
        Acceso restringido: Vista exclusiva para Administradores
      </h2>

      <p style={{ fontSize: '14px', color: 'var(--color-charcoal)', lineHeight: '1.6', marginBottom: '24px', maxWidth: '580px', margin: '0 auto 24px auto' }}>
        La sesión actual tiene asignado el perfil <strong>&ldquo;{rolUsuario}&rdquo;</strong>.
        La consulta y gestión del inventario logístico y la disponibilidad de recursos
        está restringida exclusivamente a usuarios con el perfil de <strong>Administrador</strong>.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onCambiarAAdmin}
          style={{ backgroundColor: 'var(--color-primary-teal)', color: 'var(--color-white)', border: 'none', borderRadius: 0, padding: '12px 24px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
        >
          Simular como Administrador General &rarr;
        </button>
        <Link
          href="/callcenter"
          style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'var(--color-charcoal)', color: 'var(--color-white)', padding: '12px 20px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}
        >
          Ir a Centro Call Center
        </Link>
        <Link
          href="/"
          style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-primary-teal-dark)', border: '1px solid #D5DCE4', padding: '12px 20px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
