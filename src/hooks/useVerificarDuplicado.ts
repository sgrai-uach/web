'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  verificarDuplicado,
  type VerificarDuplicadoPayload,
} from '@/services/incidentesManualesService';
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
          tipoAfectacion: tipoAfectacion.trim() as VerificarDuplicadoPayload['tipoAfectacion'],
          latitud,
          longitud,
          radioMetros: 300,
          horasVentana: 24,
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
      timeoutRef.current = setTimeout(() => {
        setHayDuplicados(false);
        setCoincidencias([]);
      }, 0);
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
