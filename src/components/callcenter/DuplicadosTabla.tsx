'use client';

import React from 'react';
import type { DuplicadoItem } from '@/types/incidente-manual';

interface DuplicadosTablaProps {
  coincidencias: DuplicadoItem[];
}

export default function DuplicadosTabla({ coincidencias }: DuplicadosTablaProps) {
  return (
    <div style={{ border: '1px solid #DFE3E8', marginBottom: '20px', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#ECEFF3', borderBottom: '2px solid #3B3F45' }}>
            <th style={{ padding: '10px 12px', fontWeight: 700, color: '#14505A' }}>Código</th>
            <th style={{ padding: '10px 12px', fontWeight: 700, color: '#14505A' }}>Tipo</th>
            <th style={{ padding: '10px 12px', fontWeight: 700, color: '#14505A' }}>Dirección</th>
            <th style={{ padding: '10px 12px', fontWeight: 700, color: '#14505A' }}>Distancia</th>
            <th style={{ padding: '10px 12px', fontWeight: 700, color: '#14505A' }}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {coincidencias.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: '#5F676E' }}>
                No se encontraron detalles específicos de incidentes coincidentes cercanos.
              </td>
            </tr>
          ) : (
            coincidencias.map((item, idx) => (
              <tr
                key={item.id || idx}
                style={{
                  borderBottom: '1px solid #DFE3E8',
                  backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                }}
              >
                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1B6F7D' }}>
                  {item.codigo}
                </td>
                <td style={{ padding: '10px 12px' }}>{item.tipoAfectacion}</td>
                <td style={{ padding: '10px 12px', maxWidth: '200px', wordBreak: 'break-word' }}>
                  {item.direccion}
                </td>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                  {typeof item.distanciaMetros === 'number' && !isNaN(item.distanciaMetros)
                    ? `${Math.round(item.distanciaMetros)} m`
                    : '-'}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: '#ECEFF3',
                      color: '#3B3F45',
                      border: '1px solid #CFD8DC',
                    }}
                  >
                    {item.estado}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
