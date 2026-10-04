'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, FileText } from 'lucide-react';
import type { AdjuntoEvidencia } from '@/types/misiones';
import { MisionEvidenciaLightbox } from './MisionEvidenciaLightbox';
import styles from '@/styles/mision-detalle.module.css';

interface MisionEvidenciasGalleryProps {
  adjuntos: AdjuntoEvidencia[];
}

export const MisionEvidenciasGallery: React.FC<MisionEvidenciasGalleryProps> = ({ adjuntos }) => {
  const [adjuntoSeleccionado, setAdjuntoSeleccionado] = useState<AdjuntoEvidencia | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const formatTamano = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!adjuntos || adjuntos.length === 0) {
    return (
      <div className={styles.galeriaContenedor}>
        <span className={styles.galeriaTitulo}>
          <ImageIcon size={14} />
          <span>Evidencia Adjunta:</span>
        </span>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted, #5F676E)', fontStyle: 'italic' }}>
          Sin evidencias fotográficas adjuntas
        </p>
      </div>
    );
  }

  return (
    <div className={styles.galeriaContenedor}>
      <span className={styles.galeriaTitulo}>
        <ImageIcon size={14} />
        <span>Evidencias y Documentación en Terreno ({adjuntos.length}):</span>
      </span>

      <div className={styles.galeriaGrid}>
        {adjuntos.map((adj) => {
          const mediaUrl = adj.url.startsWith('http') ? adj.url : `${API_BASE}${adj.url}`;
          const esImagen = adj.tipoMime.startsWith('image/');

          return (
            <div
              key={adj.id}
              className={styles.miniaturaCard}
              onClick={() => setAdjuntoSeleccionado(adj)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setAdjuntoSeleccionado(adj);
                }
              }}
              title={`Ver archivo ${adj.nombreArchivo} (${formatTamano(adj.tamanoBytes)})`}
            >
              <div className={styles.miniaturaImgBox}>
                {esImagen ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaUrl}
                    alt={adj.nombreArchivo}
                    className={styles.miniaturaImg}
                    loading="lazy"
                  />
                ) : (
                  <FileText size={32} color="var(--color-charcoal, #3B3F45)" />
                )}
              </div>

              <div className={styles.miniaturaInfo}>
                <span className={styles.miniaturaNombre}>{adj.nombreArchivo}</span>
                <span className={styles.miniaturaPeso}>{formatTamano(adj.tamanoBytes)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <MisionEvidenciaLightbox
        adjunto={adjuntoSeleccionado}
        onCerrar={() => setAdjuntoSeleccionado(null)}
      />
    </div>
  );
};
