import React from 'react';

interface PuntosCriticosSkeletonProps {
  filas?: number;
}

export default function PuntosCriticosSkeleton({ filas = 5 }: PuntosCriticosSkeletonProps) {
  const items = Array.from({ length: filas }, (_, i) => i);

  return (
    <>
      {items.map((idx) => (
        <tr
          key={idx}
          style={{
            borderBottom: '1px solid #DFE3E8',
            backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
          }}
        >
          {/* Código y Nombre */}
          <td style={{ padding: '16px' }}>
            <div
              style={{
                width: '30%',
                height: '14px',
                backgroundColor: '#ECEFF3',
                marginBottom: '8px',
                animation: 'pulse 1.5s infinite',
              }}
            />
            <div
              style={{
                width: '80%',
                height: '16px',
                backgroundColor: '#ECEFF3',
                marginBottom: '6px',
                animation: 'pulse 1.5s infinite',
              }}
            />
            <div
              style={{
                width: '60%',
                height: '12px',
                backgroundColor: '#ECEFF3',
                animation: 'pulse 1.5s infinite',
              }}
            />
          </td>

          {/* Tipo de Riesgo */}
          <td style={{ padding: '16px' }}>
            <div
              style={{
                width: '70%',
                height: '14px',
                backgroundColor: '#ECEFF3',
                animation: 'pulse 1.5s infinite',
              }}
            />
          </td>

          {/* Prioridad */}
          <td style={{ padding: '16px' }}>
            <div
              style={{
                width: '60px',
                height: '24px',
                backgroundColor: '#ECEFF3',
                animation: 'pulse 1.5s infinite',
              }}
            />
          </td>

          {/* Coordenadas */}
          <td style={{ padding: '16px' }}>
            <div
              style={{
                width: '120px',
                height: '14px',
                backgroundColor: '#ECEFF3',
                animation: 'pulse 1.5s infinite',
              }}
            />
          </td>

          {/* Delegación */}
          <td style={{ padding: '16px' }}>
            <div
              style={{
                width: '110px',
                height: '14px',
                backgroundColor: '#ECEFF3',
                animation: 'pulse 1.5s infinite',
              }}
            />
          </td>

          {/* Estado */}
          <td style={{ padding: '16px' }}>
            <div
              style={{
                width: '70px',
                height: '24px',
                backgroundColor: '#ECEFF3',
                animation: 'pulse 1.5s infinite',
              }}
            />
          </td>

          {/* Acción */}
          <td style={{ padding: '16px', textAlign: 'center' }}>
            <div
              style={{
                width: '32px',
                height: '20px',
                backgroundColor: '#ECEFF3',
                margin: '0 auto',
                animation: 'pulse 1.5s infinite',
              }}
            />
          </td>
        </tr>
      ))}
    </>
  );
}
