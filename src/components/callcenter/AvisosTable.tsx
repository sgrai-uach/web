'use client';

import React from 'react';
import type { AvisoItem } from '@/types/avisos';
import AvisosTableRow from './table/AvisosTableRow';
import AvisosTableEmpty from './table/AvisosTableEmpty';
import AvisosPagination from './table/AvisosPagination';

interface AvisosTableProps {
  avisos: AvisoItem[];
  cargando: boolean;
  paginaActual: number;
  totalPaginas: number;
  totalItems: number;
  limite: number;
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
                backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                color: 'var(--color-charcoal, #3B3F45)',
                borderBottom: '2px solid #BAC7D5',
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
              <th style={{ padding: '0.875rem 1rem', width: '150px' }}>Ubicación</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'right', width: '120px' }}>
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {cargando && avisos.length === 0 ? (
              <AvisosTableEmpty cargando={true} />
            ) : avisos.length === 0 ? (
              <AvisosTableEmpty cargando={false} />
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

      <AvisosPagination
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalItems={totalItems}
        limite={limite}
        onCambiarPagina={onCambiarPagina}
        onCambiarLimite={onCambiarLimite}
      />
    </div>
  );
}
