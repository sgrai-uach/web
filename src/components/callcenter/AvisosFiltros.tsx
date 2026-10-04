'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { RotateCw, Filter, FilterX, X } from 'lucide-react';
import type {
  FiltroDelegacion,
  FiltroEstado,
  FiltroOrigen,
  FiltroSemaforo,
} from '@/types/avisos';
import { ESTADOS_OPCIONES } from '@/types/avisos';
import { useCatalogos } from '@/hooks/useCatalogos';

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
  const { nombresDelegaciones } = useCatalogos();

  const delegacionesOpciones: { valor: FiltroDelegacion; etiqueta: string }[] = [
    { valor: 'TODAS', etiqueta: 'Todas las delegaciones' },
    ...nombresDelegaciones.map((n) => ({
      valor: n as FiltroDelegacion,
      etiqueta: n,
    })),
  ];

  const selectStyle: React.CSSProperties = {
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid var(--border-color-dark, #3B3F45)',
    borderRadius: 0,
    outline: 'none',
    backgroundColor: '#FFFFFF',
    color: 'var(--color-text-dark, #2B2B2B)',
    width: '100%',
    height: '38px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--color-primary-teal-dark, #14505A)',
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)',
        padding: '16px 20px',
        border: '1px solid #DFE3E8',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Grilla principal de controles estandarizada */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          alignItems: 'flex-end',
        }}
      >
        {/* Buscador */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="filtro-busqueda" style={labelStyle}>
            Buscar por descripción o calle:
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              id="filtro-busqueda"
              type="text"
              value={busqueda}
              onChange={(e) => onBusquedaChange(e.target.value)}
              placeholder="Ej: Inundación, Picarte..."
              style={{
                ...selectStyle,
                paddingRight: busqueda ? '30px' : '10px',
              }}
              aria-label="Buscar aviso"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => onBusquedaChange('')}
                style={{
                  position: 'absolute',
                  right: '6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted, #5F676E)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px',
                }}
                title="Borrar búsqueda"
                aria-label="Borrar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Delegación */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="filtro-delegacion" style={labelStyle}>
            Delegación Territorial:
          </label>
          <select
            id="filtro-delegacion"
            value={filtroDelegacion}
            onChange={(e) => onFiltroDelegacionChange(e.target.value as FiltroDelegacion)}
            style={selectStyle}
            aria-label="Delegación Territorial"
          >
            {delegacionesOpciones.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </div>

        {/* Estado Operativo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="filtro-estado" style={labelStyle}>
            Estado del Aviso:
          </label>
          <select
            id="filtro-estado"
            value={filtroEstado}
            onChange={(e) => onFiltroEstadoChange(e.target.value as FiltroEstado)}
            style={selectStyle}
            aria-label="Estado del Aviso"
          >
            {ESTADOS_OPCIONES.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </div>

        {/* Canal de Origen */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="filtro-origen" style={labelStyle}>
            Canal de Origen:
          </label>
          <select
            id="filtro-origen"
            value={filtroOrigen}
            onChange={(e) => onFiltroOrigenChange(e.target.value as FiltroOrigen)}
            style={selectStyle}
            aria-label="Canal de Origen"
          >
            <option value="TODOS">Todos los canales</option>
            <option value="WEB">Portal Web</option>
            <option value="CHATBOT">Chatbot Municipal</option>
            <option value="TELEFONO">Central Telefónica</option>
          </select>
        </div>

        {/* Prioridad de Espera */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="filtro-semaforo" style={labelStyle}>
            Prioridad de Espera:
          </label>
          <select
            id="filtro-semaforo"
            value={filtroSemaforo}
            onChange={(e) => onFiltroSemaforoChange(e.target.value as FiltroSemaforo)}
            style={selectStyle}
            aria-label="Prioridad de Espera"
          >
            <option value="TODOS">Todas las prioridades</option>
            <option value="EN_TIEMPO">En Tiempo (&lt; 15 min)</option>
            <option value="PRECAUCION">Precaución (15-30 min)</option>
            <option value="URGENTE">Urgente (&gt; 30 min)</option>
          </select>
        </div>

        {/* Botón Refrescar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onRefrescar}
            disabled={cargando}
            suppressHydrationWarning
            title="Refrescar lista de avisos"
            style={{
              height: '38px',
              width: '100%',
              justifyContent: 'center',
              fontSize: '13px',
            }}
          >
            <RotateCw size={14} className={cargando ? 'animate-spin' : ''} aria-hidden="true" />
            <span>{cargando ? 'Actualizando...' : 'Refrescar'}</span>
          </Button>
        </div>
      </div>

      {/* Indicador visual de filtros activos y acción Limpiar Filtros */}
      {hayFiltrosActivos && (
        <div
          data-testid="indicador-filtros-activos"
          style={{
            borderTop: '1px solid var(--color-bg-light, #ECEFF3)',
            paddingTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-primary-teal-dark, #14505A)',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
              }}
            >
              <Filter size={13} aria-hidden="true" />
              Filtros activos:
            </span>

            {/* Chip Búsqueda */}
            {busqueda.trim() && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                  border: '1px solid #CCD2D9',
                  padding: '3px 8px',
                  fontSize: '12px',
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
                  gap: '4px',
                  backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                  border: '1px solid var(--color-primary-teal, #1B6F7D)',
                  padding: '3px 8px',
                  fontSize: '12px',
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
                  gap: '4px',
                  backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                  border: '1px solid #CCD2D9',
                  padding: '3px 8px',
                  fontSize: '12px',
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
                  gap: '4px',
                  backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                  border: '1px solid #CCD2D9',
                  padding: '3px 8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--color-text-dark, #2B2B2B)',
                }}
              >
                Canal:{' '}
                {filtroOrigen === 'WEB'
                  ? 'Portal Web'
                  : filtroOrigen === 'CHATBOT'
                  ? 'Chatbot'
                  : 'Teléfono'}
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
                  gap: '4px',
                  backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                  border: '1px solid #CCD2D9',
                  padding: '3px 8px',
                  fontSize: '12px',
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

          {/* Botón Limpiar filtros estilo RecursosFiltros */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onLimpiarFiltros}
            title="Restablecer todos los filtros aplicados"
            style={{
              color: 'var(--color-primary-teal, #1B6F7D)',
              padding: '4px 8px',
              minHeight: 'auto',
              textDecoration: 'underline',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '13px',
            }}
          >
            <FilterX size={13} aria-hidden="true" />
            <span>Limpiar filtros</span>
          </Button>
        </div>
      )}
    </div>
  );
}
