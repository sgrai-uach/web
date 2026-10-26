'use client';

import React, { useEffect } from 'react';
import {
  X,
  HardHat,
  Users,
  Wrench,
  Pencil,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import type { CuadrillaItem } from '@/types/cuadrilla';
import Button from '@/components/ui/Button';

interface CuadrillaDetalleDrawerProps {
  cuadrilla: CuadrillaItem | null;
  isOpen: boolean;
  onCerrar: () => void;
  onEditar?: (cuadrilla: CuadrillaItem) => void;
  onDesactivar?: (cuadrilla: CuadrillaItem) => void;
  puedeEditar?: boolean;
  puedeEliminar?: boolean;
}

export default function CuadrillaDetalleDrawer({
  cuadrilla,
  isOpen,
  onCerrar,
  onEditar,
  onDesactivar,
  puedeEditar = true,
  puedeEliminar = true,
}: CuadrillaDetalleDrawerProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onCerrar();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCerrar]);

  if (!isOpen || !cuadrilla) return null;

  const estadoNorm = (cuadrilla.estado || '').toUpperCase();
  const estaInactiva = cuadrilla.activo === false || estadoNorm === 'NO_DISPONIBLE';
  const bloqueadaPorMision =
    estadoNorm === 'EN_MISION' || estadoNorm === 'EN_TRANSITO' || estadoNorm === 'EN_OPERACION';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-drawer, 1000)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Backdrop oscuro */}
      <div
        onClick={onCerrar}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Panel lateral deslizante */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '560px',
          height: '100%',
          backgroundColor: 'var(--color-white)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1001,
          overflowY: 'auto',
        }}
      >
        {/* Cabecera del Drawer */}
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: 'var(--color-primary-teal-dark, #14505A)',
            color: 'var(--color-white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid var(--color-accent-mint, #4FAE9B)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <HardHat size={24} style={{ color: 'var(--color-accent-mint)' }} />
            <div>
              <span
                id="drawer-title"
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  display: 'block',
                  color: 'var(--color-white)',
                }}
              >
                {cuadrilla.nombre}
              </span>
              <span style={{ fontSize: '12px', color: '#CCD2D9' }}>
                Delegación {cuadrilla.delegacion.nombre}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar panel de detalle"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-white)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Drawer */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
          {/* Advertencia si está en misión */}
          {bloqueadaPorMision && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 16px',
                backgroundColor: 'var(--color-warning-bg, #FFF3E0)',
                border: '1px solid #FFE0B2',
                color: 'var(--color-warning, #E65100)',
                fontSize: '13px',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <strong>Cuadrilla Desplegada en Terreno:</strong> Esta unidad se encuentra actualmente en misión activa. Su dotación y datos están protegidos contra modificaciones operativas.
              </div>
            </div>
          )}

          {/* Tarjeta de Delegado Responsable */}
          <div
            style={{
              border: '1px solid var(--border-color-neutral)',
              padding: '16px',
              backgroundColor: 'var(--color-bg-light)',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-primary-teal)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Delegado Responsable en Terreno
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  backgroundColor: 'var(--color-primary-teal)',
                  color: 'var(--color-white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                {cuadrilla.delegado?.nombre ? cuadrilla.delegado.nombre.charAt(0) : 'D'}
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-dark)', display: 'block' }}>
                  {cuadrilla.delegado?.nombre || 'Sin delegado asignado'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block' }}>
                  {cuadrilla.delegado?.email} {cuadrilla.delegado?.rut && `• RUT: ${cuadrilla.delegado.rut}`}
                </span>
              </div>
            </div>
          </div>

          {/* Sección Trabajadores Operativos */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
                borderBottom: '1px solid var(--border-color-neutral)',
                paddingBottom: '6px',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--color-primary-teal-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Users size={16} />
                Trabajadores Asignados ({cuadrilla.trabajadores?.length || 0})
              </span>
            </div>

            {cuadrilla.trabajadores && cuadrilla.trabajadores.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cuadrilla.trabajadores.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      border: '1px solid var(--border-color-neutral)',
                      padding: '10px 12px',
                      backgroundColor: 'var(--color-white)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '13px', display: 'block' }}>
                        {t.nombre}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {t.cargo || 'Operario'} {t.especialidad && `• ${t.especialidad}`}
                      </span>
                    </div>
                    {t.rut && (
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-light)', padding: '2px 6px' }}>
                        {t.rut}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                No hay trabajadores operativos asignados a esta cuadrilla.
              </p>
            )}
          </div>

          {/* Sección Recursos Materiales y Vehículos */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
                borderBottom: '1px solid var(--border-color-neutral)',
                paddingBottom: '6px',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--color-primary-teal-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Wrench size={16} />
                Equipamiento y Vehículos ({cuadrilla.recursos?.length || 0})
              </span>
            </div>

            {cuadrilla.recursos && cuadrilla.recursos.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cuadrilla.recursos.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      border: '1px solid var(--border-color-neutral)',
                      padding: '10px 12px',
                      backgroundColor: 'var(--color-white)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '13px', display: 'block' }}>
                        {r.nombre}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {r.esIndividual ? 'Vehículo / Activo Individual' : 'Insumo / Herramienta'}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-bg-light)',
                        padding: '3px 8px',
                        border: '1px solid var(--border-color-neutral)',
                      }}
                    >
                      {r.cantidadAsignada} {r.cantidadAsignada === 1 ? 'unidad' : 'unidades'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                No hay recursos logísticos ni vehículos asignados a esta cuadrilla.
              </p>
            )}
          </div>

          {/* Metadatos de Auditoría */}
          <div
            style={{
              marginTop: 'auto',
              borderTop: '1px solid var(--border-color-neutral)',
              paddingTop: '12px',
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <span>
              <strong>Creado:</strong>{' '}
              {cuadrilla.creadoEn ? new Date(cuadrilla.creadoEn).toLocaleString('es-CL') : 'N/D'}
            </span>
            {cuadrilla.actualizadoEn && (
              <span>
                <strong>Última actualización:</strong>{' '}
                {new Date(cuadrilla.actualizadoEn).toLocaleString('es-CL')}
              </span>
            )}
          </div>
        </div>

        {/* Pie del Drawer */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: 'var(--color-bg-light)',
            borderTop: '1px solid var(--border-color-neutral)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <Button variant="outline" size="md" onClick={onCerrar}>
            Cerrar
          </Button>

          {puedeEditar && onEditar && !estaInactiva && (
            <div
              style={{ display: 'inline-block' }}
              title={
                bloqueadaPorMision
                  ? 'No se puede editar una cuadrilla que se encuentra actualmente en misión activa'
                  : 'Modificar datos y dotación'
              }
            >
              <Button
                variant="primary"
                size="md"
                disabled={bloqueadaPorMision}
                onClick={() => {
                  onCerrar();
                  onEditar(cuadrilla);
                }}
                icon={<Pencil size={15} />}
                style={{
                  opacity: bloqueadaPorMision ? 0.6 : 1,
                  cursor: bloqueadaPorMision ? 'not-allowed' : 'pointer',
                }}
              >
                Editar Cuadrilla
              </Button>
            </div>
          )}

          {puedeEliminar && onDesactivar && !estaInactiva && (
            <div
              style={{ display: 'inline-block' }}
              title={
                bloqueadaPorMision
                  ? 'No se puede desactivar una cuadrilla que se encuentra actualmente en misión activa'
                  : 'Desactivar y retirar de servicio operativo la cuadrilla'
              }
            >
              <Button
                variant="destructive"
                size="md"
                disabled={bloqueadaPorMision}
                onClick={() => {
                  onCerrar();
                  onDesactivar(cuadrilla);
                }}
                icon={<Trash2 size={15} />}
                style={{
                  opacity: bloqueadaPorMision ? 0.6 : 1,
                  cursor: bloqueadaPorMision ? 'not-allowed' : 'pointer',
                }}
              >
                Desactivar Cuadrilla
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
