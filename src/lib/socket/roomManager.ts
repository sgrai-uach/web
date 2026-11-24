import type { Socket } from 'socket.io-client';

export type RoomJoinEvent = 'join' | 'unirse';
export type RoomLeaveEvent = 'leave' | 'salir';

export interface SalaSuscripcionConfig {
  sala: string;
  eventosJoin?: RoomJoinEvent[];
  eventosLeave?: RoomLeaveEvent[];
}

export type SocketRoomCapable = Pick<Socket, 'connected' | 'emit' | 'on' | 'off'>;

const suscripcionesPorSocket = new WeakMap<object, Map<string, number>>();

function obtenerMapaSalas(socket: SocketRoomCapable): Map<string, number> {
  const existente = suscripcionesPorSocket.get(socket);
  if (existente) {
    return existente;
  }
  const nuevo = new Map<string, number>();
  suscripcionesPorSocket.set(socket, nuevo);
  return nuevo;
}

/**
 * Administra suscripciones a salas de Socket.io mediante conteo de referencias por instancia
 * de socket, evitando que modales o hooks secundarios expulsen al socket compartido de salas
 * requeridas por otras vistas activas (como el Tablero Kanban).
 */
export function suscribirSalasSocket(
  socket: SocketRoomCapable,
  salas: SalaSuscripcionConfig[]
): () => void {
  const mapa = obtenerMapaSalas(socket);
  const normalizadas = salas.map((item) => ({
    sala: item.sala,
    eventosJoin:
      item.eventosJoin && item.eventosJoin.length > 0
        ? item.eventosJoin
        : (['join', 'unirse'] as RoomJoinEvent[]),
    eventosLeave:
      item.eventosLeave && item.eventosLeave.length > 0
        ? item.eventosLeave
        : (['leave', 'salir'] as RoomLeaveEvent[]),
  }));

  const emitirJoin = () => {
    for (const { sala, eventosJoin } of normalizadas) {
      for (const ev of eventosJoin) {
        socket.emit(ev, sala);
      }
    }
  };

  for (const { sala } of normalizadas) {
    mapa.set(sala, (mapa.get(sala) ?? 0) + 1);
  }

  if (socket.connected) {
    emitirJoin();
  }

  socket.on('connect', emitirJoin);

  let liberado = false;
  return () => {
    if (liberado) return;
    liberado = true;

    socket.off('connect', emitirJoin);

    for (const { sala, eventosLeave } of normalizadas) {
      const actual = mapa.get(sala) ?? 0;
      const restante = Math.max(0, actual - 1);
      if (restante === 0) {
        mapa.delete(sala);
        for (const ev of eventosLeave) {
          socket.emit(ev, sala);
        }
      } else {
        mapa.set(sala, restante);
      }
    }
  };
}
