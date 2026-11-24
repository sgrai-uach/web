import { describe, it, expect, vi } from 'vitest';
import { suscribirSalasSocket, type SocketRoomCapable } from '../roomManager';

function crearMockSocket(connected = true) {
  const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
  const socket: SocketRoomCapable & { _triggerConnect: () => void } = {
    connected,
    emit: vi.fn(),
    on: vi.fn((event: string, cb: (...args: unknown[]) => void) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(cb);
      return socket as never;
    }),
    off: vi.fn((event: string, cb: (...args: unknown[]) => void) => {
      if (!listeners[event]) return socket as never;
      listeners[event] = listeners[event].filter((fn) => fn !== cb);
      return socket as never;
    }),
    _triggerConnect: () => {
      for (const cb of listeners['connect'] || []) {
        cb();
      }
    },
  };
  return socket;
}

describe('roomManager — suscribirSalasSocket (reference counting)', () => {
  it('no emite leave ni salir al desmontar un modal secundario mientras el tablero Kanban sigue montado', () => {
    const socket = crearMockSocket(true);

    const desuscribirKanban = suscribirSalasSocket(socket, [
      { sala: 'encargado', eventosJoin: ['join'], eventosLeave: ['leave'] },
      { sala: 'sala:encargados', eventosJoin: ['unirse'], eventosLeave: ['salir'] },
      { sala: 'mapa', eventosJoin: ['join', 'unirse'], eventosLeave: ['leave', 'salir'] },
    ]);

    const desuscribirPatrullasModal = suscribirSalasSocket(socket, [
      { sala: 'encargado', eventosJoin: ['join'], eventosLeave: ['leave'] },
      { sala: 'sala:encargados', eventosJoin: ['unirse'], eventosLeave: ['salir'] },
      { sala: 'mapa', eventosJoin: ['join', 'unirse'], eventosLeave: ['leave', 'salir'] },
    ]);

    vi.mocked(socket.emit).mockClear();

    // Cerrar el modal secundario NO debe expulsar al socket compartido de ninguna sala
    desuscribirPatrullasModal();
    expect(socket.emit).not.toHaveBeenCalledWith('leave', 'encargado');
    expect(socket.emit).not.toHaveBeenCalledWith('salir', 'sala:encargados');
    expect(socket.emit).not.toHaveBeenCalledWith('leave', 'mapa');
    expect(socket.emit).not.toHaveBeenCalledWith('salir', 'mapa');

    // Al desmontar el último suscriptor activo (Kanban), sí se emiten leave y salir
    desuscribirKanban();
    expect(socket.emit).toHaveBeenCalledWith('leave', 'encargado');
    expect(socket.emit).toHaveBeenCalledWith('salir', 'sala:encargados');
    expect(socket.emit).toHaveBeenCalledWith('leave', 'mapa');
    expect(socket.emit).toHaveBeenCalledWith('salir', 'mapa');

    // Invocaciones repetidas de limpieza son idempotentes
    vi.mocked(socket.emit).mockClear();
    desuscribirKanban();
    expect(socket.emit).not.toHaveBeenCalled();
  });

  it('re-emite join y unirse en evento connect tras reconexión', () => {
    const socket = crearMockSocket(false);

    const desuscribir = suscribirSalasSocket(socket, [
      { sala: 'sala:encargados', eventosJoin: ['unirse'], eventosLeave: ['salir'] },
    ]);

    expect(socket.emit).not.toHaveBeenCalled();

    socket._triggerConnect();
    expect(socket.emit).toHaveBeenCalledWith('unirse', 'sala:encargados');

    desuscribir();
    expect(socket.emit).toHaveBeenCalledWith('salir', 'sala:encargados');
  });
});
