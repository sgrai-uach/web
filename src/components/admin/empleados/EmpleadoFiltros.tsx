'use client';

import React from 'react';
import type { CatalogoItem } from '@/types/empleados';
import type { EstadoFiltro } from '@/hooks/useEmpleados';
import EmpleadoFiltrosBar from './EmpleadoFiltrosBar';

export interface EmpleadoFiltrosProps {
  termino?: string;
  setTermino?: (val: string) => void;
  delegacionFiltro: string;
  setDelegacionFiltro: (val: string) => void;
  rolFiltro: string;
  setRolFiltro: (val: string) => void;
  estadoFiltro?: EstadoFiltro;
  setEstadoFiltro?: (val: EstadoFiltro) => void;
  estadoOperativoFiltro?: string;
  setEstadoOperativoFiltro?: (val: string) => void;
  especialidadFiltro?: string;
  setEspecialidadFiltro?: (val: string) => void;
  cargoFiltro?: string;
  setCargoFiltro?: (val: string) => void;
  ordenarPor: string;
  setOrdenarPor: (val: string) => void;
  orden: 'asc' | 'desc';
  setOrden: (val: 'asc' | 'desc') => void;
  delegaciones: CatalogoItem[];
  roles: CatalogoItem[];
  especialidades?: string[];
  cargando?: boolean;
  onFocusInput?: () => void;
  onLimpiarFiltros?: () => void;
}

export default function EmpleadoFiltros(props: EmpleadoFiltrosProps) {
  return <EmpleadoFiltrosBar {...props} />;
}
