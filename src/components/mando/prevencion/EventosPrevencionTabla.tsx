'use client';

import React from 'react';
import { ShieldAlert, MapPin, Eye, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { EventoPrevencionListItemDTO } from '@/types/evento-prevencion';
import { ESTADOS_PREVENCION } from '@/types/evento-prevencion';
import styles from './EventosPrevencion.module.css';

interface EventosPrevencionTablaProps {
  eventos: EventoPrevencionListItemDTO[];
  eventoSeleccionadoId?: string | null;
  onSeleccionarEvento: (evento: EventoPrevencionListItemDTO) => void;
  cargando?: boolean;
  tieneFiltrosActivos?: boolean;
  onLimpiarFiltros?: () => void;
}

function formatearFecha(fechaIso?: string | null): string {
  if (!fechaIso) return '—';
  try {
    const fecha = new Date(fechaIso);
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(fecha);
  } catch {
    return fechaIso;
  }
}

export const EventosPrevencionTabla: React.FC<EventosPrevencionTablaProps> = ({
  eventos,
  eventoSeleccionadoId,
  onSeleccionarEvento,
  cargando,
  tieneFiltrosActivos,
  onLimpiarFiltros,
}) => {
  if (cargando) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.loadingSkeleton}>
          Cargando eventos preventivos en terreno...
        </div>
      </div>
    );
  }

  if (eventos.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.emptyState}>
          <ShieldAlert size={36} color="var(--color-primary-teal, #1B6F7D)" />
          <span style={{ fontWeight: 600, fontSize: '15px' }}>
            No se encontraron eventos u operativos de prevención
          </span>
          <span style={{ fontSize: '13px' }}>
            No hay registros que coincidan con los criterios de filtrado seleccionados.
          </span>
          {tieneFiltrosActivos && onLimpiarFiltros && (
            <div style={{ marginTop: '12px' }}>
              <Button variant="outline" size="sm" onClick={onLimpiarFiltros}>
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table} aria-label="Listado de eventos de prevención en puntos críticos">
        <thead>
          <tr>
            <th scope="col">Código</th>
            <th scope="col">Punto Crítico</th>
            <th scope="col">Delegación</th>
            <th scope="col">Estado</th>
            <th scope="col">Unidad a Cargo</th>
            <th scope="col">Fechas</th>
            <th scope="col" style={{ textAlign: 'right' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {eventos.map((ev) => {
            const isSelected = eventoSeleccionadoId === ev.id;
            const estadoCfg =
              ESTADOS_PREVENCION.find((e) => e.valor === ev.estado) || {
                valor: ev.estado,
                label: ev.estado,
                color: '#5F676E',
                bg: '#ECEFF3',
              };

            const unidadACargo = ev.cuadrilla
              ? { tipo: 'Cuadrilla', nombre: ev.cuadrilla.nombre }
              : ev.patrulla
              ? { tipo: 'Patrulla', nombre: ev.patrulla.nombre }
              : null;

            return (
              <tr
                key={ev.id}
                onClick={() => onSeleccionarEvento(ev)}
                className={`${styles.tableRow} ${isSelected ? styles.tableRowSelected : ''}`}
              >
                {/* Código de prevención */}
                <td>
                  <span className={styles.codigoLink}>
                    <ShieldAlert size={14} color="var(--color-primary-teal, #1B6F7D)" aria-hidden="true" />
                    <span>{ev.codigo}</span>
                  </span>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #5F676E)', marginTop: '2px' }}>
                    {ev.nombre}
                  </div>
                </td>

                {/* Punto crítico asociado */}
                <td>
                  {ev.puntoCritico ? (
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-dark, #2B2B2B)' }}>
                        {ev.puntoCritico.nombre}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-primary-teal, #1B6F7D)', fontFamily: 'monospace' }}>
                        {ev.puntoCritico.codigo}
                      </div>
                    </div>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        color: 'var(--color-text-muted, #5F676E)',
                      }}
                    >
                      <MapPin size={12} />
                      <span>{ev.sector || 'Coordenadas libres'}</span>
                    </span>
                  )}
                </td>

                {/* Delegación territorial */}
                <td>
                  <span style={{ fontSize: '13px' }}>
                    {ev.delegacion?.nombre || '—'}
                  </span>
                </td>

                {/* Estado operativo con badge */}
                <td>
                  <span
                    className={styles.badgeEstado}
                    style={{
                      color: estadoCfg.color,
                      backgroundColor: estadoCfg.bg,
                      borderColor: estadoCfg.color,
                    }}
                  >
                    <span
                      className={styles.badgeDot}
                      style={{ backgroundColor: estadoCfg.color }}
                      aria-hidden="true"
                    />
                    <span>{estadoCfg.label}</span>
                  </span>
                </td>

                {/* Unidad Operativa a Cargo */}
                <td>
                  {unidadACargo ? (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>
                        {unidadACargo.nombre}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)' }}>
                        {unidadACargo.tipo}
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #5F676E)', fontStyle: 'italic' }}>
                      Sin asignar
                    </span>
                  )}
                </td>

                {/* Fechas de creación y ejecución */}
                <td>
                  <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} color="var(--color-text-muted, #5F676E)" />
                    <span>{formatearFecha(ev.creadoEn)}</span>
                  </div>
                  {ev.mision?.fechaInicio && (
                    <div style={{ fontSize: '11px', color: 'var(--color-primary-teal, #1B6F7D)', marginTop: '2px' }}>
                      Inicio: {formatearFecha(ev.mision.fechaInicio)}
                    </div>
                  )}
                </td>

                {/* Botón de acción hacia Drawer */}
                <td style={{ textAlign: 'right' }}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeleccionarEvento(ev);
                    }}
                    title={`Abrir panel de detalle para ${ev.codigo}`}
                    aria-label={`Ver detalle de ${ev.codigo}`}
                  >
                    <Eye size={13} style={{ marginRight: '4px' }} />
                    <span>Detalle</span>
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EventosPrevencionTabla;
