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
  onSeleccionarPunto?: (punto: PuntoCriticoItem) => void;
  onEliminarPunto?: (punto: PuntoCriticoItem) => void;
  puedeEliminar?: boolean;
}

export default function PuntosCriticosTabla({
  puntosCriticos,
  cargando,
  esFiltroActivo,
  onLimpiarFiltros,
  onSeleccionarPunto,
  onEliminarPunto,
  puedeEliminar = true,
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
            <th style={{ padding: '12px 16px', fontWeight: 700, width: '28%' }}>
              Identificador / Sector
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 700, width: '18%' }}>
              Tipo de Riesgo
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 700, width: '11%' }}>
              Prioridad
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 700, width: '15%' }}>
              Coordenadas / Ubicación
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 700, width: '12%' }}>
              Delegación Asociada
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 700, width: '8%' }}>
              Estado
            </th>
            <th
              style={{
                padding: '12px 16px',
                fontWeight: 700,
                width: '8%',
                textAlign: 'center',
              }}
            >
              Acción
            </th>
          </tr>
        </thead>

        <tbody>
          {cargando && <PuntosCriticosSkeleton filas={5} />}

          {!cargando && puntosCriticos.filter((p) => p.activo !== false).length === 0 && (
            <tr>
              <td colSpan={7} style={{ padding: 0 }}>
                <PuntosCriticosEmptyState
                  esFiltroActivo={esFiltroActivo}
                  onLimpiarFiltros={onLimpiarFiltros}
                />
              </td>
            </tr>
          )}

          {!cargando &&
            puntosCriticos
              .filter((p) => p.activo !== false)
              .map((punto, idx) => (
                <PuntoCriticoRow
                  key={punto.id}
                  punto={punto}
                  indice={idx}
                  onSeleccionar={onSeleccionarPunto}
                  onEliminar={onEliminarPunto}
                  puedeEliminar={puedeEliminar}
                />
              ))}
        </tbody>
      </table>
    </div>
  );
}
