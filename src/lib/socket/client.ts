/**
 * Cliente Socket.io para actualizaciones en tiempo real.
 *
 * Proporciona la conexión al servidor de WebSocket de sgrai-api
 * para reflejar cambios de estado de incidentes, ubicación de
 * cuadrillas en el mapa, etc.
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? '';

let socket: Socket | null = null;

/**
 * Obtiene la instancia singleton del socket.
 * La conexión se establece de forma lazy en la primera llamada.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
    });
  }
  return socket;
}
