import React from 'react';
import type { AvisoItem } from '@/types/avisos';
import AvisoMap from '@/components/maps/AvisoMap';

interface AvisoDetalleUbicacionProps {
  aviso: AvisoItem;
  datosInf?: { direccionAproximada?: string };
  direccionAproximada?: string | null;
}

export default function AvisoDetalleUbicacion({
  aviso,
  datosInf,
  direccionAproximada,
}: AvisoDetalleUbicacionProps) {
  const direccion = direccionAproximada || datosInf?.direccionAproximada || undefined;

  return (
    <div
      style={{
        border: '1px solid #DFE3E8',
        padding: '1.25rem',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <div
        style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: 'var(--color-primary-teal, #1B6F7D)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          borderBottom: '2px solid var(--color-accent-mint, #4FAE9B)',
          paddingBottom: '0.35rem',
        }}
      >
        Ubicación Georreferenciada (Valdivia)
      </div>

      <div style={{ fontSize: '0.8125rem', color: '#666', marginBottom: '0.25rem' }}>
        Coordenadas: {aviso.latitud.toFixed(5)}, {aviso.longitud.toFixed(5)}
      </div>

      <AvisoMap
        latitud={aviso.latitud}
        longitud={aviso.longitud}
        titulo={aviso.tipoPreliminarNombre || 'Aviso de Emergencia'}
        direccion={direccion}
        height="220px"
      />
    </div>
  );
}
