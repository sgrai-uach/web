'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, AlertTriangle, AlertCircle, X, ShieldAlert, Package, Truck } from 'lucide-react';
import type { RecursoItem } from '@/types/recurso';
import { eliminarRecurso, RecursoServiceError } from '@/services/recursosService';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';

export interface RecursoEliminarModalProps {
  isOpen: boolean;
  recurso: RecursoItem | null;
  usuarioActivoId: string;
  onCerrar: () => void;
  onEliminacionExitosa: (recurso: RecursoItem) => void;
}

export default function RecursoEliminarModal({
  isOpen,
  recurso,
  usuarioActivoId,
  onCerrar,
  onEliminacionExitosa,
}: RecursoEliminarModalProps) {
  const [eliminando, setEliminando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [esConflictoOperativo, setEsConflictoOperativo] = useState(false);

  const handleCerrar = useCallback(() => {
    if (eliminando) return;
    setErrorMensaje(null);
    setEsConflictoOperativo(false);
    setEliminando(false);
    onCerrar();
  }, [eliminando, onCerrar]);

  // Manejo de tecla Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCerrar();
      }
    },
    [handleCerrar]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !recurso) {
    return null;
  }

  const handleConfirmarEliminacion = async () => {
    setEliminando(true);
    setErrorMensaje(null);
    setEsConflictoOperativo(false);

    try {
      await eliminarRecurso(recurso.id, usuarioActivoId);
      onEliminacionExitosa(recurso);
      handleCerrar();
    } catch (err: unknown) {
      if (err instanceof RecursoServiceError) {
        const status = err.apiError.statusCode;
        if (status === 409) {
          setEsConflictoOperativo(true);
          setErrorMensaje(
            err.apiError.message ||
              `El recurso "${recurso.nombre}" tiene unidades actualmente desplegadas en terreno o misiones activas y no puede ser dado de baja.`
          );
        } else if (status === 403) {
          setErrorMensaje('Acceso denegado: Se requiere perfil de Administrador para dar de baja recursos.');
        } else if (status === 404) {
          setErrorMensaje('El recurso ya no existe o fue dado de baja previamente.');
        } else {
          setErrorMensaje(err.apiError.message || 'Error al procesar la baja del recurso.');
        }
      } else if (err instanceof Error) {
        setErrorMensaje(err.message);
      } else {
        setErrorMensaje('Ocurrió un error inesperado al procesar la solicitud.');
      }
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-eliminar-recurso-titulo"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(20, 80, 90, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 'var(--z-modal-backdrop, 2000)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4, 16px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !eliminando) {
          handleCerrar();
        }
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-white, #FFFFFF)',
          width: '100%',
          maxWidth: '560px',
          boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.15))',
          border: '1px solid var(--border-color-neutral, #DFE3E8)',
          borderRadius: 0,
          zIndex: 'var(--z-modal, 2010)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInModal 0.2s ease-out',
        }}
      >
        {/* Cabecera del Modal con Franja de Advertencia Destructiva */}
        <div
          style={{
            backgroundColor: 'var(--color-danger, #D32F2F)',
            color: 'var(--color-white, #FFFFFF)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #B71C1C',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Trash2 size={22} aria-hidden="true" />
            <Heading
              as="h3"
              variant="h3"
              color="white"
              noMargin
              id="modal-eliminar-recurso-titulo"
            >
              Confirmar Baja de Recurso
            </Heading>
          </div>
          <button
            type="button"
            onClick={handleCerrar}
            disabled={eliminando}
            aria-label="Cerrar modal"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-white, #FFFFFF)',
              cursor: eliminando ? 'not-allowed' : 'pointer',
              padding: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: eliminando ? 0.5 : 1,
            }}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div
          style={{
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            fontSize: 'var(--font-size-base, 14px)',
            color: 'var(--color-text-dark, #2B2B2B)',
          }}
        >
          {/* Mensaje principal */}
          <p style={{ margin: 0, lineHeight: 1.5 }}>
            ¿Está seguro de que desea dar de baja el siguiente recurso del inventario operativo municipal?
          </p>

          {/* Tarjeta de Resumen del Recurso */}
          <div
            style={{
              backgroundColor: 'var(--color-bg-light, #ECEFF3)',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '15px',
                  color: 'var(--color-primary-teal-dark, #14505A)',
                }}
              >
                {recurso.nombre}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 6px',
                  backgroundColor: recurso.esIndividual ? '#E0F2FE' : '#F3F4F6',
                  color: recurso.esIndividual ? '#0369A1' : '#374151',
                  border: `1px solid ${recurso.esIndividual ? '#BAE6FD' : '#E5E7EB'}`,
                }}
              >
                {recurso.esIndividual ? <Truck size={12} aria-hidden="true" /> : <Package size={12} aria-hidden="true" />}
                {recurso.tipo}
              </span>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--color-charcoal, #3B3F45)', display: 'flex', gap: '16px' }}>
              <span>
                <strong>Stock total:</strong> {recurso.cantidadInventario}
              </span>
              <span>
                <strong>Disponibles:</strong> {recurso.cantidadDisponible}
              </span>
              <span>
                <strong>En uso en terreno:</strong> {recurso.cantidadEnUso}
              </span>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #5F676E)' }}>
              <span>
                <strong>Procedencia:</strong> {recurso.delegacion ? recurso.delegacion.nombre : 'Reserva Central'}
              </span>
            </div>
          </div>

          {/* Nota de Auditoría y Trazabilidad (SENAPRED) */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              backgroundColor: '#FFF8E1',
              border: '1px solid #FFE082',
              padding: '12px 14px',
              alignItems: 'flex-start',
            }}
          >
            <ShieldAlert size={20} color="#B78103" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
            <div style={{ fontSize: '13px', color: '#5D4037', lineHeight: 1.4 }}>
              <strong>Baja Lógica Institucional:</strong> Esta acción retirará el recurso del inventario activo y de
              futuras asignaciones. El historial de misiones pasadas, incidentes y reportes asociados se mantendrá
              inalterable para trazabilidad y auditoría oficial (Informe Alfa 37G SENAPRED).
            </div>
          </div>

          {/* Banner de Error o Conflicto Operativo (409) */}
          {errorMensaje && (
            <div
              role="alert"
              style={{
                display: 'flex',
                gap: '12px',
                backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
                border: '1px solid var(--color-danger, #D32F2F)',
                padding: '12px 14px',
                alignItems: 'flex-start',
              }}
            >
              {esConflictoOperativo ? (
                <AlertTriangle size={20} color="var(--color-danger, #D32F2F)" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
              ) : (
                <AlertCircle size={20} color="var(--color-danger, #D32F2F)" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
              )}
              <div style={{ fontSize: '13px', color: 'var(--color-danger, #D32F2F)', lineHeight: 1.4 }}>
                <strong>{esConflictoOperativo ? 'Bloqueo Operativo (Recurso en uso):' : 'Error al dar de baja:'}</strong>{' '}
                {errorMensaje}
              </div>
            </div>
          )}
        </div>

        {/* Pie del Modal con Acciones */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-light, #ECEFF3)',
            borderTop: '1px solid var(--border-color-neutral, #DFE3E8)',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}
        >
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleCerrar}
            disabled={eliminando}
          >
            {esConflictoOperativo ? 'Entendido / Cerrar' : 'Cancelar'}
          </Button>

          {!esConflictoOperativo && (
            <Button
              type="button"
              variant="destructive"
              size="md"
              onClick={handleConfirmarEliminacion}
              loading={eliminando}
              disabled={eliminando}
              icon={<Trash2 size={16} aria-hidden="true" />}
              iconPosition="left"
            >
              Sí, Dar de Baja Recurso
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
