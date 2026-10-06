import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AsistenciaSocialClient from '../AsistenciaSocialClient';
import * as asistenciaSocialService from '@/services/asistenciaSocialService';
import type { EventoAsistenciaSocialItem } from '@/types/asistenciaSocial';

let mockRol = 'Encargado';
let mockHasPermission = vi.fn(() => true);

vi.mock('@/context/SimulatedSessionContext', () => ({
  useSimulatedSession: () => ({
    usuarioActivo: {
      id: '00000000-0000-4000-8000-000000000003',
      nombre: 'Encargado de Operaciones',
      rol: mockRol,
      esAdmin: false,
    },
    hasPermission: (perm: string) => mockHasPermission(perm),
  }),
}));

vi.mock('@/lib/socket/client', () => ({
  getSocket: () => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  }),
}));

describe('AsistenciaSocialClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRol = 'Encargado';
    mockHasPermission = vi.fn(() => true);
  });

  const mockItem: EventoAsistenciaSocialItem = {
    id: '70000000-0000-4000-8000-000000000001',
    codigo: 'AS-2026-0001',
    descripcion: 'Anegamiento en patio',
    tipoAfectacion: 'VIVIENDA_ANEGADA',
    personasAfectadas: 4,
    familiasAfectadas: 1,
    direccionTexto: 'Calle Los Alerces 1420',
    latitud: -39.8234,
    longitud: -73.2189,
    prioridad: 'ALTA',
    estado: 'PENDIENTE',
    contactoNombre: 'María González',
    contactoTelefono: '+56912345678',
    contactoRut: null,
    delegacionId: null,
    delegacionNombre: 'Delegación Costa',
    incidenteId: null,
    asistenteSocialId: null,
    asistenteSocialNombre: null,
    creadoPor: { id: 'user-1', nombre: 'Encargado' },
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
  };

  it('debe renderizar el encabezado y la tabla con los eventos cargados', async () => {
    vi.spyOn(asistenciaSocialService, 'obtenerEventosAsistenciaSocial').mockResolvedValueOnce({
      data: [mockItem],
      total: 1,
      pagina: 1,
      limite: 10,
      totalPaginas: 1,
    });

    render(<AsistenciaSocialClient basePath="/gestion/asistente-social" />);

    expect(screen.getByRole('heading', { name: /Asistencia Social/i })).toBeDefined();
    expect(screen.getByText(/Nuevo Evento Social/i)).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('AS-2026-0001')).toBeDefined();
      expect(screen.getByText(/Calle Los Alerces 1420/i)).toBeDefined();
      expect(screen.getByText(/María González/i)).toBeDefined();
    });
  });

  it('debe mostrar el estado vacío institucional cuando no hay registros', async () => {
    vi.spyOn(asistenciaSocialService, 'obtenerEventosAsistenciaSocial').mockResolvedValueOnce({
      data: [],
      total: 0,
      pagina: 1,
      limite: 10,
      totalPaginas: 1,
    });

    render(<AsistenciaSocialClient basePath="/gestion/asistente-social" />);

    await waitFor(() => {
      expect(screen.getByText(/No hay eventos de asistencia social pendientes/i)).toBeDefined();
    });
  });

  it('debe bloquear el acceso con AccesoDenegadoState si el rol no tiene permisos de lectura', () => {
    mockRol = 'Observador';
    mockHasPermission = vi.fn(() => false);

    render(<AsistenciaSocialClient basePath="/gestion/asistente-social" />);

    expect(screen.getByText(/Acceso Restringido/i)).toBeDefined();
    expect(
      screen.getByText(/Se requieren credenciales de Encargado, Administrador o Asistente Social/i)
    ).toBeDefined();
  });
});
