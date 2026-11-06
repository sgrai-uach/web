'use client';

import React from 'react';
import {
  HardHat,
  Pencil,
  Eye,
  Users,
  Wrench,
  Clock,
  Trash2,
} from 'lucide-react';
import type { CuadrillaItem, EstadoCuadrilla } from '@/types/cuadrilla';
import Button from '@/components/ui/Button';

interface CuadrillasTablaProps {
  cuadrillas: CuadrillaItem[];
  cargando: boolean;
  onEditarCuadrilla: (cuadrilla: CuadrillaItem) => void;
  onVerDetalle: (cuadrilla: CuadrillaItem) => void;
  onDesactivarCuadrilla?: (cuadrilla: CuadrillaItem) => void;
  puedeEditar?: boolean;
  puedeEliminar?: boolean;
}

/**
 * Renderiza el badge del estado operativo de la cuadrilla según el estándar semántico municipal.
 */
function BadgeEstadoCuadrilla({ estado }: { estado: EstadoCuadrilla }) {
  const est = (estado || '').toUpperCase();
  if (est === 'DISPONIBLE') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          backgroundColor: 'var(--color-success-bg, #E8F5E9)',
          color: 'var(--color-success, #2E7D32)',
          fontSize: '12px',
          fontWeight: 700,
          border: '1px solid #C8E6C9',
          letterSpacing: '0.3px',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-success, #2E7D32)',
          }}
        />
        DISPONIBLE
      </span>
    );
  }

  if (est === 'EN_MISION' || est === 'EN_TRANSITO' || est === 'EN_OPERACION') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          backgroundColor: 'var(--color-warning-bg, #FFF3E0)',
          color: 'var(--color-warning, #E65100)',
          fontSize: '12px',
          fontWeight: 700,
          border: '1px solid #FFE0B2',
          letterSpacing: '0.3px',
        }}
        title="Cuadrilla desplegada en terreno cumpliendo una misión activa"
      >
        <Clock size={12} />
        EN MISIÓN
      </span>
    );
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        backgroundColor: '#F1F3F5',
        color: '#5F676E',
        fontSize: '12px',
        fontWeight: 700,
        border: '1px solid #DFE3E8',
        letterSpacing: '0.3px',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '9999px',
          backgroundColor: '#5F676E',
        }}
      />
      NO DISPONIBLE
    </span>
  );
}

