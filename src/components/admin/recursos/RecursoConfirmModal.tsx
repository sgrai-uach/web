import React from 'react';
import type { RecursoFormState } from '@/types/recurso';
import Modal from '@/components/common/Modal';

interface RecursoConfirmModalProps {
  isOpen: boolean;
  formData: RecursoFormState;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function RecursoConfirmModal({
  isOpen,
  formData,
  isSubmitting,
  onClose,
  onConfirm,
}: RecursoConfirmModalProps) {
  const actions = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        style={{
          backgroundColor: 'var(--color-charcoal)',
          color: 'var(--color-white)',
          border: 'none',
          borderRadius: 0,
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          height: '44px',
        }}
      >
        Modificar datos
      </button>

      <button
        type="button"
        onClick={onConfirm}
        disabled={isSubmitting}
        style={{
          backgroundColor: isSubmitting ? 'var(--color-bg-light)' : 'var(--color-accent-mint)',
          color: isSubmitting ? 'var(--color-charcoal)' : 'var(--color-white)',
          border: 'none',
          borderRadius: 0,
          padding: '12px 28px',
          fontSize: '14px',
          fontWeight: 700,
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          height: '44px',
        }}
      >
        {isSubmitting ? 'Ingresando Recurso...' : 'Confirmar y Guardar'}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      title="Confirmar Registro de Recurso"
      onClose={onClose}
      actions={actions}
      maxWidth="600px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-charcoal)' }}>
          Revisa el resumen antes de ingresar definitivamente el recurso al inventario logístico municipal.
        </p>

        <div
          style={{
            backgroundColor: 'var(--color-bg-light)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: '14px',
            color: 'var(--color-text-dark)',
          }}
        >
          <div>
            <strong style={{ color: 'var(--color-primary-teal-dark)' }}>Nombre del Recurso:</strong> {formData.nombre}
          </div>

          {formData.descripcion && (
            <div>
              <strong style={{ color: 'var(--color-primary-teal-dark)' }}>Descripción:</strong> {formData.descripcion}
            </div>
          )}

          <div>
            <strong style={{ color: 'var(--color-primary-teal-dark)' }}>Tipo de Recurso:</strong>{' '}
            {formData.esIndividual ? 'Vehículo o Maquinaria' : 'Material o Insumo'}
          </div>

          <div>
            <strong style={{ color: 'var(--color-primary-teal-dark)' }}>Cantidad:</strong>{' '}
            {formData.esIndividual ? '1 unidad' : `${formData.cantidadInventario} unidades`}
          </div>

          {!formData.esIndividual && (
            <div>
              <strong style={{ color: 'var(--color-primary-teal-dark)' }}>Umbral de Alerta:</strong>{' '}
              {Number(formData.cantidadMinima) > 0 ? `${formData.cantidadMinima} unidades` : 'Alerta desactivada (0)'}
            </div>
          )}

          {formData.esIndividual && (
            <div style={{ borderTop: '1px solid #D5DCE4', paddingTop: '8px' }}>
              <strong style={{ color: 'var(--color-primary-teal-dark)' }}>
                Especificaciones ({formData.subtipoDetalle}):
              </strong>
              <ul style={{ margin: '4px 0 0 18px', fontSize: '13px', padding: 0 }}>
                {formData.detalles.patente && <li>Patente: {formData.detalles.patente}</li>}
                {formData.detalles.numeroSerie && <li>Nº Serie: {formData.detalles.numeroSerie}</li>}
                {formData.detalles.marca && <li>Marca: {formData.detalles.marca}</li>}
                {formData.detalles.modelo && <li>Modelo: {formData.detalles.modelo}</li>}
                {formData.detalles.anio && <li>Año: {formData.detalles.anio}</li>}
                {formData.detalles.kilometraje && <li>Kilometraje: {formData.detalles.kilometraje} km</li>}
                {formData.detalles.tipoCombustible && <li>Combustible: {formData.detalles.tipoCombustible}</li>}
                {formData.detalles.capacidadPasajeros && <li>Pasajeros: {formData.detalles.capacidadPasajeros}</li>}
                {formData.detalles.numeroChasis && <li>Chasis/VIN: {formData.detalles.numeroChasis}</li>}
                {formData.detalles.capacidadCargaKg && <li>Carga: {formData.detalles.capacidadCargaKg} kg</li>}
                {formData.detalles.alcanceMaximoMetros && <li>Alcance: {formData.detalles.alcanceMaximoMetros} m</li>}
                {formData.detalles.tipoGrua && <li>Tipo Grúa: {formData.detalles.tipoGrua}</li>}
                {formData.detalles.horometro && <li>Horómetro: {formData.detalles.horometro} hrs</li>}
                {formData.detalles.caudalMaximoLpm && <li>Caudal: {formData.detalles.caudalMaximoLpm} L/min</li>}
                {formData.detalles.diametroPulgadas && <li>Diámetro: {formData.detalles.diametroPulgadas}&quot;</li>}
                {formData.detalles.potenciaHp && <li>Potencia: {formData.detalles.potenciaHp} HP</li>}
              </ul>
            </div>
          )}

          <div style={{ borderTop: '1px solid #D5DCE4', paddingTop: '8px' }}>
            <strong style={{ color: 'var(--color-primary-teal-dark)' }}>Ubicación Geográfica:</strong>{' '}
            Latitud: {Number(formData.latitud).toFixed(6)}, Longitud: {Number(formData.longitud).toFixed(6)}
          </div>
        </div>
      </div>
    </Modal>
  );
}
