'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';
import { MapPin } from 'lucide-react';
import type { IncidenteDetalle } from '@/services/incidentesService';
import { obtenerNombreDelegacion } from '@/lib/utils/delegacionUtils';
import styles from '@/styles/mando.module.css';

interface IncidenteUbicacionSectionProps {
  detalle: IncidenteDetalle;
}

export const IncidenteUbicacionSection: React.FC<IncidenteUbicacionSectionProps> = ({ detalle }) => {
  const nombreDelegacion = detalle.delegacion
    ? obtenerNombreDelegacion(detalle.delegacion.nombre || detalle.delegacion.id, 'No asignada')
    : 'No asignada';

  return (
    <div className={styles.drawerSection}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <MapPin size={18} color="var(--color-primary-teal, #1B6F7D)" />
        <Heading as="h3" variant="h4" color="teal" noMargin>
          Ubicación Territorial
        </Heading>
      </div>

      <div className={styles.drawerDataGrid}>
        <div>
          <span className={styles.drawerDataLabel}>Dirección / Referencia</span>
          <span className={styles.drawerDataValue}>{detalle.direccion}</span>
        </div>
        <div>
          <span className={styles.drawerDataLabel}>Delegación Asignada</span>
          <span className={styles.drawerDataValue}>
            {nombreDelegacion}
          </span>
        </div>
        <div>
          <span className={styles.drawerDataLabel}>Coordenadas GPS</span>
          <span className={styles.drawerDataValue}>
            {detalle.latitud.toFixed(4)}, {detalle.longitud.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
};
