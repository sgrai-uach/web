'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';
import { ShieldCheck } from 'lucide-react';
import type { IncidenteDetalle } from '@/services/incidentesService';
import { formatearPrioridad } from '@/lib/utils/estadoUtils';
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

      {(detalle.justificacionReclasificacion || detalle.reclasificadoEnTerreno) && (
        <div
          data-testid="bloque-reclasificacion-terreno"
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-info-bg, #E0F2F1)',
            borderLeft: '4px solid var(--color-primary-teal, #1B6F7D)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
            <ShieldCheck size={16} color="var(--color-primary-teal, #1B6F7D)" aria-hidden="true" />
            <strong style={{ fontSize: '0.8125rem', color: 'var(--color-primary-teal-dark, #14505A)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Reclasificación Técnica en Terreno
            </strong>
          </div>
          <p style={{ margin: '0.2rem 0', fontSize: '0.8125rem', color: 'var(--color-charcoal, #3B3F45)' }}>
            <strong>Tipología constatada:</strong> {detalle.tipoAfectacion}
          </p>
          {detalle.justificacionReclasificacion && (
            <p style={{ margin: '0.2rem 0', fontSize: '0.8125rem', color: 'var(--color-charcoal, #3B3F45)' }}>
              <strong>Justificación de la patrulla:</strong> {detalle.justificacionReclasificacion}
            </p>
          )}
          {detalle.cambioPrioridadMotivo && (
            <p style={{ margin: '0.2rem 0', fontSize: '0.8125rem', color: 'var(--color-charcoal, #3B3F45)' }}>
              <strong>Prioridad ajustada:</strong> {formatearPrioridad(detalle.prioridad)}
            </p>
          )}
        </div>
      )}

      <div style={{ marginTop: '0.75rem' }}>
        <span className={styles.drawerDataLabel}>Descripción del Relato</span>
        <p className={styles.drawerDataValue} style={{ margin: '0.25rem 0' }}>
          {detalle.descripcion || 'Sin descripción detallada ingresada.'}
        </p>
      </div>
    </div>
  );
};
