import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventoAtpForm from '../EventoAtpForm';
import * as eventosAtpService from '@/services/eventosAtpService';
import * as useCatalogosModule from '@/hooks/useCatalogos';
import type { EventoAtpDetalle } from '@/types/eventoAtp';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/gestion/admin/eventos-atp/nuevo',
}));

const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

vi.mock('@/context/SimulatedSessionContext', () => ({
  useSimulatedSession: () => ({
    usuarioActivo: {
      id: '00000000-0000-4000-8000-000000000001',
      rol: 'Administrador',
      esAdmin: true,
    },
  }),
}));

const delegaciones = [
  {
    id: '30000000-0000-4000-8000-000000000001',
    codigo: 'DEL_NORTE',
    nombre: 'Delegación Municipal Norte',
  },
  {
    id: '30000000-0000-4000-8000-000000000002',
    codigo: 'DEL_SUR',
    nombre: 'Delegación Municipal Sur',
  },
  {
    id: '30000000-0000-4000-8000-000000000003',
    codigo: 'DEL_COSTA',
    nombre: 'Delegación Municipal Costa',
  },
  {
    id: '30000000-0000-4000-8000-000000000004',
    codigo: 'DEL_CALLE_CALLE',
    nombre: 'Delegación Municipal Calle Calle',
  },
];

const eventoGuardado: EventoAtpDetalle = {
  id: '50000000-0000-4000-8000-000000000001',
  codigo: 'ATP-2026-0001',
  nombre: 'Sistema Frontal Mayo 2026',
  descripcion:
    'Sistema frontal con precipitaciones intensas y vientos moderados a fuertes durante 48 horas.',
  tipoAmenaza: 'METEOROLOGICA',
  nivelAlerta: 'AMARILLA',
  fechaInicio: '2026-05-01T10:00:00.000Z',
  fechaTermino: '2026-05-03T18:00:00.000Z',
  estado: 'ACTIVO',
  delegaciones: [delegaciones[0]],
  creadoPorId: '00000000-0000-4000-8000-000000000001',
  creadoEn: '2026-05-01T09:55:00.000Z',
  actualizadoEn: '2026-05-01T09:55:00.000Z',
};

function completarCamposObligatorios() {
  fireEvent.change(screen.getByLabelText(/Nombre del evento/i), {
    target: { value: 'Sistema Frontal Mayo 2026' },
  });
  fireEvent.change(screen.getByLabelText(/Descripción del evento/i), {
    target: {
      value:
        'Sistema frontal con precipitaciones intensas y vientos moderados a fuertes durante 48 horas.',
    },
  });
  fireEvent.change(screen.getByLabelText(/Fecha y hora de inicio/i), {
    target: { value: '2026-05-01T10:00' },
  });
  fireEvent.change(
    screen.getByLabelText(/Fecha y hora estimada de término/i),
    { target: { value: '2026-05-03T18:00' } }
  );
}

