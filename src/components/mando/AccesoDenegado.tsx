'use client';

import React from 'react';
import CommonAccesoDenegadoState from '@/components/common/AccesoDenegadoState';

interface AccesoDenegadoProps {
  onReintentar?: () => void;
  rolUsuario?: string;
}

export const AccesoDenegado: React.FC<AccesoDenegadoProps> = ({
  rolUsuario,
}) => {
  return (
    <CommonAccesoDenegadoState
      rolUsuario={rolUsuario}
      modulo="el Centro de Mando"
      mensajePersonalizado="No cuenta con los permisos necesarios para acceder a esta sección. Si requiere acceso, puede solicitarlos a un administrador."
      botonVolverHref="/callcenter"
      botonVolverTexto="Ir a Bandeja de Avisos"
    />
  );
};
