import React from 'react';
import type { DetallesRecursoTecnico } from '@/types/recurso';

interface RecursoDetalleSpecsProps {
  detalles: DetallesRecursoTecnico;
}

export default function RecursoDetalleSpecs({ detalles: d }: RecursoDetalleSpecsProps) {
  const tieneSpecs = Object.keys(d).length > 0;
  if (!tieneSpecs) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-teal-dark)' }}>
        Especificaciones Técnicas
      </h5>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '13px', backgroundColor: 'var(--color-bg-light)', padding: '12px' }}>
        {d.patente && <div><strong>Patente:</strong> {String(d.patente)}</div>}
        {d.numeroSerie && <div><strong>Nº Serie:</strong> {String(d.numeroSerie)}</div>}
        {d.marca && <div><strong>Marca:</strong> {String(d.marca)}</div>}
        {d.modelo && <div><strong>Modelo:</strong> {String(d.modelo)}</div>}
        {d.anio && <div><strong>Año:</strong> {String(d.anio)}</div>}
        {d.kilometraje !== undefined && <div><strong>Kilometraje:</strong> {String(d.kilometraje)} km</div>}
        {d.tipoCombustible && <div><strong>Combustible:</strong> {String(d.tipoCombustible)}</div>}
        {d.capacidadPasajeros && <div><strong>Pasajeros:</strong> {String(d.capacidadPasajeros)}</div>}
        {d.numeroChasis && <div><strong>VIN/Chasis:</strong> {String(d.numeroChasis)}</div>}
        {d.capacidadCargaKg && <div><strong>Capacidad:</strong> {String(d.capacidadCargaKg)} kg</div>}
        {d.alcanceMaximoMetros && <div><strong>Alcance:</strong> {String(d.alcanceMaximoMetros)} m</div>}
        {d.tipoGrua && <div><strong>Tipo Grúa:</strong> {String(d.tipoGrua)}</div>}
        {d.horometro !== undefined && <div><strong>Horómetro:</strong> {String(d.horometro)} hrs</div>}
        {d.caudalMaximoLpm && <div><strong>Caudal:</strong> {String(d.caudalMaximoLpm)} L/min</div>}
        {d.diametroPulgadas && <div><strong>Diámetro:</strong> {String(d.diametroPulgadas)}&quot;</div>}
        {d.potenciaHp && <div><strong>Potencia:</strong> {String(d.potenciaHp)} HP</div>}
      </div>
    </div>
  );
}
