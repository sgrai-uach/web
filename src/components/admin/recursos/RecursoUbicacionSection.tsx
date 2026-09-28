import React from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
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
          height: '260px',
          border: '1px solid var(--color-charcoal)',
          backgroundColor: 'var(--color-bg-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-charcoal)',
          fontSize: '14px',
        }}
      >
        Cargando mapa de Valdivia...
      </div>
    ),
  }
);

interface RecursoUbicacionSectionProps {
  sectionNumber: string;
  latitud: number | string;
  longitud: number | string;
  errorLatitud?: string;
  errorLongitud?: string;
  onChangeCoords: (coords: { latitud: number; longitud: number }) => void;
  onChangeLatitud: (val: string) => void;
  onChangeLongitud: (val: string) => void;
  onCenterValdivia: () => void;
  onBlur: (field: string) => void;
}

export default function RecursoUbicacionSection({
  sectionNumber,
  latitud,
  longitud,
  errorLatitud,
  errorLongitud,
  onChangeCoords,
  onChangeLatitud,
  onChangeLongitud,
  onCenterValdivia,
  onBlur,
}: RecursoUbicacionSectionProps) {
  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    padding: '8px 10px',
    fontSize: '14px',
    border: hasError ? '2px solid #C81E1E' : '1px solid var(--color-charcoal)',
    borderRadius: 0,
    outline: 'none',
    backgroundColor: 'var(--color-white)',
    color: 'var(--color-text-dark)',
  });

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ borderBottom: '2px solid var(--color-primary-teal)', paddingBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--color-primary-teal)', fontWeight: 'bold', fontSize: '18px' }}>{sectionNumber}</span>
          <Heading as="h2" variant="h3" color="teal-dark" noMargin>
            Ubicación Geográfica en Valdivia
          </Heading>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCenterValdivia}
        >
          <MapPin size={12} aria-hidden="true" />
          <span>Centrar en Valdivia</span>
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="latitud" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark)' }}>Latitud <span style={{ color: '#C81E1E' }}>*</span></label>
          <input id="latitud" type="number" step="0.000001" required autoComplete="off" value={latitud} onChange={(e) => onChangeLatitud(e.target.value)} onBlur={() => onBlur('latitud')} placeholder="Ej. -39.814200" style={inputStyle(Boolean(errorLatitud))} />
          {errorLatitud && <span style={{ fontSize: '12px', color: '#C81E1E' }}>{errorLatitud}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="longitud" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark)' }}>Longitud <span style={{ color: '#C81E1E' }}>*</span></label>
          <input id="longitud" type="number" step="0.000001" required autoComplete="off" value={longitud} onChange={(e) => onChangeLongitud(e.target.value)} onBlur={() => onBlur('longitud')} placeholder="Ej. -73.245900" style={inputStyle(Boolean(errorLongitud))} />
          {errorLongitud && <span style={{ fontSize: '12px', color: '#C81E1E' }}>{errorLongitud}</span>}
        </div>
      </div>

      <LocationPickerMap
        latitud={typeof latitud === 'number' ? latitud : parseFloat(latitud) || null}
        longitud={typeof longitud === 'number' ? longitud : parseFloat(longitud) || null}
        onChange={(coords) => {
          if (coords) onChangeCoords(coords);
        }}
      />
    </section>
  );
}
