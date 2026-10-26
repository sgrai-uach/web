import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/ui/Button';
import type { CuadrillaItem } from '@/types/cuadrilla';

interface CuadrillaDesactivarModalProps {
  cuadrilla: CuadrillaItem | null;
  desactivando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/**
 * Modal accesible de confirmación para baja lógica de cuadrillas operativas (HU-82).
 * Reutiliza el componente común Modal y Button conforme a GEMINI.md y docs/ARCHITECTURE.md.
 * Impide la baja si la cuadrilla posee misiones activas en terreno (EN_MISION, EN_TRANSITO, EN_OPERACION).
 */
export default function CuadrillaDesactivarModal({
  cuadrilla,
  desactivando,
  onConfirmar,
  onCancelar,
}: CuadrillaDesactivarModalProps) {
  if (!cuadrilla) return null;

  const estadoNorm = (cuadrilla.estado || '').toUpperCase();
  const estaEnMision =
    estadoNorm === 'EN_MISION' ||
    estadoNorm === 'EN_TRANSITO' ||
    estadoNorm === 'EN_OPERACION';

  const cantTrabajadores = cuadrilla.trabajadores?.length ?? cuadrilla.totalTrabajadores ?? 0;
  const cantRecursos = cuadrilla.recursos?.length ?? cuadrilla.totalRecursos ?? 0;

  return (
    <Modal
      isOpen={Boolean(cuadrilla)}
      title="Confirmar Desactivación de Cuadrilla"
      onClose={onCancelar}
      maxWidth="560px"
      actions={
        <>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancelar}
            disabled={desactivando}
          >
            {estaEnMision ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!estaEnMision && (
            <Button
              type="button"
              variant="destructive"
              size="md"
              onClick={onConfirmar}
              loading={desactivando}
              disabled={desactivando}
            >
              {desactivando ? 'Desactivando...' : 'Sí, desactivar cuadrilla'}
            </Button>
          )}
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-charcoal, #3B3F45)', lineHeight: 1.5 }}>
          ¿Está seguro de que desea retirar de servicio activo a la cuadrilla operativa{' '}
          <strong style={{ color: 'var(--color-primary-teal-dark, #14505A)' }}>
            «{cuadrilla.nombre}»
          </strong>{' '}
          (Delegación: {cuadrilla.delegacion.nombre})?
        </p>

        {estaEnMision ? (
          <div
            role="alert"
            style={{
              backgroundColor: '#FFFBEB',
              borderLeft: '4px solid #F59E0B',
              padding: '14px',
              fontSize: '13px',
              color: '#92400E',
              lineHeight: 1.45,
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <AlertTriangle size={22} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '4px', color: '#B45309', fontSize: '14px' }}>
                Acción Bloqueada: Cuadrilla con Misión en Curso
              </strong>
              <span>
                Esta unidad operativa se encuentra desplegada en terreno o posee misiones activas (Planificada, Despachada o En Curso).
                Por protocolo de seguridad y auditoría institucional, no es posible disolverla hasta que la Central u Operaciones finalice
                o reasigne sus compromisos pendientes.
              </span>
            </div>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: 'var(--color-bg-light, #ECEFF3)',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              padding: '14px 16px',
              fontSize: '13px',
              color: 'var(--color-charcoal, #3B3F45)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--color-primary-teal-dark)' }}>
              <ShieldAlert size={16} style={{ color: 'var(--color-primary-teal)' }} />
              <span>Consecuencias de la baja lógica:</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.5 }}>
              <li>
                <strong>Cierre de dotación:</strong> Se desvincularán de forma inmediata{' '}
                <span style={{ color: 'var(--color-primary-teal-dark)', fontWeight: 700 }}>
                  {cantRecursos} {cantRecursos === 1 ? 'recurso' : 'recursos'}
                </span>{' '}
                y{' '}
                <span style={{ color: 'var(--color-primary-teal-dark)', fontWeight: 700 }}>
                  {cantTrabajadores} {cantTrabajadores === 1 ? 'trabajador' : 'trabajadores'}
                </span>
                , quedando disponibles en el inventario central y dotación libre.
              </li>
              <li>
                <strong>Líder operativo:</strong> El delegado asignado ({cuadrilla.delegado?.nombre || 'N/A'}) revertirá su rol institucional a Brigadista si no encabeza otra cuadrilla activa.
              </li>
              <li>
                <strong>Historial inmutable:</strong> Se preservará el registro completo de atenciones e informes técnicos previos para auditoría y reportes SENAPRED.
              </li>
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}
