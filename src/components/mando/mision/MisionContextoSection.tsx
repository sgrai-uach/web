'use client';

import React from 'react';
import { AlertCircle, MapPin, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import type { IncidenteMisionResumen, PrevencionMisionResumen } from '@/types/misiones';
import styles from '@/styles/mision-detalle.module.css';

interface MisionContextoSectionProps {
  incidente: IncidenteMisionResumen | null;
  prevencion: PrevencionMisionResumen | null;
  descripcionMision: string | null;
}

export const MisionContextoSection: React.FC<MisionContextoSectionProps> = ({
  incidente,
  prevencion,
  descripcionMision,
}) => {
  return (
    <div className={styles.seccionBloque}>
      <div className={styles.seccionHeader}>
        <div className={styles.seccionTituloGroup}>
          <AlertCircle size={18} color="var(--color-primary-teal, #1B6F7D)" />
          <Heading as="h3" variant="h4" color="teal" noMargin>
            {incidente ? 'Incidente Operativo Asociado' : 'Punto Crítico Preventivo Asociado'}
          </Heading>
        </div>
        {incidente && incidente.requiereAsistenciaSocial && (
          <span
            style={{
              backgroundColor: '#EDE9FE',
              color: '#5B21B6',
              border: '1px solid #C4B5FD',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
            }}
            title="Este caso requiere aplicación de Ficha Básica de Emergencia (FIBE)"
          >
            Requiere Asistencia Social (FIBE)
          </span>
        )}
      </div>

      <div className={styles.seccionBody}>
        {descripcionMision && (
          <div
            style={{
              paddingBottom: 'var(--space-3, 12px)',
              borderBottom: '1px solid var(--border-color-neutral, #DFE3E8)',
            }}
          >
            <span className={styles.dataLabel}>Instrucciones de la Misión:</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--color-text-dark, #2B2B2B)', lineHeight: 1.4 }}>
              {descripcionMision}
            </p>
          </div>
        )}

        {incidente && (
          <div className={styles.dataGrid}>
            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Código Incidente</span>
              <span className={styles.dataValue} style={{ fontWeight: 700 }}>
                {incidente.codigo}{' '}
                <small style={{ color: 'var(--color-text-muted, #5F676E)', fontWeight: 400 }}>
                  (Seguimiento: {incidente.codigoSeguimiento})
                </small>
              </span>
            </div>

            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Tipo de Emergencia</span>
              <span className={styles.dataValue} style={{ fontWeight: 600 }}>
                {incidente.tipoAfectacion}
              </span>
            </div>

            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Dirección</span>
              <span
                className={styles.dataValue}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <MapPin size={14} color="var(--color-primary-teal, #1B6F7D)" style={{ flexShrink: 0 }} />
                <span>{incidente.direccion}</span>
              </span>
            </div>

            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Delegación Municipal</span>
              <span className={styles.dataValue}>
                {incidente.delegacionNombre || 'Sin delegación asignada'}
              </span>
            </div>

            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Estado del Incidente</span>
              <span className={styles.dataValue} style={{ fontWeight: 600 }}>
                {incidente.estado}
              </span>
            </div>

            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Prioridad del Incidente</span>
              <span className={styles.dataValue} style={{ fontWeight: 600 }}>
                {incidente.prioridad}
              </span>
            </div>
          </div>
        )}

        {prevencion && !incidente && (
          <div className={styles.dataGrid}>
            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Código Punto Crítico</span>
              <span className={styles.dataValue} style={{ fontWeight: 700 }}>
                {prevencion.codigo}
              </span>
            </div>

            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Nombre del Punto</span>
              <span className={styles.dataValue} style={{ fontWeight: 600 }}>
                {prevencion.nombre}
              </span>
            </div>

            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Delegación</span>
              <span className={styles.dataValue}>
                {prevencion.delegacionNombre || 'Sin delegación'}
              </span>
            </div>

            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Coordenadas</span>
              <span className={styles.dataValue}>
                {prevencion.latitud.toFixed(4)}, {prevencion.longitud.toFixed(4)}
              </span>
            </div>

            {prevencion.descripcion && (
              <div className={styles.dataItem} style={{ gridColumn: '1 / -1' }}>
                <span className={styles.dataLabel}>Descripción Preventiva</span>
                <span className={styles.dataValue}>{prevencion.descripcion}</span>
              </div>
            )}
          </div>
        )}

        {!incidente && !prevencion && (
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted, #5F676E)' }}>
            Misión operativa independiente sin incidente ni punto preventivo asociado.
          </p>
        )}
      </div>
    </div>
  );
};
