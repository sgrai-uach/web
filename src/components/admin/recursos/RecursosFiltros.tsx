'use client';

import { useState, useEffect, useTransition } from 'react';
import type { EstadoRecurso } from '@/types/recurso';
import { DELEGACIONES_MUNICIPALES } from '@/hooks/useRecursos';
import Button from '@/components/ui/Button';

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
    }, 300);

    return () => clearTimeout(handler);
  }, [localBusqueda, busqueda, onCambiarBusqueda]);

  const hayFiltrosActivos = Boolean(busqueda?.trim() || estado || delegacionId || esIndividual !== undefined);

  const selectStyle: React.CSSProperties = { padding: '8px 10px', fontSize: '13px', border: '1px solid var(--color-charcoal)', borderRadius: 0, outline: 'none', backgroundColor: 'var(--color-white)', color: 'var(--color-text-dark)' };

  return (
    <div style={{ backgroundColor: 'var(--color-white)', padding: '16px 20px', border: '1px solid var(--color-bg-light)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
        {/* Buscador */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="filtro-busqueda" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-teal-dark)' }}>
            Buscar por nombre o descripción:
          </label>
          <input
            id="filtro-busqueda"
            type="text"
            value={localBusqueda}
            onChange={(e) => setLocalBusqueda(e.target.value)}
            placeholder="Ej: Camioneta, Sacos..."
            style={{ ...selectStyle, padding: '8px 10px' }}
          />
        </div>

        {/* Delegación */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="filtro-delegacion" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-teal-dark)' }}>
            Delegación Territorial:
          </label>
          <select
            id="filtro-delegacion"
            value={delegacionId || ''}
            onChange={(e) => onCambiarDelegacion(e.target.value || undefined)}
            style={selectStyle}
          >
            <option value="">Todas las delegaciones</option>
            {DELEGACIONES_MUNICIPALES.map((del) => (
              <option key={del.id} value={del.id}>{del.nombre}</option>
            ))}
          </select>
        </div>

        {/* Estado Operativo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="filtro-estado" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-teal-dark)' }}>
            Estado Operativo:
          </label>
          <select
            id="filtro-estado"
            value={estado || ''}
            onChange={(e) => onCambiarEstado((e.target.value as EstadoRecurso) || undefined)}
            style={selectStyle}
          >
            <option value="">Todos los estados</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="ASIGNADO">Asignado a Cuadrilla</option>
            <option value="EN_MANTENCION">En Mantención</option>
            <option value="BAJO_STOCK">Bajo Stock (Alerta)</option>
            <option value="NO_DISPONIBLE">No Disponible</option>
          </select>
        </div>

        {/* Tipo de Recurso */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="filtro-tipo" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-teal-dark)' }}>
            Tipo de Inventario:
          </label>
          <select
            id="filtro-tipo"
            value={esIndividual === undefined ? '' : esIndividual ? 'true' : 'false'}
            onChange={(e) => onCambiarEsIndividual(e.target.value === '' ? undefined : e.target.value === 'true')}
            style={selectStyle}
          >
            <option value="">Todos los tipos</option>
            <option value="true">Vehículo o Maquinaria (Individual)</option>
            <option value="false">Material o Insumo (A Granel)</option>
          </select>
        </div>
      </div>

      {hayFiltrosActivos && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onLimpiarFiltros}
            style={{ color: 'var(--color-primary-teal)', padding: '4px 8px', minHeight: 'auto', textDecoration: 'underline' }}
          >
            Limpiar todos los filtros
          </Button>
        </div>
      )}
    </div>
  );
}
