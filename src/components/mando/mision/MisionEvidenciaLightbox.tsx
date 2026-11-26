'use client';

import React, { useEffect } from 'react';
import { X, Download, FileText } from 'lucide-react';
import type { AdjuntoEvidencia } from '@/types/misiones';
import { resolverUrlEvidencia } from './evidenciaUrl';
import styles from '@/styles/mision-detalle.module.css';

interface MisionEvidenciaLightboxProps {
  adjunto: AdjuntoEvidencia | null;
  onCerrar: () => void;
}

export const MisionEvidenciaLightbox: React.FC<MisionEvidenciaLightboxProps> = ({
  adjunto,
  onCerrar,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCerrar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCerrar]);

  if (!adjunto) return null;

  const mediaUrl = resolverUrlEvidencia(adjunto.url);

  const formatTamano = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const esImagen = Boolean(mediaUrl) && adjunto.tipoMime.startsWith('image/');

  return (
    <div
      className={styles.lightboxOverlay}
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-label={`Visor de evidencia: ${adjunto.nombreArchivo}`}
    >
      <div className={styles.lightboxHeader} onClick={(e) => e.stopPropagation()}>
        <span className={styles.lightboxTitle}>
          {adjunto.nombreArchivo} ({formatTamano(adjunto.tamanoBytes)})
        </span>

        <button
          type="button"
          className={styles.lightboxCloseBtn}
          onClick={onCerrar}
          aria-label="Cerrar visor de evidencia"
          title="Cerrar visor (Esc)"
        >
          <X size={26} />
        </button>
      </div>

      <div className={styles.lightboxImgContainer} onClick={(e) => e.stopPropagation()}>
        {esImagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaUrl}
            alt={adjunto.nombreArchivo}
            className={styles.lightboxImg}
          />
        ) : (
          <div
            style={{
              backgroundColor: '#1E293B',
              padding: '2rem',
              color: '#FFFFFF',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <FileText size={48} />
            <p style={{ margin: 0, fontSize: '1rem' }}>{adjunto.nombreArchivo}</p>
            {mediaUrl ? (
              <a
                href={mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={adjunto.nombreArchivo}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
                  color: '#FFFFFF',
                  padding: '8px 16px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                <Download size={16} />
                <span>Descargar Archivo</span>
              </a>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
