'use client';

import React from 'react';

export default function RolesSkeleton() {
  const placeholders = Array.from({ length: 6 });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.25rem',
      }}
      aria-busy="true"
      aria-label="Cargando listado de roles y permisos"
    >
      {placeholders.map((_, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: 'var(--color-white, #FFFFFF)',
            border: '1px solid #DFE3E8',
            borderTop: '4px solid #DFE3E8',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '220px',
          }}
        >
          <div>
            {/* Header skeleton */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <div
                className="sgrai-skeleton"
                style={{
                  width: '55%',
                  height: '20px',
                  backgroundColor: '#E0E0E0',
                }}
              />
              <div
                className="sgrai-skeleton"
                style={{
                  width: '25%',
                  height: '18px',
                  backgroundColor: '#E0E0E0',
                }}
              />
            </div>

            {/* Description lines skeleton */}
            <div
              className="sgrai-skeleton"
              style={{
                width: '100%',
                height: '14px',
                backgroundColor: '#EEEEEE',
                marginBottom: '0.5rem',
              }}
            />
            <div
              className="sgrai-skeleton"
              style={{
                width: '75%',
                height: '14px',
                backgroundColor: '#EEEEEE',
                marginBottom: '1rem',
              }}
            />

            {/* Badge skeleton */}
            <div
              className="sgrai-skeleton"
              style={{
                width: '40%',
                height: '22px',
                backgroundColor: '#E0E0E0',
                marginBottom: '1.25rem',
              }}
            />
          </div>

          {/* Button skeleton */}
          <div
            className="sgrai-skeleton"
            style={{
              width: '100%',
              height: '38px',
              backgroundColor: '#E0E0E0',
            }}
          />
        </div>
      ))}

      <style jsx>{`
        .sgrai-skeleton {
          animation: skeletonPulse 1.2s ease-in-out infinite;
        }
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
    </div>
  );
}