export default function CuadrillasTabla({
  cuadrillas,
  cargando,
  onEditarCuadrilla,
  onVerDetalle,
  onDesactivarCuadrilla,
  puedeEditar = true,
  puedeEliminar = true,
}: CuadrillasTablaProps) {
  if (cargando) {
    return (
      <div
        style={{
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--border-color-neutral)',
          padding: '48px',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: '14px',
        }}
      >
        <HardHat size={36} style={{ color: 'var(--color-primary-teal)', marginBottom: '12px', animation: 'spin 2s linear infinite' }} />
        <p style={{ margin: 0 }}>Cargando cuadrillas operativas...</p>
      </div>
    );
  }

  if (!cuadrillas || cuadrillas.length === 0) {
    return (
      <div
        style={{
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--border-color-neutral)',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <HardHat size={40} style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }} />
        <p style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 600, color: 'var(--color-charcoal)' }}>
          No se encontraron cuadrillas operativas
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>
          No hay registros coincidentes con los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--color-white)',
        border: '1px solid var(--border-color-neutral)',
        overflowX: 'auto',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '13px',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--color-primary-teal-dark, #14505A)',
              color: 'var(--color-white)',
              borderBottom: '2px solid var(--color-primary-teal, #1B6F7D)',
            }}
          >
            <th style={{ padding: '12px 16px', fontWeight: 700, width: '25%' }}>
              Cuadrilla Operativa
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 700, width: '15%' }}>
              Delegación Base
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 700, width: '20%' }}>
              Delegado Responsable
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 700, width: '15%' }}>
              Dotación
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 700, width: '12%' }}>
              Estado
            </th>
            <th style={{ padding: '12px 16px', fontWeight: 700, width: '13%', textAlign: 'right' }}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {cuadrillas.map((cuadrilla) => {
            const estadoNorm = (cuadrilla.estado || '').toUpperCase();
            const bloqueadaPorMision =
              estadoNorm === 'EN_MISION' || estadoNorm === 'EN_TRANSITO' || estadoNorm === 'EN_OPERACION';
            const estaInactiva = cuadrilla.activo === false || estadoNorm === 'NO_DISPONIBLE';
            const cantTrabajadores = cuadrilla.trabajadores?.length ?? cuadrilla.totalTrabajadores ?? 0;
            const cantRecursos = cuadrilla.recursos?.length ?? cuadrilla.totalRecursos ?? 0;

            return (
              <tr
                key={cuadrilla.id}
                style={{
                  borderBottom: '1px solid var(--border-color-neutral)',
                  backgroundColor: 'var(--color-white)',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {/* Nombre de la Cuadrilla */}
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-primary-teal)',
                        flexShrink: 0,
                      }}
                    >
                      <HardHat size={18} />
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary-teal-dark)', display: 'block' }}>
                        {cuadrilla.nombre}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        ID: {cuadrilla.id.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                </td>

                {/* Delegación Base */}
                <td style={{ padding: '14px 16px', color: 'var(--color-charcoal)' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      backgroundColor: 'var(--color-bg-light)',
                      border: '1px solid #DFE3E8',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {cuadrilla.delegacion.nombre}
                  </span>
                </td>

                {/* Delegado Responsable */}
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>
                      {cuadrilla.delegado?.nombre || 'Sin delegado asignado'}
                    </span>
                    {cuadrilla.delegado?.rut && (
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        RUT: {cuadrilla.delegado.rut}
                      </span>
                    )}
                  </div>
                </td>

                {/* Dotación Operativa */}
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: 'var(--color-charcoal)',
                      }}
                    >
                      <Users size={14} style={{ color: 'var(--color-primary-teal)' }} />
                      <strong>{cantTrabajadores}</strong> {cantTrabajadores === 1 ? 'operario' : 'operarios'}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      <Wrench size={13} />
                      <strong>{cantRecursos}</strong> {cantRecursos === 1 ? 'recurso' : 'recursos'}
                    </span>
                  </div>
                </td>

                {/* Estado */}
                <td style={{ padding: '14px 16px' }}>
                  <BadgeEstadoCuadrilla estado={cuadrilla.estado} />
                </td>

                {/* Acciones */}
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onVerDetalle(cuadrilla)}
                      title="Ver dotación completa de la cuadrilla"
                      aria-label={`Ver detalle de cuadrilla ${cuadrilla.nombre}`}
                      icon={<Eye size={14} />}
                    >
                      Detalle
                    </Button>

                    {puedeEditar && !estaInactiva && (
                      <div
                        style={{ display: 'inline-block' }}
                        title={
                          bloqueadaPorMision
                            ? 'No se puede editar una cuadrilla que se encuentra actualmente en misión activa en terreno'
                            : 'Modificar datos, delegado y dotación de la cuadrilla'
                        }
                      >
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={bloqueadaPorMision}
                          onClick={() => onEditarCuadrilla(cuadrilla)}
                          aria-label={`Editar cuadrilla ${cuadrilla.nombre}`}
                          icon={<Pencil size={14} />}
                          style={{
                            opacity: bloqueadaPorMision ? 0.6 : 1,
                            cursor: bloqueadaPorMision ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Editar
                        </Button>
                      </div>
                    )}

                    {puedeEliminar && !estaInactiva && onDesactivarCuadrilla && (
                      <div
                        style={{ display: 'inline-block' }}
                        title={
                          bloqueadaPorMision
                            ? 'No se puede desactivar una cuadrilla que se encuentra actualmente en misión activa en terreno'
                            : 'Desactivar y retirar de servicio operativo la cuadrilla'
                        }
                      >
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={bloqueadaPorMision}
                          onClick={() => onDesactivarCuadrilla(cuadrilla)}
                          aria-label={`Desactivar cuadrilla ${cuadrilla.nombre}`}
                          icon={<Trash2 size={14} />}
                          style={{
                            opacity: bloqueadaPorMision ? 0.6 : 1,
                            cursor: bloqueadaPorMision ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Desactivar
                        </Button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
