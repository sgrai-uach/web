'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Crosshair } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

const LocationPickerMap = dynamic(
  () => import('@/components/maps/LocationPickerMap'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '340px',
          border: '1px solid var(--border-color-neutral, #DFE3E8)',
          backgroundColor: 'var(--color-bg-light, #ECEFF3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted, #5F676E)',
          fontSize: '14px',
        }}
      >
        Cargando cartografía comunal de Valdivia...
      </div>
    ),
  }
);

interface PuntoCriticoLocationSectionProps {
  lat: number | string;
  lng: number | string;
  radioMetros: number | string;
  errorLat?: string;
  errorLng?: string;
  errorRadio?: string;
  onChangeCoords: (coords: { latitud: number; longitud: number }) => void;
  onChangeLat: (val: string) => void;
  onChangeLng: (val: string) => void;
  onChangeRadio: (val: string) => void;
  onCenterValdivia: () => void;
  onBlur: (field: 'lat' | 'lng' | 'radioMetros') => void;
}

export default function PuntoCriticoLocationSection({
  lat,
  lng,
  radioMetros,
  errorLat,
  errorLng,
  errorRadio,
  onChangeCoords,
  onChangeLat,
  onChangeLng,
  onChangeRadio,
  onCenterValdivia,
  onBlur,
}: PuntoCriticoLocationSectionProps) {
  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    padding: '8px 12px',
    fontSize: '14px',
    border: hasError ? '2px solid var(--color-danger, #D32F2F)' : '1px solid var(--border-color-neutral-dark, #CCD2D9)',
    borderRadius: 'var(--radius-none, 0px)',
    outline: 'none',
    backgroundColor: 'var(--color-white, #FFFFFF)',
    color: 'var(--color-text-dark, #2B2B2B)',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
  });

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--color-primary-teal-dark, #14505A)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)',
        border: '1px solid var(--border-color-neutral, #DFE3E8)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div
        style={{
          borderBottom: '2px solid var(--color-primary-teal, #1B6F7D)',
          paddingBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={20} color="var(--color-primary-teal, #1B6F7D)" aria-hidden="true" />
          <Heading as="h2" variant="h3" color="teal-dark" noMargin>
            2. Geolocalización Territorial
          </Heading>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCenterValdivia}
        >
          <Crosshair size={14} aria-hidden="true" />
          <span>Centrar Valdivia</span>
        </Button>
      </div>

      <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted, #5F676E)' }}>
        Haga clic sobre el mapa para fijar la coordenada del sector o arrastre el marcador para afinar la ubicación. También puede ingresar las coordenadas manualmente si dispone del punto exacto.
      </p>

      {/* Grid de Inputs de Coordenadas y Radio */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="input-lat" style={labelStyle}>
            Latitud (WGS84) <span style={{ color: 'var(--color-danger, #D32F2F)' }}>*</span>
          </label>
          <input
            id="input-lat"
            type="number"
            step="0.000001"
            value={lat}
            onChange={(e) => onChangeLat(e.target.value)}
            onBlur={() => onBlur('lat')}
            placeholder="Ej: -39.814220"
            style={inputStyle(Boolean(errorLat))}
            required
          />
          {errorLat && (
            <span style={{ fontSize: '12px', color: 'var(--color-danger, #D32F2F)', fontWeight: 600 }}>
              {errorLat}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="input-lng" style={labelStyle}>
            Longitud (WGS84) <span style={{ color: 'var(--color-danger, #D32F2F)' }}>*</span>
          </label>
          <input
            id="input-lng"
            type="number"
            step="0.000001"
            value={lng}
            onChange={(e) => onChangeLng(e.target.value)}
            onBlur={() => onBlur('lng')}
            placeholder="Ej: -73.245890"
            style={inputStyle(Boolean(errorLng))}
            required
          />
          {errorLng && (
            <span style={{ fontSize: '12px', color: 'var(--color-danger, #D32F2F)', fontWeight: 600 }}>
              {errorLng}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="input-radio" style={labelStyle}>
            Radio Afectación (Metros)
          </label>
          <input
            id="input-radio"
            type="number"
            min={1}
            max={50000}
            step={1}
            value={radioMetros}
            onChange={(e) => onChangeRadio(e.target.value)}
            onBlur={() => onBlur('radioMetros')}
            placeholder="Por defecto: 50"
            style={inputStyle(Boolean(errorRadio))}
          />
          {errorRadio && (
            <span style={{ fontSize: '12px', color: 'var(--color-danger, #D32F2F)', fontWeight: 600 }}>
              {errorRadio}
            </span>
          )}
        </div>
      </div>

      {/* Contenedor del Mapa Interactivo */}
      <div style={{ marginTop: '4px' }}>
        <LocationPickerMap
          latitud={lat}
          longitud={lng}
          onChange={onChangeCoords}
          height="340px"
          ariaLabel="Mapa interactivo para selección de coordenadas de punto crítico"
        />
      </div>
    </div>
  );
}
