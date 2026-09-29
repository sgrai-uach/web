'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';
import type { IncidenteDetalle } from '@/services/incidentesService';
import styles from '@/styles/mando.module.css';

interface IncidenteResumenSectionProps {
  detalle: IncidenteDetalle;
}

export const IncidenteResumenSection: React.FC<IncidenteResumenSectionProps> = ({ detalle }) => {
  return (
    <div className={styles.drawerSection}>
      <Heading as="h3" variant="h4" color="teal" style={{ marginBottom: '0.75rem' }}>
        Resumen del Incidente
      </Heading>
      <div className={styles.drawerDataGrid}>
        <div>
          <span className={styles.drawerDataLabel}>Tipo de Afectación</span>
          <span className={styles.drawerDataValue}>{detalle.tipoAfectacion}</span>
        </div>
        <div>
          <span className={styles.drawerDataLabel}>Código de Seguimiento</span>
          <span className={styles.drawerDataValue}>{detalle.codigoSeguimiento}</span>
        </div>
        <div>
          <span className={styles.drawerDataLabel}>Origen del Reporte</span>
          <span className={styles.drawerDataValue}>{detalle.fuenteOrigen}</span>
        </div>
        <div>
          <span className={styles.drawerDataLabel}>Fecha de Ingreso</span>
          <span className={styles.drawerDataValue}>
            {new Date(detalle.creadoEn).toLocaleString('es-CL')}
          </span>
        </div>
      </div>

      <div style={{ marginTop: '0.75rem' }}>
        <span className={styles.drawerDataLabel}>Descripción del Relato</span>
        <p className={styles.drawerDataValue} style={{ margin: '0.25rem 0' }}>
          {detalle.descripcion || 'Sin descripción detallada ingresada.'}
        </p>
      </div>
    </div>
  );
};