describe('EventoAtpForm (H61: Creación de Evento ATP)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(useCatalogosModule, 'useCatalogos').mockReturnValue({
      catalogos: {
        roles: [],
        especialidades: [],
        cargos: [],
        delegaciones,
      },
      cargando: false,
      error: null,
    } as unknown as ReturnType<typeof useCatalogosModule.useCatalogos>);
  });

  it('debe renderizar todos los campos y las cuatro delegaciones', () => {
    render(<EventoAtpForm />);

    expect(screen.getByLabelText(/Código identificador/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre del evento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción del evento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de amenaza/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Alerta Verde/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Alerta Amarilla/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Alerta Roja/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha y hora de inicio/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Fecha y hora estimada de término/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/Delegación Municipal Norte/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Delegación Municipal Sur/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Delegación Municipal Costa/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Delegación Municipal Calle Calle/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /Guardar Evento ATP/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Cancelar/i })
    ).toBeInTheDocument();
  });

  it('debe bloquear el envío y mostrar errores si faltan campos obligatorios', async () => {
    const spyCrear = vi.spyOn(eventosAtpService, 'crearEventoAtp');
    render(<EventoAtpForm />);

    fireEvent.click(
      screen.getByRole('button', { name: /Guardar Evento ATP/i })
    );

    expect(
      await screen.findByText(/El nombre del evento es obligatorio/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/La descripción es obligatoria/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Debe indicar una fecha y hora de inicio válida/i)
    ).toBeInTheDocument();
    expect(mockShowError).toHaveBeenCalledWith(
      expect.stringContaining('Por favor corrija los campos marcados'),
      'Formulario Incompleto'
    );
    expect(spyCrear).not.toHaveBeenCalled();
  });

  it('debe rechazar una fecha de término anterior a la fecha de inicio', async () => {
    const spyCrear = vi.spyOn(eventosAtpService, 'crearEventoAtp');
    render(<EventoAtpForm />);

    completarCamposObligatorios();
    fireEvent.change(
      screen.getByLabelText(/Fecha y hora estimada de término/i),
      { target: { value: '2026-04-30T18:00' } }
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Guardar Evento ATP/i })
    );

    expect(
      await screen.findByText(
        /La fecha y hora de término debe ser mayor o igual a la fecha y hora de inicio/i
      )
    ).toBeInTheDocument();
    expect(spyCrear).not.toHaveBeenCalled();
  });

  it('debe permitir seleccionar todas las delegaciones', async () => {
    vi.spyOn(eventosAtpService, 'crearEventoAtp').mockResolvedValueOnce(
      eventoGuardado
    );

    render(<EventoAtpForm />);

    completarCamposObligatorios();
    fireEvent.click(
      screen.getByRole('button', { name: /Seleccionar todas/i })
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Guardar Evento ATP/i })
    );

    await waitFor(() => {
      expect(eventosAtpService.crearEventoAtp).toHaveBeenCalledWith(
        expect.objectContaining({
          delegacionIds: delegaciones.map((delegacion) => delegacion.id),
        })
      );
    });
  });

  it('debe crear el evento, normalizar el código y mostrar la confirmación', async () => {
    const spyCrear = vi
      .spyOn(eventosAtpService, 'crearEventoAtp')
      .mockResolvedValueOnce(eventoGuardado);

    render(<EventoAtpForm />);

    fireEvent.change(screen.getByLabelText(/Código identificador/i), {
      target: { value: 'atp-2026-0001' },
    });
    completarCamposObligatorios();
    fireEvent.click(screen.getByLabelText(/Alerta Amarilla/i));
    fireEvent.click(screen.getByLabelText(/Delegación Municipal Norte/i));
    fireEvent.click(
      screen.getByRole('button', { name: /Guardar Evento ATP/i })
    );

    await waitFor(() => {
      expect(spyCrear).toHaveBeenCalledWith({
        codigo: 'ATP-2026-0001',
        nombre: 'Sistema Frontal Mayo 2026',
        descripcion:
          'Sistema frontal con precipitaciones intensas y vientos moderados a fuertes durante 48 horas.',
        tipoAmenaza: 'METEOROLOGICA',
        nivelAlerta: 'AMARILLA',
        fechaInicio: '2026-05-01T10:00',
        fechaTermino: '2026-05-03T18:00',
        delegacionIds: [delegaciones[0].id],
      });
    });

    expect(
      await screen.findByText(/Evento ATP registrado exitosamente/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText('ATP-2026-0001').length).toBeGreaterThan(0);
    expect(mockShowSuccess).toHaveBeenCalledWith(
      expect.stringContaining('ATP-2026-0001'),
      'Registro Exitoso'
    );
  });

  it('debe mostrar el error del servidor y los campos rechazados', async () => {
    vi.spyOn(eventosAtpService, 'crearEventoAtp').mockRejectedValueOnce(
      new eventosAtpService.EventoAtpServiceError({
        message: "Ya existe un Evento ATP registrado con el código 'ATP-2026-0001'.",
        statusCode: 409,
      })
    );

    render(<EventoAtpForm />);

    completarCamposObligatorios();
    fireEvent.click(
      screen.getByRole('button', { name: /Guardar Evento ATP/i })
    );

    expect(
      await screen.findByText(
        /Ya existe un Evento ATP registrado con el código/i
      )
    ).toBeInTheDocument();
    expect(mockShowError).toHaveBeenCalledWith(
      expect.stringContaining('Ya existe un Evento ATP'),
      'Error al guardar'
    );
  });

  it('debe volver al panel de administración al cancelar', () => {
    render(<EventoAtpForm />);

    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));

    expect(mockPush).toHaveBeenCalledWith('/gestion/admin');
  });
});
