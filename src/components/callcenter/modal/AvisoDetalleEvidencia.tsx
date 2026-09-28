import React, { useState } from 'react';
import type { AvisoDetalleResponse } from '@/types/avisos';

interface AvisoDetalleEvidenciaProps {
  adjuntos: NonNullable<AvisoDetalleResponse['adjuntos']>;
}

export default function AvisoDetalleEvidencia({ adjuntos }: AvisoDetalleEvidenciaProps) {
  const [fotoAmpliadaUrl, setFotoAmpliadaUrl] = useState<string | null>(null);

  if (!adjuntos || adjuntos.length === 0) return null;

  return (
    <>
      <div
        style={{
          border: '1px solid #DFE3E8',
          padding: '1.25rem',
          backgroundColor: 'var(--color-bg-light, #ECEFF3)',
        }}
      >
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--color-primary-teal, #1B6F7D)',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}
        >
          Evidencia Multimedia Adjunta ({adjuntos.length})
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {adjuntos.map((foto) => (
            <div
              key={foto.id}
              onClick={() => setFotoAmpliadaUrl(foto.url)}
              style={{ border: '1px solid #BAC7D5', backgroundColor: '#FFFFFF', padding: '0.25rem', cursor: 'pointer' }}
              title="Clic para ampliar imagen"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto.url}
                alt={foto.nombreArchivo}
                style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div style={{ fontSize: '0.6875rem', padding: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#555' }}>
                {foto.nombreArchivo}
              </div>
            </div>
          ))}
        </div>
      </div>

      {fotoAmpliadaUrl && (
        <div
          onClick={() => setFotoAmpliadaUrl(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '2rem',
          }}
        >
          <div style={{ maxWidth: '90%', maxHeight: '90%' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fotoAmpliadaUrl}
              alt="Evidencia ampliada"
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
            />
            <div style={{ textAlign: 'center', marginTop: '0.5rem', color: '#FFF', fontSize: '0.875rem' }}>
              Clic en cualquier lugar para cerrar
            </div>
          </div>
        </div>
      )}
    </>
  );
}
