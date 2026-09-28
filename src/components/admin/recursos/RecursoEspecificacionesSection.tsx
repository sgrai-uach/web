import React from 'react';
import Heading from '@/components/ui/Heading';
import type { SubtipoDetalle, RecursoDetallesFormFields } from '@/types/recurso';
import RecursoVehiculoFields from './subtipos/RecursoVehiculoFields';
import RecursoMaquinariaFields from './subtipos/RecursoMaquinariaFields';
import RecursoMotobombaFields from './subtipos/RecursoMotobombaFields';

interface RecursoEspecificacionesSectionProps {
  subtipoDetalle: SubtipoDetalle;
  detalles: RecursoDetallesFormFields;
  onChangeSubtipo: (val: SubtipoDetalle) => void;
  onChangeDetalle: <K extends keyof RecursoDetallesFormFields>(
    field: K,
    val: RecursoDetallesFormFields[K]
  ) => void;
}

export default function RecursoEspecificacionesSection({
  subtipoDetalle,
  detalles,
  onChangeSubtipo,
  onChangeDetalle,
}: RecursoEspecificacionesSectionProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          borderBottom: '2px solid var(--color-primary-teal)',
          paddingBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ color: 'var(--color-primary-teal)', fontWeight: 'bold', fontSize: '18px' }}>
          3.
        </span>
        <Heading as="h2" variant="h3" color="teal-dark" noMargin>
          Detalles Técnicos del Activo
        </Heading>
      </div>

      {/* Selector de Categoría */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label htmlFor="subtipoDetalle" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark)' }}>
          Categoría de Especificaciones
        </label>
        <select
          id="subtipoDetalle"
          value={subtipoDetalle}
          onChange={(e) => onChangeSubtipo(e.target.value as SubtipoDetalle)}
          style={{
            padding: '10px 12px',
            fontSize: '14px',
            border: '1px solid var(--color-charcoal)',
            borderRadius: 0,
            outline: 'none',
            backgroundColor: 'var(--color-white)',
            color: 'var(--color-text-dark)',
            maxWidth: '320px',
          }}
        >
          <option value="GENERAL">General / Serializado</option>
          <option value="VEHICULO">Vehículo / Camioneta</option>
          <option value="MAQUINARIA">Maquinaria / Grúa</option>
          <option value="MOTOBOMBA">Motobomba / Equipo de Bombeo</option>
        </select>
      </div>

      {/* Identificación común para serializados */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="patente" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)' }}>Patente</label>
          <input id="patente" type="text" value={detalles.patente} onChange={(e) => onChangeDetalle('patente', e.target.value)} placeholder="Ej. AB-1234" style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid var(--color-charcoal)', borderRadius: 0 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="numeroSerie" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)' }}>Número de Serie</label>
          <input id="numeroSerie" type="text" value={detalles.numeroSerie} onChange={(e) => onChangeDetalle('numeroSerie', e.target.value)} placeholder="Ej. SN-998231" style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid var(--color-charcoal)', borderRadius: 0 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="marca" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)' }}>Marca</label>
          <input id="marca" type="text" value={detalles.marca} onChange={(e) => onChangeDetalle('marca', e.target.value)} placeholder="Ej. Toyota, Honda" style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid var(--color-charcoal)', borderRadius: 0 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="modelo" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)' }}>Modelo</label>
          <input id="modelo" type="text" value={detalles.modelo} onChange={(e) => onChangeDetalle('modelo', e.target.value)} placeholder="Ej. Hilux 4x4" style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid var(--color-charcoal)', borderRadius: 0 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="anio" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)' }}>Año</label>
          <input id="anio" type="number" min="1950" max="2099" value={detalles.anio} onChange={(e) => onChangeDetalle('anio', e.target.value)} placeholder="Ej. 2024" style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid var(--color-charcoal)', borderRadius: 0 }} />
        </div>
      </div>

      {/* Subsecciones específicas desacopladas */}
      {subtipoDetalle === 'VEHICULO' && (
        <RecursoVehiculoFields detalles={detalles} onChange={onChangeDetalle} />
      )}
      {subtipoDetalle === 'MAQUINARIA' && (
        <RecursoMaquinariaFields detalles={detalles} onChange={onChangeDetalle} />
      )}
      {subtipoDetalle === 'MOTOBOMBA' && (
        <RecursoMotobombaFields detalles={detalles} onChange={onChangeDetalle} />
      )}
    </section>
  );
}
