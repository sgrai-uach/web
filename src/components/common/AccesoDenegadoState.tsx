'use client';

import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

const DICCIONARIO_PERMISOS_LEGIBLES: Record<string, string> = {
  'seguridad:roles:leer': 'Visualización de Roles y Permisos',
  'seguridad:roles:gestionar': 'Gestión y Modificación de Roles y Permisos',
  'recursos:leer': 'Visualización del Inventario Logístico',
  'recursos:crear': 'Registro de Nuevos Recursos Logísticos',
  'incidentes:kanban': 'Gestión Táctica del Tablero de Incidentes',
  'incidentes:leer': 'Consulta y Seguimiento de Incidentes',
  'incidentes:crear': 'Registro de Incidentes',
  'avisos:leer': 'Recepción y Revisión de Avisos Ciudadanos',
  'avisos:crear': 'Ingreso Manual de Avisos',
  'personal:leer': 'Consulta del Directorio de Personal',
  'personal:gestionar': 'Administración de Cuentas y Personal',
};

export interface AccesoDenegadoStateProps {
  rolUsuario?: string;
  modulo?: string;
  permisoRequerido?: string;
  mensajePersonalizado?: string;
  onReintentar?: () => void;
  botonVolverHref?: string;
  botonVolverTexto?: string;
}

export default function AccesoDenegadoState({
  rolUsuario,
  modulo,
  permisoRequerido,
  mensajePersonalizado,
  onReintentar,
  botonVolverHref = '/',
  botonVolverTexto = 'Volver al Inicio',
}: AccesoDenegadoStateProps) {
  const permisoLegible = permisoRequerido
    ? DICCIONARIO_PERMISOS_LEGIBLES[permisoRequerido] || permisoRequerido
    : null;

  return (
    <div
      style={{
        maxWidth: '720px',
        margin: '2.5rem auto',
        backgroundColor: 'var(--color-white, #FFFFFF)',
        borderTop: '4px solid var(--color-danger, #D32F2F)',
        borderLeft: '1px solid var(--border-color-neutral, #DFE3E8)',
        borderRight: '1px solid var(--border-color-neutral, #DFE3E8)',
        borderBottom: '1px solid var(--border-color-neutral, #DFE3E8)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        borderRadius: 0,
      }}
      role="alert"
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
          color: 'var(--color-danger, #D32F2F)',
          marginBottom: '1rem',
          borderRadius: 0,
        }}
      >
        <ShieldAlert size={28} aria-hidden="true" />
      </div>

      <div
        style={{
          fontSize: '0.8125rem',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: 'var(--color-danger, #D32F2F)',
          letterSpacing: '0.6px',
          marginBottom: '0.5rem',
        }}
      >
        Acceso Restringido
      </div>

      <Heading
        as="h2"
        variant="h2"
        color="charcoal-dark"
        align="center"
        style={{ marginBottom: '0.75rem' }}
      >
        {modulo
          ? `Permisos insuficientes para ${modulo}`
          : 'Permisos insuficientes para acceder a este módulo'}
      </Heading>

      <div
        style={{
          fontSize: '0.925rem',
          color: 'var(--color-text-dark, #2B2B2B)',
          lineHeight: '1.6',
          marginBottom: '1.5rem',
          maxWidth: '580px',
          margin: '0 auto 1.5rem auto',
        }}
      >
        {mensajePersonalizado ? (
          <p style={{ margin: 0 }}>{mensajePersonalizado}</p>
        ) : (
          <>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              La sesión activa{rolUsuario ? ` con perfil «${rolUsuario}»` : ''} no cuenta con los
              privilegios requeridos para consultar o gestionar esta sección
              {permisoLegible ? ` (${permisoLegible})` : ''}.
            </p>
            <p style={{ margin: 0, color: 'var(--color-text-muted, #5F676E)', fontSize: '0.875rem' }}>
              Si necesita acceso para realizar sus labores operativas, solicite al Administrador la
              asignación de los permisos correspondientes. También puede alternar a un usuario autorizado
              desde el selector de sesión en la esquina superior derecha del encabezado.
            </p>
          </>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {onReintentar && (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onReintentar}
          >
            Reintentar acceso
          </Button>
        )}

        <Button
          href={botonVolverHref}
          variant={onReintentar ? 'outline' : 'primary'}
          size="md"
          icon={<ArrowLeft size={16} />}
        >
          {botonVolverTexto}
        </Button>
      </div>
    </div>
  );
}
