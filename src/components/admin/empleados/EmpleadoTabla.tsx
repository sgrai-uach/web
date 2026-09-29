'use client';

import React from 'react';
import type { EmpleadoUsuario } from '@/types/empleados';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/Button';
import { Edit2, Trash2, CheckCircle2, XCircle, Shield, MapPin, Phone, Mail } from 'lucide-react';

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
              <th style={{ padding: '0.875rem 1rem', width: '220px' }}>Funcionario</th>
              <th style={{ padding: '0.875rem 1rem', width: '220px' }}>Contacto</th>
              <th style={{ padding: '0.875rem 1rem', width: '170px' }}>Rol Institucional</th>
              <th style={{ padding: '0.875rem 1rem', width: '170px' }}>Delegación</th>
              <th style={{ padding: '0.875rem 1rem', width: '120px' }}>Estado</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'right', width: '150px' }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {cargando && empleados.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748B' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <span style={{ color: 'var(--color-primary-teal, #1B6F7D)' }}>Cargando personal municipal...</span>
                  </div>
                </td>
              </tr>
            ) : empleados.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748B' }}>
                  No se encontraron funcionarios coincidentes con los filtros aplicados.
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
                    {/* Funcionario */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-text-dark, #2B2B2B)' }}>
                        {usr.nombres} {usr.apellidos}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                        RUT: <strong>{usr.rut}</strong>
                      </div>
                    </td>

                    {/* Contacto */}
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
                      {usr.telefono && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            color: '#64748B',
                            fontSize: '0.75rem',
                            marginTop: '0.2rem',
                          }}
                        >
                          <Phone size={12} style={{ flexShrink: 0 }} />
                          <span>{usr.telefono}</span>
                        </div>
                      )}
                    </td>

                    {/* Rol */}
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

                    {/* Estado */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {usr.usuario_activo ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            backgroundColor: 'var(--color-success-bg, #E8F5E9)',
                            color: 'var(--color-success, #2E7D32)',
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          <CheckCircle2 size={12} />
                          <span>Activo</span>
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
                            color: 'var(--color-danger, #D32F2F)',
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          <XCircle size={12} />
                          <span>Inactivo</span>
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '0.4rem',
                        }}
                      >
                        <Button
                          type="button"
                          variant={estaSeleccionado ? 'primary' : 'outline'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectUsuario(usr);
                          }}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                          title="Modificar datos del funcionario"
                        >
                          <Edit2 size={13} />
                          <span>{estaSeleccionado ? 'Editando' : 'Editar'}</span>
                        </Button>

                        {usr.usuario_activo && onDarDeBaja && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDarDeBaja(usr);
                            }}
                            title={`Dar de baja a ${usr.nombres} ${usr.apellidos}`}
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '0.25rem 0.5rem',
                              backgroundColor: 'transparent',
                              color: '#991B1B',
                              border: '1px solid #FECACA',
                              borderRadius: 0,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#FEF2F2';
                              e.currentTarget.style.color = '#B91C1C';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#991B1B';
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Baja</span>
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

      <Pagination
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalItems={totalItems}
        limite={limite}
        onCambiarPagina={onCambiarPagina}
        onCambiarLimite={onCambiarLimite}
        nombreEntidad="empleados"
        opcionesLimite={[5, 10, 20, 50]}
      />
    </div>
  );
}
