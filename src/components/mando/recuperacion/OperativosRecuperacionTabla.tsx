'use client';

import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { obtenerVarianteChipPrioridad } from '@/lib/utils/chipVariants';
import type {
  OperativoRecuperacionListadoItem,
  OrdenarPorRecuperacion,
  DireccionOrdenRecuperacion,
} from '@/types/recuperacion';
import {
  ETIQUETA_ESTADO_RECUPERACION,
  ETIQUETA_PRIORIDAD_RECUPERACION,
  VARIANTE_ESTADO_RECUPERACION,
  formatearFechaChilena,
} from './recuperacionLabels';
import styles from './OperativosRecuperacion.module.css';

export interface OperativosRecuperacionTablaProps {
  operativos: OperativoRecuperacionListadoItem[];
  selectedId: string | null;
  ordenarPor: OrdenarPorRecuperacion;
  orden: DireccionOrdenRecuperacion;
  onToggleOrden: (campo: OrdenarPorRecuperacion) => void;
  onSelectOperativo: (id: string) => void;
}

export const OperativosRecuperacionTabla: React.FC<OperativosRecuperacionTablaProps> = ({
  operativos,
  selectedId,
  ordenarPor,
  orden,
  onToggleOrden,
  onSelectOperativo,
}) => {
  const renderSortIcon = (campo: OrdenarPorRecuperacion) => {
    if (ordenarPor !== campo) {
      return <ArrowUpDown size={12} aria-hidden="true" />;
    }
    return orden === 'asc' ? (
      <ArrowUp size={12} aria-hidden="true" />
    ) : (
      <ArrowDown size={12} aria-hidden="true" />
    );
  };

  return (
    <div className={styles.tableCard}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>
              <button
                type="button"
                className={styles.sortButton}
                onClick={() => onToggleOrden('codigo')}
              >
                <span>Código</span>
                {renderSortIcon('codigo')}
              </button>
            </th>
            <th className={styles.th}>Título / Sector</th>
            <th className={styles.th}>Delegación</th>
            <th className={styles.th}>Estado</th>
            <th className={styles.th}>Prioridad</th>
            <th className={styles.th}>Insumos Asignados</th>
            <th className={styles.th}>
              <button
                type="button"
                className={styles.sortButton}
                onClick={() => onToggleOrden('creadoEn')}
              >
                <span>Fecha de Registro</span>
                {renderSortIcon('creadoEn')}
              </button>
            </th>
            <th className={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {operativos.map((item) => {
            const resumenTexto =
              item.recursosResumen && item.recursosResumen.length > 0
                ? item.recursosResumen
                    .map((r) => `${r.cantidadAsignada} ${r.nombre}`)
                    .join(', ')
                : null;

            const totalInsumos = item.cantidadInsumosAsignados ?? 0;
            const isSelected = selectedId === item.id;

            const handleRowKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectOperativo(item.id);
              }
            };

            return (
              <tr
                key={item.id}
                tabIndex={0}
                aria-label={`Operativo ${item.codigo}: ${item.nombre}`}
                className={`${styles.row} ${isSelected ? styles.rowSelected : ''}`.trim()}
                onClick={() => onSelectOperativo(item.id)}
                onKeyDown={handleRowKeyDown}
              >
                <td className={styles.td}>
                  <span className={styles.codigoBadge}>{item.codigo}</span>
                </td>
                <td className={styles.td}>
                  <div
                    className={styles.tituloWrapper}
                    title={item.descripcion || item.nombre}
                  >
                    <span className={styles.tituloText}>{item.nombre}</span>
                    <span className={styles.sectorSubtext}>{item.sector}</span>
                  </div>
                </td>
                <td className={styles.td}>
                  {item.delegacion?.nombre || 'Sin delegación'}
                </td>
                <td className={styles.td}>
                  <Chip variant={VARIANTE_ESTADO_RECUPERACION[item.estado] || 'neutral'} size="sm">
                    {ETIQUETA_ESTADO_RECUPERACION[item.estado] || item.estado}
                  </Chip>
                </td>
                <td className={styles.td}>
                  <Chip variant={obtenerVarianteChipPrioridad(item.prioridad)} size="sm">
                    {ETIQUETA_PRIORIDAD_RECUPERACION[item.prioridad] || item.prioridad}
                  </Chip>
                </td>
                <td className={styles.td} title={resumenTexto || undefined}>
                  <div className={styles.insumosCell}>
                    <span className={styles.insumosTotal}>
                      {totalInsumos} {totalInsumos === 1 ? 'unidad' : 'unidades'}
                    </span>
                    {resumenTexto && (
                      <span className={styles.insumosResumen}>{resumenTexto}</span>
                    )}
                  </div>
                </td>
                <td className={styles.td}>{formatearFechaChilena(item.creadoEn)}</td>
                <td
                  className={styles.td}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<Eye size={14} />}
                    onClick={() => onSelectOperativo(item.id)}
                    aria-label={`Ver detalle de ${item.codigo}`}
                  >
                    Detalle
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
