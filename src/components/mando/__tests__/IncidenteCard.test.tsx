import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IncidenteCard } from '../IncidenteCard';
import type { IncidenteResumen } from '@/services/incidentesService';

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

  it('debe renderizar botón "Asignar Patrulla" en estado REPORTADO y llamar onAsignarPatrulla sin propagar', () => {
    const handleClick = vi.fn();
    const handleAsignar = vi.fn();
    render(
      <IncidenteCard
        incidente={mockIncidente} // estado: REPORTADO
        onClick={handleClick}
        onAsignarPatrulla={handleAsignar}
      />
    );

    const btnAsignar = screen.getByRole('button', {
      name: /Asignar patrulla verificadora al incidente INC-58291045/i,
    });
    expect(btnAsignar).toBeDefined();

    fireEvent.click(btnAsignar);

    expect(handleAsignar).toHaveBeenCalledTimes(1);
    expect(handleAsignar).toHaveBeenCalledWith(mockIncidente);
    // No debe abrir el drawer (stopPropagation)
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('NO debe renderizar botón "Asignar Patrulla" si el incidente ya está en otro estado (ej. VERIFICANDO)', () => {
    const handleAsignar = vi.fn();
    render(
      <IncidenteCard
        incidente={{ ...mockIncidente, estado: 'VERIFICANDO' }}
        onClick={vi.fn()}
        onAsignarPatrulla={handleAsignar}
      />
    );

    const btnAsignar = screen.queryByRole('button', {
      name: /Asignar patrulla verificadora/i,
    });
    expect(btnAsignar).toBeNull();
  });

  it('NO debe renderizar botón "Asignar Patrulla" si puedeAsignarPatrulla es false por falta de permisos (BUG-03)', () => {
    const handleAsignar = vi.fn();
    render(
      <IncidenteCard
        incidente={mockIncidente} // estado: REPORTADO
        onClick={vi.fn()}
        onAsignarPatrulla={handleAsignar}
        puedeAsignarPatrulla={false}
      />
    );

    const btnAsignar = screen.queryByRole('button', {
      name: /Asignar patrulla verificadora/i,
    });
    expect(btnAsignar).toBeNull();
  });

  it('muestra el indicador directo de lectura/no lectura en la tarjeta Kanban según trazabilidadNotificacion', () => {
    const { rerender } = render(
      <IncidenteCard
        incidente={{ ...mockIncidente, estado: 'VERIFICANDO' }}
        onClick={vi.fn()}
        trazabilidadNotificacion="PENDIENTE_ENVIO"
      />
    );

    const cardOffline = screen.getByTestId('card-trazabilidad-inc-001');
    expect(cardOffline.textContent).toContain('NO LEÍDA');
    expect(cardOffline.textContent).toContain('Sin señal / offline');
    expect(cardOffline.style.borderRadius).toBe('0px');

    rerender(
      <IncidenteCard
        incidente={{ ...mockIncidente, estado: 'VERIFICANDO' }}
        onClick={vi.fn()}
        trazabilidadNotificacion="LEIDA"
      />
    );

    const cardLeida = screen.getByTestId('card-trazabilidad-inc-001');
    expect(cardLeida.textContent).toContain('LEÍDA');
    expect(cardLeida.textContent).toContain('Leída por operador en terreno');
    expect(/\p{Extended_Pictographic}/u.test(cardLeida.textContent || '')).toBe(false);
  });

  it('muestra aviso SIN ACUSE en tarjetas VERIFICANDO sin confirmación recibida aún', () => {
    render(
      <IncidenteCard
        incidente={{ ...mockIncidente, estado: 'VERIFICANDO' }}
        onClick={vi.fn()}
      />
    );

    const aviso = screen.getByTestId('card-trazabilidad-pendiente-inc-001');
    expect(aviso.textContent).toContain('SIN ACUSE');
    expect(aviso.textContent).toContain('Lectura aún no confirmada');
    expect(aviso.style.flexDirection).toBe('column');
    expect(aviso.style.flexShrink).toBe('0');
    expect(aviso.style.overflow).toBe('hidden');
    expect(aviso.style.borderRadius).toBe('0px');
  });

  it('mantiene diseño apilado y contenido contenido dentro de la caja de trazabilidad ante direcciones extensas', () => {
    const direccionLarga = 'a'.repeat(120);
    render(
      <IncidenteCard
        incidente={{
          ...mockIncidente,
          estado: 'VERIFICANDO',
          direccion: direccionLarga,
        }}
        onClick={vi.fn()}
        trazabilidadNotificacion="RECIBIDA"
      />
    );

    const cardBox = screen.getByTestId('card-trazabilidad-inc-001');
    expect(cardBox.style.flexDirection).toBe('column');
    expect(cardBox.style.flexShrink).toBe('0');
    expect(cardBox.style.width).toBe('100%');
    expect(cardBox.style.overflow).toBe('hidden');
    expect(cardBox.style.borderRadius).toBe('0px');
    expect(cardBox.textContent).toContain('RECIBIDA (SIN LEER)');
    expect(cardBox.textContent).toContain('Recibida · pendiente lectura');
    expect(screen.getByText(direccionLarga)).toBeDefined();
  });
});
