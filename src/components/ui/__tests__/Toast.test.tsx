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
});

