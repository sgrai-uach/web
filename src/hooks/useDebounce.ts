'use client';

import { useState, useEffect } from 'react';

/**
 * Hook reutilizable para retrasar la actualización de un valor (debounce).
 * Ideal para entradas de texto de búsqueda y filtros que disparan consultas API.
 *
 * @param value Valor a retrasar.
 * @param delay Tiempo de espera en milisegundos (por omisión 300ms).
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
