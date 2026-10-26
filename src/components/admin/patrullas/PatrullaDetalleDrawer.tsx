'use client';

import React, { useEffect } from 'react';
import {
  ShieldCheck,
  X,
  MapPin,
  Truck,
  Users,
  Edit,
  Clock,
  Compass,
  Activity,
  ShieldAlert,
  XCircle,
  AlertTriangle,
  UserCheck,
  Shield,
  Trash2,
} from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import type { PatrullaVerificadoraDTO, EstadoPatrullaEnum } from '@/types/patrullas';

export interface PatrullaDetalleDrawerProps {
  patrulla: PatrullaVerificadoraDTO | null;
  onClose: () => void;
  onEditar?: (patrulla: PatrullaVerificadoraDTO) => void;
  puedeEditar?: boolean;
  onDesactivar?: (patrulla: PatrullaVerificadoraDTO) => void;
  puedeDesactivar?: boolean;
}

const CONFIG_ESTADOS: Record<
  EstadoPatrullaEnum,
  {
    etiqueta: string;
    icono: React.ComponentType<{ size?: number }>;
    bg: string;
    color: string;
  }
> = {
  DISPONIBLE: {
    etiqueta: 'Disponible',
    icono: ShieldCheck,
    bg: 'var(--color-success-bg, #E8F5E9)',
    color: 'var(--color-success, #2E7D32)',
  },
  EN_VERIFICACION: {
    etiqueta: 'En Verificación',
    icono: Compass,
    bg: 'var(--color-warning-bg, #FFF3E0)',
    color: 'var(--color-warning, #E65100)',
  },
  EN_PREVENCION: {
    etiqueta: 'En Prevención',
    icono: ShieldAlert,
    bg: 'var(--color-info-bg, #E0F2F1)',
    color: 'var(--color-primary-teal, #1B6F7D)',
  },
  EN_RECUPERACION: {
    etiqueta: 'En Recuperación',
    icono: Activity,
    bg: 'var(--color-info-bg, #E0F2F1)',
    color: 'var(--color-primary-teal, #1B6F7D)',
  },
  EN_MISION: {
    etiqueta: 'En Misión',
    icono: Clock,
    bg: 'var(--color-warning-bg, #FFF3E0)',
    color: 'var(--color-warning, #E65100)',
  },
  NO_DISPONIBLE: {
    etiqueta: 'No Disponible',
    icono: XCircle,
    bg: 'var(--color-danger-bg, #FFEBEE)',
    color: 'var(--color-danger, #D32F2F)',
  },
};

