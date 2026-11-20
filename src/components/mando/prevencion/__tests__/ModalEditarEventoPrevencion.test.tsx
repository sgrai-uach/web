import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModalEditarEventoPrevencion } from '../ModalEditarEventoPrevencion';
import * as prevencionService from '@/services/prevencionService';
import * as recursosService from '@/services/recursosService';
import type { EventoPrevencionListItemDTO, EventoPrevencionDTO } from '@/types/evento-prevencion';

const mockShowToast = vi.fn();

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
  useOptionalToast: () => ({ showToast: mockShowToast }),
}));

vi.mock('@/services/recursosService', () => ({
  getRecursos: vi.fn(),
}));

vi.mock('@/services/prevencionService', async (importOriginal) => {
  const actual = await importOriginal<typeof prevencionService>();
  return {
    ...actual,
    editarEventoPrevencion: vi.fn(),
  };
});

describe('ModalEditarEventoPrevencion (H77)', () => {
  const mockEvento: EventoPrevencionListItemDTO = {
    id: 'ev-123',
    codigo: 'PREV-2026-0001',
    nombre: 'Limpieza de colectores en Angachilla',
    descripcion: 'Inspección y limpieza de sumideros previos al frente de lluvia.',
    sector: 'Angachilla',
    direccionTexto: 'Av. Simpson 1200',
    prioridad: 'ALTA',
    estado: 'EN_CURSO',
    latitud: -39.8456,
    longitud: -73.2389,
    delegacion: { id: 'del-sur', codigo: 'SUR', nombre: 'Delegación Sur' },
    puntoCritico: null,
    patrulla: { id: 'pat-1', nombre: 'Patrulla Sur', estado: 'EN_PREVENCION' },
    cuadrilla: null,
    mision: null,
    recursos: [
      {
        recursoId: 'rec-1',
        nombre: 'Sacos de Arena 25kg',
        cantidadAsignada: 10,
      },
    ],
    fechaEstimadaFin: '2026-11-26T20:00:00.000Z',
    creadoPorId: 'user-1',
    actualizadoPorId: null,
    creadoEn: '2026-11-19T10:00:00.000Z',
    actualizadoEn: '2026-11-19T10:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(recursosService.getRecursos).mockResolvedValue({
      data: [
        {
          id: 'rec-1',
          codigo: 'REC-001',
          nombre: 'Sacos de Arena 25kg',
          tipo: 'INSUMO',
          estado: 'DISPONIBLE',
          cantidadTotal: 50,
          cantidadDisponible: 40,
        },
        {
          id: 'rec-2',
          codigo: 'REC-002',
          nombre: 'Motobomba Portátil',
          tipo: 'MAQUINARIA',
          estado: 'DISPONIBLE',
          cantidadTotal: 4,
          cantidadDisponible: 4,
        },
      ] as unknown as Awaited<ReturnType<typeof recursosService.getRecursos>>['data'],
      meta: { total: 2, pagina: 1, limite: 100, totalPaginas: 1 },
    });
  });

  it('debe precargar los valores actuales del evento al abrir el modal', async () => {
    render(
      <ModalEditarEventoPrevencion
        isOpen={true}
        evento={mockEvento}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('Limpieza de colectores en Angachilla')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('Inspección y limpieza de sumideros previos al frente de lluvia.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Agregar Recurso/i })).not.toBeInTheDocument();
  });

  it('debe mostrar error en cliente si se intenta guardar sin modificar ningún campo', async () => {
    render(
      <ModalEditarEventoPrevencion
        isOpen={true}
        evento={mockEvento}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    expect(
      await screen.findByText(/Debe modificar al menos un campo antes de guardar los cambios/i)
    ).toBeInTheDocument();
    expect(prevencionService.editarEventoPrevencion).not.toHaveBeenCalled();
  });

  it('debe validar con Zod la longitud mínima de la descripción de tareas', async () => {
    render(
      <ModalEditarEventoPrevencion
        isOpen={true}
        evento={mockEvento}
        onClose={vi.fn()}
      />
    );

    const textarea = screen.getByLabelText(/Descripción de Tareas Planificadas/i);
    fireEvent.change(textarea, { target: { value: 'abc' } });

    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    expect(
      await screen.findByText(/La descripción de tareas debe tener al menos 5 caracteres/i)
    ).toBeInTheDocument();
    expect(prevencionService.editarEventoPrevencion).not.toHaveBeenCalled();
  });

  it('debe enviar solo los campos modificados y cerrar el modal en 200 OK', async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const mockActualizado = {
      ...mockEvento,
      prioridad: 'CRITICA',
      descripcion: 'Despeje urgente de rejillas por alerta meteorológica.',
    } as unknown as EventoPrevencionDTO;

    vi.mocked(prevencionService.editarEventoPrevencion).mockResolvedValueOnce(mockActualizado);

    render(
      <ModalEditarEventoPrevencion
        isOpen={true}
        evento={mockEvento}
        onClose={onClose}
        onSuccess={onSuccess}
        userId="encargado-99"
      />
    );

    fireEvent.change(screen.getByLabelText(/Prioridad Operativa/i), {
      target: { value: 'CRITICA' },
    });
    fireEvent.change(screen.getByLabelText(/Descripción de Tareas Planificadas/i), {
      target: { value: 'Despeje urgente de rejillas por alerta meteorológica.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    await waitFor(() => {
      expect(prevencionService.editarEventoPrevencion).toHaveBeenCalledWith(
        'ev-123',
        {
          prioridad: 'CRITICA',
          descripcion: 'Despeje urgente de rejillas por alerta meteorológica.',
        },
        'encargado-99'
      );
    });

    expect(mockShowToast).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(mockActualizado);
    expect(onClose).toHaveBeenCalled();
  });

  it('debe mostrar el mensaje 409 Conflict dentro del modal sin cerrarlo', async () => {
    const onClose = vi.fn();
    vi.mocked(prevencionService.editarEventoPrevencion).mockRejectedValueOnce(
      new prevencionService.PrevencionServiceError(
        'No se puede editar un evento de prevención en estado COMPLETADA.',
        {
          statusCode: 409,
          tipoConflicto: 'ESTADO_BLOQUEADO',
        }
      )
    );

    render(
      <ModalEditarEventoPrevencion
        isOpen={true}
        evento={mockEvento}
        onClose={onClose}
      />
    );

    fireEvent.change(screen.getByLabelText(/Descripción de Tareas Planificadas/i), {
      target: { value: 'Actualización de tareas urgentes.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    expect(
      await screen.findByText('No se puede editar un evento de prevención en estado COMPLETADA.')
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
