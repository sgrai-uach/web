'use client';

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
        backgroundColor: '#FFFFFF',
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
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          backgroundColor: '#FFEBEE',
          color: '#C62828',
          fontSize: '30px',
          marginBottom: '16px',
        }}
      >
        <span aria-hidden="true">🔒</span>
      </div>

      <div
        style={{
          fontSize: '12px',
          textTransform: 'uppercase',
          fontWeight: 800,
          color: '#C62828',
          letterSpacing: '0.8px',
          marginBottom: '6px',
        }}
      >
        HTTP 403 &bull; Acceso Denegado (RBAC)
      </div>

      <h2
        style={{
          fontSize: '22px',
          fontWeight: 800,
          color: '#24272B',
          margin: '0 0 12px 0',
        }}
      >
        Acceso restringido: Vista exclusiva para Administradores
      </h2>

      <p
        style={{
          fontSize: '14px',
          color: '#3B3F45',
          lineHeight: '1.6',
          marginBottom: '24px',
          maxWidth: '580px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        La sesión actual tiene asignado el perfil <strong>&ldquo;{rolUsuario}&rdquo;</strong>.
        La consulta y gestión del inventario logístico y la disponibilidad de recursos
        está restringida exclusivamente a usuarios con el perfil de <strong>Administrador</strong> de
        la Dirección de Gestión de Riesgos de Desastres de la Municipalidad de Valdivia.
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={onCambiarAAdmin}
          style={{
            backgroundColor: '#1B6F7D',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 0,
            padding: '12px 24px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
        >
          Simular como Administrador General &rarr;
        </button>

        <Link
          href="/callcenter"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#3B3F45',
            color: '#FFFFFF',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            borderRadius: 0,
          }}
        >
          Ir a Centro Call Center
        </Link>

        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#ECEFF3',
            color: '#14505A',
            border: '1px solid #D5DCE4',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            borderRadius: 0,
          }}
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
