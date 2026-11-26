'use client';

import React, { useEffect } from 'react';
import { X, Download, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import { resolverUrlEvidencia } from '@/lib/utils/mediaUrl';
import type { AdjuntoEvidencia } from '@/types/misiones';
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
    if (!adjunto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onCerrar();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [adjunto, onCerrar]);

  if (!adjunto) return null;

  const mediaUrl = resolverUrlEvidencia(adjunto.url);

  const formatTamano = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const esImagen = adjunto.tipoMime.startsWith('image/');
  const esVideo = adjunto.tipoMime.startsWith('video/');
  const esPdf = adjunto.tipoMime === 'application/pdf';

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
        ) : esVideo ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <video
              controls
              preload="metadata"
              src={mediaUrl}
              className={styles.lightboxVideo}
              aria-label={adjunto.nombreArchivo}
            />
            <Button
              variant="primary"
              size="md"
              href={mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={adjunto.nombreArchivo}
              icon={<Download size={16} />}
            >
              <span>Descargar Video</span>
            </Button>
          </div>
        ) : esPdf ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <iframe
              src={mediaUrl}
              title={adjunto.nombreArchivo}
              className={styles.lightboxPdf}
            />
            <Button
              variant="primary"
              size="md"
              href={mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={adjunto.nombreArchivo}
              icon={<Download size={16} />}
            >
              <span>Descargar PDF</span>
            </Button>
          </div>
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
            <Button
              variant="primary"
              size="md"
              href={mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={adjunto.nombreArchivo}
              icon={<Download size={16} />}
            >
              <span>Descargar Archivo</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
