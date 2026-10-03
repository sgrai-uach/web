'use client';

import React from 'react';
import type { PuntoCriticoItem } from '@/types/puntoCritico';
import PuntoCriticoRow from './PuntoCriticoRow';
import PuntosCriticosSkeleton from './PuntosCriticosSkeleton';
import PuntosCriticosEmptyState from './PuntosCriticosEmptyState';

interface PuntosCriticosTablaProps {
  puntosCriticos: PuntoCriticoItem[];
  cargando: boolean;
  esFiltroActivo: boolean;
  onLimpiarFiltros: () => void;
}

export default function PuntosCriticosTabla({
  puntosCriticos,
  cargando,
  esFiltroActivo,
  onLimpiarFiltros,
}: PuntosCriticosTablaProps) {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #DFE3E8',
        overflowX: 'auto',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '13px',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--color-primary-teal-dark, #14505A)',
              color: '#FFFFFF',
              borderBottom: '2px solid var(--color-primary-teal, #1B6F7D)',
            }}
          >
            <th style={{ padding: '12px 16px', fontWeight: 700, width: '32%' }}>
              Identificador / Sector
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 700, width: '20%' }}>
              Tipo de Riesgo
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 700, width: '12%' }}>
              Prioridad
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 700, width: '16%' }}>
              Coordenadas / Ubicación
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 700, width: '12%' }}>
              Delegación Asociada
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 700, width: '8%' }}>
              Estado
            </th>
          </tr>
        </thead>

        <tbody>
          {cargando && <PuntosCriticosSkeleton filas={5} />}

          {!cargando && puntosCriticos.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: 0 }}>
                <PuntosCriticosEmptyState
                  esFiltroActivo={esFiltroActivo}
                  onLimpiarFiltros={onLimpiarFiltros}
                />
              </td>
            </tr>
          )}

          {!cargando &&
            puntosCriticos.map((punto, idx) => (
              <PuntoCriticoRow
                key={punto.id}
                punto={punto}
                indice={idx}
              />
            ))}
        </tbody>
      </table>
    </div>
  );
}
