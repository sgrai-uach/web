'use client';

import React from 'react';
import type {
  AsistenteSocialItem,
  EstadoOperativoPersonal,
  MetaAsistentesSociales,
} from '@/types/asistenteSocialPersonal';
import Pagination from '@/components/common/Pagination';
import { MapPin, Phone, User } from 'lucide-react';
import AsistentesSocialesSkeleton from './AsistentesSocialesSkeleton';
import styles from './AsistentesSocialesTabla.module.css';

interface AsistentesSocialesTablaProps {
  asistentes: AsistenteSocialItem[];
  meta: MetaAsistentesSociales;
  onCambiarPagina: (nuevaPagina: number) => void;
  onCambiarLimite?: (nuevoLimite: number) => void;
  cargando?: boolean;
}

function getEstadoConfig(estado: EstadoOperativoPersonal) {
  switch (estado) {
    case 'disponible':
      return {
        clase: styles.badge_disponible,
        etiqueta: 'Disponible',
      };
    case 'en_mision':
      return {
        clase: styles.badge_en_mision,
        etiqueta: 'En Misión',
      };
    case 'descanso':
      return {
        clase: styles.badge_descanso,
        etiqueta: 'Descanso',
      };
    case 'licencia':
      return {
        clase: styles.badge_licencia,
        etiqueta: 'Licencia Médica',
      };
    case 'inactivo':
    default:
      return {
        clase: styles.badge_inactivo,
        etiqueta: 'Inactivo',
      };
  }
}

export default function AsistentesSocialesTabla({
  asistentes,
  meta,
  onCambiarPagina,
  onCambiarLimite,
  cargando = false,
}: AsistentesSocialesTablaProps) {
  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Nombre y Apellidos</th>
              <th className={styles.th}>Delegación Municipal</th>
              <th className={styles.th}>Teléfono Institucional</th>
              <th className={styles.th}>Estado Operativo</th>
              <th className={styles.thCenter}>Casos FIBE Asignados</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <AsistentesSocialesSkeleton filas={5} />
            ) : (
              asistentes.map((asistente) => {
                const configEstado = getEstadoConfig(asistente.estadoOperativo);

                return (
                  <tr key={asistente.usuarioId} className={styles.tr}>
                    {/* Nombre y Apellidos */}
                    <td className={styles.td}>
                      <div className={styles.personalInfo}>
                        <div className={styles.personalIcon} aria-hidden="true">
                          <User size={18} />
                        </div>
                        <div className={styles.personalDetails}>
                          <span className={styles.personalNombre}>
                            {asistente.nombreCompleto}
                          </span>
                          <div className={styles.personalMeta}>
                            <span>RUT: {asistente.rut}</span>
                            <span>•</span>
                            <span>{asistente.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Delegación Municipal */}
                    <td className={styles.td}>
                      <div className={styles.delegacionCell}>
                        <MapPin size={15} style={{ color: 'var(--color-primary-teal, #1B6F7D)', flexShrink: 0 }} />
                        <span>{asistente.delegacionNombre || 'Sin delegación asignada'}</span>
                      </div>
                    </td>

                    {/* Teléfono Institucional */}
                    <td className={styles.td}>
                      {asistente.telefono ? (
                        <a
                          href={`tel:${asistente.telefono}`}
                          className={styles.telefonoLink}
                          title={`Llamar a ${asistente.nombreCompleto}`}
                        >
                          <Phone size={14} style={{ flexShrink: 0 }} />
                          <span>{asistente.telefono}</span>
                        </a>
                      ) : (
                        <span className={styles.telefonoVacio}>No registrado</span>
                      )}
                    </td>

                    {/* Estado Operativo (Badge institucional) */}
                    <td className={styles.td}>
                      <span className={`${styles.badgeEstado} ${configEstado.clase}`}>
                        <span className={styles.dot} aria-hidden="true" />
                        {configEstado.etiqueta}
                      </span>
                    </td>

                    {/* Casos FIBE Asignados */}
                    <td className={styles.tdCenter}>
                      {asistente.casosFibeAsignados > 0 ? (
                        <span
                          className={styles.badgeCasosActivos}
                          title={`${asistente.casosFibeAsignados} ${asistente.casosFibeAsignados === 1 ? 'caso FIBE activo' : 'casos FIBE activos'}`}
                        >
                          {asistente.casosFibeAsignados}
                        </span>
                      ) : (
                        <span className={styles.badgeCasosCero} title="Sin casos asignados">
                          0
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {!cargando && meta.totalPaginas > 1 && (
        <Pagination
          paginaActual={meta.pagina}
          totalPaginas={meta.totalPaginas}
          onCambiarPagina={onCambiarPagina}
          totalItems={meta.total}
          limite={meta.limite}
          onCambiarLimite={onCambiarLimite || (() => {})}
          nombreEntidad="asistentes sociales"
        />
      )}
    </div>
  );
}
