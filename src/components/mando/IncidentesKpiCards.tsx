'use client';

import React from 'react';
import {
  AlertCircle,
  Clock,
  Activity,
  XCircle,
  CheckCircle2,
  Calendar,
  RotateCw,
  MapPin,
  Radio,
} from 'lucide-react';
import type { IncidentesKpisData, DelegacionOpcion } from '@/types/incidentesKpis';
import type { EstadoIncidente } from '@/services/incidentesService';
import Button from '@/components/ui/Button';
import styles from '@/styles/mando.module.css';

interface IncidentesKpiCardsProps {
  kpis: IncidentesKpisData | null;
  cargando: boolean;
  delegacionId: string;
  onDelegacionChange: (delegacionId: string) => void;
  delegaciones: DelegacionOpcion[];
  onRefrescar: () => void;
  estadoSeleccionado: EstadoIncidente | null;
  onSelectEstado: (estado: EstadoIncidente) => void;
  conectado: boolean;
}

interface TarjetaConfig {
  estado: EstadoIncidente;
  campoContador: keyof NonNullable<IncidentesKpisData>['contadores'];
  titulo: string;
  descripcion: string;
  icon: React.ComponentType<{ size?: number; className?: string; color?: string }>;
  cardClass: string;
  colorHex: string;
}

const TARJETAS_CONFIG: TarjetaConfig[] = [
  {
    estado: 'REPORTADO',
    campoContador: 'reportado',
    titulo: 'Reportados',
    descripcion: 'Avisos reportados para verificación',
    icon: AlertCircle,
    cardClass: styles.kpiCardReportado,
    colorHex: 'var(--color-danger, #D32F2F)',
  },
  {
    estado: 'VERIFICANDO',
    campoContador: 'verificando',
    titulo: 'En Verificación',
    descripcion: 'Patrullas evaluando en terreno',
    icon: Clock,
    cardClass: styles.kpiCardVerificando,
    colorHex: 'var(--color-warning, #E65100)',
  },
  {
    estado: 'EN_ATENCION',
    campoContador: 'enAtencion',
    titulo: 'En Atención',
    descripcion: 'Cuadrillas activas en mitigación',
    icon: Activity,
    cardClass: styles.kpiCardEnAtencion,
    colorHex: '#D97706',
  },
  {
    estado: 'NO_ABORDABLE',
    campoContador: 'noAbordables',
    titulo: 'No Abordables',
    descripcion: 'Descartados o fuera de competencia',
    icon: XCircle,
    cardClass: styles.kpiCardNoAbordable,
    colorHex: 'var(--color-charcoal, #3B3F45)',
  },
  {
    estado: 'RESUELTO',
    campoContador: 'resueltos',
    titulo: 'Resueltos',
    descripcion: 'Incidentes finalizados hoy',
    icon: CheckCircle2,
    cardClass: styles.kpiCardResuelto,
    colorHex: 'var(--color-success, #2E7D32)',
  },
];

function formatearFechaChile(fechaStr?: string): string {
  if (!fechaStr) return 'Hoy';
  try {
    const [year, month, day] = fechaStr.split('-').map(Number);
    if (!year || !month || !day) return fechaStr;
    const fecha = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(fecha);
  } catch {
    return fechaStr;
  }
}

export const IncidentesKpiCards: React.FC<IncidentesKpiCardsProps> = ({
  kpis,
  cargando,
  delegacionId,
  onDelegacionChange,
  delegaciones,
  onRefrescar,
  estadoSeleccionado,
  onSelectEstado,
  conectado,
}) => {
  const contadores = kpis?.contadores || {
    reportado: 0,
    verificando: 0,
    enAtencion: 0,
    noAbordables: 0,
    resueltos: 0,
  };

  const fechaFormateada = formatearFechaChile(kpis?.fecha);
  const total = kpis?.total ?? Object.values(contadores).reduce((a, b) => a + b, 0);

  return (
    <section className={styles.kpiSection} aria-label="Panorama del día y KPIs de incidentes">
      <div className={styles.kpiHeaderBar}>
        <div className={styles.kpiTitleGroup}>
          <div className={styles.kpiTitleRow}>
            <h2 className={styles.kpiTitle}>
              <Calendar size={18} color="var(--color-primary-teal, #1B6F7D)" />
              Panorama del Día — Vista Rápida de Incidentes
            </h2>
            <span className={styles.counterBadge} title="Total de incidentes registrados en la jornada">
              {total} {total === 1 ? 'caso total' : 'casos totales'}
            </span>
          </div>
          <p className={styles.kpiSubtitle}>
            Jornada de {fechaFormateada} (Zona Horaria: {kpis?.zonaHoraria || 'America/Santiago'}).
            Haz clic en una categoría para enfocar el tablero.
          </p>
        </div>

        <div className={styles.kpiControlsGroup}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={15} color="var(--color-primary-teal, #1B6F7D)" />
            <select
              id="kpis-selector-delegacion"
              aria-label="Filtrar KPIs por delegación territorial"
              value={delegacionId}
              onChange={(e) => onDelegacionChange(e.target.value)}
              className={styles.delegacionSelect}
            >
              <option value="">Toda la Comuna (Valdivia)</option>
              {delegaciones.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </div>

          <div
            className={styles.kpiLiveBadge}
            title={
              conectado
                ? 'Conectado a sala:encargados — Reactividad en tiempo real activa'
                : 'Reconectando con el servidor en tiempo real...'
            }
          >
            <Radio
              size={14}
              color={conectado ? 'var(--color-accent-mint, #4FAE9B)' : 'var(--color-warning, #E65100)'}
            />
            <span>{conectado ? 'En Vivo' : 'Desconectado'}</span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefrescar}
            disabled={cargando}
            aria-label="Actualizar contadores de incidentes"
            title="Actualizar datos"
          >
            <RotateCw size={13} className={cargando ? styles.spinner : undefined} />
            <span>{cargando ? 'Actualizando...' : 'Actualizar'}</span>
          </Button>
        </div>
      </div>

      <div className={styles.kpiGrid} role="region" aria-label="Tarjetas de estados de incidentes">
        {TARJETAS_CONFIG.map((tarjeta) => {
          const IconComponent = tarjeta.icon;
          const cantidad = contadores[tarjeta.campoContador] ?? 0;
          const estaActiva = estadoSeleccionado === tarjeta.estado;

          return (
            <button
              key={tarjeta.estado}
              type="button"
              className={`${styles.kpiCard} ${tarjeta.cardClass} ${
                estaActiva ? styles.kpiCardActive : ''
              }`}
              onClick={() => onSelectEstado(tarjeta.estado)}
              aria-pressed={estaActiva}
              aria-label={`Filtrar por ${tarjeta.titulo}: ${cantidad} incidentes. ${tarjeta.descripcion}`}
            >
              <div className={styles.kpiCardTop}>
                <span className={styles.kpiCardLabel}>
                  <IconComponent size={16} color={tarjeta.colorHex} />
                  {tarjeta.titulo}
                </span>
                {estaActiva && <span className={styles.kpiActiveTag}>Enfocado</span>}
              </div>

              <div className={styles.kpiCardCount}>{cantidad}</div>

              <div className={styles.kpiCardFooter}>
                <span>{tarjeta.descripcion}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
