'use client';

import React from 'react';
import type { CatalogoItem } from '@/types/empleados';
import EmpleadoSearchInput from './EmpleadoSearchInput';
import EmpleadoFiltrosBar from './EmpleadoFiltrosBar';

interface EmpleadoFiltrosProps {
  termino: string;
  setTermino: (val: string) => void;
  delegacionFiltro: string;
  setDelegacionFiltro: (val: string) => void;
  rolFiltro: string;
  setRolFiltro: (val: string) => void;
  ordenarPor: string;
  setOrdenarPor: (val: string) => void;
  orden: 'asc' | 'desc';
  setOrden: (val: 'asc' | 'desc') => void;
  delegaciones: CatalogoItem[];
  roles: CatalogoItem[];
  cargando: boolean;
  onFocusInput: () => void;
}

export default function EmpleadoFiltros({
  termino,
  setTermino,
  delegacionFiltro,
  setDelegacionFiltro,
  rolFiltro,
  setRolFiltro,
  ordenarPor,
  setOrdenarPor,
  orden,
  setOrden,
  delegaciones,
  roles,
  cargando,
  onFocusInput,
}: EmpleadoFiltrosProps) {
  return (
    <>
      <EmpleadoSearchInput
        termino={termino}
        setTermino={setTermino}
        cargando={cargando}
        onFocusInput={onFocusInput}
      />
      <EmpleadoFiltrosBar
        delegacionFiltro={delegacionFiltro}
        setDelegacionFiltro={setDelegacionFiltro}
        rolFiltro={rolFiltro}
        setRolFiltro={setRolFiltro}
        ordenarPor={ordenarPor}
        setOrdenarPor={setOrdenarPor}
        orden={orden}
        setOrden={setOrden}
        delegaciones={delegaciones}
        roles={roles}
      />
    </>
  );
}
