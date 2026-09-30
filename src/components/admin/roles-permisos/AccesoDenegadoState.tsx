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
      botonVolverHref="/callcenter"
      botonVolverTexto="Ir a Bandeja de Avisos"
    />
  );
}
