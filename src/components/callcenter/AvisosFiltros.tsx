'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { RotateCw, Filter, FilterX, X, Search } from 'lucide-react';
import type {
  FiltroDelegacion,
  FiltroEstado,
  FiltroOrigen,
  FiltroSemaforo,
} from '@/types/avisos';
import { DELEGACIONES_OPCIONES, ESTADOS_OPCIONES } from '@/types/avisos';

interface AvisosFiltrosProps {
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  filtroOrigen: FiltroOrigen;
  onFiltroOrigenChange: (val: FiltroOrigen) => void;
  filtroSemaforo: FiltroSemaforo;
  onFiltroSemaforoChange: (val: FiltroSemaforo) => void;
  filtroDelegacion: FiltroDelegacion;
  onFiltroDelegacionChange: (val: FiltroDelegacion) => void;
  filtroEstado: FiltroEstado;
  onFiltroEstadoChange: (val: FiltroEstado) => void;
  hayFiltrosActivos: boolean;
  onLimpiarFiltros: () => void;
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
  filtroDelegacion,
  onFiltroDelegacionChange,
  filtroEstado,
  onFiltroEstadoChange,
  hayFiltrosActivos,
  onLimpiarFiltros,
  onRefrescar,
  cargando,
}: AvisosFiltrosProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)',
        border: '1px solid #DFE3E8',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Barra principal de controles */}
      <div
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.875rem',
        }}
      >
        {/* Campo de búsqueda */}
        <div style={{ flex: '1 1 240px', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              color: 'var(--color-text-muted, #5F676E)',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            placeholder="Buscar por descripción, calle o informante..."
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem 0.55rem 2.25rem',
              border: '1px solid var(--border-color-dark, #3B3F45)',
              fontSize: '0.875rem',
              color: 'var(--color-text-dark, #2B2B2B)',
              outline: 'none',
              borderRadius: 0,
              backgroundColor: '#FFFFFF',
            }}
            aria-label="Buscar aviso"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => onBusquedaChange('')}
              style={{
                position: 'absolute',
                right: '0.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted, #5F676E)',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.25rem',
              }}
              title="Borrar búsqueda"
              aria-label="Borrar búsqueda"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Selectores de filtro */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          {/* Filtro por Delegación */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
            <label
              htmlFor="filtro-delegacion"
              style={{ color: 'var(--color-charcoal, #3B3F45)', fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              Delegación:
            </label>
            <select
              id="filtro-delegacion"
              value={filtroDelegacion}
              onChange={(e) => onFiltroDelegacionChange(e.target.value as FiltroDelegacion)}
              style={{
                padding: '0.55rem 0.65rem',
                border: '1px solid var(--border-color-dark, #3B3F45)',
                fontSize: '0.875rem',
                color: 'var(--color-text-dark, #2B2B2B)',
                backgroundColor: '#FFFFFF',
                borderRadius: 0,
                cursor: 'pointer',
              }}
            >
              {DELEGACIONES_OPCIONES.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
            <label
              htmlFor="filtro-estado"
              style={{ color: 'var(--color-charcoal, #3B3F45)', fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              Estado:
            </label>
            <select
              id="filtro-estado"
              value={filtroEstado}
              onChange={(e) => onFiltroEstadoChange(e.target.value as FiltroEstado)}
              style={{
                padding: '0.55rem 0.65rem',
                border: '1px solid var(--border-color-dark, #3B3F45)',
                fontSize: '0.875rem',
                color: 'var(--color-text-dark, #2B2B2B)',
                backgroundColor: '#FFFFFF',
                borderRadius: 0,
                cursor: 'pointer',
              }}
            >
              {ESTADOS_OPCIONES.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por origen / canal */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
            <label
              htmlFor="filtro-origen"
              style={{ color: 'var(--color-charcoal, #3B3F45)', fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              Canal:
            </label>
            <select
              id="filtro-origen"
              value={filtroOrigen}
              onChange={(e) => onFiltroOrigenChange(e.target.value as FiltroOrigen)}
              style={{
                padding: '0.55rem 0.65rem',
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
              <option value="CHATBOT">Chatbot</option>
              <option value="TELEFONO">Teléfono 14XX</option>
            </select>
          </div>

          {/* Filtro por prioridad / semáforo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
            <label
              htmlFor="filtro-semaforo"
              style={{ color: 'var(--color-charcoal, #3B3F45)', fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              Prioridad:
            </label>
            <select
              id="filtro-semaforo"
              value={filtroSemaforo}
              onChange={(e) => onFiltroSemaforoChange(e.target.value as FiltroSemaforo)}
              style={{
                padding: '0.55rem 0.65rem',
                border: '1px solid var(--border-color-dark, #3B3F45)',
                fontSize: '0.875rem',
                color: 'var(--color-text-dark, #2B2B2B)',
                backgroundColor: '#FFFFFF',
                borderRadius: 0,
                cursor: 'pointer',
              }}
            >
              <option value="TODOS">Todas las prioridades</option>
              <option value="EN_TIEMPO">En Tiempo (&lt; 15 min)</option>
              <option value="PRECAUCION">Precaución (15-30 min)</option>
              <option value="URGENTE">Urgente (&gt; 30 min)</option>
            </select>
          </div>

          {/* Botón Refrescar */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onRefrescar}
            disabled={cargando}
            suppressHydrationWarning
            title="Refrescar lista de avisos"
          >
            <RotateCw size={13} className={cargando ? 'animate-spin' : ''} aria-hidden="true" />
            <span>{cargando ? 'Actualizando...' : 'Refrescar'}</span>
          </Button>
        </div>
      </div>

      {/* Indicador visual de filtros activos y botón Limpiar Filtros */}
      {hayFiltrosActivos && (
        <div
          data-testid="indicador-filtros-activos"
          style={{
            backgroundColor: 'var(--color-bg-light, #ECEFF3)',
            borderTop: '1px solid #DFE3E8',
            padding: '0.625rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--color-primary-teal-dark, #14505A)',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
              }}
            >
              <Filter size={14} aria-hidden="true" />
              Filtros activos:
            </span>

            {/* Chip Búsqueda */}
            {busqueda.trim() && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CCD2D9',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-text-dark, #2B2B2B)',
                }}
              >
                Texto: &ldquo;{busqueda.trim()}&rdquo;
                <button
                  type="button"
                  onClick={() => onBusquedaChange('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: 'var(--color-text-muted, #5F676E)',
                  }}
                  title="Quitar filtro de texto"
                  aria-label="Quitar filtro de texto"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {/* Chip Delegación */}
            {filtroDelegacion !== 'TODAS' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-primary-teal, #1B6F7D)',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-primary-teal, #1B6F7D)',
                }}
              >
                Delegación: {filtroDelegacion}
                <button
                  type="button"
                  onClick={() => onFiltroDelegacionChange('TODAS')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: 'var(--color-primary-teal, #1B6F7D)',
                  }}
                  title="Quitar filtro de delegación"
                  aria-label="Quitar filtro de delegación"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {/* Chip Estado */}
            {filtroEstado !== 'PENDIENTE' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CCD2D9',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-text-dark, #2B2B2B)',
                }}
              >
                Estado:{' '}
                {filtroEstado === 'VERIFICADO'
                  ? 'Verificado'
                  : filtroEstado === 'RECHAZADO'
                  ? 'Rechazado'
                  : 'Todos'}
                <button
                  type="button"
                  onClick={() => onFiltroEstadoChange('PENDIENTE')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: 'var(--color-text-muted, #5F676E)',
                  }}
                  title="Restablecer a Pendientes"
                  aria-label="Restablecer a Pendientes"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {/* Chip Canal Origen */}
            {filtroOrigen !== 'TODOS' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CCD2D9',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-text-dark, #2B2B2B)',
                }}
              >
                Canal: {filtroOrigen === 'WEB' ? 'Portal Web' : filtroOrigen === 'CHATBOT' ? 'Chatbot' : 'Teléfono'}
                <button
                  type="button"
                  onClick={() => onFiltroOrigenChange('TODOS')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: 'var(--color-text-muted, #5F676E)',
                  }}
                  title="Quitar filtro de canal"
                  aria-label="Quitar filtro de canal"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {/* Chip Prioridad Semáforo */}
            {filtroSemaforo !== 'TODOS' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CCD2D9',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-text-dark, #2B2B2B)',
                }}
              >
                Prioridad:{' '}
                {filtroSemaforo === 'EN_TIEMPO'
                  ? 'En Tiempo'
                  : filtroSemaforo === 'PRECAUCION'
                  ? 'Precaución'
                  : 'Urgente'}
                <button
                  type="button"
                  onClick={() => onFiltroSemaforoChange('TODOS')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: 'var(--color-text-muted, #5F676E)',
                  }}
                  title="Quitar filtro de prioridad"
                  aria-label="Quitar filtro de prioridad"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>

          {/* Botón Limpiar filtros */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onLimpiarFiltros}
            title="Restablecer todos los filtros aplicados"
            style={{
              borderColor: 'var(--color-charcoal, #3B3F45)',
              color: 'var(--color-charcoal, #3B3F45)',
              padding: '0.35rem 0.75rem',
              fontSize: '0.8125rem',
            }}
          >
            <FilterX size={14} aria-hidden="true" />
            <span>Limpiar filtros</span>
          </Button>
        </div>
      )}
    </div>
  );
}
