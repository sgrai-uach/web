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
  estadoOperativoFiltro?: string;
  setEstadoOperativoFiltro?: (val: string) => void;
  especialidadFiltro?: string;
  setEspecialidadFiltro?: (val: string) => void;
  ordenarPor: string;
  setOrdenarPor: (val: string) => void;
  orden: 'asc' | 'desc';
  setOrden: (val: 'asc' | 'desc') => void;
  delegaciones: CatalogoItem[];
  roles: CatalogoItem[];
  especialidades?: string[];
  cargando: boolean;
  onFocusInput: () => void;
  onLimpiarFiltros?: () => void;
}

export default function EmpleadoFiltros({
  termino,
  setTermino,
  delegacionFiltro,
  setDelegacionFiltro,
  rolFiltro,
  setRolFiltro,
  estadoOperativoFiltro,
  setEstadoOperativoFiltro,
  especialidadFiltro,
  setEspecialidadFiltro,
  ordenarPor,
  setOrdenarPor,
  orden,
  setOrden,
  delegaciones,
  roles,
  especialidades,
  cargando,
  onFocusInput,
  onLimpiarFiltros,
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
        estadoOperativoFiltro={estadoOperativoFiltro}
        setEstadoOperativoFiltro={setEstadoOperativoFiltro}
        especialidadFiltro={especialidadFiltro}
        setEspecialidadFiltro={setEspecialidadFiltro}
        ordenarPor={ordenarPor}
        setOrdenarPor={setOrdenarPor}
        orden={orden}
        setOrden={setOrden}
        delegaciones={delegaciones}
        roles={roles}
        especialidades={especialidades}
        onLimpiarFiltros={onLimpiarFiltros}
      />
    </>
  );
}
