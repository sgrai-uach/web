'use client';

import React from 'react';
import { Truck, Package, Pencil, Trash2 } from 'lucide-react';
import type { RecursoItem } from '@/types/recurso';
import { obtenerNombreDelegacion } from '@/lib/utils/delegacionUtils';
import BadgeEstado from './BadgeEstado';
import Button from '@/components/ui/Button';

interface RecursoRowProps {
  recurso: RecursoItem;
  indice: number;
  onSeleccionar: (recurso: RecursoItem) => void;
  onEditar?: (recurso: RecursoItem) => void;
  onEliminar?: (recurso: RecursoItem) => void;
  puedeEliminar?: boolean;
}

export default function RecursoRow({
  recurso,
  indice,
  onSeleccionar,
  onEditar,
  onEliminar,
  puedeEliminar = false,
}: RecursoRowProps) {
  const esFilaPar = indice % 2 === 0;
  const tieneBajoStock =
    recurso.estado === 'BAJO_STOCK' ||
    (recurso.cantidadMinima > 0 && recurso.cantidadDisponible <= recurso.cantidadMinima);

  return (
    <tr
      onClick={() => onSeleccionar(recurso)}
      style={{
        backgroundColor: esFilaPar ? 'var(--color-white)' : '#F8FAFC',
        borderBottom: '1px solid var(--color-bg-light)',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-bg-light)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = esFilaPar ? 'var(--color-white)' : '#F8FAFC'; }}
    >
      {/* Nombre e Identificador */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 700, color: 'var(--color-primary-teal-dark)', fontSize: '14px' }}>
            {recurso.nombre}
          </span>
          {recurso.detalles?.patente && (
            <span style={{ fontSize: '12px', color: 'var(--color-primary-teal)', fontWeight: 600 }}>
              Patente: {String(recurso.detalles.patente)}
            </span>
          )}
          {recurso.descripcion && !recurso.detalles?.patente && (
            <span style={{ fontSize: '12px', color: 'var(--color-charcoal)', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={recurso.descripcion}>
              {recurso.descripcion}
            </span>
          )}
        </div>
      </td>

      {/* Tipo / Clasificación */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '3px 8px', backgroundColor: recurso.esIndividual ? '#E0F2FE' : '#F3F4F6', color: recurso.esIndividual ? '#0369A1' : '#374151', border: `1px solid ${recurso.esIndividual ? '#BAE6FD' : '#E5E7EB'}` }}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            {recurso.esIndividual ? <Truck size={14} aria-hidden="true" /> : <Package size={14} aria-hidden="true" />}
          </span>
          <span>{recurso.tipo}</span>
        </span>
      </td>

      {/* Disponibilidad y Stock */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: tieneBajoStock ? '#D97706' : 'var(--color-primary-teal-dark)' }}>
              {recurso.cantidadDisponible} disp.
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-charcoal)' }}>
              / {recurso.cantidadInventario} tot.
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-charcoal)' }}>
            <span>{recurso.cantidadEnUso} en terreno</span>
            {recurso.cantidadMinima > 0 && (
              <span style={{ marginLeft: '4px', color: tieneBajoStock ? '#D97706' : 'var(--color-charcoal)' }}>
                &bull; Min: {recurso.cantidadMinima}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Procedencia Territorial */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: recurso.delegacion ? 'var(--color-charcoal-dark)' : 'var(--color-charcoal)' }}>
          {recurso.delegacion ? obtenerNombreDelegacion(recurso.delegacion.nombre || recurso.delegacion.id, 'Reserva Central') : 'Reserva Central'}
        </span>
      </td>

      {/* Badge de Estado */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <BadgeEstado estado={recurso.estado} />
      </td>

      {/* Acciones */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSeleccionar(recurso);
            }}
          >
            Ver Ficha
          </Button>
          {onEditar && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEditar(recurso);
              }}
              title={`Editar ${recurso.nombre}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'var(--color-primary-teal)',
                color: 'var(--color-white)',
              }}
            >
              <Pencil size={13} aria-hidden="true" />
              <span>Editar</span>
            </Button>
          )}

          {puedeEliminar && onEliminar && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEliminar(recurso);
              }}
              title={`Dar de baja ${recurso.nombre}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Trash2 size={13} aria-hidden="true" />
              <span>Eliminar</span>
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

