import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DetalleEventoPrevencionPage, { generateMetadata } from '../page';

vi.mock('@/components/prevencion/DetalleEventoPrevencionClient', () => ({
  DetalleEventoPrevencionClient: ({ id }: { id: string }) => (
    <div data-testid="mock-detalle-prevencion-client">Detalle Prevención: {id}</div>
  ),
}));

describe('DetalleEventoPrevencionPage', () => {
  it('renderiza DetalleEventoPrevencionClient con el id provisto en los params', async () => {
    const paramsPromise = Promise.resolve({ id: 'prev-test-123' });
    const Component = await DetalleEventoPrevencionPage({ params: paramsPromise });
    render(Component);

    expect(screen.getByTestId('mock-detalle-prevencion-client')).toHaveTextContent(
      'Detalle Prevención: prev-test-123'
    );
  });

  it('genera los metadatos correctos para la página', async () => {
    const paramsPromise = Promise.resolve({ id: 'prev-test-123' });
    const metadata = await generateMetadata({ params: paramsPromise });

    expect(metadata.title).toContain('Evento de Prevención prev-test-123');
    expect(metadata.description).toContain('Ficha operativa y asignación de patrullas');
  });
});
