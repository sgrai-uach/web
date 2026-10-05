'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import type { IncidenteResumen } from '@/services/incidentesService';
import type { EventoPrevencionDTO } from '@/types/evento-prevencion';
import Button from '@/components/ui/Button';
import { ShieldAlert, Truck, Layers } from 'lucide-react';

export interface EventoRecuperacionItemProps {
  id?: string;
  codigo?: string;
  nombre?: string;
  descripcion?: string | null;
  sector?: string;
  direccionTexto?: string | null;
  prioridad?: string;
  latitud: number;
  longitud: number;
  familiasAfectadas?: number;
  patrulla?: {
    nombre?: string;
    estado?: string;
  };
  mision?: {
    codigo?: string;
    estado?: string;
  };
  recursos?: {
    nombre?: string;
    cantidadAsignada?: number;
  }[];
}

export interface MapaOperativoMandoProps {
  incidentes?: IncidenteResumen[];
  eventosRecuperacion?: EventoRecuperacionItemProps[];
  eventosPrevencion?: EventoPrevencionDTO[];
  onSelectIncidente?: (id: string) => void;
  onCrearRecuperacion?: () => void;
  onCrearPrevencion?: () => void;
  height?: string;
}

const DynamicMapaOperativoInner = dynamic(() => import('./MapaOperativoMandoInner'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '480px',
        backgroundColor: 'var(--color-bg-light, #ECEFF3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-charcoal, #3B3F45)',
        fontSize: '0.875rem',
        border: '1px solid var(--border-color-neutral, #DFE3E8)',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--color-primary-teal, #1B6F7D)' }}>
        Cargando Mapa Operativo de Valdivia...
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #5F676E)' }}>
        Capas cartográficas, incidentes y puntos territoriales en tiempo real
      </div>
    </div>
  ),
});

export const MapaOperativoMando: React.FC<MapaOperativoMandoProps> = ({
  incidentes = [],
  eventosRecuperacion = [],
  eventosPrevencion = [],
  onSelectIncidente,
  onCrearRecuperacion,
  onCrearPrevencion,
  height = '520px',
}) => {
  const [mostrarIncidentes, setMostrarIncidentes] = useState(true);
  const [mostrarPrevenciones, setMostrarPrevenciones] = useState(true);
  const [mostrarRecuperaciones, setMostrarRecuperaciones] = useState(true);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--border-color-neutral, #DFE3E8)',
        backgroundColor: '#FFFFFF',
        width: '100%',
      }}
    >
      {/* Barra de herramientas del mapa táctico */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '10px 16px',
          backgroundColor: 'var(--color-bg-light, #ECEFF3)',
          borderBottom: '1px solid var(--border-color-neutral, #DFE3E8)',
          fontSize: '13px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <Layers size={16} color="var(--color-primary-teal, #1B6F7D)" />
            <span>Capas Cartográficas:</span>
          </div>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={mostrarIncidentes}
              onChange={(e) => setMostrarIncidentes(e.target.checked)}
            />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '9999px',
                  backgroundColor: '#1B6F7D',
                  display: 'inline-block',
                }}
              />
              Incidentes Activos ({incidentes.length})
            </span>
          </label>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={mostrarPrevenciones}
              onChange={(e) => setMostrarPrevenciones(e.target.checked)}
            />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '9999px',
                  backgroundColor: '#D97706',
                  display: 'inline-block',
                }}
              />
              Eventos de Prevención ({eventosPrevencion.length})
            </span>
          </label>

          {eventosRecuperacion && (
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={mostrarRecuperaciones}
                onChange={(e) => setMostrarRecuperaciones(e.target.checked)}
              />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '9999px',
                    backgroundColor: '#0D9488',
                    display: 'inline-block',
                  }}
                />
                Eventos de Recuperación ({eventosRecuperacion.length})
              </span>
            </label>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onCrearPrevencion && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCrearPrevencion}
              title="Crear un nuevo evento de prevención territorial"
              style={{
                backgroundColor: '#B45309',
                color: '#FFFFFF',
                border: 'none',
              }}
            >
              <ShieldAlert size={14} style={{ marginRight: '6px' }} />
              <span>Crear Prevención</span>
            </Button>
          )}

          {onCrearRecuperacion && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onCrearRecuperacion}
              title="Crear un nuevo evento de recuperación territorial"
            >
              <Truck size={14} style={{ marginRight: '6px' }} />
              <span>Crear Recuperación</span>
            </Button>
          )}
        </div>
      </div>

      {/* Contenedor del mapa Leaflet */}
      <div style={{ width: '100%', height, position: 'relative' }}>
        <DynamicMapaOperativoInner
          incidentes={incidentes}
          eventosPrevencion={eventosPrevencion}
          eventosRecuperacion={eventosRecuperacion}
          onSelectIncidente={onSelectIncidente}
          mostrarIncidentes={mostrarIncidentes}
          mostrarPrevenciones={mostrarPrevenciones}
          mostrarRecuperaciones={mostrarRecuperaciones}
        />
      </div>
    </div>
  );
};

export default MapaOperativoMando;
