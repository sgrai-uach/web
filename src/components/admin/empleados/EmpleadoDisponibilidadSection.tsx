'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';
import { Activity } from 'lucide-react';
import type { EstadoOperativo } from '@/types/empleados';
import { inputStyle, labelStyle } from './empleadoStyles';

interface EmpleadoDisponibilidadSectionProps {
  estadoOperativo: EstadoOperativo;
  setEstadoOperativo: (valor: EstadoOperativo) => void;
  esRolTerreno: boolean;
  disponibleTerreno: boolean;
  setDisponibleTerreno: (valor: boolean) => void;
}

const ESTADOS_COMUNES: EstadoOperativo[] = ['disponible', 'descanso', 'licencia', 'inactivo'];
const ESTADOS_TERRENO: EstadoOperativo[] = ['en_mision', 'en_patrulla'];

const ETIQUETAS: Record<EstadoOperativo, string> = {
  disponible: 'Disponible',
  en_mision: 'En Misión',
  en_patrulla: 'En Patrulla',
  descanso: 'Descanso',
  licencia: 'Licencia',
  inactivo: 'Inactivo',
};

/**
 * Sección de disponibilidad del funcionario (H11).
 *
 * - El "Estado Operativo" se muestra para todos los usuarios y se persiste en
 *   `usuario.estado_operativo`.
 * - "Disponible para terreno" sólo aplica a perfiles de terreno y corresponde a la
 *   capacidad (`personal.disponible_terreno`), no al estado.
 */
export default function EmpleadoDisponibilidadSection({
  estadoOperativo,
  setEstadoOperativo,
  esRolTerreno,
  disponibleTerreno,
  setDisponibleTerreno,
}: EmpleadoDisponibilidadSectionProps) {
  const opciones: EstadoOperativo[] = esRolTerreno
    ? [...ESTADOS_COMUNES.slice(0, 3), ...ESTADOS_TERRENO, 'inactivo']
    : ESTADOS_COMUNES;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <Heading as="h3" variant="h4" color="teal" style={{ marginBottom: '0.875rem' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} />
          3. Disponibilidad Operacional
        </span>
      </Heading>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div>
          <label htmlFor="form-estado-operativo" style={labelStyle}>
            Estado Operativo *
          </label>
          <select
            id="form-estado-operativo"
            value={estadoOperativo}
            onChange={(e) => setEstadoOperativo(e.target.value as EstadoOperativo)}
            style={inputStyle}
          >
            {opciones.map((estado) => (
              <option key={estado} value={estado}>
                {ETIQUETAS[estado]}
              </option>
            ))}
          </select>
        </div>

        {esRolTerreno && (
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
            <label
              htmlFor="form-disponible-terreno"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
            >
              <input
                id="form-disponible-terreno"
                type="checkbox"
                checked={disponibleTerreno}
                onChange={(e) => setDisponibleTerreno(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--color-primary-teal, #1B6F7D)',
                  borderRadius: 0,
                }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-charcoal, #3B3F45)' }}>
                Disponible para terreno
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
