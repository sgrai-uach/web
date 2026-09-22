import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IncidenteCard } from '../IncidenteCard';
import type { IncidenteResumen } from '@/lib/api/incidentes';

const mockIncidente: IncidenteResumen = {
  id: 'inc-001',
  codigo: 'INC-58291045',
  codigoSeguimiento: '58291045',
  tipoAfectacion: 'Caída de árbol',
  descripcion: 'Árbol sobre tendido eléctrico',
  direccion: 'Los Robles 300, Isla Teja',
  latitud: -39.8089,
  longitud: -73.2534,
  estado: 'REPORTADO',
  prioridad: 'CRITICA',
  requiereAsistenciaSocial: true,
  fuenteOrigen: 'CHATBOT',
  informanteNombre: 'Vecino Ejemplo',
  delegacionNombre: 'Isla Teja',
  totalMisiones: 2,
  creadoEn: '2026-09-22T10:00:00Z',
  actualizadoEn: '2026-09-22T10:00:00Z',
};

describe('IncidenteCard', () => {
  it('debe renderizar el código, tipo de afectación, dirección y prioridad crítica', () => {
    const handleClick = vi.fn();
    render(<IncidenteCard incidente={mockIncidente} onClick={handleClick} />);

    expect(screen.getByText('INC-58291045')).toBeDefined();
    expect(screen.getByText('Caída de árbol')).toBeDefined();
    expect(screen.getByText('Los Robles 300, Isla Teja')).toBeDefined();
    expect(screen.getByText('CRITICA')).toBeDefined();
    expect(screen.getByText('FIBE')).toBeDefined();
    expect(screen.getByText('2 misiones')).toBeDefined();
    expect(screen.getByText('Isla Teja')).toBeDefined();
  });

  it('debe invocar onClick al hacer clic sobre la tarjeta', () => {
    const handleClick = vi.fn();
    render(<IncidenteCard incidente={mockIncidente} onClick={handleClick} />);

    const card = screen.getByRole('button', {
      name: /Ver detalles del incidente INC-58291045/i,
    });
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(mockIncidente);
  });

  it('debe invocar onClick al presionar Enter sobre la tarjeta', () => {
    const handleClick = vi.fn();
    render(<IncidenteCard incidente={mockIncidente} onClick={handleClick} />);

    const card = screen.getByRole('button', {
      name: /Ver detalles del incidente INC-58291045/i,
    });
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
