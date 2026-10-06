'use client';

import React, { useState } from 'react';
import type {
  EventoAsistenciaSocialItem,
  PrioridadEventoSocial,
  EstadoEventoSocial,
} from '@/types/asistenciaSocial';
import { TIPOS_AFECTACION_SOCIAL } from '@/types/asistenciaSocial';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/Button';
import { MapPin, Users, Phone, User, Calendar, Eye } from 'lucide-react';
import EventoAsistenciaSocialDetalleModal from './EventoAsistenciaSocialDetalleModal';

interface AsistenciaSocialTablaProps {
  eventos: EventoAsistenciaSocialItem[];
  meta: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
  onCambiarPagina: (nuevaPagina: number) => void;
  onCambiarLimite?: (nuevoLimite: number) => void;
  cargando?: boolean;
}

function getPrioridadBadgeStyle(prioridad: PrioridadEventoSocial) {
  switch (prioridad) {
    case 'CRITICA':
      return {
        backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
        color: 'var(--color-danger, #D32F2F)',
        border: '1px solid var(--color-danger, #D32F2F)',
      };
    case 'ALTA':
      return {
        backgroundColor: 'var(--color-warning-bg, #FFF3E0)',
        color: 'var(--color-warning, #E65100)',
        border: '1px solid #FFB74D',
      };
    case 'MEDIA':
      return {
        backgroundColor: 'var(--color-info-bg, #E0F2F1)',
        color: 'var(--color-primary-teal, #1B6F7D)',
        border: '1px solid var(--color-accent-mint, #4FAE9B)',
      };
    case 'BAJA':
    default:
      return {
        backgroundColor: 'var(--color-bg-light, #ECEFF3)',
        color: 'var(--color-charcoal, #3B3F45)',
        border: '1px solid var(--border-color-neutral, #DFE3E8)',
      };
  }
}

function getEstadoBadgeStyle(estado: EstadoEventoSocial) {
  switch (estado) {
    case 'PENDIENTE':
      return {
        backgroundColor: '#FFF8E1',
        color: '#F57F17',
        border: '1px solid #FFE082',
      };
    case 'ASIGNADO':
      return {
        backgroundColor: 'var(--color-info-bg, #E0F2F1)',
        color: 'var(--color-primary-teal, #1B6F7D)',
        border: '1px solid #80CBC4',
      };
    case 'EN_EVALUACION_FIBE':
      return {
        backgroundColor: '#E8EAF6',
        color: '#283593',
        border: '1px solid #9FA8DA',
      };
    case 'FINALIZADO':
      return {
        backgroundColor: 'var(--color-success-bg, #E8F5E9)',
        color: 'var(--color-success, #2E7D32)',
        border: '1px solid #A5D6A7',
      };
    case 'DESCARTADO':
    default:
      return {
        backgroundColor: 'var(--color-bg-light, #ECEFF3)',
        color: 'var(--color-text-muted, #5F676E)',
        border: '1px solid #DFE3E8',
      };
  }
}

function getTipoAfectacionLabel(tipo: string): string {
  const encontrado = TIPOS_AFECTACION_SOCIAL.find((t) => t.value === tipo);
  return encontrado ? encontrado.label : tipo;
}

