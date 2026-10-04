'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { EmpleadoUsuario } from '@/types/empleados';
import { useEmpleados } from '@/hooks/useEmpleados';
import EmpleadoFiltros from './EmpleadoFiltros';
import EmpleadoResultadosList from './EmpleadoResultadosList';

interface EmpleadoBuscadorProps {
  onSelectUsuario: (usuario: EmpleadoUsuario) => void;
  usuarioSeleccionadoId?: string;
  versionActualizacion?: number;
}

export default function EmpleadoBuscador({
  onSelectUsuario,
  usuarioSeleccionadoId,
  versionActualizacion = 0,
}: EmpleadoBuscadorProps) {
  const {
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
    catalogos,
    resultados,
    cargando,
    limpiarFiltros,
  } = useEmpleados({ versionActualizacion });

  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickAfuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickAfuera);
    return () => document.removeEventListener('mousedown', handleClickAfuera);
  }, []);

  useEffect(() => {
    if (!usuarioSeleccionadoId) {
      setTermino('');
    }
  }, [usuarioSeleccionadoId, setTermino]);

  const handleSelect = (usr: EmpleadoUsuario) => {
    onSelectUsuario(usr);
    setAbierto(false);
    setTermino('');
  };

  return (
    <div
      ref={contenedorRef}
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)',
        border: '1px solid var(--border-color-neutral, #DFE3E8)',
        padding: '1.25rem 1.5rem',
        position: 'relative',
      }}
    >
      <EmpleadoFiltros
        termino={termino}
        setTermino={(val) => {
          setTermino(val);
          setAbierto(true);
        }}
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
        delegaciones={catalogos.delegaciones}
        roles={catalogos.roles}
        especialidades={catalogos.especialidades}
        cargando={cargando}
        onFocusInput={() => setAbierto(true)}
        onLimpiarFiltros={limpiarFiltros}
      />

      {abierto && (
        <EmpleadoResultadosList
          resultados={resultados}
          usuarioSeleccionadoId={usuarioSeleccionadoId}
          cargando={cargando}
          onSelectUsuario={handleSelect}
        />
      )}
    </div>
  );
}
