import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EventoAsistenciaSocialDetalleModal from '../EventoAsistenciaSocialDetalleModal';
import type { DatosFichaAsistenciaSocial } from '../EventoAsistenciaSocialDetalleModal';

describe('EventoAsistenciaSocialDetalleModal', () => {
  const datosMock: DatosFichaAsistenciaSocial = {
    codigo: 'AS-2026-0001',
    descripcion: 'Anegamiento severo de vivienda en sector Isla Teja',
    tipoAfectacion: 'VIVIENDA_ANEGADA',
    prioridad: 'ALTA',
    personasAfectadas: 4,
    familiasAfectadas: 1,
    direccionTexto: 'Los Robles 1025, Isla Teja',
    latitud: -39.8142,
    longitud: -73.2459,
    delegacionNombre: 'Delegación Costa / Niebla',
    incidenteCodigo: 'INC-2026-0088',
    contactoNombre: 'Juan Valenzuela',
    contactoTelefono: '+56987654321',
    contactoRut: '12.345.678-9',
    creadoPorNombre: 'Encargado de Operaciones',
    creadoEn: '2026-10-05T14:00:00.000Z',
    estado: 'PENDIENTE',
  };

  it('no debe renderizar nada si isOpen es false', () => {
    const { container } = render(
      <EventoAsistenciaSocialDetalleModal
        isOpen={false}
        onClose={vi.fn()}
        datos={datosMock}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar todos los datos de la ficha cuando está abierto', () => {
    render(
      <EventoAsistenciaSocialDetalleModal
        isOpen={true}
        onClose={vi.fn()}
        datos={datosMock}
      />
    );

    expect(screen.getByText(/Ficha de Asistencia Social FIBE/i)).toBeDefined();
    expect(screen.getByText('AS-2026-0001')).toBeDefined();
    expect(screen.getByText(/Anegamiento severo de vivienda en sector Isla Teja/i)).toBeDefined();
    expect(screen.getByText('Los Robles 1025, Isla Teja')).toBeDefined();
    expect(screen.getByText(/-39\.8142, -73\.2459/i)).toBeDefined();
    expect(screen.getByText(/Delegación Costa \/ Niebla/i)).toBeDefined();
    expect(screen.getByText('INC-2026-0088')).toBeDefined();
    expect(screen.getByText('Juan Valenzuela')).toBeDefined();
    expect(screen.getByText('+56987654321')).toBeDefined();
    expect(screen.getByText('12.345.678-9')).toBeDefined();
    expect(screen.getByText(/Encargado de Operaciones/i)).toBeDefined();
  });

  it('debe mostrar título de vista previa y botón de confirmar cuando esVistaPrevia es true', () => {
    const handleConfirmar = vi.fn();
    render(
      <EventoAsistenciaSocialDetalleModal
        isOpen={true}
        onClose={vi.fn()}
        datos={datosMock}
        esVistaPrevia={true}
        onConfirmarGuardado={handleConfirmar}
      />
    );

    expect(screen.getByText(/Ficha de Evento Social \(Vista Previa\)/i)).toBeDefined();
    expect(screen.getByText(/Borrador en Pantalla/i)).toBeDefined();

    const confirmarBtn = screen.getByRole('button', { name: /Confirmar y Guardar Evento/i });
    expect(confirmarBtn).toBeDefined();

    fireEvent.click(confirmarBtn);
    expect(handleConfirmar).toHaveBeenCalledTimes(1);
  });

  it('debe invocar onClose al hacer clic en Cerrar Ficha', () => {
    const handleClose = vi.fn();
    render(
      <EventoAsistenciaSocialDetalleModal
        isOpen={true}
        onClose={handleClose}
        datos={datosMock}
      />
    );

    const cerrarBtn = screen.getByRole('button', { name: /Cerrar Ficha/i });
    fireEvent.click(cerrarBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
