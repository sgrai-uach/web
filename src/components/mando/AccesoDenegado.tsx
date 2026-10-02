'use client';

import React from 'react';
import CommonAccesoDenegadoState from '@/components/common/AccesoDenegadoState';

interface AccesoDenegadoProps {
  onReintentar?: () => void;
  rolUsuario?: string;
}

export const AccesoDenegado: React.FC<AccesoDenegadoProps> = ({
  onReintentar,
  rolUsuario,
}) => {
  return (
    <CommonAccesoDenegadoState
      rolUsuario={rolUsuario}
      modulo="el Centro de Mando"
      permisoRequerido="incidentes:kanban"
      onReintentar={onReintentar}
      botonVolverHref="/callcenter"
      botonVolverTexto="Ir a Bandeja de Avisos"
    />
  );
};
