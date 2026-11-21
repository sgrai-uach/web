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

    expect(screen.getByText(/Detalle de Evento de Asistencia Social/i)).toBeDefined();
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

    expect(screen.getByText(/Detalle de Evento de Asistencia Social \(Vista Previa\)/i)).toBeDefined();
    expect(screen.getByText(/Borrador en Pantalla/i)).toBeDefined();

    const confirmarBtn = screen.getByRole('button', { name: /Confirmar y Guardar Evento/i });
    expect(confirmarBtn).toBeDefined();

    fireEvent.click(confirmarBtn);
    expect(handleConfirmar).toHaveBeenCalledTimes(1);
  });

  it('debe invocar onClose al hacer clic en Cerrar Detalle', () => {
    const handleClose = vi.fn();
    render(
      <EventoAsistenciaSocialDetalleModal
        isOpen={true}
        onClose={handleClose}
        datos={datosMock}
      />
    );

    const cerrarBtn = screen.getByRole('button', { name: /Cerrar Detalle/i });
    fireEvent.click(cerrarBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('muestra indicador de Estimación Aproximada cuando no existen familias desglosadas', () => {
    render(
      <EventoAsistenciaSocialDetalleModal
        isOpen={true}
        onClose={vi.fn()}
        datos={{ ...datosMock, detallesEvaluacion: null }}
      />
    );

    expect(screen.getByTestId('ficha-desglose-demografico')).toBeDefined();
    expect(screen.getByText(/Estimación Aproximada \(Sin desglose por familia\)/i)).toBeDefined();
    expect(screen.getByText('No especificados')).toBeDefined();
  });

  it('muestra el desglose completo por familias, grupos vulnerables, compromiso habitacional y trazabilidad descartando aproximación previa', () => {
    render(
      <EventoAsistenciaSocialDetalleModal
        isOpen={true}
        onClose={vi.fn()}
        datos={{
          ...datosMock,
          estado: 'ASIGNADO',
          asistenteSocialNombre: 'Camila Valenzuela Castro',
          actualizadoEn: '2026-10-05T16:30:00.000Z',
          personasAfectadas: 99,
          familiasAfectadas: 99,
          detallesEvaluacion: {
            nivelCompromisoVivienda: 'GRAVE_INHABITABLE',
            danosEstimados: 'Pérdida total de enseres en dormitorio principal',
            familias: [
              {
                referencia: 'Familia Soto',
                nucleoFamiliarTotal: 4,
                cantidadNinos: 2,
                cantidadAdultosMayores: 1,
                personasDiscapacitadas: 1,
                personasElectrodependientes: 0,
                mascotasAfectadas: 1,
                nivelCompromisoVivienda: 'GRAVE_INHABITABLE',
                contactoNombre: 'Ana Soto',
                contactoTelefono: '+56911111111',
              },
              {
                referencia: 'Familia Ríos',
                nucleoFamiliarTotal: 2,
                cantidadNinos: 0,
                cantidadAdultosMayores: 1,
                personasDiscapacitadas: 0,
                personasElectrodependientes: 1,
                mascotasAfectadas: 0,
                nivelCompromisoVivienda: 'MODERADO',
                contactoNombre: 'Pedro Ríos',
                contactoTelefono: '+56922222222',
              },
            ],
          },
        }}
      />
    );

    expect(screen.getByText('ASIGNADO')).toBeDefined();
    expect(screen.getByText('Camila Valenzuela Castro')).toBeDefined();
    expect(screen.getByText(/Desglose por Familia \(2 hogares\)/i)).toBeDefined();
    expect(screen.getByText(/aproximación descartada/i)).toBeDefined();
    expect(screen.getByText('Pérdida total de enseres en dormitorio principal')).toBeDefined();
    expect(screen.getAllByText('Daño grave / Inhabitable').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByTestId('ficha-resumen-grupos-vulnerables')).toBeDefined();
    expect(screen.getByTestId('ficha-familia-item-0').textContent).toContain('Familia #1 — Familia Soto');
    expect(screen.getByTestId('ficha-familia-item-1').textContent).toContain('Familia #2 — Familia Ríos');
    expect(screen.getByTestId('detalle-contacto-familia-0').textContent).toContain('Ana Soto');
    expect(screen.getByTestId('detalle-contacto-familia-1').textContent).toContain('Pedro Ríos');
    expect(screen.queryByText('99')).toBeNull();
    expect(screen.getByText(/Última actualización:/i)).toBeDefined();
  });
});
