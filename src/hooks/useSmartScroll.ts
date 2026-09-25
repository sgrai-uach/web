'use client';

import { useRef, useCallback, useEffect } from 'react';

export interface UseSmartScrollOptions {
  /**
   * Umbral mínimo de visibilidad (0.0 a 1.0) para considerar que el elemento
   * ya está adecuadamente a la vista. Por omisión 0.5 (50%).
   */
  threshold?: number;
  /**
   * Alineación del scroll. 'nearest' evita brincos bruscos si el elemento
   * ya se asoma en pantalla. Por omisión 'nearest'.
   */
  block?: ScrollLogicalPosition;
  /**
   * Comportamiento del scroll ('smooth' | 'auto'). Por omisión 'smooth'.
   */
  behavior?: ScrollBehavior;
}

/**
 * Custom Hook para desplazamiento suave e inteligente basado en IntersectionObserver.
 *
 * Mide dinámicamente el porcentaje de visibilidad del elemento referenciado y
 * solo ejecuta el scroll si no está visible o si su visibilidad es menor al umbral (threshold).
 * Evita saltos molestos de pantalla si el usuario ya está viendo el contenido.
 */
export function useSmartScroll<T extends HTMLElement = HTMLDivElement>(
  options: UseSmartScrollOptions = {}
) {
  const {
    threshold = 0.5,
    block = 'nearest',
    behavior = 'smooth',
  } = options;

  const targetRef = useRef<T | null>(null);
  const isAdequatelyVisibleRef = useRef<boolean>(false);

  useEffect(() => {
    const element = targetRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry) {
          isAdequatelyVisibleRef.current = entry.intersectionRatio >= threshold;
        }
      },
      {
        threshold: [0, threshold, 1],
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  const scrollToTarget = useCallback(() => {
    const element = targetRef.current;
    if (!element) return;

    // Solo realiza el scroll si el elemento no está suficientemente visible en el viewport
    if (!isAdequatelyVisibleRef.current) {
      element.scrollIntoView({
        behavior,
        block,
      });
    }
  }, [behavior, block]);

  return {
    targetRef,
    scrollToTarget,
  };
}
