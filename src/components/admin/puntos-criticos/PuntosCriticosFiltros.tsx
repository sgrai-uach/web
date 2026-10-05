'use client';

import React, { useState, useEffect, useTransition } from 'react';
import type { PrioridadPuntoCritico } from '@/types/puntoCritico';
import { DELEGACIONES_MUNICIPALES } from '@/hooks/usePuntosCriticos';
import Button from '@/components/ui/Button';

interface PuntosCriticosFiltrosProps {
  busqueda: string;
  delegacionId?: string;
  prioridad?: PrioridadPuntoCritico;
  activo?: boolean;
  onCambiarBusqueda: (busqueda: string) => void;
  onCambiarDelegacion: (delegacionId?: string) => void;
  onCambiarPrioridad: (prioridad?: PrioridadPuntoCritico) => void;
  onCambiarActivo?: (activo?: boolean) => void;
  onLimpiarFiltros: () => void;
}

export default function PuntosCriticosFiltros({
  busqueda,
  delegacionId,
  prioridad,
  onCambiarBusqueda,
  onCambiarDelegacion,
  onCambiarPrioridad,
  onLimpiarFiltros,
}: PuntosCriticosFiltrosProps) {
  const [localBusqueda, setLocalBusqueda] = useState(busqueda);
  const [busquedaPrevia, setBusquedaPrevia] = useState(busqueda);
  const [, startTransition] = useTransition();

  if (busqueda !== busquedaPrevia) {
    setBusquedaPrevia(busqueda);
    setLocalBusqueda(busqueda);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localBusqueda !== busqueda) {
        startTransition(() => {
          onCambiarBusqueda(localBusqueda);
        });
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [localBusqueda, busqueda, onCambiarBusqueda]);

  const hayFiltrosActivos = Boolean(
    busqueda?.trim() ||
      delegacionId ||
      prioridad
  );

  const selectStyle: React.CSSProperties = {
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid var(--border-color-neutral-dark, #CCD2D9)',
    borderRadius: 'var(--radius-none, 0px)',
    outline: 'none',
    backgroundColor: 'var(--color-white, #FFFFFF)',
    color: 'var(--color-text-dark, #2B2B2B)',
    fontFamily: 'inherit',
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)',
        padding: '16px 20px',
        border: '1px solid var(--border-color-neutral, #DFE3E8)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px',
          alignItems: 'flex-end',
        }}
      >
        {/* Buscador Textual */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            htmlFor="filtro-busqueda-pc"
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-primary-teal-dark, #14505A)',
            }}
          >
            Buscar sector o código:
          </label>
          <input
            id="filtro-busqueda-pc"
            type="text"
            value={localBusqueda}
            onChange={(e) => setLocalBusqueda(e.target.value)}
            placeholder="Ej: PC-ANG-01, Humedal, Inundación..."
            style={selectStyle}
          />
        </div>

        {/* Delegación Territorial */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            htmlFor="filtro-delegacion-pc"
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-primary-teal-dark, #14505A)',
            }}
          >
            Delegación Territorial:
          </label>
          <select
            id="filtro-delegacion-pc"
            value={delegacionId || ''}
            onChange={(e) => onCambiarDelegacion(e.target.value || undefined)}
            style={selectStyle}
          >
            <option value="">Todas las delegaciones</option>
            {DELEGACIONES_MUNICIPALES.map((del) => (
              <option key={del.id} value={del.id}>
                {del.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Prioridad / Gravedad */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            htmlFor="filtro-prioridad-pc"
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-primary-teal-dark, #14505A)',
            }}
          >
            Prioridad operativa:
          </label>
          <select
            id="filtro-prioridad-pc"
            value={prioridad || ''}
            onChange={(e) =>
              onCambiarPrioridad(
                (e.target.value as PrioridadPuntoCritico) || undefined
              )
            }
            style={selectStyle}
          >
            <option value="">Todas las prioridades</option>
            <option value="CRITICA">Crítica</option>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
            <option value="BAJA">Baja</option>
          </select>
        </div>

      </div>

      {hayFiltrosActivos && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: '6px',
            borderTop: '1px dashed var(--border-color-neutral, #DFE3E8)',
          }}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onLimpiarFiltros}
          >
            Limpiar Filtros
          </Button>
        </div>
      )}
    </div>
  );
}
