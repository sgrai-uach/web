import React from 'react';

interface AsistentesSocialesSkeletonProps {
  filas?: number;
}

export default function AsistentesSocialesSkeleton({ filas = 5 }: AsistentesSocialesSkeletonProps) {
  const items = Array.from({ length: filas }, (_, i) => i);

  return (
    <>
      {items.map((idx) => (
        <tr
          key={idx}
          data-testid="asistentes-sociales-skeleton-row"
          style={{
            borderBottom: '1px solid var(--border-color-neutral, #DFE3E8)',
            backgroundColor: idx % 2 === 0 ? '#FFFFFF' : 'var(--color-bg-light, #ECEFF3)',
          }}
        >
          {/* Nombre y Contacto */}
          <td style={{ padding: 'var(--space-4, 16px)' }}>
            <div
              style={{
                width: '65%',
                height: '16px',
                backgroundColor: 'var(--border-color-neutral, #DFE3E8)',
                marginBottom: '8px',
                animation: 'skeletonPulse 1.5s infinite ease-in-out',
              }}
            />
            <div
              style={{
                width: '40%',
                height: '12px',
                backgroundColor: 'var(--border-color-neutral, #DFE3E8)',
                animation: 'skeletonPulse 1.5s infinite ease-in-out',
              }}
            />
          </td>

          {/* Delegación */}
          <td style={{ padding: 'var(--space-4, 16px)' }}>
            <div
              style={{
                width: '75%',
                height: '14px',
                backgroundColor: 'var(--border-color-neutral, #DFE3E8)',
                animation: 'skeletonPulse 1.5s infinite ease-in-out',
              }}
            />
          </td>

          {/* Teléfono Institucional */}
          <td style={{ padding: 'var(--space-4, 16px)' }}>
            <div
              style={{
                width: '55%',
                height: '14px',
                backgroundColor: 'var(--border-color-neutral, #DFE3E8)',
                animation: 'skeletonPulse 1.5s infinite ease-in-out',
              }}
            />
          </td>

          {/* Estado Operativo */}
          <td style={{ padding: 'var(--space-4, 16px)' }}>
            <div
              style={{
                width: '95px',
                height: '24px',
                backgroundColor: 'var(--border-color-neutral, #DFE3E8)',
                animation: 'skeletonPulse 1.5s infinite ease-in-out',
              }}
            />
          </td>

          {/* Casos FIBE Asignados */}
          <td style={{ padding: 'var(--space-4, 16px)', textAlign: 'center' }}>
            <div
              style={{
                width: '45px',
                height: '24px',
                backgroundColor: 'var(--border-color-neutral, #DFE3E8)',
                margin: '0 auto',
                animation: 'skeletonPulse 1.5s infinite ease-in-out',
              }}
            />
          </td>
        </tr>
      ))}

      <style>{`
        @keyframes skeletonPulse {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.6;
          }
        }
      `}</style>
    </>
  );
}
