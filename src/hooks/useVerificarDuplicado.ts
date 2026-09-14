'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { verificarDuplicado } from '@/lib/api/incidentes-manuales';
import type { DuplicadoItem } from '@/types/incidente-manual';

interface UseVerificarDuplicadoParams {
  direccion: string;
  tipoAfectacion: string;
  latitud?: number;
  longitud?: number;
  operadorId: string;
}

export function useVerificarDuplicado({
  direccion,
  tipoAfectacion,
  latitud,
  longitud,
  operadorId,
}: UseVerificarDuplicadoParams) {
  const [consultando, setConsultando] = useState(false);
  const [hayDuplicados, setHayDuplicados] = useState(false);
  const [coincidencias, setCoincidencias] = useState<DuplicadoItem[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const ejecutarVerificacion = useCallback(async () => {
    if (direccion.trim().length < 5 || !tipoAfectacion.trim()) {
      setHayDuplicados(false);
      setCoincidencias([]);
      return;
    }

    setConsultando(true);
    try {
      const res = await verificarDuplicado(
        {
          direccion: direccion.trim(),
          tipoAfectacion: tipoAfectacion.trim(),
          latitud,
          longitud,
        },
        operadorId
      );

      setHayDuplicados(res.hayDuplicados);
      setCoincidencias(res.coincidencias);
    } catch {
      setHayDuplicados(false);
      setCoincidencias([]);
    } finally {
      setConsultando(false);
    }
  }, [direccion, tipoAfectacion, latitud, longitud, operadorId]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (direccion.trim().length >= 5 && tipoAfectacion.trim()) {
      timeoutRef.current = setTimeout(() => {
        ejecutarVerificacion();
      }, 600);
    } else {
      setHayDuplicados(false);
      setCoincidencias([]);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [direccion, tipoAfectacion, latitud, longitud, ejecutarVerificacion]);

  return {
    consultando,
    hayDuplicados,
    coincidencias,
    verificarAhora: ejecutarVerificacion,
  };
}
