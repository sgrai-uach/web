'use client';

import React from 'react';
import { Search, FilterX } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { DELEGACIONES_MUNICIPALES } from '@/hooks/usePuntosCriticos';
import type {
  FiltrosEventosAsistenciaSocialState,
  PrioridadEventoSocial,
  EstadoEventoSocial,
} from '@/types/asistenciaSocial';

interface AsistenciaSocialFiltrosProps {
  filtros: FiltrosEventosAsistenciaSocialState;
  onCambiarBusqueda: (busqueda: string) => void;
  onCambiarDelegacion: (delegacionId?: string) => void;
  onCambiarPrioridad: (prioridad?: PrioridadEventoSocial) => void;
  onCambiarEstado: (estado?: EstadoEventoSocial) => void;
  onLimpiarFiltros: () => void;
}

export default function AsistenciaSocialFiltros({
  filtros,
  onCambiarBusqueda,
  onCambiarDelegacion,
  onCambiarPrioridad,
  onCambiarEstado,
  onLimpiarFiltros,
}: AsistenciaSocialFiltrosProps) {
  const tieneFiltrosActivos =
    Boolean(filtros.busqueda) ||
    Boolean(filtros.delegacionId) ||
    Boolean(filtros.prioridad) ||
    (Boolean(filtros.estado) && filtros.estado !== 'PENDIENTE');

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color-neutral, #DFE3E8)',
        padding: 'var(--space-4, 16px)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-4, 16px)',
        alignItems: 'flex-end',
      }}
    >
      <div style={{ flex: '1 1 240px', minWidth: '220px' }}>
        <Input
          label="Búsqueda Rápida"
          placeholder="Código AS, dirección, contacto..."
          value={filtros.busqueda || ''}
          onChange={(e) => onCambiarBusqueda(e.target.value)}
          icon={<Search size={16} color="var(--color-text-muted, #5F676E)" />}
        />
      </div>

      <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
        <Select
          label="Delegación Territorial"
          value={filtros.delegacionId || ''}
          onChange={(e) => onCambiarDelegacion(e.target.value || undefined)}
          options={[
            { value: '', label: 'Todas las delegaciones' },
            ...DELEGACIONES_MUNICIPALES.map((d) => ({
              value: d.id,
              label: d.nombre,
            })),
          ]}
        />
      </div>

      <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
        <Select
          label="Prioridad"
          value={filtros.prioridad || ''}
          onChange={(e) => onCambiarPrioridad((e.target.value as PrioridadEventoSocial) || undefined)}
          options={[
            { value: '', label: 'Todas las prioridades' },
            { value: 'CRITICA', label: 'Crítica' },
            { value: 'ALTA', label: 'Alta' },
            { value: 'MEDIA', label: 'Media' },
            { value: 'BAJA', label: 'Baja' },
          ]}
        />
      </div>

      <div style={{ flex: '1 1 160px', minWidth: '140px' }}>
        <Select
          label="Estado del Caso"
          value={filtros.estado || 'PENDIENTE'}
          onChange={(e) => onCambiarEstado((e.target.value as EstadoEventoSocial) || undefined)}
          options={[
            { value: 'PENDIENTE', label: 'Pendientes de asignación' },
            { value: 'ASIGNADO', label: 'Asistente asignado' },
            { value: 'EN_EVALUACION_FIBE', label: 'En evaluación FIBE' },
            { value: 'FINALIZADO', label: 'Finalizados' },
            { value: '', label: 'Todos los estados' },
          ]}
        />
      </div>

      {tieneFiltrosActivos && (
        <div>
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onLimpiarFiltros}
            title="Restablecer todos los filtros"
            style={{ border: '1px solid var(--border-color-neutral, #DFE3E8)' }}
          >
            <FilterX size={15} style={{ marginRight: '6px' }} />
            <span>Limpiar</span>
          </Button>
        </div>
      )}
    </div>
  );
}
