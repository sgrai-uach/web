'use client';

import type { RecursoItem } from '@/types/recurso';
import BadgeEstado from './BadgeEstado';

interface RecursoRowProps {
  recurso: RecursoItem;
  indice: number;
  onSeleccionar: (recurso: RecursoItem) => void;
}

export default function RecursoRow({ recurso, indice, onSeleccionar }: RecursoRowProps) {
  const esFilaPar = indice % 2 === 0;
  const tieneBajoStock =
    recurso.estado === 'BAJO_STOCK' ||
    (recurso.cantidadMinima > 0 && recurso.cantidadDisponible <= recurso.cantidadMinima);

  return (
    <tr
      onClick={() => onSeleccionar(recurso)}
      style={{
        backgroundColor: esFilaPar ? '#FFFFFF' : '#F8FAFC',
        borderBottom: '1px solid #ECEFF3',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#ECEFF3';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = esFilaPar ? '#FFFFFF' : '#F8FAFC';
      }}
    >
      {/* Nombre del Recurso e Identificador */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 700, color: '#14505A', fontSize: '14px' }}>
            {recurso.nombre}
          </span>
          {recurso.detalles?.patente && (
            <span style={{ fontSize: '12px', color: '#1B6F7D', fontWeight: 600 }}>
              Patente: {recurso.detalles.patente}
            </span>
          )}
          {recurso.descripcion && !recurso.detalles?.patente && (
            <span
              style={{
                fontSize: '12px',
                color: '#6B7280',
                maxWidth: '260px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={recurso.descripcion}
            >
              {recurso.descripcion}
            </span>
          )}
        </div>
      </td>

      {/* Tipo / Clasificación */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: 0,
            backgroundColor: recurso.esIndividual ? '#E0F2FE' : '#F3F4F6',
            color: recurso.esIndividual ? '#0369A1' : '#374151',
            border: `1px solid ${recurso.esIndividual ? '#BAE6FD' : '#E5E7EB'}`,
          }}
        >
          <span>{recurso.esIndividual ? '🚜' : '📦'}</span>
          <span>{recurso.tipo}</span>
        </span>
      </td>

      {/* Disponibilidad y Stock */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: tieneBajoStock ? '#D97706' : '#14505A',
              }}
            >
              {recurso.cantidadDisponible} disp.
            </span>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>
              / {recurso.cantidadInventario} tot.
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280' }}>
            <span>{recurso.cantidadEnUso} en terreno</span>
            {recurso.cantidadMinima > 0 && (
              <span style={{ marginLeft: '4px', color: tieneBajoStock ? '#D97706' : '#6B7280' }}>
                &bull; Min: {recurso.cantidadMinima}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Procedencia Territorial (Delegación) */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: recurso.delegacion ? '#24272B' : '#6B7280',
            }}
          >
            {recurso.delegacion ? recurso.delegacion.nombre : 'Reserva Central'}
          </span>
        </div>
      </td>

      {/* Badge de Estado */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <BadgeEstado estado={recurso.estado} />
      </td>

      {/* Acciones */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSeleccionar(recurso);
          }}
          style={{
            backgroundColor: '#ECEFF3',
            color: '#14505A',
            border: '1px solid #D5DCE4',
            borderRadius: 0,
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1B6F7D';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ECEFF3';
            e.currentTarget.style.color = '#14505A';
          }}
        >
          Ver Ficha
        </button>
      </td>
    </tr>
  );
}
