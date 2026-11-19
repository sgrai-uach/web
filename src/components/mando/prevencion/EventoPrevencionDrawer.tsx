'use client';

import React, { useEffect } from 'react';
import LocationPickerMap from '@/components/maps/LocationPickerMap';
import {
  X,
  ShieldAlert,
  MapPin,
  Calendar,
  AlertTriangle,
  Compass,
  Truck,
  Users,
} from 'lucide-react';
import Heading from '@/components/ui/Heading';
import type { EventoPrevencionListItemDTO } from '@/types/evento-prevencion';
import { ESTADOS_PREVENCION } from '@/types/evento-prevencion';
import styles from './EventoPrevencionDrawer.module.css';

interface EventoPrevencionDrawerProps {
  evento: EventoPrevencionListItemDTO | null;
  isOpen: boolean;
  onClose: () => void;
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

export const EventoPrevencionDrawer: React.FC<EventoPrevencionDrawerProps> = ({
  evento,
  isOpen,
  onClose,
}) => {
  // Manejo de tecla Escape para cerrar
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !evento) return null;

  const estadoCfg =
    ESTADOS_PREVENCION.find((e) => e.valor === evento.estado) || {
      valor: evento.estado,
      label: evento.estado,
      color: '#5F676E',
      bg: '#ECEFF3',
    };

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-prevencion-title"
    >
      <aside
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Detalle del evento de prevención ${evento.codigo}`}
      >
        {/* Cabecera del Drawer */}
        <header className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <ShieldAlert size={22} color="var(--color-accent-mint, #4FAE9B)" aria-hidden="true" />
            <div className={styles.headerTitles}>
              <Heading as="h2" variant="h4" color="white" id="drawer-prevencion-title" style={{ margin: 0 }}>
                {evento.codigo}
              </Heading>
              <span className={styles.headerSubtitle}>
                {evento.nombre}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            title="Cerrar panel de detalle"
            aria-label="Cerrar panel lateral"
          >
            <X size={20} />
          </button>
        </header>

        {/* Cuerpo del Drawer */}
        <div className={styles.body}>
          {/* Ficha Resumen de Estado */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: estadoCfg.bg,
              border: `1px solid ${estadoCfg.color}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: estadoCfg.color, textTransform: 'uppercase' }}>
                Estado: {estadoCfg.label}
              </span>
            </div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-charcoal, #3B3F45)',
                textTransform: 'uppercase',
              }}
            >
              Prioridad: {evento.prioridad}
            </span>
          </div>

          {/* Sección 1: Información del Punto Crítico (o Fallback) */}
          <section className={styles.section} aria-labelledby="section-punto-critico-title">
            <div className={styles.sectionHeader}>
              <h3 id="section-punto-critico-title" className={styles.sectionTitle}>
                <AlertTriangle size={16} />
                <span>Punto Crítico Territorial</span>
              </h3>
              {evento.puntoCritico && (
                <span className={styles.coordenadasPill}>
                  {evento.puntoCritico.codigo}
                </span>
              )}
            </div>

            {evento.puntoCritico ? (
              <div className={styles.infoGrid}>
                <div className={styles.infoFieldFull}>
                  <span className={styles.label}>Nombre Oficial</span>
                  <span className={styles.value}>{evento.puntoCritico.nombre}</span>
                </div>

                <div className={styles.infoField}>
                  <span className={styles.label}>Tipo de Riesgo</span>
                  <span className={styles.value}>{evento.puntoCritico.tipoRiesgo || 'No especificado'}</span>
                </div>

                <div className={styles.infoField}>
                  <span className={styles.label}>Nivel de Prioridad</span>
                  <span className={styles.value}>{evento.puntoCritico.prioridad || 'Media'}</span>
                </div>

                {evento.puntoCritico.descripcion && (
                  <div className={styles.infoFieldFull}>
                    <span className={styles.label}>Descripción de Vulnerabilidad</span>
                    <span className={styles.value}>{evento.puntoCritico.descripcion}</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className={styles.alertaFallback}>
                  <MapPin size={16} style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Evento con coordenadas libres:</strong> Esta operación preventiva no fue asociada a un punto crítico formal del catálogo municipal.
                  </span>
                </div>

                <div className={styles.infoGrid}>
                  <div className={styles.infoField}>
                    <span className={styles.label}>Sector Referencial</span>
                    <span className={styles.value}>{evento.sector || 'Sin sector especificado'}</span>
                  </div>

                  <div className={styles.infoField}>
                    <span className={styles.label}>Dirección en Terreno</span>
                    <span className={styles.value}>{evento.direccionTexto || 'Sin dirección de referencia'}</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Sección 2: Georreferenciación y Cartografía PostGIS */}
          <section className={styles.section} aria-labelledby="section-geo-title">
            <div className={styles.sectionHeader}>
              <h3 id="section-geo-title" className={styles.sectionTitle}>
                <MapPin size={16} />
                <span>Georreferenciación PostGIS (EPSG:4326)</span>
              </h3>
              <span className={styles.coordenadasPill}>
                {evento.latitud.toFixed(4)}, {evento.longitud.toFixed(4)}
              </span>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoField}>
                <span className={styles.label}>Delegación Municipal</span>
                <span className={styles.value}>{evento.delegacion?.nombre || 'Sin delegación'}</span>
              </div>

              <div className={styles.infoField}>
                <span className={styles.label}>Geometría PostGIS</span>
                <span className={styles.value}>
                  {evento.ubicacionGeoJson?.type || 'Point'} WGS84
                </span>
              </div>
            </div>

            {/* Mini-mapa interactivo en modo lectura */}
            <div className={styles.mapContainer}>
              <LocationPickerMap
                latitud={evento.latitud}
                longitud={evento.longitud}
                readOnly={true}
                height="220px"
                ariaLabel={`Ubicación geográfica del evento preventivo ${evento.codigo}`}
              />
            </div>
          </section>

          {/* Sección 3: Misión y Unidad Operativa a Cargo */}
          <section className={styles.section} aria-labelledby="section-mision-title">
            <div className={styles.sectionHeader}>
              <h3 id="section-mision-title" className={styles.sectionTitle}>
                <Compass size={16} />
                <span>Misión y Despacho Operativo</span>
              </h3>
              {evento.mision && (
                <span className={styles.coordenadasPill}>
                  {evento.mision.codigo}
                </span>
              )}
            </div>

            {evento.mision ? (
              <div className={styles.infoGrid}>
                <div className={styles.infoFieldFull}>
                  <span className={styles.label}>Título de la Misión</span>
                  <span className={styles.value}>{evento.mision.titulo}</span>
                </div>

                <div className={styles.infoField}>
                  <span className={styles.label}>Tipo de Misión</span>
                  <span className={styles.value}>{evento.mision.tipoMision}</span>
                </div>

                <div className={styles.infoField}>
                  <span className={styles.label}>Estado de la Misión</span>
                  <span className={styles.value}>{evento.mision.estado}</span>
                </div>

                <div className={styles.infoField}>
                  <span className={styles.label}>Fecha Inicio</span>
                  <span className={styles.value}>{formatearFecha(evento.mision.fechaInicio)}</span>
                </div>

                <div className={styles.infoField}>
                  <span className={styles.label}>Fecha Cierre</span>
                  <span className={styles.value}>{formatearFecha(evento.mision.fechaCierre)}</span>
                </div>
              </div>
            ) : (
              <span className={styles.sinAsignar}>
                No se ha generado una misión operativa formal para este evento.
              </span>
            )}

            {/* Unidad Asignada (Patrulla / Cuadrilla) */}
            <div style={{ marginTop: '8px', borderTop: '1px solid var(--border-color-neutral, #DFE3E8)', paddingTop: '8px' }}>
              <span className={styles.label}>Unidad Asignada en Terreno</span>
              {evento.cuadrilla ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <Users size={16} color="var(--color-primary-teal, #1B6F7D)" />
                  <div>
                    <span style={{ fontWeight: 600 }}>{evento.cuadrilla.nombre}</span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #5F676E)', marginLeft: '6px' }}>
                      (Cuadrilla • {evento.cuadrilla.estado})
                    </span>
                  </div>
                </div>
              ) : evento.patrulla ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <Truck size={16} color="var(--color-primary-teal, #1B6F7D)" />
                  <div>
                    <span style={{ fontWeight: 600 }}>{evento.patrulla.nombre}</span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #5F676E)', marginLeft: '6px' }}>
                      (Patrulla • {evento.patrulla.estado})
                    </span>
                  </div>
                </div>
              ) : (
                <span className={styles.sinAsignar} style={{ display: 'block', marginTop: '4px' }}>
                  Sin patrulla ni cuadrilla asignada actualmente.
                </span>
              )}
            </div>
          </section>

          {/* Sección 4: Instrucciones y Trazabilidad */}
          <section className={styles.section} aria-labelledby="section-trazabilidad-title">
            <div className={styles.sectionHeader}>
              <h3 id="section-trazabilidad-title" className={styles.sectionTitle}>
                <Calendar size={16} />
                <span>Instrucciones y Trazabilidad</span>
              </h3>
            </div>

            {evento.descripcion && (
              <div className={styles.infoFieldFull}>
                <span className={styles.label}>Instrucciones de Mitigación</span>
                <span className={styles.value} style={{ lineHeight: 1.5 }}>
                  {evento.descripcion}
                </span>
              </div>
            )}

            <div className={styles.infoGrid} style={{ marginTop: '4px' }}>
              <div className={styles.infoField}>
                <span className={styles.label}>Fecha de Creación</span>
                <span className={styles.value}>{formatearFecha(evento.creadoEn)}</span>
              </div>

              <div className={styles.infoField}>
                <span className={styles.label}>Última Actualización</span>
                <span className={styles.value}>{formatearFecha(evento.actualizadoEn)}</span>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
};

export default EventoPrevencionDrawer;
