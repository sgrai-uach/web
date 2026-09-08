'use client';

import React from 'react';
import type { AvisoItem } from '@/types/api';

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
  // Función auxiliar de formateo de fecha
  function formatearFechaHora(fechaIso: string) {
    try {
      const d = new Date(fechaIso);
      return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return fechaIso;
    }
  }

  // Render del semáforo visual de prioridad
  function renderSemaforo(minutos: number) {
    if (minutos > 30) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: '#FFEBEE',
            color: '#B71C1C',
            border: '1px solid #FFCDD2',
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.3px',
          }}
          title={`En espera hace ${minutos} minutos (Urgente > 30 min)`}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#D32F2F',
              borderRadius: '50%',
              display: 'inline-block',
            }}
          />
          {minutos} min &bull; URGENTE
        </span>
      );
    }

    if (minutos >= 15) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: '#FFF9C4',
            color: '#E65100',
            border: '1px solid #FFE082',
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
          title={`En espera hace ${minutos} minutos (Precaución 15-30 min)`}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#F57F17',
              borderRadius: '50%',
              display: 'inline-block',
            }}
          />
          {minutos} min
        </span>
      );
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          backgroundColor: '#E8F5E9',
          color: '#1B5E20',
          border: '1px solid #A5D6A7',
          padding: '0.25rem 0.5rem',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}
        title={`En espera hace ${minutos} minutos (En tiempo < 15 min)`}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#2E7D32',
            borderRadius: '50%',
            display: 'inline-block',
          }}
        />
        {minutos} min
      </span>
    );
  }

  // Render del origen del reporte
  function renderOrigen(origen: string) {
    let color = '#3B3F45';
    let etiqueta = origen;

    if (origen === 'WEB') {
      color = 'var(--color-primary-teal, #1B6F7D)';
      etiqueta = 'Portal Web';
    } else if (origen === 'CHATBOT') {
      color = '#6A1B9A';
      etiqueta = 'Chatbot';
    } else if (origen === 'TELEFONO') {
      color = '#00838F';
      etiqueta = 'Teléfono 14XX';
    }

    return (
      <span
        style={{
          borderLeft: `3px solid ${color}`,
          paddingLeft: '0.5rem',
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: 'var(--color-charcoal, #3B3F45)',
        }}
      >
        {etiqueta}
      </span>
    );
  }

  const inicioRango = totalItems === 0 ? 0 : (paginaActual - 1) * limite + 1;
  const finRango = Math.min(paginaActual * limite, totalItems);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)',
        border: '1px solid #DFE3E8',
        boxShadow: 'none',
      }}
    >
      {/* Tabla con scroll horizontal responsivo */}
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
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: '3rem 1rem',
                    textAlign: 'center',
                    color: 'var(--color-charcoal, #3B3F45)',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    Cargando avisos de emergencia...
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#666' }}>
                    Conectando con la base de datos municipal...
                  </div>
                </td>
              </tr>
            ) : avisos.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: '3.5rem 1rem',
                    textAlign: 'center',
                    backgroundColor: '#FAFAFA',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
                      color: '#FFFFFF',
                      width: '44px',
                      height: '44px',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {/* Ícono de bandeja al día (Inbox check) */}
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                      <path d="m9 8 2 2 4-4" />
                    </svg>
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: 'var(--color-primary-teal, #1B6F7D)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    No hay avisos pendientes en la bandeja
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    El sistema está escuchando en tiempo real vía WebSockets para nuevos reportes de la ciudadanía.
                  </div>
                </td>
              </tr>
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
                      title={aviso.descripcion}
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
            )}
          </tbody>
        </table>
      </div>

      {/* Barra de paginación plana */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1.5rem',
          borderTop: '1px solid #DFE3E8',
          backgroundColor: 'var(--color-bg-light, #ECEFF3)',
          gap: '1rem',
          fontSize: '0.875rem',
        }}
      >
        {/* Info de rango */}
        <div style={{ color: 'var(--color-charcoal, #3B3F45)' }}>
          Mostrando <strong>{inicioRango}</strong> a <strong>{finRango}</strong> de{' '}
          <strong>{totalItems}</strong> avisos
        </div>

        {/* Controles de página y límite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Selector de límite */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#555' }}>Mostrar:</span>
            <select
              value={limite}
              onChange={(e) => onCambiarLimite(Number(e.target.value))}
              style={{
                padding: '0.35rem 0.5rem',
                border: '1px solid #BAC7D5',
                fontSize: '0.8125rem',
                backgroundColor: '#FFFFFF',
                borderRadius: 0,
                cursor: 'pointer',
              }}
              aria-label="Avisos por página"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Botones de navegación */}
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              type="button"
              disabled={paginaActual <= 1}
              onClick={() => onCambiarPagina(paginaActual - 1)}
              style={{
                backgroundColor: paginaActual <= 1 ? '#E0E0E0' : 'var(--color-charcoal, #3B3F45)',
                color: paginaActual <= 1 ? '#9E9E9E' : '#FFFFFF',
                border: 'none',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: paginaActual <= 1 ? 'not-allowed' : 'pointer',
                borderRadius: 0,
              }}
            >
              &larr; Anterior
            </button>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 0.5rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              Pág. {paginaActual} de {Math.max(1, totalPaginas)}
            </span>

            <button
              type="button"
              disabled={paginaActual >= totalPaginas}
              onClick={() => onCambiarPagina(paginaActual + 1)}
              style={{
                backgroundColor:
                  paginaActual >= totalPaginas ? '#E0E0E0' : 'var(--color-charcoal, #3B3F45)',
                color: paginaActual >= totalPaginas ? '#9E9E9E' : '#FFFFFF',
                border: 'none',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: paginaActual >= totalPaginas ? 'not-allowed' : 'pointer',
                borderRadius: 0,
              }}
            >
              Siguiente &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
