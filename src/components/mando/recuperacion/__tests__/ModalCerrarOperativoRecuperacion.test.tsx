import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModalCerrarOperativoRecuperacion } from '../ModalCerrarOperativoRecuperacion';
import * as recuperacionService from '@/services/recuperacionService';
import type {
  CerrarOperativoRecuperacionData,
  OperativoRecuperacionDetalle,
} from '@/types/recuperacion';

const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

vi.mock('@/components/ui/Toast', () => ({
  useOptionalToast: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
    showWarning: vi.fn(),
    showInfo: vi.fn(),
    showToast: vi.fn(),
    removeToast: vi.fn(),
  }),
}));

const operativoBase: OperativoRecuperacionDetalle = {
  id: '70000000-0000-4000-8000-000000000001',
  codigo: 'REC-2026-0001',
  nombre: 'Entrega de kits de emergencia en Collico',
  descripcion: 'Operativo activo en terreno',
  sector: 'Collico',
  direccionTexto: 'Balmaceda 1245',
  prioridad: 'ALTA',
  contactoNombre: null,
  contactoTelefono: null,
  latitud: -39.8142,
  longitud: -73.2459,
  estado: 'EN_EJECUCION',
  familiasAfectadas: 5,
  delegacion: { id: '30000000-0000-4000-8000-000000000001', codigo: 'SUR', nombre: 'Delegación Sur' },
  creadoPor: { id: '00000000-0000-4000-8000-000000000003', nombre: 'Encargado' },
  mision: {
    id: '60000000-0000-4000-8000-000000000001',
    codigo: 'MIS-2026-0001',
    titulo: 'Entrega de kits',
    estado: 'EN_CURSO',
    tipoMision: 'RECUPERACION',
  },
  patrulla: {
    id: '50000000-0000-4000-8000-000000000001',
    nombre: 'Patrulla Alfa',
    estado: 'EN_RECUPERACION',
  },
  recursos: [
    {
      recursoId: '80000000-0000-4000-8000-000000000001',
      nombre: 'Frazadas Térmicas',
      cantidadAsignada: 10,
    },
    {
      recursoId: '80000000-0000-4000-8000-000000000002',
      nombre: 'Sacos de Arena 25kg',
      cantidadAsignada: 5,
    },
  ],
  cantidadInsumosAsignados: 15,
  totalTiposInsumos: 2,
  historial: [],
  creadoEn: '2026-11-10T10:00:00.000Z',
  actualizadoEn: '2026-11-10T11:00:00.000Z',
  fechaEstimadaFin: null,
  actualizadoPorId: null,
  fechaCierre: null,
  observacionesCierre: null,
  cerradoPorId: null,
};

