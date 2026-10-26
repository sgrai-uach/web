'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import type { DelegacionResumen } from '@/types/cuadrilla';
import Button from '@/components/ui/Button';

interface CuadrillasFiltrosProps {
  busqueda: string;
  delegacionId?: string;
  estado?: string;
  delegaciones: DelegacionResumen[];
  onBusquedaChange: (busqueda: string) => void;
  onDelegacionChange: (delegacionId?: string) => void;
  onEstadoChange: (estado?: string) => void;
  onLimpiar: () => void;
}

export default function CuadrillasFiltros({
  busqueda,
  delegacionId,
  estado,
  delegaciones,
  onBusquedaChange,
  onDelegacionChange,
  onEstadoChange,
  onLimpiar,
}: CuadrillasFiltrosProps) {
  const hayFiltrosActivos = Boolean(busqueda.trim() || delegacionId || estado);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-white)',
        border: '1px solid var(--border-color-neutral)',
        padding: '16px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          flex: 1,
          minWidth: '280px',
        }}
      >
        {/* Buscador de texto */}
        <div
          style={{
            position: 'relative',
            flex: '1 1 240px',
            minWidth: '200px',
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Buscar por cuadrilla o delegado..."
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            style={{
              width: '100%',
              height: '38px',
              padding: '8px 12px 8px 36px',
              fontSize: '13px',
              fontFamily: 'inherit',
              border: '1px solid var(--border-color-neutral-dark)',
              borderRadius: '0px',
              outline: 'none',
              backgroundColor: 'var(--color-white)',
              color: 'var(--color-text-dark)',
            }}
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => onBusquedaChange('')}
              aria-label="Limpiar búsqueda"
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filtro por Delegación */}
        <div style={{ flex: '0 1 200px', minWidth: '160px' }}>
          <select
            value={delegacionId || ''}
            onChange={(e) => onDelegacionChange(e.target.value || undefined)}
            aria-label="Filtrar por delegación municipal"
            style={{
              width: '100%',
              height: '38px',
              padding: '8px 12px',
              fontSize: '13px',
              fontFamily: 'inherit',
              border: '1px solid var(--border-color-neutral-dark)',
              borderRadius: '0px',
              backgroundColor: 'var(--color-white)',
              color: 'var(--color-text-dark)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="">Todas las delegaciones</option>
            {delegaciones.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Estado */}
        <div style={{ flex: '0 1 180px', minWidth: '150px' }}>
          <select
            value={estado || ''}
            onChange={(e) => onEstadoChange(e.target.value || undefined)}
            aria-label="Filtrar por estado operativo"
            style={{
              width: '100%',
              height: '38px',
              padding: '8px 12px',
              fontSize: '13px',
              fontFamily: 'inherit',
              border: '1px solid var(--border-color-neutral-dark)',
              borderRadius: '0px',
              backgroundColor: 'var(--color-white)',
              color: 'var(--color-text-dark)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="">Solo Activas (Por defecto)</option>
            <option value="DISPONIBLE">Disponibles</option>
            <option value="EN_MISION">En Misión (Terreno)</option>
            <option value="INACTIVAS">Inactivas (Dadas de baja)</option>
            <option value="TODAS">Todas las cuadrillas</option>
          </select>
        </div>
      </div>

      {/* Botón de limpiar filtros */}
      {hayFiltrosActivos && (
        <Button variant="outline" size="sm" onClick={onLimpiar} icon={<X size={14} />}>
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
