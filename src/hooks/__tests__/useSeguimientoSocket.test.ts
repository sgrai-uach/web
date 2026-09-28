import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSeguimientoSocket } from '../useSeguimientoSocket';
import * as socketClient from '@/lib/socket/client';

describe('useSeguimientoSocket', () => {
  let mockSocket: {
    connected: boolean;
    connect: ReturnType<typeof vi.fn>;
    emit: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
    off: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockSocket = {
      connected: true,
      connect: vi.fn(),
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    };

    vi.spyOn(socketClient, 'getSocket').mockReturnValue(mockSocket as unknown as ReturnType<typeof socketClient.getSocket>);
  });

  it('debe unirse a la sala de seguimiento al montar con un código válido', () => {
    renderHook(() => useSeguimientoSocket({ codigo: '58291045' }));

    expect(mockSocket.emit).toHaveBeenCalledWith('unirse', 'sala:seguimiento:58291045');
    expect(mockSocket.on).toHaveBeenCalledWith('incidente:estado_actualizado', expect.any(Function));
  });

  it('no debe unirse a la sala si el código no tiene formato válido', () => {
    renderHook(() => useSeguimientoSocket({ codigo: '123' }));

    expect(mockSocket.emit).not.toHaveBeenCalled();
  });

  it('debe invocar onEstadoActualizado y activar actualizadoEnVivo al recibir evento con código coincidente', () => {
    const onActualizado = vi.fn();
    let listenerHandler: ((payload: unknown) => void) | undefined;

    mockSocket.on.mockImplementation((event: string, handler: (payload: unknown) => void) => {
      if (event === 'incidente:estado_actualizado') {
        listenerHandler = handler;
      }
      return mockSocket;
    });

    const { result } = renderHook(() =>
      useSeguimientoSocket({
        codigo: '58291045',
        onEstadoActualizado: onActualizado,
      })
    );

    expect(listenerHandler).toBeDefined();

    const mockPayload = {
      codigoSeguimiento: '58291045',
      estado: 'EN_ATENCION' as const,
      estadoEtiqueta: 'En Atención',
      estadoDescripcion: 'Cuadrilla trabajando en terreno',
      actualizadoEn: '2026-09-20T12:00:00.000Z',
    };

    act(() => {
      listenerHandler?.(mockPayload);
    });

    expect(onActualizado).toHaveBeenCalledWith(mockPayload);
    expect(result.current.actualizadoEnVivo).toBe(true);
  });

  it('debe desuscribirse y emitir salir al desmontar', () => {
    const { unmount } = renderHook(() =>
      useSeguimientoSocket({ codigo: '58291045' })
    );

    unmount();

    expect(mockSocket.emit).toHaveBeenCalledWith('salir', 'sala:seguimiento:58291045');
    expect(mockSocket.off).toHaveBeenCalledWith('incidente:estado_actualizado', expect.any(Function));
  });
});
