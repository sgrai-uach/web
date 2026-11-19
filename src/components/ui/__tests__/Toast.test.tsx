import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../Toast';

function TestConsumer() {
  const { showInfo } = useToast();
  return (
    <button
      type="button"
      onClick={() => {
        showInfo('Incidente INC-948888-846 actualizado a estado En verificación.', 'Actualización de Incidente', {
          codeBadge: 'INC-948888-846',
        });
      }}
    >
      Emitir
    </button>
  );
}

describe('ToastProvider deduplication', () => {
  it('no apila toasts idénticos emitidos de forma repetida', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );

    const btn = screen.getByRole('button', { name: 'Emitir' });

    act(() => {
      btn.click();
      btn.click();
      btn.click();
      btn.click();
    });

    const matches = screen.getAllByText('Incidente INC-948888-846 actualizado a estado En verificación.');
    expect(matches).toHaveLength(1);
  });

  it('formatea priorityBadge de forma legible y renderiza detalles, ícono semántico y acción contextual', () => {
    const onVerIncidente = vi.fn();

    function RichToastConsumer() {
      const { showWarning } = useToast();
      return (
        <button
          type="button"
          onClick={() => {
            showWarning(
              'La cuadrilla completó la misión en INC-2026-0004.',
              'Cierre de Cuadrilla — Atención Requerida',
              {
                icon: 'cuadrilla',
                codeBadge: 'INC-2026-0004',
                priorityBadge: 'CRITICA',
                dedupKey: 'cierre-cuadrilla:inc-4:rep-4',
                details: [
                  { label: 'Estado final del terreno', value: 'Crítico' },
                  { label: 'Horas hombre', value: '4 h' },
                ],
                action: {
                  label: 'Ver incidente',
                  onClick: onVerIncidente,
                },
              }
            );
          }}
        >
          Emitir Cierre
        </button>
      );
    }

    render(
      <ToastProvider>
        <RichToastConsumer />
      </ToastProvider>
    );

    act(() => {
      screen.getByRole('button', { name: 'Emitir Cierre' }).click();
    });

    expect(screen.getByText('Cierre de Cuadrilla — Atención Requerida')).toBeDefined();
    expect(screen.getByText('INC-2026-0004')).toBeDefined();
    expect(screen.getByText('Crítica')).toBeDefined();
    expect(screen.queryByText('CRITICA')).toBeNull();
    expect(screen.getByText('Estado final del terreno:')).toBeDefined();
    expect(screen.getByText('Crítico')).toBeDefined();

    act(() => {
      screen.getByRole('button', { name: /Ver incidente/i }).click();
    });
    expect(onVerIncidente).toHaveBeenCalledTimes(1);
  });
});

