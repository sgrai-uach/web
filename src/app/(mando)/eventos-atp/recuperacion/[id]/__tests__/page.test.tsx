import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DetalleEventoRecuperacionPage, { generateMetadata } from '../page';

vi.mock('@/components/recuperacion/DetalleEventoRecuperacionClient', () => ({
  DetalleEventoRecuperacionClient: ({ id }: { id: string }) => (
    <div data-testid="mock-detalle-client">Detalle Cliente: {id}</div>
  ),
}));

describe('DetalleEventoRecuperacionPage', () => {
  it('renderiza DetalleEventoRecuperacionClient con el id provisto en los params', async () => {
    const paramsPromise = Promise.resolve({ id: 'rec-test-123' });
    const Component = await DetalleEventoRecuperacionPage({ params: paramsPromise });
    render(Component);

    expect(screen.getByTestId('mock-detalle-client')).toHaveTextContent('Detalle Cliente: rec-test-123');
  });

  it('genera los metadatos correctos para la página', async () => {
    const paramsPromise = Promise.resolve({ id: 'rec-test-123' });
    const metadata = await generateMetadata({ params: paramsPromise });

    expect(metadata.title).toContain('Evento de Recuperación rec-test-123');
    expect(metadata.description).toContain('Ficha operativa y asignación de patrullas');
  });
});
