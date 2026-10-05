'use client';

import { useState } from 'react';
import type { RecursoItem } from '@/types/recurso';
import RecursoRow from './RecursoRow';
import RecursosSkeleton from './RecursosSkeleton';
import RecursosEmptyState from './RecursosEmptyState';
import RecursoDetalleModal from './RecursoDetalleModal';

interface RecursosTablaProps {
  recursos: RecursoItem[];
  cargando: boolean;
  esFiltroActivo: boolean;
  onLimpiarFiltros: () => void;
  onEditarRecurso?: (recurso: RecursoItem) => void;
  onEliminarRecurso?: (recurso: RecursoItem) => void;
  puedeEliminar?: boolean;
}

export default function RecursosTabla({
  recursos,
  cargando,
  esFiltroActivo,
  onLimpiarFiltros,
  onEditarRecurso,
  onEliminarRecurso,
  puedeEliminar = false,
}: RecursosTablaProps) {
  const [recursoSeleccionado, setRecursoSeleccionado] = useState<RecursoItem | null>(null);

  return (
    <>
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #D5DCE4',
          overflowX: 'auto',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '13px',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#14505A',
                color: '#FFFFFF',
                borderBottom: '2px solid #1B6F7D',
              }}
            >
              <th style={{ padding: '12px 16px', fontWeight: 700, width: '28%' }}>
                Recurso / Identificador
              </th>
              <th style={{ padding: '12px 16px', fontWeight: 700, width: '18%' }}>
                Tipo
              </th>
              <th style={{ padding: '12px 16px', fontWeight: 700, width: '18%' }}>
                Disponibilidad y Stock
              </th>
              <th style={{ padding: '12px 16px', fontWeight: 700, width: '18%' }}>
                Procedencia Territorial
              </th>
              <th style={{ padding: '12px 16px', fontWeight: 700, width: '10%' }}>
                Estado
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  fontWeight: 700,
                  width: '8%',
                  textAlign: 'center',
                }}
              >
                Acción
              </th>
            </tr>
          </thead>

          <tbody>
            {cargando && <RecursosSkeleton filas={5} />}

            {!cargando && recursos.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 0 }}>
                  <RecursosEmptyState
                    esFiltroActivo={esFiltroActivo}
                    onLimpiarFiltros={onLimpiarFiltros}
                  />
                </td>
              </tr>
            )}

            {!cargando &&
              recursos.map((recurso, idx) => (
                <RecursoRow
                  key={recurso.id}
                  recurso={recurso}
                  indice={idx}
                  onSeleccionar={(rec) => setRecursoSeleccionado(rec)}
                  onEditar={onEditarRecurso}
                  onEliminar={onEliminarRecurso}
                  puedeEliminar={puedeEliminar}
                />
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal Interactivo de Ficha Técnica */}
      <RecursoDetalleModal
        recurso={recursoSeleccionado}
        onCerrar={() => setRecursoSeleccionado(null)}
        onEditar={onEditarRecurso}
        onEliminar={onEliminarRecurso}
        puedeEliminar={puedeEliminar}
      />
    </>
  );
}

