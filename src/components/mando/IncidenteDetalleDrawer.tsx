'use client';

import React, { useEffect, useState } from 'react';
import {
  obtenerDetalleIncidente,
  type IncidenteDetalle,
} from '@/lib/api/incidentes';
import styles from '@/styles/mando.module.css';

interface IncidenteDetalleDrawerProps {
  incidenteId: string | null;
  userId: string;
  onCerrar: () => void;
}

export const IncidenteDetalleDrawer: React.FC<IncidenteDetalleDrawerProps> = ({
  incidenteId,
  userId,
  onCerrar,
}) => {
  const [detalle, setDetalle] = useState<IncidenteDetalle | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!incidenteId) {
      setDetalle(null);
      return;
    }

    let isMounted = true;
    setCargando(true);
    setError(null);

    obtenerDetalleIncidente(incidenteId, userId).then((res) => {
      if (!isMounted) return;
      if (res.exito && res.datos) {
        setDetalle(res.datos);
      } else {
        setError(res.mensaje);
      }
      setCargando(false);
    });

    return () => {
      isMounted = false;
    };
  }, [incidenteId, userId]);

  if (!incidenteId) return null;

  return (
    <div className={styles.drawerOverlay} onClick={onCerrar} role="dialog" aria-modal="true">
      <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
        {/* Cabecera del Drawer */}
        <div className={styles.drawerHeader}>
          <div className={styles.drawerHeaderInfo}>
            <h2 className={styles.drawerCodigo}>
              {detalle ? detalle.codigo : 'Cargando caso...'}
            </h2>
            {detalle && (
              <div className={styles.drawerBadgesRow}>
                <span className={styles.badgePrioridad} style={{ backgroundColor: '#14505A' }}>
                  Estado: {detalle.estado}
                </span>
                <span className={styles.badgePrioridad} style={{ backgroundColor: '#2B6CB0' }}>
                  Prioridad: {detalle.prioridad}
                </span>
                {detalle.requiereAsistenciaSocial && (
                  <span className={styles.tagAsistenciaSocial}>
                    FIBE Requerida
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className={styles.drawerCloseBtn}
            onClick={onCerrar}
            aria-label="Cerrar panel de detalle"
          >
            &times;
          </button>
        </div>

        {/* Cuerpo del Drawer */}
        <div className={styles.drawerBody}>
          {cargando && (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B' }}>
              Cargando información detallada del incidente...
            </div>
          )}

          {error && (
            <div style={{ padding: '1rem', backgroundColor: '#FED7D7', color: '#742A2A' }}>
              {error}
            </div>
          )}

          {!cargando && detalle && (
            <>
              {/* Sección 1: Información General */}
              <div className={styles.drawerSection}>
                <h3 className={styles.drawerSectionTitle}>Resumen del Incidente</h3>
                <div className={styles.drawerDataGrid}>
                  <div>
                    <span className={styles.drawerDataLabel}>Tipo de Afectación</span>
                    <span className={styles.drawerDataValue}>{detalle.tipoAfectacion}</span>
                  </div>
                  <div>
                    <span className={styles.drawerDataLabel}>Código de Seguimiento</span>
                    <span className={styles.drawerDataValue}>{detalle.codigoSeguimiento}</span>
                  </div>
                  <div>
                    <span className={styles.drawerDataLabel}>Origen del Reporte</span>
                    <span className={styles.drawerDataValue}>{detalle.fuenteOrigen}</span>
                  </div>
                  <div>
                    <span className={styles.drawerDataLabel}>Fecha de Ingreso</span>
                    <span className={styles.drawerDataValue}>
                      {new Date(detalle.creadoEn).toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <span className={styles.drawerDataLabel}>Descripción del Relato</span>
                  <p className={styles.drawerDataValue} style={{ margin: '0.25rem 0' }}>
                    {detalle.descripcion || 'Sin descripción detallada ingresada.'}
                  </p>
                </div>
              </div>

              {/* Sección 2: Ubicación Geográfica */}
              <div className={styles.drawerSection}>
                <h3 className={styles.drawerSectionTitle}>Ubicación Territorial</h3>
                <div className={styles.drawerDataGrid}>
                  <div>
                    <span className={styles.drawerDataLabel}>Dirección / Referencia</span>
                    <span className={styles.drawerDataValue}>{detalle.direccion}</span>
                  </div>
                  <div>
                    <span className={styles.drawerDataLabel}>Delegación Asignada</span>
                    <span className={styles.drawerDataValue}>
                      {detalle.delegacion?.nombre || 'No asignada'}
                    </span>
                  </div>
                  <div>
                    <span className={styles.drawerDataLabel}>Coordenadas GPS</span>
                    <span className={styles.drawerDataValue}>
                      {detalle.latitud.toFixed(4)}, {detalle.longitud.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sección 3: Informante y Operador */}
              <div className={styles.drawerSection}>
                <h3 className={styles.drawerSectionTitle}>Informante y Operador</h3>
                <div className={styles.drawerDataGrid}>
                  <div>
                    <span className={styles.drawerDataLabel}>Nombre Informante</span>
                    <span className={styles.drawerDataValue}>
                      {detalle.informante?.nombre || 'Anónimo'}
                    </span>
                  </div>
                  <div>
                    <span className={styles.drawerDataLabel}>Teléfono Contacto</span>
                    <span className={styles.drawerDataValue}>
                      {detalle.informante?.telefono || 'No registrado'}
                    </span>
                  </div>
                  <div>
                    <span className={styles.drawerDataLabel}>Registrado Por</span>
                    <span className={styles.drawerDataValue}>
                      {detalle.creadoPor?.nombre || 'Sistema Automatizado'}
                    </span>
                  </div>
                  <div>
                    <span className={styles.drawerDataLabel}>Encargado Asignado</span>
                    <span className={styles.drawerDataValue}>
                      {detalle.encargado?.nombre || 'Sin encargado designado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sección 4: Misiones Operativas */}
              <div className={styles.drawerSection}>
                <h3 className={styles.drawerSectionTitle}>
                  Misiones y Equipos en Terreno ({detalle.misiones.length})
                </h3>
                {detalle.misiones.length === 0 ? (
                  <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>
                    No se han despachado misiones operativas para este caso.
                  </p>
                ) : (
                  detalle.misiones.map((mision) => (
                    <div key={mision.id} className={styles.misionCard}>
                      <div className={styles.misionHeader}>
                        <span>{mision.codigo}: {mision.titulo}</span>
                        <span style={{ color: '#1B6F7D' }}>{mision.estado}</span>
                      </div>
                      <div>
                        <strong>Tipo:</strong> {mision.tipoMision} |{' '}
                        <strong>Prioridad:</strong> {mision.prioridad}
                      </div>
                      {mision.cuadrilla && (
                        <div>
                          <strong>Cuadrilla:</strong> {mision.cuadrilla.nombre} ({mision.cuadrilla.estado})
                        </div>
                      )}
                      {mision.patrulla && (
                        <div>
                          <strong>Patrulla:</strong> {mision.patrulla.nombre} ({mision.patrulla.estado})
                        </div>
                      )}
                      {mision.justificacionRechazo && (
                        <div className={styles.misionRechazo}>
                          <strong>Motivo de Rechazo por la Cuadrilla:</strong>{' '}
                          {mision.justificacionRechazo}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Sección 5: Recursos Asociados */}
              <div className={styles.drawerSection}>
                <h3 className={styles.drawerSectionTitle}>
                  Recursos Logísticos Desplegados ({detalle.recursosAsociados.length})
                </h3>
                {detalle.recursosAsociados.length === 0 ? (
                  <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>
                    No hay vehículos, maquinaria ni insumos asignados a través de cuadrillas.
                  </p>
                ) : (
                  <table className={styles.recursosTable}>
                    <thead>
                      <tr>
                        <th>Recurso</th>
                        <th>Cant.</th>
                        <th>Tipo</th>
                        <th>Cuadrilla</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalle.recursosAsociados.map((rec, i) => (
                        <tr key={`${rec.recursoId}-${i}`}>
                          <td><strong>{rec.nombre}</strong></td>
                          <td>{rec.cantidadAsignadaTotal}</td>
                          <td>{rec.esIndividual ? 'Individual' : 'Granel'}</td>
                          <td>{rec.cuadrillaNombre || 'No especificada'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
