'use client';

import { useState, useEffect } from 'react';
import type { EmpleadoUsuario } from '@/types/empleados';
import { useCatalogos } from '@/hooks/useCatalogos';
import { empleadosService } from '@/services/empleadosService';
import { getErrorMessage } from '@/lib/utils/errorUtils';

interface UseEmpleadosProps {
  versionActualizacion?: number;
}

/**
 * Custom Hook para gestionar el listado, filtros, orden y debounce del personal.
 * Conforme a docs/ARCHITECTURE.md (use{Dominio}Buscador.ts).
 */
export function useEmpleados({ versionActualizacion = 0 }: UseEmpleadosProps = {}) {
  const [termino, setTermino] = useState('');
  const [delegacionFiltro, setDelegacionFiltro] = useState('');
  const [rolFiltro, setRolFiltro] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('apellidos');
  const [orden, setOrden] = useState<'asc' | 'desc'>('asc');

  const { catalogos } = useCatalogos();

  const [resultados, setResultados] = useState<EmpleadoUsuario[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Búsqueda con debounce
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

  return {
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
    catalogos,
    resultados,
    cargando,
    error,
  };
}
