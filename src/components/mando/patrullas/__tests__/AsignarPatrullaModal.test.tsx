import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AsignarPatrullaModal } from '../AsignarPatrullaModal';
import * as patrullasService from '@/services/patrullasService';
import * as misionesService from '@/services/misionesService';
import type { PatrullaVerificadoraDTO } from '@/types/patrullas';

// Mock de Toast
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

describe('AsignarPatrullaModal (HU-20: Despacho de Patrulla Verificadora)', () => {
  const mockIncidente = {
    id: 'inc-001',
    codigo: 'INC-2026-1042',
    tipoAfectacion: 'Anegamiento',
    direccion: 'Av. Las Ánimas 450, Valdivia',
    prioridad: 'ALTA',
  };

  const mockPatrullasDisponibles: PatrullaVerificadoraDTO[] = [
    {
      id: 'pat-001',
      nombre: 'Patrulla Ánimas Norte 1',
      estado: 'DISPONIBLE',
      delegacion: {
        id: 'del-01',
        nombre: 'Delegación Norte',
        codigo: 'DEL_NORTE',
      },
      lider: {
        id: 'user-01',
        nombre: 'Juan Pérez',
        email: 'juan.perez@valdivia.cl',
        telefono: '+56911223344',
      },
    },
    {
      id: 'pat-002',
      nombre: 'Patrulla Centro 2',
      estado: 'DISPONIBLE',
      delegacion: {
        id: 'del-02',
        nombre: 'Delegación Centro',
        codigo: 'DEL_CENTRO',
      },
      lider: {
        id: 'user-02',
        nombre: 'María Soto',
        email: 'maria.soto@valdivia.cl',
        telefono: '+56955667788',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no renderiza nada si isOpen es false', () => {
    const { container } = render(
      <AsignarPatrullaModal
        isOpen={false}
        onClose={vi.fn()}
        incidente={mockIncidente}
        onAsignacionExitosa={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('carga y renderiza las patrullas disponibles en el selector', async () => {
    vi.spyOn(patrullasService, 'listarPatrullasDisponibles').mockResolvedValueOnce({
      exito: true,
      data: mockPatrullasDisponibles,
      meta: { total: 2, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrev: false },
      mensaje: 'OK',
    });

    render(
      <AsignarPatrullaModal
        isOpen={true}
        onClose={vi.fn()}
        incidente={mockIncidente}
        onAsignacionExitosa={vi.fn()}
      />
    );

    expect(screen.getByText(/Asignar Patrulla Verificadora/i)).toBeInTheDocument();
    expect(screen.getByText(/Incidente: INC-2026-1042/i)).toBeInTheDocument();
    expect(screen.getByText(/Anegamiento/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    expect(screen.getByText(/Patrulla Ánimas Norte 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Patrulla Centro 2/i)).toBeInTheDocument();
  });

  it('despacha exitosamente la patrulla seleccionada', async () => {
    vi.spyOn(patrullasService, 'listarPatrullasDisponibles').mockResolvedValueOnce({
      exito: true,
      data: mockPatrullasDisponibles,
      meta: { total: 2, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrev: false },
      mensaje: 'OK',
    });

    const mockDespachoResponse = {
      exito: true,
      mensaje: 'Misión despachada exitosamente',
      data: {
        mision: {
          id: 'mis-50',
          codigo: 'MIS-2026-8341',
          titulo: 'Verificación: Anegamiento - INC-2026-1042',
          estado: 'DESPACHADA' as const,
          tipoMision: 'VERIFICACION' as const,
        },
        incidente: {
          id: 'inc-001',
          codigo: 'INC-2026-1042',
          estado: 'VERIFICANDO' as const,
        },
        patrulla: {
          id: 'pat-001',
          nombre: 'Patrulla Ánimas Norte 1',
          estado: 'EN_VERIFICACION' as const,
        },
      },
    };

    const despacharSpy = vi
      .spyOn(misionesService, 'despacharPatrullaVerificadora')
      .mockResolvedValueOnce(mockDespachoResponse);

    const onAsignacionExitosaMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <AsignarPatrullaModal
        isOpen={true}
        onClose={onCloseMock}
        incidente={mockIncidente}
        onAsignacionExitosa={onAsignacionExitosaMock}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', { name: /Confirmar y Despachar/i });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(despacharSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          incidenteId: 'inc-001',
          patrullaId: 'pat-001',
          prioridad: 'ALTA',
        }),
        undefined
      );
    });

    expect(onAsignacionExitosaMock).toHaveBeenCalledWith(mockDespachoResponse.data);
    expect(onCloseMock).toHaveBeenCalled();
    expect(mockShowSuccess).toHaveBeenCalledWith(
      expect.stringContaining('MIS-2026-8341'),
      'Despacho Confirmado'
    );
  });

  it('maneja el error 409 Conflict y refresca automáticamente las patrullas disponibles', async () => {
    const listarSpy = vi
      .spyOn(patrullasService, 'listarPatrullasDisponibles')
      .mockResolvedValueOnce({
        exito: true,
        data: mockPatrullasDisponibles,
        meta: { total: 2, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrev: false },
        mensaje: 'OK',
      })
      .mockResolvedValueOnce({
        exito: true,
        data: [mockPatrullasDisponibles[1]], // ahora solo queda la segunda
        meta: { total: 1, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrev: false },
        mensaje: 'OK',
      });

    vi.spyOn(misionesService, 'despacharPatrullaVerificadora').mockResolvedValueOnce({
      exito: false,
      esConflicto: true,
      codigoError: 409,
      mensaje: 'La patrulla seleccionada ya no se encuentra disponible. Por favor selecciona otra patrulla.',
    });

    render(
      <AsignarPatrullaModal
        isOpen={true}
        onClose={vi.fn()}
        incidente={mockIncidente}
        onAsignacionExitosa={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', { name: /Confirmar y Despachar/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/La patrulla seleccionada ya no se encuentra disponible/i)
      ).toBeInTheDocument();
    });

    expect(mockShowError).toHaveBeenCalledWith(
      expect.stringContaining('ya no se encuentra disponible'),
      'Conflicto de Disponibilidad'
    );
    expect(listarSpy).toHaveBeenCalledTimes(2);
  });

  it('muestra mensaje informativo y deshabilita confirmación si no hay patrullas disponibles', async () => {
    vi.spyOn(patrullasService, 'listarPatrullasDisponibles').mockResolvedValueOnce({
      exito: true,
      data: [],
      meta: { total: 0, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrev: false },
      mensaje: 'OK',
    });

    render(
      <AsignarPatrullaModal
        isOpen={true}
        onClose={vi.fn()}
        incidente={mockIncidente}
        onAsignacionExitosa={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Actualmente no existen patrullas verificadoras en estado/i)
      ).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', { name: /Confirmar y Despachar/i });
    expect(submitBtn).toBeDisabled();
  });

  it('maneja error 403 Forbidden por permisos insuficientes', async () => {
    vi.spyOn(patrullasService, 'listarPatrullasDisponibles').mockResolvedValueOnce({
      exito: true,
      data: mockPatrullasDisponibles,
      meta: { total: 2, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrev: false },
      mensaje: 'OK',
    });

    vi.spyOn(misionesService, 'despacharPatrullaVerificadora').mockResolvedValueOnce({
      exito: false,
      esForbidden: true,
      codigoError: 403,
      mensaje: 'No cuenta con el permiso requerido (misiones:asignar).',
    });

    render(
      <AsignarPatrullaModal
        isOpen={true}
        onClose={vi.fn()}
        incidente={mockIncidente}
        onAsignacionExitosa={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', { name: /Confirmar y Despachar/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/misiones:asignar/i)).toBeInTheDocument();
    });

    expect(mockShowError).toHaveBeenCalledWith(
      expect.stringContaining('misiones:asignar'),
      'Acceso Denegado'
    );
  });
});
