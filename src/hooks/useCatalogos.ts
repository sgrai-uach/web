'use client';

import { useState, useEffect } from 'react';
import type { CatalogosResponse } from '@/types/catalogos';
import { getCatalogos } from '@/services/catalogosService';
import { getErrorMessage } from '@/lib/utils/errorUtils';

const CATALOGOS_INICIALES: CatalogosResponse = {
  roles: [],
  delegaciones: [],
  especialidades: [],
  cargos: [],
};

/**
 * Custom Hook para cargar y gestionar los catálogos del sistema.
 */
export function useCatalogos() {
  const [catalogos, setCatalogos] = useState<CatalogosResponse>(CATALOGOS_INICIALES);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let montado = true;

    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const data = await getCatalogos();
        if (montado) {
          setCatalogos(data);
        }
      } catch (err: unknown) {
        if (montado) {
          setError(getErrorMessage(err, 'Error al cargar los catálogos'));
        }
      } finally {
        if (montado) {
          setCargando(false);
        }
      }
    }

    cargar();

    return () => {
      montado = false;
    };
  }, []);

  return { catalogos, cargando, error };
}
