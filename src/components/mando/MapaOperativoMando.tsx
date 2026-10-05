'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import type { IncidenteResumen } from '@/services/incidentesService';
import type { EventoRecuperacionResponse } from '@/types/recuperacion';
import Button from '@/components/ui/Button';
import { Truck, Layers } from 'lucide-react';

export interface MapaOperativoMandoProps {
  incidentes?: IncidenteResumen[];
  eventosRecuperacion?: EventoRecuperacionResponse[];
  eventosPrevencion?: unknown[];
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
        Capas cartográficas e incidentes en tiempo real
      </div>
    </div>
  ),
});

export const MapaOperativoMando: React.FC<MapaOperativoMandoProps> = ({
  incidentes = [],
  eventosRecuperacion = [],
  onSelectIncidente,
  onCrearRecuperacion,
  height = '520px',
}) => {
  const [mostrarIncidentes, setMostrarIncidentes] = useState(true);
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
      {/* Barra de herramientas del mapa */}
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
        </div>

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

      {/* Contenedor del mapa */}
      <div style={{ width: '100%', height, position: 'relative' }}>
        <DynamicMapaOperativoInner
          incidentes={incidentes}
          eventosRecuperacion={eventosRecuperacion}
          onSelectIncidente={onSelectIncidente}
          mostrarIncidentes={mostrarIncidentes}
          mostrarRecuperaciones={mostrarRecuperaciones}
        />
      </div>
    </div>
  );
};

export default MapaOperativoMando;
