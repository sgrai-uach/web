'use client';

import React from 'react';
import type { EmpleadoUsuario } from '@/types/empleados';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import BadgeEstadoOperativo from './BadgeEstadoOperativo';
import { Trash2, Shield, MapPin, Phone, Mail, Pencil, UserX } from 'lucide-react';

interface EmpleadoTablaProps {
  empleados: EmpleadoUsuario[];
  cargando: boolean;
  paginaActual: number;
  totalPaginas: number;
  totalItems: number;
  limite: number;
  onCambiarPagina: (pagina: number) => void;
  onCambiarLimite: (limite: number) => void;
  usuarioSeleccionadoId?: string;
  onSelectUsuario: (usuario: EmpleadoUsuario) => void;
  onDarDeBaja?: (usuario: EmpleadoUsuario) => void;
  onLimpiarFiltros?: () => void;
}

export default function EmpleadoTabla({
  empleados,
  cargando,
  paginaActual,
  totalPaginas,
  totalItems,
  limite,
  onCambiarPagina,
  onCambiarLimite,
  usuarioSeleccionadoId,
  onSelectUsuario,
  onDarDeBaja,
  onLimpiarFiltros,
}: EmpleadoTablaProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)',
        border: '1px solid var(--border-color-neutral, #DFE3E8)',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.875rem',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--color-primary-teal-dark, #14505A)',
                color: 'var(--color-text-light, #FFFFFF)',
                borderBottom: '2px solid var(--color-primary-teal, #1B6F7D)',
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              <th style={{ padding: '0.75rem 0.875rem', width: '110px' }}>RUT</th>
              <th style={{ padding: '0.75rem 0.875rem' }}>Nombre y apellidos</th>
              <th style={{ padding: '0.75rem 0.875rem' }}>Correo</th>
              <th style={{ padding: '0.75rem 0.875rem', width: '130px' }}>Teléfono</th>
              <th style={{ padding: '0.75rem 0.875rem', width: '170px' }}>Rol / Cargo</th>
              <th style={{ padding: '0.75rem 0.875rem', width: '160px' }}>Delegación</th>
              <th style={{ padding: '0.75rem 0.875rem', width: '150px' }}>Estado Operativo</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', width: '84px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && empleados.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 0 }}>
                  <div
                    data-testid="empleados-skeleton"
                    aria-busy="true"
                    aria-label="Cargando personal municipal"
                    style={{ padding: '1.5rem' }}
                  >
                    {[0, 1, 2, 3].map((fila) => (
                      <div
                        key={fila}
                        style={{
                          height: '2.25rem',
                          marginBottom: '0.5rem',
                          backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                          borderRadius: '2px',
                          opacity: 1 - fila * 0.15,
                        }}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ) : empleados.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 0 }}>
                  <EmptyState
                    icon={<UserX size={28} />}
                    title="No se encontraron funcionarios"
                    description="No hay resultados que coincidan con los filtros aplicados. Adjusta los criterios o limpia los filtros para ver el directorio completo."
                    action={
                      onLimpiarFiltros ? (
                        <button
                          type="button"
                          onClick={onLimpiarFiltros}
                          style={{
                            backgroundColor: 'var(--color-primary-teal, #1B6F7D)',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '0.5rem 0.875rem',
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Limpiar filtros
                        </button>
                      ) : undefined
                    }
                  />
                </td>
              </tr>
            ) : (
              empleados.map((usr) => {
                const estaSeleccionado = usr.usuario_id === usuarioSeleccionadoId;
                return (
                  <tr
                    key={usr.usuario_id}
                    onClick={() => onSelectUsuario(usr)}
                    style={{
                      borderBottom: '1px solid #ECEFF3',
                      backgroundColor: estaSeleccionado
                        ? 'var(--color-bg-light, #ECEFF3)'
                        : 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                      borderLeft: estaSeleccionado
                        ? '4px solid var(--color-primary-teal, #1B6F7D)'
                        : '4px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!estaSeleccionado) {
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = estaSeleccionado
                        ? 'var(--color-bg-light, #ECEFF3)'
                        : 'transparent';
                    }}
                  >
                    {/* RUT */}
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{usr.rut}</td>

                    {/* Nombre y apellidos */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-text-dark, #2B2B2B)' }}>
                        {usr.nombres} {usr.apellidos}
                      </div>
                      {!usr.usuario_activo && (
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--color-danger, #D32F2F)',
                            marginTop: '0.15rem',
                            fontWeight: 700,
                          }}
                        >
                          FUNCIONARIO DADO DE BAJA
                        </div>
                      )}
                    </td>

                    {/* Correo */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: 'var(--color-text-dark, #2B2B2B)',
                          fontSize: '0.8125rem',
                        }}
                      >
                        <Mail size={13} style={{ color: '#64748B', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {usr.email}
                        </span>
                      </div>
                    </td>

                    {/* Teléfono */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {usr.telefono ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            color: '#64748B',
                            fontSize: '0.75rem',
                          }}
                        >
                          <Phone size={12} style={{ flexShrink: 0 }} />
                          <span>{usr.telefono}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>

                    {/* Rol / Cargo */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Shield size={13} style={{ color: 'var(--color-primary-teal, #1B6F7D)' }} />
                        <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                          {usr.rol_nombre || usr.rol_codigo}
                        </span>
                      </div>
                      {usr.cargo && (
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                          {usr.cargo}
                        </div>
                      )}
                    </td>

                    {/* Delegación */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={13} style={{ color: '#E06D53' }} />
                        <span style={{ fontSize: '0.8125rem', color: '#334155' }}>
                          {usr.delegacion_nombre || 'Sin delegación'}
                        </span>
                      </div>
                    </td>

                    {/* Estado Operativo (disponibilidad actual) */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <BadgeEstadoOperativo estado={usr.estado_operativo} />
                    </td>

                    {/* Botones de acción: Editar y Baja lógica */}
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', width: '84px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectUsuario(usr);
                          }}
                          title={`Editar antecedentes de ${usr.nombres} ${usr.apellidos}`}
                          aria-label={`Editar antecedentes de ${usr.nombres} ${usr.apellidos}`}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border-color-neutral, #DFE3E8)',
                            borderRadius: '0px',
                            padding: '0.35rem',
                            color: 'var(--color-primary-teal, #1B6F7D)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-info-bg, #E0F2F1)';
                            e.currentTarget.style.borderColor = 'var(--color-primary-teal, #1B6F7D)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = 'var(--border-color-neutral, #DFE3E8)';
                          }}
                        >
                          <Pencil size={14} />
                        </button>

                        {usr.usuario_activo && onDarDeBaja && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDarDeBaja(usr);
                            }}
                            title={`Dar de baja a ${usr.nombres} ${usr.apellidos}`}
                            aria-label={`Dar de baja a ${usr.nombres} ${usr.apellidos}`}
                            style={{
                              background: 'transparent',
                              border: '1px solid #FECACA',
                              borderRadius: '0px',
                              padding: '0.35rem',
                              color: '#DC2626',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#FEF2F2';
                              e.currentTarget.style.borderColor = '#EF4444';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.borderColor = '#FECACA';
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <Pagination
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          totalItems={totalItems}
          limite={limite}
          onCambiarPagina={onCambiarPagina}
          onCambiarLimite={onCambiarLimite}
          nombreEntidad="personal municipal"
          opcionesLimite={[10, 20, 50]}
        />
      )}
    </div>
  );
}
