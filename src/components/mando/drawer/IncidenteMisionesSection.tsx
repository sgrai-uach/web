'use client';

import React, { useState } from 'react';
import { Eye, ShieldCheck, Users, AlertTriangle, Clock, ChevronDown } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import type { IncidenteDetalle } from '@/services/incidentesService';
import {
  formatearEstado,
  formatearPrioridad,
  formatearTipoMision,
  obtenerChipEstadoMision,
} from '@/lib/utils/estadoUtils';
import styles from '@/styles/mando.module.css';

interface IncidenteMisionesSectionProps {
  misiones: IncidenteDetalle['misiones'];
  incidenteEstado?: string;
  onVerDetalleMision?: (misionId: string) => void;
  onAsignarPatrulla?: () => void;
  puedeAsignar?: boolean;
}

export const IncidenteMisionesSection: React.FC<IncidenteMisionesSectionProps> = ({
  misiones,
  incidenteEstado,
  onVerDetalleMision,
  onAsignarPatrulla,
  puedeAsignar = true,
}) => {
  const tieneVerificacionActiva = misiones.some(
    (m) =>
      m.tipoMision === 'VERIFICACION' &&
      ['PLANIFICADA', 'DESPACHADA', 'EN_CURSO'].includes(m.estado)
  );

  const mostrarBotonDespacho =
    incidenteEstado === 'REPORTADO' &&
    !tieneVerificacionActiva &&
    Boolean(onAsignarPatrulla) &&
    puedeAsignar;

  // 1. Separar misiones rechazadas vs misiones activas / vigentes
  const misionesRechazadas = misiones.filter(
    (m) => m.estado === 'RECHAZADA' || Boolean(m.justificacionRechazo)
  );

  const misionesActivas = misiones
    .filter((m) => !misionesRechazadas.some((r) => r.id === m.id))
    .sort((a, b) => {
      // Priorizar misiones en proceso al tope: EN_CURSO (0) > DESPACHADA (1) > PLANIFICADA (2) > COMPLETADA (3)
      const ordenEstado: Record<string, number> = {
        EN_CURSO: 0,
        DESPACHADA: 1,
        PLANIFICADA: 2,
        COMPLETADA: 3,
        CANCELADA: 4,
      };
      return (ordenEstado[a.estado] ?? 99) - (ordenEstado[b.estado] ?? 99);
    });

  // Si hay misiones en proceso, los rechazos inician colapsados para priorizar las activas.
  // Si no hay misiones en proceso, inician abiertos para visualización inmediata del motivo.
  const [rechazosAbiertos, setRechazosAbiertos] = useState<boolean>(
    misionesActivas.length === 0 && misionesRechazadas.length > 0
  );

  const formatFechaHora = (fechaIso?: string | null) => {
    if (!fechaIso) return null;
    try {
      const d = new Date(fechaIso);
      return d.toLocaleString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  };

  const renderTarjetaMision = (
    mision: IncidenteDetalle['misiones'][number],
    esDentroDeRechazos = false
  ) => {
    const chip = obtenerChipEstadoMision(mision.estado);
    const esRechazada = mision.estado === 'RECHAZADA' || Boolean(mision.justificacionRechazo);
    const fechaLegible = formatFechaHora(mision.fechaInicio || mision.creadoEn);

    return (
      <div
        key={mision.id}
        className={styles.misionCard}
        style={{
          border: esDentroDeRechazos ? '1px solid #DFE3E8' : undefined,
          borderLeft:
            esRechazada && !esDentroDeRechazos
              ? '4px solid var(--color-danger, #D32F2F)'
              : '1px solid #CBD5E1',
          backgroundColor: esRechazada ? '#FFFDFD' : 'var(--color-bg-light, #ECEFF3)',
          marginBottom: '0.6rem',
        }}
      >
        {/* Cabecera de la Tarjeta con Código, Título y Chip de Estado */}
        <div className={styles.misionHeader} style={{ alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', flex: 1 }}>
            <span
              style={{
                padding: '2px 6px',
                backgroundColor: 'var(--color-charcoal, #3B3F45)',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.3px',
                borderRadius: 0,
              }}
              title="Código correlativo de misión"
            >
              {mision.codigo}
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-charcoal-dark, #24272B)' }}>
              {mision.titulo}
            </span>
          </div>

          {/* Chip de Estado Estilo SGRAI */}
          <span
            style={{
              padding: '2px 8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              backgroundColor: chip.bg,
              color: chip.color,
              border: `1px solid ${chip.borderColor}`,
              borderRadius: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0,
            }}
          >
            {chip.label}
          </span>
        </div>

        {/* Metadatos Estructurados (Tipo, Prioridad, Fecha) */}
        <div
          style={{
            fontSize: '0.8125rem',
            marginTop: '0.35rem',
            color: 'var(--color-charcoal, #3B3F45)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <span>
            <strong>Tipo:</strong> {formatearTipoMision(mision.tipoMision)}
          </span>
          <span>&bull;</span>
          <span>
            <strong>Prioridad:</strong> {formatearPrioridad(mision.prioridad)}
          </span>
          {fechaLegible && (
            <>
              <span>&bull;</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted, #5F676E)' }}>
                <Clock size={12} aria-hidden="true" />
                <span>{fechaLegible}</span>
              </span>
            </>
          )}
        </div>

        {/* Equipos Asignados */}
        {mision.patrulla && (
          <div
            style={{
              fontSize: '0.8125rem',
              marginTop: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-text-dark, #2B2B2B)',
            }}
          >
            <ShieldCheck size={14} color="var(--color-primary-teal, #1B6F7D)" aria-hidden="true" style={{ flexShrink: 0 }} />
            <span>
              <strong>Patrulla:</strong> {mision.patrulla.nombre}{' '}
              <span style={{ color: 'var(--color-text-muted, #5F676E)' }}>
                ({formatearEstado(mision.patrulla.estado)})
              </span>
            </span>
          </div>
        )}

        {mision.cuadrilla && (
          <div
            style={{
              fontSize: '0.8125rem',
              marginTop: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-text-dark, #2B2B2B)',
            }}
          >
            <Users size={14} color="var(--color-primary-teal, #1B6F7D)" aria-hidden="true" style={{ flexShrink: 0 }} />
            <span>
              <strong>Cuadrilla:</strong> {mision.cuadrilla.nombre}{' '}
              <span style={{ color: 'var(--color-text-muted, #5F676E)' }}>
                ({formatearEstado(mision.cuadrilla.estado)})
              </span>
            </span>
          </div>
        )}

        {/* Bloque Destacado de Rechazo de Misión */}
        {mision.justificacionRechazo && (
          <div
            style={{
              marginTop: '0.6rem',
              padding: '8px 10px',
              backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
              border: '1px solid #FFCDD2',
              borderLeft: '3px solid var(--color-danger, #D32F2F)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
              <AlertTriangle size={14} color="var(--color-danger, #D32F2F)" aria-hidden="true" />
              <strong style={{ fontSize: '0.8125rem', color: 'var(--color-danger, #D32F2F)' }}>
                Motivo de Rechazo en Terreno:
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-charcoal, #3B3F45)' }}>
              {mision.justificacionRechazo}
            </p>
          </div>
        )}

        {/* Acción de Detalle */}
        <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onVerDetalleMision?.(mision.id)}
            title={`Ver detalles completos de la misión ${mision.codigo}`}
            aria-label={`Ver detalles de la misión ${mision.codigo}`}
          >
            <Eye size={13} aria-hidden="true" style={{ marginRight: '4px' }} />
            <span>Ver Detalles</span>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.drawerSection}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <Heading as="h3" variant="h4" color="teal" noMargin>
          Misiones y Equipos en Terreno ({misiones.length})
        </Heading>
      </div>

      {mostrarBotonDespacho && (
        <div
          style={{
            backgroundColor: '#F8FAFB',
            border: '1px solid var(--border-color-neutral, #DFE3E8)',
            padding: '12px 14px',
            borderRadius: 0,
            marginBottom: misiones.length > 0 ? '1rem' : '0',
          }}
        >
          <p
            style={{
              color: 'var(--color-text-dark, #2B2B2B)',
              fontSize: '0.85rem',
              margin: '0 0 10px 0',
            }}
          >
            Este incidente está pendiente de evaluación inicial. Despache una patrulla disponible para verificar en terreno las necesidades reales.
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onAsignarPatrulla}
            title="Despachar patrulla verificadora"
          >
            <ShieldCheck size={14} style={{ marginRight: '5px' }} />
            <span>Despachar Patrulla Verificadora</span>
          </Button>
        </div>
      )}

      {misiones.length === 0 && !mostrarBotonDespacho && (
        <p style={{ color: 'var(--color-text-muted, #5F676E)', fontSize: '0.85rem', margin: 0 }}>
          No se han despachado misiones operativas para este caso.
        </p>
      )}

      {/* 1. Misiones Activas y en Proceso (priorizadas al inicio de la lista) */}
      {misionesActivas.map((mision) => renderTarjetaMision(mision))}

      {/* 2. Menú Desplegable Agrupado de Misiones Rechazadas */}
      {misionesRechazadas.length > 0 && (
        <div className={styles.rechazosContainer}>
          <button
            type="button"
            className={styles.rechazosTrigger}
            onClick={() => setRechazosAbiertos(!rechazosAbiertos)}
            aria-expanded={rechazosAbiertos}
            aria-label={`${rechazosAbiertos ? 'Colapsar' : 'Desplegar'} misiones rechazadas (${misionesRechazadas.length})`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color="var(--color-danger, #D32F2F)" aria-hidden="true" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-danger, #D32F2F)' }}>
                Misiones Rechazadas en Terreno ({misionesRechazadas.length})
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #5F676E)' }}>
                {rechazosAbiertos ? 'Ocultar' : 'Ver motivos'}
              </span>
              <ChevronDown
                size={16}
                color="var(--color-danger, #D32F2F)"
                className={rechazosAbiertos ? styles.chevronRotated : ''}
                aria-hidden="true"
              />
            </div>
          </button>

          {rechazosAbiertos && (
            <div className={styles.rechazosBody}>
              {misionesRechazadas.map((mision) => renderTarjetaMision(mision, true))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