describe('ModalCerrarOperativoRecuperacion (HU-75)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calcula dinámicamente el remanente a devolver al inventario al modificar el consumo', () => {
    render(
      <ModalCerrarOperativoRecuperacion
        isOpen={true}
        operativo={operativoBase}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    const inputFrazadas = screen.getByLabelText(
      'Cantidad consumida de Frazadas Térmicas'
    ) as HTMLInputElement;
    expect(inputFrazadas.value).toBe('10');

    fireEvent.change(inputFrazadas, { target: { value: '7' } });

    expect(screen.getByText('3 un.')).toBeInTheDocument();
    expect(screen.getByText(/A reintegrar a bodega:/i)).toBeInTheDocument();
  });

  it('impide enviar si el resumen de cierre tiene menos de 10 caracteres o el consumo supera lo asignado', async () => {
    const cerrarSpy = vi.spyOn(recuperacionService, 'cerrarOperativoRecuperacion');

    render(
      <ModalCerrarOperativoRecuperacion
        isOpen={true}
        operativo={operativoBase}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    const textarea = screen.getByLabelText('Resumen formal de cierre');
    fireEvent.change(textarea, { target: { value: 'Corto' } });

    const form = textarea.closest('form')!;
    fireEvent.submit(form);

    expect(
      await screen.findByText(/El resumen de cierre debe tener al menos 10 caracteres/i)
    ).toBeInTheDocument();
    expect(cerrarSpy).not.toHaveBeenCalled();

    const inputFrazadas = screen.getByLabelText('Cantidad consumida de Frazadas Térmicas');
    fireEvent.change(inputFrazadas, { target: { value: '12' } });
    fireEvent.change(textarea, {
      target: { value: 'Se entregaron frazadas y sacos en sector Collico.' },
    });

    fireEvent.submit(form);

    expect(
      await screen.findByText(/No puede superar las 10 unidades asignadas/i)
    ).toBeInTheDocument();
    expect(cerrarSpy).not.toHaveBeenCalled();
  });

  it('envía el cierre con consumos, muestra toast y ejecuta onSuccess y onClose', async () => {
    const respuestaData: CerrarOperativoRecuperacionData = {
      evento: {
        ...operativoBase,
        estado: 'COMPLETADA',
        patrulla: {
          id: '50000000-0000-4000-8000-000000000001',
          nombre: 'Patrulla Alfa',
          estado: 'DISPONIBLE',
        },
        mision: {
          id: '60000000-0000-4000-8000-000000000001',
          codigo: 'MIS-2026-0001',
          titulo: 'Entrega de kits',
          estado: 'COMPLETADA',
          tipoMision: 'RECUPERACION',
        },
        recursos: [
          {
            recursoId: '80000000-0000-4000-8000-000000000001',
            nombre: 'Frazadas Térmicas',
            cantidadAsignada: 10,
            cantidadConsumida: 7,
            cantidadDevuelta: 3,
            devueltoEn: '2026-11-20T18:00:00.000Z',
          },
          {
            recursoId: '80000000-0000-4000-8000-000000000002',
            nombre: 'Sacos de Arena 25kg',
            cantidadAsignada: 5,
            cantidadConsumida: 5,
            cantidadDevuelta: 0,
            devueltoEn: '2026-11-20T18:00:00.000Z',
          },
        ],
        creadoPorId: '00000000-0000-4000-8000-000000000003',
        fechaCierre: '2026-11-20T18:00:00.000Z',
        observacionesCierre: 'Se entregaron 7 frazadas y 5 sacos; sector despejado.',
        cerradoPorId: '00000000-0000-4000-8000-000000000003',
      },
      recursosReintegrados: [
        {
          recursoId: '80000000-0000-4000-8000-000000000001',
          nombre: 'Frazadas Térmicas',
          esIndividual: false,
          cantidadAsignada: 10,
          cantidadConsumida: 7,
          cantidadDevuelta: 3,
          cantidadInventario: 23,
          cantidadEnUso: 0,
          estadoRecurso: 'DISPONIBLE',
        },
        {
          recursoId: '80000000-0000-4000-8000-000000000002',
          nombre: 'Sacos de Arena 25kg',
          esIndividual: false,
          cantidadAsignada: 5,
          cantidadConsumida: 5,
          cantidadDevuelta: 0,
          cantidadInventario: 10,
          cantidadEnUso: 0,
          estadoRecurso: 'DISPONIBLE',
        },
      ],
      mision: {
        id: '60000000-0000-4000-8000-000000000001',
        codigo: 'MIS-2026-0001',
        estado: 'COMPLETADA',
      },
      patrullaLiberada: {
        id: '50000000-0000-4000-8000-000000000001',
        nombre: 'Patrulla Alfa',
        estado: 'DISPONIBLE',
      },
    };

    const cerrarSpy = vi
      .spyOn(recuperacionService, 'cerrarOperativoRecuperacion')
      .mockResolvedValueOnce({
        message: 'Operativo de recuperación concluido exitosamente.',
        data: respuestaData,
      });

    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <ModalCerrarOperativoRecuperacion
        isOpen={true}
        operativo={operativoBase}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText('Resumen formal de cierre'), {
      target: { value: 'Se entregaron 7 frazadas y 5 sacos; sector despejado.' },
    });
    fireEvent.change(screen.getByLabelText('Cantidad consumida de Frazadas Térmicas'), {
      target: { value: '7' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Confirmar y Declarar Concluido/i }));

    await waitFor(() => {
      expect(cerrarSpy).toHaveBeenCalledWith(
        operativoBase.id,
        {
          resumenCierre: 'Se entregaron 7 frazadas y 5 sacos; sector despejado.',
          consumos: [
            { recursoId: '80000000-0000-4000-8000-000000000001', cantidadConsumida: 7 },
            { recursoId: '80000000-0000-4000-8000-000000000002', cantidadConsumida: 5 },
          ],
        },
        undefined
      );
    });

    expect(mockShowSuccess).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(respuestaData);
    expect(onClose).toHaveBeenCalled();
  });

  it('muestra alerta de error y mantiene el modal abierto ante 409 Conflict', async () => {
    vi.spyOn(recuperacionService, 'cerrarOperativoRecuperacion').mockRejectedValueOnce(
      new recuperacionService.RecuperacionServiceError(
        'Solo se pueden cerrar operativos en estado EN_EJECUCION.',
        { statusCode: 409, tipoConflicto: 'ESTADO_BLOQUEADO' }
      )
    );

    const onClose = vi.fn();
    render(
      <ModalCerrarOperativoRecuperacion
        isOpen={true}
        operativo={operativoBase}
        onClose={onClose}
        onSuccess={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText('Resumen formal de cierre'), {
      target: { value: 'Intento de cierre sobre operativo no elegible.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar y Declarar Concluido/i }));

    expect(
      await screen.findByText(/Solo se pueden cerrar operativos en estado EN_EJECUCION/i)
    ).toBeInTheDocument();
    expect(mockShowError).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
