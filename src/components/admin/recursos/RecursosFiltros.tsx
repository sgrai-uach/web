'use client';

import { useState, useEffect, useTransition } from 'react';
import type { EstadoRecurso } from '@/types/recurso';
import { DELEGACIONES_MUNICIPALES } from '@/hooks/useRecursos';

interface RecursosFiltrosProps {
  busqueda: string;
  estado?: EstadoRecurso;
  delegacionId?: string;
  esIndividual?: boolean;
  onCambiarBusqueda: (busqueda: string) => void;
  onCambiarEstado: (estado?: EstadoRecurso) => void;
  onCambiarDelegacion: (delegacionId?: string) => void;
  onCambiarEsIndividual: (esIndividual?: boolean) => void;
  onLimpiarFiltros: () => void;
}

export default function RecursosFiltros({
  busqueda,
  estado,
  delegacionId,
  esIndividual,
  onCambiarBusqueda,
  onCambiarEstado,
  onCambiarDelegacion,
  onCambiarEsIndividual,
  onLimpiarFiltros,
}: RecursosFiltrosProps) {
  // Estado local para input de búsqueda con debounce
  const [localBusqueda, setLocalBusqueda] = useState(busqueda);
  const [busquedaPrevia, setBusquedaPrevia] = useState(busqueda);
  const [, startTransition] = useTransition();

  // Ajustar estado local si el prop cambia (patrón oficial React sin useEffect)
  if (busqueda !== busquedaPrevia) {
    setBusquedaPrevia(busqueda);
    setLocalBusqueda(busqueda);
  }

  // Debounce de 300ms sobre el término de búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localBusqueda !== busqueda) {
        startTransition(() => {
          onCambiarBusqueda(localBusqueda);
        });
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [localBusqueda, busqueda, onCambiarBusqueda]);

  const hayFiltrosActivos =
    Boolean(busqueda && busqueda.trim().length > 0) ||
    Boolean(estado) ||
    Boolean(delegacionId) ||
    esIndividual !== undefined;

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        padding: '16px 20px',
        border: '1px solid #D5DCE4',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          alignItems: 'flex-end',
        }}
      >
        {/* Buscador de texto con Debounce */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            htmlFor="filtro-busqueda-recursos"
            style={{ fontSize: '13px', fontWeight: 700, color: '#14505A' }}
          >
            Buscar por nombre o descripción:
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="filtro-busqueda-recursos"
              type="text"
              value={localBusqueda}
              onChange={(e) => setLocalBusqueda(e.target.value)}
              placeholder="Ej: Camioneta, Sacos, Motobomba..."
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: '14px',
                border: '1px solid #D5DCE4',
                borderRadius: 0,
                backgroundColor: '#F8FAFC',
                color: '#2B2B2B',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
            {localBusqueda && (
              <button
                type="button"
                onClick={() => {
                  setLocalBusqueda('');
                  onCambiarBusqueda('');
                }}
                title="Borrar término de búsqueda"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#3B3F45',
                  fontSize: '14px',
                  padding: '4px',
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filtro por Estado de Disponibilidad */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            htmlFor="filtro-estado-recurso"
            style={{ fontSize: '13px', fontWeight: 700, color: '#14505A' }}
          >
            Estado de disponibilidad:
          </label>
          <select
            id="filtro-estado-recurso"
            value={estado || ''}
            onChange={(e) => {
              const val = e.target.value as EstadoRecurso | '';
              onCambiarEstado(val ? val : undefined);
            }}
            style={{
              padding: '9px 12px',
              fontSize: '14px',
              border: '1px solid #D5DCE4',
              borderRadius: 0,
              backgroundColor: '#F8FAFC',
              color: '#2B2B2B',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="">Todos los estados</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="ASIGNADO">En Terreno / Asignado</option>
            <option value="EN_MANTENCION">En Mantención</option>
            <option value="BAJO_STOCK">Bajo Stock (Alerta)</option>
            <option value="NO_DISPONIBLE">No Disponible</option>
          </select>
        </div>

        {/* Filtro por Delegación Territorial */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            htmlFor="filtro-delegacion-recurso"
            style={{ fontSize: '13px', fontWeight: 700, color: '#14505A' }}
          >
            Delegación territorial:
          </label>
          <select
            id="filtro-delegacion-recurso"
            value={delegacionId || ''}
            onChange={(e) => {
              const val = e.target.value;
              onCambiarDelegacion(val ? val : undefined);
            }}
            style={{
              padding: '9px 12px',
              fontSize: '14px',
              border: '1px solid #D5DCE4',
              borderRadius: 0,
              backgroundColor: '#F8FAFC',
              color: '#2B2B2B',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="">Todas las delegaciones</option>
            {DELEGACIONES_MUNICIPALES.map((del) => (
              <option key={del.id} value={del.id}>
                {del.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Tipo de Recurso */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            htmlFor="filtro-tipo-recurso"
            style={{ fontSize: '13px', fontWeight: 700, color: '#14505A' }}
          >
            Tipo de recurso:
          </label>
          <select
            id="filtro-tipo-recurso"
            value={esIndividual === undefined ? '' : esIndividual ? 'true' : 'false'}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') onCambiarEsIndividual(undefined);
              else onCambiarEsIndividual(val === 'true');
            }}
            style={{
              padding: '9px 12px',
              fontSize: '14px',
              border: '1px solid #D5DCE4',
              borderRadius: 0,
              backgroundColor: '#F8FAFC',
              color: '#2B2B2B',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="">Todos los tipos</option>
            <option value="true">Vehículo o Maquinaria (Individual)</option>
            <option value="false">Material o Insumo (A Granel)</option>
          </select>
        </div>
      </div>

      {/* Barra de Filtros Activos y Botón de Limpiar */}
      {hayFiltrosActivos && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '12px',
            borderTop: '1px solid #ECEFF3',
            fontSize: '13px',
          }}
        >
          <div style={{ color: '#1B6F7D', fontWeight: 600 }}>
            Filtros activos aplicados sobre el catálogo de recursos
          </div>

          <button
            type="button"
            onClick={onLimpiarFiltros}
            style={{
              backgroundColor: '#ECEFF3',
              color: '#14505A',
              border: '1px solid #D5DCE4',
              borderRadius: 0,
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>✕</span>
            <span>Limpiar Filtros</span>
          </button>
        </div>
      )}
    </div>
  );
}
