'use client';

import { useState, useEffect, useMemo } from 'react';
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
 * Conforme a docs/ARCHITECTURE.md.
 */
export function useEmpleados({ versionActualizacion = 0 }: UseEmpleadosProps = {}) {
  const [termino, setTermino] = useState('');
  const [delegacionFiltro, setDelegacionFiltro] = useState('');
  const [rolFiltro, setRolFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>('todos');
  const [ordenarPor, setOrdenarPor] = useState('apellidos');
  const [orden, setOrden] = useState<'asc' | 'desc'>('asc');
  const [paginaActual, setPaginaActual] = useState(1);
  const [limite, setLimite] = useState(10);

  const { catalogos } = useCatalogos();

  const [resultados, setResultados] = useState<EmpleadoUsuario[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reiniciar a la primera página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [termino, delegacionFiltro, rolFiltro, estadoFiltro, ordenarPor, orden]);

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
          rol_id: rolFiltro || undefined,
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
  }, [termino, delegacionFiltro, rolFiltro, ordenarPor, orden, versionActualizacion]);

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
    setTermino,
    delegacionFiltro,
    setDelegacionFiltro,
    rolFiltro,
    setRolFiltro,
    estadoFiltro,
    setEstadoFiltro,
    ordenarPor,
    setOrdenarPor,
    orden,
    setOrden,
    paginaActual,
    setPaginaActual,
    limite,
    setLimite,
    totalItems,
    totalPaginas,
    catalogos,
    resultados: resultadosFiltrados,
    empleadosPaginados,
    cargando,
    error,
  };
}
