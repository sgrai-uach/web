'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SuccessActionsProps {
  recursoNombre: string;
  onReset: () => void;
  listPath?: string;
}

const TOTAL_DURATION_MS = 5000;
const TICK_MS = 50;

export default function SuccessActions({
  recursoNombre,
  onReset,
  listPath = '/recursos',
}: SuccessActionsProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_DURATION_MS);
  const [isCancelled, setIsCancelled] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isCancelled) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= TICK_MS) {
          if (timerRef.current) clearInterval(timerRef.current);
          router.push(listPath);
          return 0;
        }
        return prev - TICK_MS;
      });
    }, TICK_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCancelled, listPath, router]);

  const handleMouseEnter = () => {
    setIsCancelled(true);
  };

  const handleManualGoToList = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    router.push(listPath);
  };

  const secondsRemaining = Math.max(0, Math.ceil(timeLeft / 1000));
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / TOTAL_DURATION_MS) * 100));

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '2px solid #1B6F7D',
        padding: '24px',
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
      role="alert"
      aria-live="polite"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: '#4FAE9B',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '20px',
          }}
        >
          ✓
        </div>
        <div>
          <h3
            style={{
              margin: 0,
              color: '#14505A',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            Recurso creado exitosamente
          </h3>
          <p style={{ margin: '4px 0 0 0', color: '#3B3F45', fontSize: '14px' }}>
            El recurso <strong>&ldquo;{recursoNombre}&rdquo;</strong> ha sido registrado en el inventario logístico municipal.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          marginTop: '8px',
        }}
      >
        {/* Botón Volver al listado con cuenta regresiva y barra inversa */}
        <div
          onMouseEnter={handleMouseEnter}
          style={{ position: 'relative', display: 'inline-block' }}
        >
          <button
            type="button"
            onClick={handleManualGoToList}
            style={{
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: '#1B6F7D',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 0,
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: '240px',
              justifyContent: 'center',
            }}
          >
            {/* Barra de progreso inversa animada en el fondo del botón */}
            {!isCancelled && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: `${progressPercent}%`,
                  backgroundColor: '#14505A',
                  opacity: 0.6,
                  transition: 'width 50ms linear',
                  zIndex: 0,
                }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>
              {isCancelled
                ? 'Volver al listado'
                : `Volver al listado (${secondsRemaining}s)`}
            </span>
          </button>
          {!isCancelled && (
            <span
              style={{
                display: 'block',
                fontSize: '11px',
                color: '#3B3F45',
                marginTop: '4px',
              }}
            >
              Pasa el cursor para pausar la redirección automática
            </span>
          )}
          {isCancelled && (
            <span
              style={{
                display: 'block',
                fontSize: '11px',
                color: '#1B6F7D',
                marginTop: '4px',
                fontWeight: 600,
              }}
            >
              Redirección automática pausada
            </span>
          )}
        </div>

        {/* Botón Crear otro recurso */}
        <button
          type="button"
          onClick={onReset}
          style={{
            backgroundColor: '#3B3F45',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 0,
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Crear otro recurso
        </button>
      </div>
    </div>
  );
}
