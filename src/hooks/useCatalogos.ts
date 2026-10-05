'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CatalogosResponse } from '@/types/catalogos';
import {
  catalogosService,
  DELEGACIONES_FALLBACK,
  NOMBRES_DELEGACIONES_ESTANDAR,
  normalizarNombreDelegacion,
} from '@/services/catalogosService';
import { getErrorMessage } from '@/lib/utils/errorUtils';

const CATALOGOS_INICIALES: CatalogosResponse = {
  roles: [],
  delegaciones: DELEGACIONES_FALLBACK,
  especialidades: [],
  cargos: [],
};

/**
 * Custom Hook para cargar y gestionar los catálogos del sistema con helpers de resolución.
 * Conforme a docs/architecture/architecture.md y ADR-004.
 */
export function useCatalogos() {
  const [catalogos, setCatalogos] = useState<CatalogosResponse>(CATALOGOS_INICIALES);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let montado = true;

    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const datos = await catalogosService.getCatalogos();
        if (montado) {
          setCatalogos(datos);
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

  const resolverId = useCallback(
    (nombreDelegacion: string): string | undefined => {
      return catalogosService.resolverDelegacionId(nombreDelegacion, catalogos.delegaciones);
    },
    [catalogos.delegaciones]
  );

  const resolverNombre = useCallback(
    (idDelegacion: string): string | undefined => {
      return catalogosService.resolverDelegacionNombre(idDelegacion, catalogos.delegaciones);
    },
    [catalogos.delegaciones]
  );

  // Lista de nombres únicos de delegaciones para alimentar los dropdowns
  const nombresDelegaciones = catalogos.delegaciones.length > 0
    ? Array.from(new Set(catalogos.delegaciones.map((d) => d.nombre)))
    : Array.from(NOMBRES_DELEGACIONES_ESTANDAR);

  return {
    catalogos,
    delegaciones: catalogos.delegaciones,
    nombresDelegaciones,
    roles: catalogos.roles,
    especialidades: catalogos.especialidades,
    cargos: catalogos.cargos,
    cargando,
    error,
    resolverId,
    resolverNombre,
    normalizarNombreDelegacion,
  };
}
