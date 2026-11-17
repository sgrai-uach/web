'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';
import { MisionEvidenciasGallery } from '@/components/mando/mision/MisionEvidenciasGallery';
import type { AdjuntoEvidencia } from '@/types/misiones';
import styles from '@/styles/mando.module.css';

interface IncidenteEvidenciasSectionProps {
  adjuntos?: AdjuntoEvidencia[];
}

export const IncidenteEvidenciasSection: React.FC<IncidenteEvidenciasSectionProps> = ({
  adjuntos,
}) => {
  if (!Array.isArray(adjuntos) || adjuntos.length === 0) {
    return null;
  }

  return (
    <div className={styles.drawerSection} data-testid="incidente-evidencias-section">
      <Heading as="h3" variant="h4" color="teal" style={{ marginBottom: '0.75rem' }}>
        Evidencia Multimedia del Incidente ({adjuntos.length})
      </Heading>
      <MisionEvidenciasGallery adjuntos={adjuntos} />
    </div>
  );
};