export const PatrullaDetalleDrawer: React.FC<PatrullaDetalleDrawerProps> = ({
  patrulla,
  onClose,
  onEditar,
  puedeEditar = true,
  onDesactivar,
  puedeDesactivar = false,
}) => {
  useEffect(() => {
    if (!patrulla) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [patrulla, onClose]);

  if (!patrulla) return null;

  const configEstado = CONFIG_ESTADOS[patrulla.estado] || CONFIG_ESTADOS.NO_DISPONIBLE;
  const IconoEstado = configEstado.icono;
  const estaBloqueada = patrulla.estado === 'EN_VERIFICACION' || Boolean(patrulla.misionActiva);
  const misionActiva = patrulla.misionActiva;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(20, 80, 90, 0.45)',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="patrulla-drawer-title"
      data-testid="patrulla-detalle-drawer"
    >
      <aside
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08))',
          overflow: 'hidden',
        }}
      >
        {/* Cabecera del Drawer */}
        <header
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--color-primary-teal, #1B6F7D)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={22} color="var(--color-accent-mint, #4FAE9B)" aria-hidden="true" />
            <div>
              <Heading as="h3" variant="h3" color="white" noMargin id="patrulla-drawer-title">
                {patrulla.nombre}
              </Heading>
              {patrulla.codigo && (
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                  Código: {patrulla.codigo}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ficha de patrulla"
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </header>

        {/* Cuerpo del Drawer */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            backgroundColor: 'var(--color-bg-light, #ECEFF3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Banner de Estado Operativo */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '12px 16px',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-charcoal, #3B3F45)' }}>
              Estado Operativo Actual:
            </span>
            <span
              style={{
                backgroundColor: configEstado.bg,
                color: configEstado.color,
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              data-testid="drawer-estado-badge"
            >
              <IconoEstado size={14} />
              {configEstado.etiqueta}
            </span>
          </div>

          {/* Bloque de Misión Activa (si aplica) */}
          {misionActiva && (
            <div
              style={{
                backgroundColor: 'var(--color-warning-bg, #FFF3E0)',
                borderLeft: '4px solid var(--color-warning, #E65100)',
                padding: '12px 16px',
                fontSize: '13px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  color: 'var(--color-warning, #E65100)',
                  marginBottom: '4px',
                }}
              >
                <AlertTriangle size={15} />
                <span>Misión Táctica en Curso: {misionActiva.codigo}</span>
              </div>
              <div style={{ fontWeight: 600, color: 'var(--color-charcoal, #3B3F45)' }}>
                {misionActiva.titulo}
              </div>
              {misionActiva.incidenteDireccion && (
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #5F676E)', marginTop: '4px' }}>
                  Lugar: {misionActiva.incidenteDireccion}
                </div>
              )}
            </div>
          )}

          {/* Delegación Base y Vehículo */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '16px',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <MapPin size={18} color="var(--color-primary-teal, #1B6F7D)" style={{ marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted, #5F676E)', fontWeight: 700 }}>
                  Delegación Municipal Base
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-charcoal, #3B3F45)' }}>
                  {patrulla.delegacion?.nombre || 'Sin delegación asignada'}
                  {patrulla.delegacion?.codigo ? ` (${patrulla.delegacion.codigo})` : ''}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', borderTop: '1px solid var(--border-color-neutral, #DFE3E8)', paddingTop: '10px' }}>
              <Truck size={18} color="var(--color-primary-teal, #1B6F7D)" style={{ marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted, #5F676E)', fontWeight: 700 }}>
                  Vehículo Institucional
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-charcoal, #3B3F45)' }}>
                  {patrulla.vehiculo?.nombre || 'Sin vehículo (Despliegue pedestre / a pie)'}
                  {patrulla.vehiculo?.detalles?.patente
                    ? ` — Patente: ${String(patrulla.vehiculo.detalles.patente)}`
                    : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Dotación y Personal */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '16px',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                borderBottom: '1px solid var(--border-color-neutral, #DFE3E8)',
                paddingBottom: '8px',
              }}
            >
              <Users size={18} color="var(--color-primary-teal, #1B6F7D)" />
              <Heading as="h4" variant="h4" color="charcoal" noMargin>
                Dotación Asignada ({patrulla.integrantes?.length || 0})
              </Heading>
            </div>

            {(!patrulla.integrantes || patrulla.integrantes.length === 0) ? (
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted, #5F676E)' }}>
                No se registran funcionarios asignados a esta unidad.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {patrulla.integrantes.map((m) => {
                  const esLider = patrulla.lider?.id === m.usuarioId || patrulla.lider?.id === m.id;
                  return (
                    <div
                      key={m.id}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: esLider
                          ? 'rgba(27, 111, 125, 0.05)'
                          : 'var(--color-bg-light, #ECEFF3)',
                        borderLeft: esLider
                          ? '3px solid var(--color-primary-teal, #1B6F7D)'
                          : '3px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-charcoal, #3B3F45)' }}>
                          {m.nombre} {m.rut ? `(${m.rut})` : ''}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)' }}>
                          {m.cargo || 'Evaluador de Terreno'}
                          {m.telefono ? ` · Tel: ${m.telefono}` : ''}
                        </div>
                      </div>

                      {esLider ? (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--color-primary-teal, #1B6F7D)',
                            backgroundColor: 'rgba(27, 111, 125, 0.1)',
                            padding: '2px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Shield size={11} /> Líder
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'var(--color-charcoal, #3B3F45)',
                            backgroundColor: '#FFFFFF',
                            padding: '2px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <UserCheck size={11} /> Integrante
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Auditoría y Fechas */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              fontSize: '12px',
              color: 'var(--color-text-muted, #5F676E)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {patrulla.creadoEn && (
              <div>
                <strong>Fecha de Creación:</strong>{' '}
                {new Date(patrulla.creadoEn).toLocaleString('es-CL')}
              </div>
            )}
            {patrulla.actualizadoEn && (
              <div data-testid="drawer-actualizado-en">
                <strong>Última Actualización:</strong>{' '}
                {new Date(patrulla.actualizadoEn).toLocaleString('es-CL')}
              </div>
            )}
          </div>
        </div>

        {/* Footer del Drawer con Acciones de Gestión */}
        <footer
          style={{
            padding: '16px 20px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid var(--border-color-neutral, #DFE3E8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cerrar Ficha
          </Button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {puedeEditar && (
              <div
                title={
                  estaBloqueada
                    ? 'No es posible editar la patrulla mientras se encuentre en verificación o en misión activa'
                    : 'Modificar delegación, vehículo o personal asignado'
                }
              >
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={estaBloqueada}
                  onClick={() => onEditar?.(patrulla)}
                  icon={<Edit size={16} />}
                  data-testid="btn-drawer-editar-patrulla"
                  aria-label={
                    estaBloqueada
                      ? 'No es posible editar la patrulla mientras se encuentre en verificación o en misión activa'
                      : 'Editar Patrulla'
                  }
                >
                  Editar Patrulla
                </Button>
              </div>
            )}

            {puedeDesactivar && (
              <div
                title={
                  estaBloqueada
                    ? 'No es posible desactivar la patrulla mientras se encuentre en verificación o en misión activa'
                    : 'Dar de baja lógica la patrulla y liberar recursos asignados'
                }
              >
                <Button
                  type="button"
                  variant="destructive"
                  size="md"
                  disabled={estaBloqueada}
                  onClick={() => onDesactivar?.(patrulla)}
                  icon={<Trash2 size={16} />}
                  data-testid="btn-drawer-desactivar-patrulla"
                  aria-label={
                    estaBloqueada
                      ? 'No es posible desactivar la patrulla mientras se encuentre en verificación o en misión activa'
                      : 'Desactivar Patrulla'
                  }
                >
                  Desactivar Patrulla
                </Button>
              </div>
            )}
          </div>
        </footer>
      </aside>
    </div>
  );
};

export default PatrullaDetalleDrawer;
