'use client';

import React from 'react';
import { AlertTriangle, Trash2, MapPin, Building2, AlertCircle } from 'lucide-react';
import type { PuntoCriticoItem } from '@/types/puntoCritico';
import Modal from '@/components/common/Modal';
import Button from '@/components/ui/Button';

interface PuntoCriticoEliminarModalProps {
  punto: PuntoCriticoItem | null;
  isOpen: boolean;
  isSubmitting: boolean;
  errorBloqueo?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function PuntoCriticoEliminarModal({
  punto,
  isOpen,
  isSubmitting,
  errorBloqueo,
  onClose,
  onConfirm,
}: PuntoCriticoEliminarModalProps) {
  if (!isOpen || !punto) return null;

  const actions = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
      <Button
        type="button"
        variant="secondary"
        onClick={onClose}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>

      <Button
        type="button"
        variant="destructive"
        onClick={onConfirm}
        loading={isSubmitting}
        disabled={isSubmitting}
        icon={<Trash2 size={15} aria-hidden="true" />}
      >
        {isSubmitting ? 'Eliminando...' : 'Eliminar Punto Crítico'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      title="Eliminar Punto Crítico"
      onClose={onClose}
      actions={actions}
      maxWidth="580px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Advertencia institucional sobre borrado lógico */}
        <div
          style={{
            backgroundColor: 'var(--color-warning-bg, #FFF3E0)',
            borderLeft: '4px solid var(--color-warning, #E65100)',
            padding: '12px 14px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}
        >
          <AlertTriangle
            size={20}
            style={{ color: 'var(--color-warning, #E65100)', flexShrink: 0, marginTop: '2px' }}
            aria-hidden="true"
          />
          <div style={{ fontSize: '13px', color: 'var(--color-text-dark, #2B2B2B)', lineHeight: 1.5 }}>
            <strong>¿Está seguro de eliminar este punto crítico?</strong>
            <p style={{ margin: '4px 0 0 0' }}>
              El punto dejará de estar visible en el mapa operativo y en el catálogo activo, pero se conservará su historial de intervenciones preventivas para auditoría institucional (SENAPRED).
            </p>
          </div>
        </div>

        {/* Mensaje de Bloqueo por Misiones Activas (Error 409 Conflict) */}
        {errorBloqueo && (
          <div
            role="alert"
            style={{
              backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
              border: '1px solid #FFCDD2',
              borderLeft: '4px solid var(--color-danger, #D32F2F)',
              padding: '12px 14px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle
              size={18}
              style={{ color: 'var(--color-danger, #D32F2F)', flexShrink: 0, marginTop: '2px' }}
              aria-hidden="true"
            />
            <div style={{ fontSize: '13px', color: 'var(--color-danger, #D32F2F)', lineHeight: 1.4 }}>
              <strong>Acción Bloqueada:</strong>
              <div style={{ marginTop: '2px', color: '#B71C1C' }}>{errorBloqueo}</div>
            </div>
          </div>
        )}

        {/* Resumen del punto crítico seleccionado */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid var(--border-color-neutral, #DFE3E8)',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-primary-teal, #1B6F7D)',
                backgroundColor: 'var(--color-info-bg, #E0F2F1)',
                padding: '2px 6px',
                border: '1px solid #B2DFDB',
              }}
            >
              {punto.codigo}
            </span>
            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-primary-teal-dark, #14505A)' }}>
              {punto.nombre}
            </span>
          </div>

          {punto.descripcion && (
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted, #5F676E)' }}>
              {punto.descripcion}
            </p>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '10px',
              paddingTop: '6px',
              borderTop: '1px solid #ECEFF3',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={13} style={{ color: 'var(--color-primary-teal, #1B6F7D)' }} aria-hidden="true" />
              <span style={{ color: 'var(--color-text-muted, #5F676E)' }}>Riesgo: </span>
              <strong style={{ color: 'var(--color-charcoal, #3B3F45)' }}>{punto.tipoRiesgo || 'No especificado'}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={13} style={{ color: 'var(--color-primary-teal, #1B6F7D)' }} aria-hidden="true" />
              <span style={{ color: 'var(--color-text-muted, #5F676E)' }}>Delegación: </span>
              <strong style={{ color: 'var(--color-charcoal, #3B3F45)' }}>{punto.delegacion?.nombre || 'Central Comunal'}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={13} style={{ color: 'var(--color-primary-teal, #1B6F7D)' }} aria-hidden="true" />
              <span style={{ color: 'var(--color-text-muted, #5F676E)' }}>Coordenadas: </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {punto.latitud.toFixed(4)}, {punto.longitud.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
