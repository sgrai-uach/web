'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { EmpleadoUsuario } from '@/types/empleados';
import { useCatalogos } from '@/hooks/useCatalogos';
import { empleadosService } from '@/services/empleadosService';
import { getErrorMessage } from '@/lib/utils/errorUtils';

interface UseEmpleadosProps {
  versionActualizacion?: number;
}

export type EstadoFiltro = 'todos' | 'activo' | 'inactivo';

/**
 * Custom Hook para gestionar el listado, filtros, paginación, orden y debounce del personal.
 * Conforme a docs/ARCHITECTURE.md y ADR-004.
 */
export function useEmpleados({ versionActualizacion = 0 }: UseEmpleadosProps = {}) {
  const [termino, setTermino] = useState('');
  const [delegacionFiltro, setDelegacionFiltro] = useState('');
  const [rolFiltro, setRolFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>('todos');
  const [estadoOperativoFiltro, setEstadoOperativoFiltro] = useState('');
  const [especialidadFiltro, setEspecialidadFiltro] = useState('');
  const [cargoFiltro, setCargoFiltro] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('apellidos');
  const [orden, setOrden] = useState<'asc' | 'desc'>('asc');
  const [paginaActual, setPaginaActual] = useState(1);
  const [limite, setLimite] = useState(10);

  const { catalogos } = useCatalogos();

  const [resultados, setResultados] = useState<EmpleadoUsuario[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handlers para filtros que resetean la página a 1 (estándar transversal de paginación)
  const handleSetTermino = useCallback((val: string | ((prev: string) => string)) => {
    setTermino(val);
    setPaginaActual(1);
  }, []);

  const handleSetDelegacionFiltro = useCallback((val: string | ((prev: string) => string)) => {
    setDelegacionFiltro(val);
    setPaginaActual(1);
  }, []);

  const handleSetRolFiltro = useCallback((val: string | ((prev: string) => string)) => {
    setRolFiltro(val);
    setPaginaActual(1);
  }, []);

  const handleSetEstadoFiltro = useCallback((val: EstadoFiltro | ((prev: EstadoFiltro) => EstadoFiltro)) => {
    setEstadoFiltro(val);
    setPaginaActual(1);
  }, []);

  const handleSetEstadoOperativoFiltro = useCallback((val: string | ((prev: string) => string)) => {
    setEstadoOperativoFiltro(val);
    setPaginaActual(1);
  }, []);

  const handleSetEspecialidadFiltro = useCallback((val: string | ((prev: string) => string)) => {
    setEspecialidadFiltro(val);
    setPaginaActual(1);
  }, []);

  const handleSetCargoFiltro = useCallback((val: string | ((prev: string) => string)) => {
    setCargoFiltro(val);
    setPaginaActual(1);
  }, []);

  const handleSetOrdenarPor = useCallback((val: string | ((prev: string) => string)) => {
    setOrdenarPor(val);
    setPaginaActual(1);
  }, []);

  const handleSetOrden = useCallback((val: ('asc' | 'desc') | ((prev: 'asc' | 'desc') => 'asc' | 'desc')) => {
    setOrden(val);
    setPaginaActual(1);
  }, []);

  const handleSetLimite = useCallback((val: number | ((prev: number) => number)) => {
    setLimite(val);
    setPaginaActual(1);
  }, []);

  // Consulta con debounce
  useEffect(() => {
    let cancelado = false;
    const timer = setTimeout(async () => {
      setCargando(true);
      setError(null);
      try {
        const data = await empleadosService.getEmpleados({
          q: termino,
          delegacion_id: delegacionFiltro || undefined,
          delegacionNombre: delegacionFiltro || undefined,
          rol_id: rolFiltro || undefined,
          estadoOperativo: estadoOperativoFiltro || undefined,
          especialidad: especialidadFiltro || undefined,
          cargo: cargoFiltro || undefined,
          ordenar_por: ordenarPor,
          orden,
          incluir_inactivos: true,
          limite: 200,
        });
        if (!cancelado) {
          setResultados(data);
        }
      } catch (err: unknown) {
        if (!cancelado) {
          setError(getErrorMessage(err, 'Error al buscar empleados'));
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }, 250);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [
    termino,
    delegacionFiltro,
    rolFiltro,
    estadoOperativoFiltro,
    especialidadFiltro,
    cargoFiltro,
    ordenarPor,
    orden,
    versionActualizacion,
  ]);

  const limpiarFiltros = useCallback(() => {
    setTermino('');
    setDelegacionFiltro('');
    setRolFiltro('');
    setEstadoFiltro('todos');
    setEstadoOperativoFiltro('');
    setEspecialidadFiltro('');
    setCargoFiltro('');
    setOrdenarPor('apellidos');
    setOrden('asc');
    setPaginaActual(1);
  }, []);

  // Filtrado en memoria por estado (Activos / Inactivos / Todos)
  const resultadosFiltrados = useMemo(() => {
    if (estadoFiltro === 'activo') {
      return resultados.filter((u) => u.usuario_activo);
    }
    if (estadoFiltro === 'inactivo') {
      return resultados.filter((u) => !u.usuario_activo);
    }
    return resultados;
  }, [resultados, estadoFiltro]);

  const totalItems = resultadosFiltrados.length;
  const totalPaginas = Math.ceil(totalItems / limite);

  // Elementos paginados para la tabla actual
  const empleadosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * limite;
    return resultadosFiltrados.slice(inicio, inicio + limite);
  }, [resultadosFiltrados, paginaActual, limite]);

  return {
    termino,
    setTermino: handleSetTermino,
    delegacionFiltro,
    setDelegacionFiltro: handleSetDelegacionFiltro,
    rolFiltro,
    setRolFiltro: handleSetRolFiltro,
    estadoFiltro,
    setEstadoFiltro: handleSetEstadoFiltro,
    estadoOperativoFiltro,
    setEstadoOperativoFiltro: handleSetEstadoOperativoFiltro,
    especialidadFiltro,
    setEspecialidadFiltro: handleSetEspecialidadFiltro,
    cargoFiltro,
    setCargoFiltro: handleSetCargoFiltro,
    ordenarPor,
    setOrdenarPor: handleSetOrdenarPor,
    orden,
    setOrden: handleSetOrden,
    paginaActual,
    setPaginaActual,
    limite,
    setLimite: handleSetLimite,
    totalItems,
    totalPaginas,
    catalogos,
    resultados: resultadosFiltrados,
    empleadosPaginados,
    cargando,
    error,
    limpiarFiltros,
  };
}
