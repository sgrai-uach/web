'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { RotateCw } from 'lucide-react';

export type FiltroOrigen = 'TODOS' | 'WEB' | 'CHATBOT' | 'TELEFONO';
export type FiltroSemaforo = 'TODOS' | 'EN_TIEMPO' | 'PRECAUCION' | 'URGENTE';

interface AvisosFiltrosProps {
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  filtroOrigen: FiltroOrigen;
  onFiltroOrigenChange: (val: FiltroOrigen) => void;
  filtroSemaforo: FiltroSemaforo;
  onFiltroSemaforoChange: (val: FiltroSemaforo) => void;
  onRefrescar: () => void;
  cargando: boolean;
}

export default function AvisosFiltros({
  busqueda,
  onBusquedaChange,
  filtroOrigen,
  onFiltroOrigenChange,
  filtroSemaforo,
  onFiltroSemaforoChange,
  onRefrescar,
  cargando,
}: AvisosFiltrosProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)',
        border: '1px solid #DFE3E8',
        padding: '1rem 1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      {/* Campo de búsqueda */}
      <div style={{ flex: '1 1 280px', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder="Buscar por descripción, calle o informante..."
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            border: '1px solid var(--border-color-dark, #3B3F45)',
            fontSize: '0.875rem',
            color: 'var(--color-text-dark, #2B2B2B)',
            outline: 'none',
            borderRadius: 0,
            backgroundColor: '#FFFFFF',
          }}
          aria-label="Buscar aviso"
        />
      </div>

      {/* Selectores de filtro */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Filtro por origen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
          <label htmlFor="filtro-origen" style={{ color: 'var(--color-charcoal, #3B3F45)', fontWeight: 600 }}>
            Canal:
          </label>
          <select
            id="filtro-origen"
            value={filtroOrigen}
            onChange={(e) => onFiltroOrigenChange(e.target.value as FiltroOrigen)}
            style={{
              padding: '0.625rem 0.75rem',
              border: '1px solid var(--border-color-dark, #3B3F45)',
              fontSize: '0.875rem',
              color: 'var(--color-text-dark, #2B2B2B)',
              backgroundColor: '#FFFFFF',
              borderRadius: 0,
              cursor: 'pointer',
            }}
          >
            <option value="TODOS">Todos los canales</option>
            <option value="WEB">Portal Web</option>
            <option value="CHATBOT">Chatbot Municipal</option>
            <option value="TELEFONO">Central Telefónica</option>
          </select>
        </div>

        {/* Filtro por semáforo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
          <label htmlFor="filtro-semaforo" style={{ color: 'var(--color-charcoal, #3B3F45)', fontWeight: 600 }}>
            Prioridad:
          </label>
          <select
            id="filtro-semaforo"
            value={filtroSemaforo}
            onChange={(e) => onFiltroSemaforoChange(e.target.value as FiltroSemaforo)}
            style={{
              padding: '0.625rem 0.75rem',
              border: '1px solid var(--border-color-dark, #3B3F45)',
              fontSize: '0.875rem',
              color: 'var(--color-text-dark, #2B2B2B)',
              backgroundColor: '#FFFFFF',
              borderRadius: 0,
              cursor: 'pointer',
            }}
          >
            <option value="TODOS">Todas las prioridades</option>
            <option value="EN_TIEMPO">&bull; En Tiempo (&lt; 15 min)</option>
            <option value="PRECAUCION">&bull; Precaución (15-30 min)</option>
            <option value="URGENTE">&bull; Urgente (&gt; 30 min)</option>
          </select>
        </div>

        {/* Botón Refrescar */}
        <Button
          type="button"
          variant="secondary"
          onClick={onRefrescar}
          disabled={cargando}
          suppressHydrationWarning
          title="Refrescar lista de avisos"
        >
          <RotateCw size={14} className={cargando ? 'animate-spin' : ''} aria-hidden="true" />
          <span>{cargando ? 'Actualizando...' : 'Refrescar'}</span>
        </Button>
      </div>
    </div>
  );
}
