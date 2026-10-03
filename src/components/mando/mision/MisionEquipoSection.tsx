'use client';

import React from 'react';
import { Users, Truck, Shield, Box } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import type { CuadrillaMisionDetalle, PatrullaMisionDetalle } from '@/types/misiones';
import styles from '@/styles/mision-detalle.module.css';

interface MisionEquipoSectionProps {
  cuadrilla: CuadrillaMisionDetalle | null;
  patrulla: PatrullaMisionDetalle | null;
}

export const MisionEquipoSection: React.FC<MisionEquipoSectionProps> = ({
  cuadrilla,
  patrulla,
}) => {
  return (
    <div className={styles.seccionBloque}>
      <div className={styles.seccionHeader}>
        <div className={styles.seccionTituloGroup}>
          <Users size={18} color="var(--color-primary-teal, #1B6F7D)" />
          <Heading as="h3" variant="h4" color="teal" noMargin>
            Unidad y Recursos Asignados
          </Heading>
        </div>
      </div>

      <div className={styles.seccionBody}>
        {/* Caso Cuadrilla */}
        {cuadrilla && (
          <div>
            <div className={styles.dataGrid}>
              <div className={styles.dataItem}>
                <span className={styles.dataLabel}>Cuadrilla Operativa</span>
                <span
                  className={styles.dataValue}
                  style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Truck size={15} color="var(--color-primary-teal, #1B6F7D)" />
                  <span>{cuadrilla.nombre}</span>
                </span>
              </div>

              <div className={styles.dataItem}>
                <span className={styles.dataLabel}>Estado Operativo</span>
                <span className={styles.dataValue} style={{ fontWeight: 600 }}>
                  {cuadrilla.estado}
                </span>
              </div>

              <div className={styles.dataItem}>
                <span className={styles.dataLabel}>Delegación</span>
                <span className={styles.dataValue}>
                  {cuadrilla.delegacionNombre || 'Sin delegación'}
                </span>
              </div>

              <div className={styles.dataItem}>
                <span className={styles.dataLabel}>Delegado a Cargo</span>
                <span className={styles.dataValue}>
                  {cuadrilla.delegado ? (
                    <>
                      <strong>{cuadrilla.delegado.nombre}</strong>{' '}
                      <small style={{ color: 'var(--color-text-muted, #5F676E)' }}>
                        ({cuadrilla.delegado.email})
                      </small>
                    </>
                  ) : (
                    'Sin delegado asignado'
                  )}
                </span>
              </div>
            </div>

            {/* Recursos asignados a la cuadrilla */}
            <div style={{ marginTop: 'var(--space-3, 12px)' }}>
              <span className={styles.dataLabel} style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Box size={14} />
                <span>Recursos Materiales y Vehículos ({cuadrilla.recursos?.length || 0}):</span>
              </span>

              {cuadrilla.recursos && cuadrilla.recursos.length > 0 ? (
                <div className={styles.recursosTableContainer}>
                  <table className={styles.recursosTable}>
                    <thead>
                      <tr>
                        <th>Nombre del Recurso</th>
                        <th>Tipo</th>
                        <th style={{ textAlign: 'right' }}>Cantidad Asignada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cuadrilla.recursos.map((rec) => (
                        <tr key={rec.id}>
                          <td style={{ fontWeight: 600 }}>{rec.nombre}</td>
                          <td>{rec.tipo}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>
                            {rec.cantidadAsignada}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-muted, #5F676E)' }}>
                  No se registran recursos materiales o vehículos específicos asignados.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Caso Patrulla */}
        {patrulla && (
          <div className={styles.dataGrid}>
            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Patrulla Verificadora</span>
              <span
                className={styles.dataValue}
                style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Shield size={15} color="var(--color-primary-teal, #1B6F7D)" />
                <span>{patrulla.nombre}</span>
              </span>
            </div>

            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Estado Operativo</span>
              <span className={styles.dataValue} style={{ fontWeight: 600 }}>
                {patrulla.estado}
              </span>
            </div>

            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Delegación</span>
              <span className={styles.dataValue}>
                {patrulla.delegacionNombre || 'Sin delegación'}
              </span>
            </div>

            <div className={styles.dataItem}>
              <span className={styles.dataLabel}>Líder de Patrulla</span>
              <span className={styles.dataValue}>
                {patrulla.lider ? (
                  <>
                    <strong>{patrulla.lider.nombre}</strong>{' '}
                    <small style={{ color: 'var(--color-text-muted, #5F676E)' }}>
                      ({patrulla.lider.email})
                    </small>
                  </>
                ) : (
                  'Sin líder asignado'
                )}
              </span>
            </div>
          </div>
        )}

        {!cuadrilla && !patrulla && (
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted, #5F676E)' }}>
            Esta misión aún no tiene cuadrilla o patrulla asignada formalmente.
          </p>
        )}
      </div>
    </div>
  );
};
