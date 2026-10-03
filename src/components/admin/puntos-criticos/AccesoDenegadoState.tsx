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
      mensajePersonalizado="No cuenta con los permisos necesarios para acceder a esta sección. Si requiere acceso, puede solicitarlos a un administrador."
      botonVolverHref="/callcenter"
      botonVolverTexto="Ir a Bandeja de Avisos"
    />
  );
}
