'use client';

import React from 'react';
import type { AvisoItem } from '@/types/avisos';
import AvisosTableRow from './table/AvisosTableRow';
import AvisosTableEmpty from './table/AvisosTableEmpty';
import Pagination from '@/components/common/Pagination';

interface AvisosTableProps {
  avisos: AvisoItem[];
  cargando: boolean;
  paginaActual: number;
  totalPaginas: number;
  totalItems: number;
  limite: number;
  hayFiltrosActivos?: boolean;
  onLimpiarFiltros?: () => void;
  onCambiarPagina: (pagina: number) => void;
  onCambiarLimite: (limite: number) => void;
  onSeleccionarAviso: (aviso: AvisoItem) => void;
}

export default function AvisosTable({
  avisos,
  cargando,
  paginaActual,
  totalPaginas,
  totalItems,
  limite,
  hayFiltrosActivos = false,
  onLimpiarFiltros,
  onCambiarPagina,
  onCambiarLimite,
  onSeleccionarAviso,
}: AvisosTableProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)',
        border: '1px solid #DFE3E8',
        boxShadow: 'none',
      }}
    >
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.875rem',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--color-primary-teal-dark, #14505A)',
                color: 'var(--color-text-light, #FFFFFF)',
                borderBottom: '2px solid var(--color-primary-teal, #1B6F7D)',
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              <th style={{ padding: '0.875rem 1rem', width: '160px' }}>Prioridad (Espera)</th>
              <th style={{ padding: '0.875rem 1rem', width: '150px' }}>Fecha y Hora</th>
              <th style={{ padding: '0.875rem 1rem', width: '170px' }}>Tipo Preliminar</th>
              <th style={{ padding: '0.875rem 1rem', width: '130px' }}>Canal Origen</th>
              <th style={{ padding: '0.875rem 1rem' }}>Descripción del Aviso</th>
              <th style={{ padding: '0.875rem 1rem', width: '180px' }}>Ubicación / Delegación</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'right', width: '120px' }}>
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {cargando && avisos.length === 0 ? (
              <AvisosTableEmpty cargando={true} />
            ) : avisos.length === 0 ? (
              <AvisosTableEmpty
                cargando={false}
                hayFiltrosActivos={hayFiltrosActivos}
                onLimpiarFiltros={onLimpiarFiltros}
              />
            ) : (
              avisos.map((aviso, idx) => (
                <AvisosTableRow
                  key={aviso.id}
                  aviso={aviso}
                  idx={idx}
                  onSeleccionarAviso={onSeleccionarAviso}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalItems={totalItems}
        limite={limite}
        onCambiarPagina={onCambiarPagina}
        onCambiarLimite={onCambiarLimite}
        nombreEntidad="avisos"
      />
    </div>
  );
}
