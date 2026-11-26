'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Map as MapIcon, ChevronUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { IncidenteDetalle } from '@/services/incidentesService';
import { obtenerNombreDelegacion } from '@/lib/utils/delegacionUtils';
import { DrawerSectionHeader } from './DrawerSectionHeader';
import styles from '@/styles/mando.module.css';

const DynamicIncidenteMiniMapa = dynamic(() => import('./IncidenteMiniMapa'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '220px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
        color: 'var(--color-text-muted, #5F676E)',
        fontSize: '0.82rem',
        border: '1px solid #CBD5E1',
        borderRadius: 'var(--radius-none, 0px)',
      }}
    >
      Cargando mapa de ubicación...
    </div>
  ),
});

interface IncidenteUbicacionSectionProps {
  detalle: IncidenteDetalle;
}

export const IncidenteUbicacionSection: React.FC<IncidenteUbicacionSectionProps> = ({ detalle }) => {
  const [mapaDesplegado, setMapaDesplegado] = useState<boolean>(false);

  const nombreDelegacion = detalle.delegacion
    ? obtenerNombreDelegacion(detalle.delegacion.nombre || detalle.delegacion.id, 'No asignada')
    : 'No asignada';

  const tieneCoordenadasValidas =
    typeof detalle.latitud === 'number' &&
    typeof detalle.longitud === 'number' &&
    Number.isFinite(detalle.latitud) &&
    Number.isFinite(detalle.longitud);

  return (
    <div className={styles.drawerSection}>
      <DrawerSectionHeader
        icono={<MapPin size={18} />}
        titulo="Ubicación Territorial"
        acciones={
          tieneCoordenadasValidas ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              data-testid="btn-toggle-mapa-ubicacion"
              onClick={() => setMapaDesplegado((prev) => !prev)}
              aria-expanded={mapaDesplegado}
              aria-label={
                mapaDesplegado
                  ? 'Ocultar mapa de ubicación territorial'
                  : 'Desplegar mapa de ubicación territorial'
              }
            >
              {mapaDesplegado ? (
                <>
                  <ChevronUp size={14} style={{ marginRight: '4px' }} aria-hidden="true" />
                  <span>Ocultar mapa</span>
                </>
              ) : (
                <>
                  <MapIcon size={14} style={{ marginRight: '4px' }} aria-hidden="true" />
                  <span>Ver en mapa</span>
                </>
              )}
            </Button>
          ) : undefined
        }
      />

      <div className={styles.drawerDataGrid}>
        <div>
          <span className={styles.drawerDataLabel}>Dirección / Referencia</span>
          <span className={styles.drawerDataValue}>{detalle.direccion}</span>
        </div>
        <div>
          <span className={styles.drawerDataLabel}>Delegación Asignada</span>
          <span className={styles.drawerDataValue}>
            {nombreDelegacion}
          </span>
        </div>
        <div>
          <span className={styles.drawerDataLabel}>Coordenadas GPS</span>
          <span className={styles.drawerDataValue}>
            {detalle.latitud.toFixed(4)}, {detalle.longitud.toFixed(4)}
          </span>
        </div>
      </div>

      {mapaDesplegado && tieneCoordenadasValidas && (
        <div
          data-testid="contenedor-mini-mapa-incidente"
          style={{ marginTop: '0.65rem' }}
        >
          <DynamicIncidenteMiniMapa
            latitud={detalle.latitud}
            longitud={detalle.longitud}
            direccion={detalle.direccion}
            codigo={detalle.codigo}
            prioridad={detalle.prioridad}
          />
        </div>
      )}
    </div>
  );
};
