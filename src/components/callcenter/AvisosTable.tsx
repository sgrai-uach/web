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
              avisos.map((aviso, idx) => {
                const filaUrgente = aviso.minutosEnEspera > 30;
                return (
                  <tr
                    key={aviso.id}
                    style={{
                      borderBottom: '1px solid #E5E9EE',
                      backgroundColor:
                        filaUrgente
                          ? 'rgba(211, 47, 47, 0.03)'
                          : idx % 2 === 0
                            ? 'var(--color-white, #FFFFFF)'
                            : '#FAFCFD',
                    }}
                  >
                    {/* Semáforo / Espera */}
                    <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                      {renderSemaforo(aviso.minutosEnEspera)}
                    </td>

                    {/* Fecha y Hora */}
                    <td
                      style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#555' }}
                      suppressHydrationWarning
                    >
                      {formatearFechaHora(aviso.creadoEn)}
                    </td>

                    {/* Tipo Preliminar */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: 'var(--color-primary-teal, #1B6F7D)',
                        }}
                      >
                        {aviso.tipoPreliminarNombre || 'Sin tipificar'}
                      </span>
                    </td>

                    {/* Origen */}
                    <td style={{ padding: '0.875rem 1rem' }}>{renderOrigen(aviso.origenReporte)}</td>

                    {/* Descripción */}
                    <td
                      style={{
                        padding: '0.875rem 1rem',
                        maxWidth: '380px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={aviso.descripcion || undefined}
                    >
                      {aviso.descripcion}
                    </td>

                    {/* Coordenadas */}
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#666' }}>
                      {aviso.latitud.toFixed(4)}, {aviso.longitud.toFixed(4)}
                    </td>

                    {/* Botón Revisar */}
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => onSeleccionarAviso(aviso)}
                        style={{
                          backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '0.45rem 0.85rem',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          borderRadius: 0,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Revisar Aviso &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })
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
