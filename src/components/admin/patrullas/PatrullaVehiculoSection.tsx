'use client';

import React, { useMemo } from 'react';
import { Truck } from 'lucide-react';
import type { RecursoItem } from '@/types/recurso';
import InlineNotice from '@/components/ui/InlineNotice';
import { formatearEstado } from '@/lib/utils/estadoUtils';
import styles from './PatrullaForm.module.css';

export interface PatrullaResumenAsignacion {
  id: string;
  codigo?: string;
  nombre: string;
}

export interface PatrullaVehiculoSectionProps {
  vehiculoId: string;
  vehiculos: RecursoItem[];
  cargando?: boolean;
  mapaPatrullasPorVehiculo?: Record<string, PatrullaResumenAsignacion[]>;
  patrullaActualId?: string;
  errorVehiculo?: string;
  onChangeVehiculo: (val: string) => void;
}

export const PatrullaVehiculoSection: React.FC<PatrullaVehiculoSectionProps> = ({
  vehiculoId,
  vehiculos,
  cargando = false,
  mapaPatrullasPorVehiculo = {},
  patrullaActualId,
  errorVehiculo,
  onChangeVehiculo,
}) => {
  // Patrullas que ya ocupan el vehículo actualmente seleccionado (deduplicadas por ID)
  const patrullasAsignadasActual = useMemo(() => {
    if (!vehiculoId) return [];
    const raw = (mapaPatrullasPorVehiculo[vehiculoId] || []).filter(
      (p) => p.id !== patrullaActualId
    );
    const seen = new Set<string>();
    return raw.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [mapaPatrullasPorVehiculo, vehiculoId, patrullaActualId]);

  return (
    <section className={styles.section} aria-labelledby="seccion-vehiculo">
      <div className={styles.sectionHeader}>
        <Truck size={20} color="var(--color-primary-teal, #1B6F7D)" aria-hidden="true" />
        <h2 id="seccion-vehiculo" className={styles.sectionTitle}>
          Vehículo Institucional Asignado
        </h2>
      </div>
      <p className={styles.sectionDescription}>
        Asigne un vehículo institucional del inventario municipal. Se permite seleccionar un vehículo
        previamente asignado a otra patrulla para uso compartido entre unidades.
      </p>

      <div className={styles.fieldGrid}>
        <div className={styles.fieldGroup}>
          <label htmlFor="patrulla-vehiculo" className={styles.fieldLabel}>
            Vehículo de Evaluación
          </label>
          <select
            id="patrulla-vehiculo"
            value={vehiculoId}
            disabled={cargando}
            onChange={(e) => onChangeVehiculo(e.target.value)}
            className={`${styles.selectField} ${errorVehiculo ? styles.inputError : ''}`}
            aria-describedby="help-patrulla-vehiculo"
            aria-invalid={Boolean(errorVehiculo)}
          >
            <option value="">
              {cargando
                ? 'Cargando vehículos disponibles...'
                : '-- Sin vehículo asignado (Despliegue pedestre / a pie) --'}
            </option>
            {vehiculos.map((v) => {
              const patente = v.detalles?.patente ? `[Patente: ${v.detalles.patente}]` : '';
              const modelo = v.detalles?.modelo ? `- ${v.detalles.modelo}` : '';
              const rawDelVehiculo = (mapaPatrullasPorVehiculo[v.id] || []).filter(
                (p) => p.id !== patrullaActualId
              );
              const seenV = new Set<string>();
              const patrullasDelVehiculo = rawDelVehiculo.filter((p) => {
                if (seenV.has(p.id)) return false;
                seenV.add(p.id);
                return true;
              });

              const avisoUso =
                patrullasDelVehiculo.length > 0
                  ? ` (Asignado en: ${patrullasDelVehiculo
                      .map((p) => p.codigo || p.nombre)
                      .join(', ')})`
                  : '';

              return (
                <option key={v.id} value={v.id}>
                  {v.nombre} {modelo} {patente}
                  {avisoUso}
                </option>
              );
            })}
          </select>

          {errorVehiculo ? (
            <span id="error-patrulla-vehiculo" className={styles.errorText} role="alert">
              {errorVehiculo}
            </span>
          ) : (
            <span id="help-patrulla-vehiculo" className={styles.helperText}>
              Vehículos institucionales del inventario municipal. Si un vehículo ya está asignado a otra patrulla, puede seleccionarse para uso compartido.
            </span>
          )}

          {patrullasAsignadasActual.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <InlineNotice variant="warning" title="Vehículo asignado a otras patrullas">
                Este vehículo ya se encuentra asignado a:{' '}
                <strong>
                  {patrullasAsignadasActual
                    .map((p) => p.nombre)
                    .join(', ')}
                </strong>
                . Si continúa, quedará compartido entre las patrullas.
              </InlineNotice>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PatrullaVehiculoSection;
