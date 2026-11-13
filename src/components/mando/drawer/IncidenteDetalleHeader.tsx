'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import {
  obtenerVarianteChipEstadoIncidente,
  obtenerVarianteChipPrioridad,
} from '@/lib/utils/chipVariants';
import { X, ShieldCheck, Hash } from 'lucide-react';
import type { IncidenteDetalle } from '@/services/incidentesService';
import { formatearEstado, formatearPrioridad } from '@/lib/utils/estadoUtils';
import styles from '@/styles/mando.module.css';

interface IncidenteDetalleHeaderProps {
  detalle: IncidenteDetalle | null;
  codigoInicial?: string | null;
  incidenteId?: string | null;
  onCerrar: () => void;
  onAsignarPatrulla?: () => void;
  puedeAsignar?: boolean;
}

export const IncidenteDetalleHeader: React.FC<IncidenteDetalleHeaderProps> = ({
  detalle,
  codigoInicial,
  incidenteId,
  onCerrar,
  onAsignarPatrulla,
  puedeAsignar = true,
}) => {
  const identificadorMostrado =
    detalle?.codigo || codigoInicial || (incidenteId ? `ID: ${incidenteId.slice(0, 8)}` : 'Cargando caso...');

  return (
    <div className={styles.drawerHeader} data-testid="incidente-detalle-header">
      <div className={styles.drawerHeaderInfo}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'rgba(255, 255, 255, 0.85)',
              backgroundColor: 'rgba(255, 255, 255, 0.14)',
              padding: '2px 7px',
              borderRadius: 'var(--radius-none, 0px)',
            }}
          >
            <Hash size={12} aria-hidden="true" />
            <span>Incidente</span>
          </span>
          <Heading
            as="h2"
            variant="h3"
            color="white"
            noMargin
            className={styles.drawerCodigo}
            data-testid="incidente-header-codigo"
          >
            {identificadorMostrado}
          </Heading>
        </div>
        {detalle && (
          <div className={styles.drawerBadgesRow}>
            <Chip variant={obtenerVarianteChipEstadoIncidente(detalle.estado)} size="sm">
              Estado: {formatearEstado(detalle.estado)}
            </Chip>
            <Chip variant={obtenerVarianteChipPrioridad(detalle.prioridad)} size="sm">
              Prioridad: {formatearPrioridad(detalle.prioridad)}
            </Chip>
            {detalle.prioridadSugerida && detalle.prioridadSugerida !== detalle.prioridad && (
              <Chip
                variant="warning"
                size="sm"
                title={
                  detalle.justificacionPrioridad
                    ? `Ajustada manualmente en terreno. Justificación: ${detalle.justificacionPrioridad}`
                    : 'Prioridad modificada respecto a la sugerencia automática del sistema'
                }
              >
                Sugerida: {formatearPrioridad(detalle.prioridadSugerida)}
              </Chip>
            )}
            {detalle.requiereAsistenciaSocial && (
              <Chip variant="warning" size="sm">
                FIBE Requerida
              </Chip>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {detalle?.estado === 'REPORTADO' && onAsignarPatrulla && puedeAsignar && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onAsignarPatrulla}
            title="Asignar y despachar patrulla verificadora"
          >
            <ShieldCheck size={14} style={{ marginRight: '5px' }} />
            <span>Asignar Patrulla</span>
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={styles.drawerCloseBtn}
          onClick={onCerrar}
          aria-label="Cerrar panel de detalle"
        >
          <X size={20} />
        </Button>
      </div>
    </div>
  );
};
