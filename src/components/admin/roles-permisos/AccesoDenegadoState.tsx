'use client';

import React from 'react';
import CommonAccesoDenegadoState from '@/components/common/AccesoDenegadoState';

interface AccesoDenegadoStateProps {
  rolUsuario: string;
  onCambiarAAdmin?: () => void;
}

export default function AccesoDenegadoState({
  rolUsuario,
}: AccesoDenegadoStateProps) {
  return (
    <CommonAccesoDenegadoState
      rolUsuario={rolUsuario}
      modulo="Roles y Permisos"
      permisoRequerido="seguridad:roles:leer"
      mensajePersonalizado="Acceso denegado. Se requieren permisos de gestión de roles para acceder."
      botonVolverHref="/callcenter"
      botonVolverTexto="Ir a Bandeja de Avisos"
    />
  );
}
