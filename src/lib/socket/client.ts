/**
 * Cliente Socket.io para actualizaciones en tiempo real.
 *
 * Proporciona la conexión al servidor de WebSocket de sgrai-api
 * para reflejar cambios de estado de incidentes, avisos en el Call Center, etc.
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000';

let socket: Socket | null = null;

/**
 * Obtiene la instancia singleton del socket.
 * La conexión se establece con transportes websocket y polling.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
}
