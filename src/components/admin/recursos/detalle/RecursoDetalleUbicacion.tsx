import React from 'react';
import dynamic from 'next/dynamic';
import Heading from '@/components/ui/Heading';

const LocationPickerMap = dynamic(
  () => import('@/components/maps/LocationPickerMap'),
  {
    ssr: false,
    loading: () => (
      <div style={{ width: '100%', height: '180px', backgroundColor: 'var(--color-bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-charcoal)', fontSize: '13px' }}>
        Cargando mapa...
      </div>
    ),
  }
);

interface RecursoDetalleUbicacionProps {
  latitud: number;
  longitud: number;
}

export default function RecursoDetalleUbicacion({
  latitud,
  longitud,
}: RecursoDetalleUbicacionProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Heading as="h5" variant="h4" color="teal-dark" noMargin>
          Ubicación en Base Operativa
        </Heading>
        <span style={{ fontSize: '12px', color: 'var(--color-charcoal)' }}>
          {latitud.toFixed(6)}, {longitud.toFixed(6)}
        </span>
      </div>
      <LocationPickerMap
        latitud={latitud}
        longitud={longitud}
        onChange={() => {}}
        readOnly
      />
    </div>
  );
}
