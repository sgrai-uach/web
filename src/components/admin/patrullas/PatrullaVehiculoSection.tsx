'use client';

import React from 'react';
import { Truck } from 'lucide-react';
import type { RecursoItem } from '@/types/recurso';
import styles from './PatrullaForm.module.css';

interface PatrullaVehiculoSectionProps {
  vehiculoId: string;
  vehiculos: RecursoItem[];
  cargando?: boolean;
  onChangeVehiculo: (val: string) => void;
}

export const PatrullaVehiculoSection: React.FC<PatrullaVehiculoSectionProps> = ({
  vehiculoId,
  vehiculos,
  cargando = false,
  onChangeVehiculo,
}) => {
  return (
    <section className={styles.section} aria-labelledby="seccion-vehiculo">
      <div className={styles.sectionHeader}>
        <Truck size={20} color="var(--color-primary-teal, #1B6F7D)" aria-hidden="true" />
        <h2 id="seccion-vehiculo" className={styles.sectionTitle}>
          Vehículo Institucional Asignado
        </h2>
      </div>
      <p className={styles.sectionDescription}>
        Asigne un vehículo institucional individualizado del inventario municipal en estado disponible.
        Al guardar, el vehículo pasará atómicamente a estado ASIGNADO.
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
            className={styles.selectField}
            aria-describedby="help-patrulla-vehiculo"
          >
            <option value="">
              {cargando
                ? 'Cargando vehículos disponibles...'
                : '-- Sin vehículo asignado (Despliegue pedestre / a pie) --'}
            </option>
            {vehiculos.map((v) => {
              const patente = v.detalles?.patente ? `[Patente: ${v.detalles.patente}]` : '';
              const modelo = v.detalles?.modelo ? `- ${v.detalles.modelo}` : '';
              return (
                <option key={v.id} value={v.id}>
                  {v.nombre} {modelo} {patente} ({v.estado})
                </option>
              );
            })}
          </select>
          <span id="help-patrulla-vehiculo" className={styles.helperText}>
            Solo se listan recursos con individualización (`esIndividual: true`) y estado DISPONIBLE.
          </span>
        </div>
      </div>
    </section>
  );
};

export default PatrullaVehiculoSection;
