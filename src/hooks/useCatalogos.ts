'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CatalogosResponse } from '@/types/empleados';
import {
  catalogosService,
  DELEGACIONES_FALLBACK,
  NOMBRES_DELEGACIONES_ESTANDAR,
  normalizarNombreDelegacion,
} from '@/services/catalogosService';

export function useCatalogos() {
  const [catalogos, setCatalogos] = useState<CatalogosResponse>({
    roles: [],
    delegaciones: DELEGACIONES_FALLBACK,
    especialidades: [],
    cargos: [],
  });
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const datos = await catalogosService.getCatalogos();
        if (activo) {
          setCatalogos(datos);
          setCargando(false);
        }
      } catch {
        if (activo) {
          setError('No fue posible cargar catálogos.');
          setCargando(false);
        }
      }
    }

    cargar();

    return () => {
      activo = false;
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
