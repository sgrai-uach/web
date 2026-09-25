'use client';

import React, { useRef } from 'react';
import type { EmpleadoUsuario } from '@/types/empleados';
import { useCatalogos } from '@/hooks/useCatalogos';
import { usePersonalBuscador } from '@/hooks/usePersonalBuscador';
import EmpleadoFiltros from './empleados/EmpleadoFiltros';
import EmpleadoLista from './empleados/EmpleadoLista';

interface EmpleadoBuscadorProps {
  onSelectUsuario: (usuario: EmpleadoUsuario) => void;
  onEliminarUsuario?: (usuario: EmpleadoUsuario) => void;
  usuarioSeleccionadoId?: string;
  usuarioEliminadoId?: string | null;
  versionActualizacion?: number;
}

export default function EmpleadoBuscador({
  onSelectUsuario,
  onEliminarUsuario,
  usuarioSeleccionadoId,
  usuarioEliminadoId,
  versionActualizacion = 0,
}: EmpleadoBuscadorProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const { catalogos } = useCatalogos();

  const {
    termino,
    setTermino,
    limpiarTermino,
    delegacionFiltro,
    setDelegacionFiltro,
    rolFiltro,
    setRolFiltro,
    ordenarPor,
    setOrdenarPor,
    orden,
    toggleOrden,
    resultados,
    cargando,
  } = usePersonalBuscador({
    usuarioSeleccionadoId,
    usuarioEliminadoId,
    versionActualizacion,
  });

  return (
    <div
      ref={contenedorRef}
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)',
        border: '1px solid #DFE3E8',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        position: 'relative',
      }}
    >
      <EmpleadoFiltros
        termino={termino}
        onTerminoChange={setTermino}
        onLimpiarTermino={limpiarTermino}
        cargando={cargando}
        delegaciones={catalogos.delegaciones}
        delegacionFiltro={delegacionFiltro}
        onDelegacionChange={setDelegacionFiltro}
        roles={catalogos.roles}
        rolFiltro={rolFiltro}
        onRolChange={setRolFiltro}
        ordenarPor={ordenarPor}
        onOrdenarPorChange={setOrdenarPor}
        orden={orden}
        onToggleOrden={toggleOrden}
      />

      <EmpleadoLista
        resultados={resultados}
        cargando={cargando}
        usuarioSeleccionadoId={usuarioSeleccionadoId}
        onSelectUsuario={onSelectUsuario}
        onEliminarUsuario={onEliminarUsuario}
      />
    </div>
  );
}
