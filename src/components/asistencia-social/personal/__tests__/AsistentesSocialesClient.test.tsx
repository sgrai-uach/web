import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AsistentesSocialesClient from '../AsistentesSocialesClient';
import * as service from '@/services/asistentesSocialesService';
import type { AsistenteSocialItem } from '@/types/asistenteSocialPersonal';

let mockRol = 'Encargado';
let mockHasPermission = vi.fn(() => true);

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/gestion/asistente-social/personal',
  useSearchParams: () => new URLSearchParams(),
}));

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

describe('AsistentesSocialesClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRol = 'Encargado';
    mockHasPermission = vi.fn(() => true);
  });

  const mockAsistentes: AsistenteSocialItem[] = [
    {
      usuarioId: '50000000-0000-4000-8000-000000000001',
      rut: '16.789.012-3',
      nombres: 'Camila Andrea',
      apellidos: 'Valenzuela Castro',
      nombreCompleto: 'Camila Valenzuela Castro',
      email: 'cvalenzuela@valdivia.cl',
      telefono: '+56 9 8765 4321',
      delegacionId: '30000000-0000-4000-8000-000000000001',
      delegacionCodigo: 'COSTA',
      delegacionNombre: 'Delegación Municipal Costa',
      personalId: '60000000-0000-4000-8000-000000000001',
      estadoOperativo: 'disponible',
      casosFibeAsignados: 0,
    },
    {
      usuarioId: '50000000-0000-4000-8000-000000000002',
      rut: '15.432.198-7',
      nombres: 'Rodrigo Ignacio',
      apellidos: 'Sepúlveda Muñoz',
      nombreCompleto: 'Rodrigo Sepúlveda Muñoz',
      email: 'rsepulveda@valdivia.cl',
      telefono: '+56 9 9876 5432',
      delegacionId: '30000000-0000-4000-8000-000000000002',
      delegacionCodigo: 'SUR',
      delegacionNombre: 'Delegación Municipal Sur',
      personalId: '60000000-0000-4000-8000-000000000002',
      estadoOperativo: 'en_mision',
      casosFibeAsignados: 3,
    },
  ];

  it('debe renderizar el encabezado y la nómina de asistentes sociales', async () => {
    vi.spyOn(service, 'obtenerAsistentesSociales').mockResolvedValueOnce({
      data: mockAsistentes,
      meta: {
        total: 2,
        pagina: 1,
        limite: 20,
        totalPaginas: 1,
      },
    });

    render(<AsistentesSocialesClient basePath="/gestion/asistente-social" />);

    expect(screen.getByRole('heading', { name: /Dotación de Asistentes Sociales/i })).toBeDefined();
    expect(screen.getByText(/Volver a Casos Sociales/i)).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Camila Valenzuela Castro')).toBeDefined();
      expect(screen.getByText('Rodrigo Sepúlveda Muñoz')).toBeDefined();
      expect(screen.getAllByText('Delegación Municipal Costa').length).toBeGreaterThan(0);
      expect(screen.getByText('+56 9 8765 4321')).toBeDefined();
      expect(screen.getAllByText('Disponible').length).toBeGreaterThan(0);
      expect(screen.getAllByText('En Misión').length).toBeGreaterThan(0);
      expect(screen.getByText('3')).toBeDefined(); // Casos FIBE activos
    });
  });

  it('debe mostrar el estado vacío institucional cuando no hay registros', async () => {
    vi.spyOn(service, 'obtenerAsistentesSociales').mockResolvedValueOnce({
      data: [],
      meta: {
        total: 0,
        pagina: 1,
        limite: 20,
        totalPaginas: 1,
      },
    });

    render(<AsistentesSocialesClient basePath="/gestion/asistente-social" />);

    await waitFor(() => {
      expect(screen.getByText(/No hay asistentes sociales registradas/i)).toBeDefined();
    });
  });

  it('debe mostrar EmptyState con opción de restablecer filtros si no hay coincidencias con filtros', async () => {
    vi.spyOn(service, 'obtenerAsistentesSociales').mockResolvedValue({
      data: [],
      meta: {
        total: 0,
        pagina: 1,
        limite: 20,
        totalPaginas: 1,
      },
    });

    render(<AsistentesSocialesClient basePath="/gestion/asistente-social" />);

    // Aplicar búsqueda
    const input = screen.getByPlaceholderText(/Nombre, RUT, teléfono o email/i);
    fireEvent.change(input, { target: { value: 'Inexistente' } });

    await waitFor(() => {
      expect(screen.getByText(/No hay asistentes que coincidan con los filtros/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /Restablecer Filtros/i })).toBeDefined();
    });
  });

  it('debe restringir el acceso con AccesoDenegadoState si el usuario carece de permiso', () => {
    mockRol = 'Informante';
    mockHasPermission = vi.fn(() => false);

    render(<AsistentesSocialesClient basePath="/gestion/asistente-social" />);

    expect(screen.getByText(/Acceso Restringido/i)).toBeDefined();
    expect(
      screen.getByText(/Se requieren credenciales de Encargado, Administrador o Asistente Social/i)
    ).toBeDefined();
  });
});
