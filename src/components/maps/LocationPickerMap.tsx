'use client';

import React from 'react';
import 'leaflet/dist/leaflet.css';
import { useLocationPickerMap } from '@/hooks/useLocationPickerMap';
import Button from '@/components/ui/Button';

interface LocationPickerMapProps {
  latitud?: number | null;
  longitud?: number | null;
  onChange: (coords: { latitud: number; longitud: number } | null) => void;
  onUserSelectLocation?: (coords: { latitud: number; longitud: number }) => void;
  readOnly?: boolean;
  height?: string;
}

export default function LocationPickerMap({
  latitud,
  longitud,
  onChange,
  onUserSelectLocation,
  readOnly = false,
  height = '240px',
}: LocationPickerMapProps) {
  const { mapContainerRef, hasCoords, handleLimpiarPunto, handleCentrarValdivia } =
    useLocationPickerMap({
      latitud,
      longitud,
      onChange,
      onUserSelectLocation,
      readOnly,
    });

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height,
          border: '1px solid #3B3F45',
          backgroundColor: '#ECEFF3',
          zIndex: 1,
        }}
        aria-label="Mapa interactivo para selección de coordenadas de incidente"
      />

      <div
        style={{
          fontSize: '12px',
          color: '#3B3F45',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span>
          {hasCoords
            ? 'Punto fijado. Puedes arrastrar el marcador para afinar la ubicación.'
            : 'Haz clic en el mapa para marcar el punto exacto (opcional).'}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontFamily: 'inherit' }}>
            GPS:{' '}
            {hasCoords ? (
              <strong style={{ color: '#1B6F7D' }}>
                {latitud?.toFixed(5)}, {longitud?.toFixed(5)}
              </strong>
            ) : (
              <span style={{ color: '#666' }}>Automático por dirección</span>
            )}
          </span>

          {hasCoords && !readOnly && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleLimpiarPunto}
            >
              Limpiar GPS
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCentrarValdivia}
          >
            Centrar Valdivia
          </Button>
        </div>
      </div>
    </div>
  );
}
