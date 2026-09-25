'use client';

import { useState, useEffect, useCallback } from 'react';
import type { EmpleadoUsuario } from '@/types/empleados';
import { getPersonal } from '@/services/empleadosService';
import { useDebounce } from './useDebounce';

export interface UsePersonalBuscadorOptions {
  usuarioSeleccionadoId?: string;
  usuarioEliminadoId?: string | null;
  versionActualizacion?: number;
}

/**
 * Custom Hook para gestionar la búsqueda, filtrado, ordenamiento y lista de personal.
 */
export function usePersonalBuscador(options: UsePersonalBuscadorOptions = {}) {
  const { usuarioSeleccionadoId, usuarioEliminadoId, versionActualizacion = 0 } = options;

  const [termino, setTermino] = useState('');
  const [delegacionFiltro, setDelegacionFiltro] = useState('');
  const [rolFiltro, setRolFiltro] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('apellidos');
  const [orden, setOrden] = useState<'asc' | 'desc'>('asc');

  const [resultados, setResultados] = useState<EmpleadoUsuario[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Valor diferido para prevenir ráfagas de consultas a la API mientras se escribe
  const terminoDebounced = useDebounce(termino, 250);

  // Consulta los empleados aplicando los criterios activos
  const cargarResultados = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await getPersonal({
        q: terminoDebounced,
        delegacion_id: delegacionFiltro || undefined,
        rol_id: rolFiltro || undefined,
        ordenar_por: ordenarPor,
        orden,
      });
      setResultados(data);
    } catch (err: unknown) {
      setError('Error al consultar empleados');
      console.error('Error al buscar usuarios:', err);
    } finally {
      setCargando(false);
    }
  }, [terminoDebounced, delegacionFiltro, rolFiltro, ordenarPor, orden]);

  useEffect(() => {
    cargarResultados();
  }, [cargarResultados, versionActualizacion]);

  // Si se deselecciona o limpia la selección, resetear término de búsqueda
  useEffect(() => {
    if (!usuarioSeleccionadoId) {
      setTermino('');
    }
  }, [usuarioSeleccionadoId]);

  // Actualización optimista: remover inmediatamente funcionario dado de baja
  useEffect(() => {
    if (usuarioEliminadoId) {
      setResultados((prev) =>
        prev.filter((u) => u.usuario_id !== usuarioEliminadoId && u.personal_id !== usuarioEliminadoId)
      );
    }
  }, [usuarioEliminadoId]);

  const toggleOrden = () => {
    setOrden((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const limpiarTermino = () => {
    setTermino('');
  };

  return {
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
    error,
    recargar: cargarResultados,
  };
}
