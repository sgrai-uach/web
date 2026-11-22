'use client';

import React from 'react';
import {
  History,
  Calendar,
  Clock,
  MapPinCheck,
  MapPin,
  UserCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import {
  formatearFechaHoraChile,
  obtenerConfigHito,
} from '@/lib/utils/misionHitos';
import type { MisionBitacoraHito } from '@/types/misiones';
import {
  esHitoTipologiaSinCambios,
  formatearHitoBitacora,
  limpiarDescripcionBitacora,
} from '@/lib/utils/estadoUtils';
import styles from '@/styles/mision-detalle.module.css';

interface MisionBitacoraSectionProps {
  bitacora: MisionBitacoraHito[];
  delegadoNombreFallback?: string | null;
  onUbicarEnMapa?: (latitud: number, longitud: number, etiqueta?: string) => void;
}

export const MisionBitacoraSection: React.FC<MisionBitacoraSectionProps> = ({
  bitacora,
  delegadoNombreFallback,
  onUbicarEnMapa,
}) => {
  return (
    <div className={styles.seccionBloque}>
      <div className={styles.seccionHeader}>
        <div className={styles.seccionTituloGroup}>
          <History size={18} color="var(--color-primary-teal, #1B6F7D)" />
          <Heading as="h3" variant="h4" color="teal" noMargin>
            Bitácora Cronológica de Operaciones ({bitacora.length})
          </Heading>
        </div>
      </div>

      <div className={styles.seccionBody}>
        {bitacora.length === 0 ? (
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted, #5F676E)' }}>
            No se registran eventos en la bitácora de la misión aún.
          </p>
        ) : (
          <div className={styles.timelineList}>
            {bitacora.map((hito, index) => {
              const sinCambiosTipologia = esHitoTipologiaSinCambios(hito);
              const claveHito = (hito.codigoHito || hito.hito || '').trim();
              const config = obtenerConfigHito(claveHito);
              const tieneEtiquetaPersonalizada =
                Boolean(config.etiqueta) &&
                config.codigo !== 'EVENTO' &&
                config.etiqueta !== claveHito;
              const tituloHito = sinCambiosTipologia
                ? 'Tipología constatada en terreno (sin cambios)'
                : tieneEtiquetaPersonalizada
                  ? config.etiqueta
                  : formatearHitoBitacora(hito.hito);
              const { fecha, hora } = hito.timestamp
                ? formatearFechaHoraChile(hito.timestamp)
                : { fecha: hito.fecha, hora: hito.hora };
              const fechaVisible = hito.timestamp && fecha !== hito.timestamp ? fecha : hito.fecha;
              const horaVisible = hito.timestamp && hora ? hora : hito.hora;

              const descripcionLimpia = limpiarDescripcionBitacora(hito.descripcion || '');
              const descripcionFinal = sinCambiosTipologia
                ? descripcionLimpia.replace(
                    /^Tipolog[íi]a reclasificada en terreno a:/i,
                    'Tipología confirmada en terreno sin modificaciones:'
                  )
                : descripcionLimpia;

              const tieneCoordenadas =
                typeof hito.latitud === 'number' &&
                typeof hito.longitud === 'number' &&
                Number.isFinite(hito.latitud) &&
                Number.isFinite(hito.longitud);

              const responsable =
                hito.registradoPorNombre ||
                (config.esLlegadaTerreno || config.esAceptacion ? delegadoNombreFallback : null);

              return (
                <div
                  key={`${hito.id || hito.timestamp}-${index}`}
                  className={`${styles.timelineItem} ${
                    config.esLlegadaTerreno ? styles.timelineItemLlegada : ''
                  }`}
                >
                  {config.esLlegadaTerreno ? (
                    <div className={styles.timelineDotIcon} aria-hidden="true">
                      <MapPinCheck size={12} />
                    </div>
                  ) : config.esAceptacion ? (
                    <div className={styles.timelineDotIcon} aria-hidden="true">
                      <CheckCircle2 size={12} />
                    </div>
                  ) : config.esRechazo ? (
                    <div
                      className={`${styles.timelineDotIcon} ${styles.timelineDotRechazo}`}
                      aria-hidden="true"
                    >
                      <AlertTriangle size={12} />
                    </div>
                  ) : config.esReporteTerreno ? (
                    <div className={styles.timelineDotIcon} aria-hidden="true">
                      <FileCheck size={12} />
                    </div>
                  ) : (
                    <div className={styles.timelineDot} />
                  )}

                  <div className={styles.timelineHeader}>
                    <span className={styles.timelineHito}>{tituloHito}</span>
                    <span className={styles.timelineDate}>
                      <Calendar size={12} aria-hidden="true" />
                      <span>{fechaVisible}</span>
                      <Clock size={12} style={{ marginLeft: '4px' }} aria-hidden="true" />
                      <span>{horaVisible}</span>
                    </span>
                  </div>

                  {descripcionFinal && (
                    <p className={styles.timelineDesc}>{descripcionFinal}</p>
                  )}

                  {(responsable || tieneCoordenadas) && (
                    <div className={styles.timelineMetaRow}>
                      {responsable && (
                        <span className={styles.timelineMetaItem}>
                          <UserCheck size={13} aria-hidden="true" />
                          <span>Reportado por: {responsable}</span>
                        </span>
                      )}

                      {tieneCoordenadas && (
                        <span className={styles.timelineMetaItem}>
                          <MapPin size={13} aria-hidden="true" />
                          <span className={styles.timelineCoords}>
                            {hito.latitud!.toFixed(5)}, {hito.longitud!.toFixed(5)}
                          </span>
                          {onUbicarEnMapa && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                onUbicarEnMapa(
                                  hito.latitud!,
                                  hito.longitud!,
                                  tituloHito
                                )
                              }
                            >
                              Ubicar en mapa
                            </Button>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
