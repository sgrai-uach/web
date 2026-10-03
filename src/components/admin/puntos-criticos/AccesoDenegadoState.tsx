'use client';

import React from 'react';
import CommonAccesoDenegadoState from '@/components/common/AccesoDenegadoState';

interface AccesoDenegadoStateProps {
  rolUsuario?: string;
  onCambiarAAdmin?: () => void;
}

export default function AccesoDenegadoState({
  rolUsuario = 'Operador Call Center',
}: AccesoDenegadoStateProps) {
  return (
    <CommonAccesoDenegadoState
      rolUsuario={rolUsuario}
      modulo="el Listado de Puntos Críticos"
      permisoRequerido="puntos_criticos:leer"
      botonVolverHref="/callcenter"
      botonVolverTexto="Ir a Bandeja de Avisos"
    />
  );
}
