import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { SeguimientoDetalleClient } from '../SeguimientoDetalleClient';
import * as seguimientoApi from '@/lib/api/seguimiento';
import * as socketHook from '@/hooks/useSeguimientoSocket';

describe('SeguimientoDetalleClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar el estado de error amigable cuando el código no existe (404)', async () => {
    vi.spyOn(seguimientoApi, 'consultarSeguimientoIncidente').mockResolvedValueOnce({
      exito: false,
      codigoError: 404,
      mensaje: 'No encontramos ningún reporte con el código ingresado. Por favor, verifica el número entregado por el asistente.',
    });

    vi.spyOn(socketHook, 'useSeguimientoSocket').mockReturnValue({
      conectado: false,
      actualizadoEnVivo: false,
    });

    render(<SeguimientoDetalleClient codigo="99999999" />);

    await waitFor(() => {
      expect(screen.getByText('Reporte #99999999 No Encontrado')).toBeDefined();
    });

    expect(screen.getByText(/No encontramos ningún reporte con el código ingresado/i)).toBeDefined();
  });

  it('debe renderizar el stepper y la tarjeta de resumen ante una consulta exitosa', async () => {
    const mockDatos: seguimientoApi.DatosSeguimiento = {
      codigoSeguimiento: '58291045',
      estado: 'EN_ATENCION',
      estadoEtiqueta: 'En Atención',
      estadoDescripcion: 'El incidente fue confirmado en terreno.',
      tipoAfectacion: 'Anegamiento',
      direccionAproximada: 'Av. Alemania 550',
      descripcion: 'Agua entrando a vivienda',
      creadoEn: '2026-09-20T10:00:00.000Z',
      actualizadoEn: '2026-09-20T11:00:00.000Z',
      esDuplicado: false,
    };

    vi.spyOn(seguimientoApi, 'consultarSeguimientoIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockDatos,
      mensaje: 'Reporte encontrado exitosamente.',
    });

    vi.spyOn(socketHook, 'useSeguimientoSocket').mockReturnValue({
      conectado: true,
      actualizadoEnVivo: false,
    });

    render(<SeguimientoDetalleClient codigo="58291045" />);

    await waitFor(() => {
      expect(screen.getByText('58291045')).toBeDefined();
      expect(screen.getByText('En Atención')).toBeDefined();
    });

    expect(screen.getByText('El incidente fue confirmado en terreno.')).toBeDefined();
    expect(screen.getByText('Av. Alemania 550')).toBeDefined();
  });

  it('debe actualizar el estado en vivo cuando el hook de socket notifica un cambio', async () => {
    let socketCallback: ((payload: socketHook.EstadoActualizadoPayload) => void) | undefined;

    const mockDatosInicial: seguimientoApi.DatosSeguimiento = {
      codigoSeguimiento: '58291045',
      estado: 'VERIFICANDO',
      estadoEtiqueta: 'Verificando',
      estadoDescripcion: 'Patrulla verificadora en camino.',
      tipoAfectacion: 'Caída de árbol',
      direccionAproximada: 'Los Boldos 120',
      descripcion: null,
      creadoEn: '2026-09-20T10:00:00.000Z',
      actualizadoEn: '2026-09-20T10:30:00.000Z',
      esDuplicado: false,
    };

    vi.spyOn(seguimientoApi, 'consultarSeguimientoIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockDatosInicial,
      mensaje: 'Reporte encontrado',
    });

    vi.spyOn(socketHook, 'useSeguimientoSocket').mockImplementation((options) => {
      socketCallback = options.onEstadoActualizado;
      return {
        conectado: true,
        actualizadoEnVivo: false,
      };
    });

    render(<SeguimientoDetalleClient codigo="58291045" />);

    await waitFor(() => {
      expect(screen.getByText('Verificando')).toBeDefined();
    });

    // Simular evento en tiempo real recibido desde Socket.io
    act(() => {
      socketCallback?.({
        codigoSeguimiento: '58291045',
        estado: 'RESUELTO',
        estadoEtiqueta: 'Resuelto',
        estadoDescripcion: 'El árbol fue retirado de la calzada con apoyo de cuadrilla.',
        actualizadoEn: '2026-09-20T12:00:00.000Z',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Resuelto')).toBeDefined();
      expect(screen.getByText('El árbol fue retirado de la calzada con apoyo de cuadrilla.')).toBeDefined();
    });
  });
});
