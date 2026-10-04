import { useState, useEffect, useCallback } from 'react';
import type { EmpleadoUsuario, CatalogosResponse } from '@/types/empleados';
import { empleadosService } from '@/services/empleadosService';
import { catalogosService } from '@/services/catalogosService';

interface UseEmpleadosProps {
  versionActualizacion?: number;
}

export function useEmpleados({ versionActualizacion = 0 }: UseEmpleadosProps = {}) {
  const [termino, setTermino] = useState('');
  const [delegacionFiltro, setDelegacionFiltro] = useState('');
  const [rolFiltro, setRolFiltro] = useState('');
  const [estadoOperativoFiltro, setEstadoOperativoFiltro] = useState('');
  const [especialidadFiltro, setEspecialidadFiltro] = useState('');
  const [cargoFiltro, setCargoFiltro] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('apellidos');
  const [orden, setOrden] = useState<'asc' | 'desc'>('asc');

  const [catalogos, setCatalogos] = useState<CatalogosResponse>({
    roles: [],
    delegaciones: [],
    especialidades: [],
    cargos: [],
  });

  const [resultados, setResultados] = useState<EmpleadoUsuario[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga inicial de catálogos
  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      try {
        const data = await catalogosService.getCatalogos();
        if (!cancelado) {
          setCatalogos(data);
        }
      } catch (err: unknown) {
        if (!cancelado) {
          console.error('Error al cargar catálogos:', err);
        }
      }
    }
    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

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
          delegacionNombre: delegacionFiltro || undefined,
          rol_id: rolFiltro || undefined,
          estadoOperativo: estadoOperativoFiltro || undefined,
          especialidad: especialidadFiltro || undefined,
          cargo: cargoFiltro || undefined,
          ordenar_por: ordenarPor,
          orden,
        });
        if (!cancelado) {
          setResultados(data);
        }
      } catch (err: unknown) {
        if (!cancelado) {
          setError(err instanceof Error ? err.message : 'Error al buscar empleados');
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
    setEstadoOperativoFiltro('');
    setEspecialidadFiltro('');
    setCargoFiltro('');
    setOrdenarPor('apellidos');
    setOrden('asc');
  }, []);

  return {
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
    cargoFiltro,
    setCargoFiltro,
    ordenarPor,
    setOrdenarPor,
    orden,
    setOrden,
    catalogos,
    resultados,
    cargando,
    error,
    limpiarFiltros,
  };
}