export default function AsistenciaSocialTabla({
  eventos,
  meta,
  onCambiarPagina,
  onCambiarLimite,
  cargando = false,
}: AsistenciaSocialTablaProps) {
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoAsistenciaSocialItem | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4, 16px)' }}>
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color-neutral, #DFE3E8)',
          boxShadow: 'var(--shadow-none)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: 'var(--font-size-sm, 13px)',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                borderBottom: '2px solid var(--border-color-neutral-dark, #CCD2D9)',
                color: 'var(--color-charcoal, #3B3F45)',
                fontWeight: 700,
              }}
            >
              <th style={{ padding: '12px 16px' }}>Código / Prioridad</th>
              <th style={{ padding: '12px 16px' }}>Afectación</th>
              <th style={{ padding: '12px 16px' }}>Ubicación y Sector</th>
              <th style={{ padding: '12px 16px' }}>Afectados</th>
              <th style={{ padding: '12px 16px' }}>Contacto</th>
              <th style={{ padding: '12px 16px' }}>Estado</th>
              <th style={{ padding: '12px 16px' }}>Fecha Registro</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
                  Cargando eventos de asistencia social...
                </td>
              </tr>
            ) : eventos.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
                  No hay eventos registrados.
                </td>
              </tr>
            ) : (
              eventos.map((evento) => {
                const prioridadStyle = getPrioridadBadgeStyle(evento.prioridad);
                const estadoStyle = getEstadoBadgeStyle(evento.estado);

                return (
                  <tr
                    key={evento.id}
                    style={{
                      borderBottom: '1px solid var(--border-color-neutral, #DFE3E8)',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            color: 'var(--color-charcoal-dark, #24272B)',
                          }}
                        >
                          {evento.codigo}
                        </span>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            width: 'fit-content',
                            ...prioridadStyle,
                          }}
                        >
                          {evento.prioridad}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', verticalAlign: 'top', maxWidth: '240px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-primary-teal, #1B6F7D)' }}>
                        {getTipoAfectacionLabel(evento.tipoAfectacion)}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--color-text-muted, #5F676E)',
                          marginTop: '3px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.4,
                        }}
                        title={evento.descripcion}
                      >
                        {evento.descripcion}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', verticalAlign: 'top', maxWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <MapPin
                          size={14}
                          color="var(--color-primary-teal, #1B6F7D)"
                          style={{ flexShrink: 0, marginTop: '2px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: '#2B2B2B' }}>
                            {evento.direccionTexto}
                          </div>
                          {evento.delegacionNombre && (
                            <div style={{ fontSize: '11px', color: '#5F676E' }}>
                              {evento.delegacionNombre}
                            </div>
                          )}
                          <div style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
                            {Number(evento.latitud).toFixed(4)}, {Number(evento.longitud).toFixed(4)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Users size={14} color="#5F676E" />
                        <span>
                          <strong>{evento.personasAfectadas}</strong> pers. / <strong>{evento.familiasAfectadas}</strong> fam.
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', verticalAlign: 'top', minWidth: '150px' }}>
                      {evento.contactoNombre || evento.contactoTelefono ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {evento.contactoNombre && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                              <User size={13} color="#5F676E" />
                              <span>{evento.contactoNombre}</span>
                            </div>
                          )}
                          {evento.contactoTelefono && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5F676E', fontSize: '12px' }}>
                              <Phone size={12} color="#5F676E" />
                              <span>{evento.contactoTelefono}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#888', fontStyle: 'italic', fontSize: '12px' }}>
                          Sin contacto preliminar
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          ...estadoStyle,
                        }}
                      >
                        {evento.estado.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5F676E', fontSize: '12px' }}>
                        <Calendar size={13} color="#5F676E" />
                        <span>
                          {new Date(evento.creadoEn).toLocaleDateString('es-CL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {evento.creadoPor?.nombre && (
                        <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                          Por: {evento.creadoPor.nombre}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px', verticalAlign: 'top', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEventoSeleccionado(evento)}
                        style={{
                          border: '1px solid var(--border-color-neutral, #DFE3E8)',
                          padding: '4px 10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                        title={`Ver ficha técnica de ${evento.codigo}`}
                      >
                        <Eye size={14} color="var(--color-primary-teal, #1B6F7D)" />
                        <span>Ver Ficha</span>
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {meta.totalPaginas > 1 && (
        <Pagination
          paginaActual={meta.pagina}
          totalPaginas={meta.totalPaginas}
          onCambiarPagina={onCambiarPagina}
          totalItems={meta.total}
          limite={meta.limite}
          onCambiarLimite={onCambiarLimite || (() => {})}
          nombreEntidad="casos registrados"
        />
      )}

      {/* Modal Ficha Técnica del Evento Seleccionado */}
      <EventoAsistenciaSocialDetalleModal
        isOpen={Boolean(eventoSeleccionado)}
        onClose={() => setEventoSeleccionado(null)}
        datos={
          eventoSeleccionado
            ? {
                codigo: eventoSeleccionado.codigo,
                descripcion: eventoSeleccionado.descripcion,
                tipoAfectacion: eventoSeleccionado.tipoAfectacion,
                prioridad: eventoSeleccionado.prioridad,
                personasAfectadas: eventoSeleccionado.personasAfectadas,
                familiasAfectadas: eventoSeleccionado.familiasAfectadas,
                direccionTexto: eventoSeleccionado.direccionTexto,
                latitud: eventoSeleccionado.latitud,
                longitud: eventoSeleccionado.longitud,
                delegacionNombre: eventoSeleccionado.delegacionNombre,
                incidenteId: eventoSeleccionado.incidenteId,
                contactoNombre: eventoSeleccionado.contactoNombre,
                contactoTelefono: eventoSeleccionado.contactoTelefono,
                contactoRut: eventoSeleccionado.contactoRut,
                creadoPorNombre: eventoSeleccionado.creadoPor?.nombre,
                creadoEn: eventoSeleccionado.creadoEn,
                estado: eventoSeleccionado.estado,
              }
            : null
        }
      />
    </div>
  );
}
