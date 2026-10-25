import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPatrullasClient from '../AdminPatrullasClient';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';
import * as patrullasServiceModule from '@/services/patrullasService';
import * as catalogosServiceModule from '@/services/catalogosService';
import * as recursosServiceModule from '@/services/recursosService';
import * as empleadosServiceModule from '@/services/empleadosService';
import type { PatrullaVerificadoraDTO } from '@/types/patrullas';

// Mock de next/navigation
let mockSearchParams = new URLSearchParams();
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/gestion/admin/patrullas',
  useSearchParams: () => mockSearchParams,
}));

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn(),
    showWarning: vi.fn(),
  }),
}));

// Mock del cliente Socket.io
vi.mock('@/lib/socket/client', () => ({
  getSocket: () => ({
    connected: true,
    connect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  }),
}));

// Mocks de servicios
vi.mock('@/services/catalogosService', async (importOriginal) => {
  const actual = await importOriginal<typeof catalogosServiceModule>();
  return {
    ...actual,
    catalogosService: {
      ...actual.catalogosService,
      getCatalogos: vi.fn().mockResolvedValue({
        roles: [],
        delegaciones: [
          { id: '30000000-0000-4000-8000-000000000001', nombre: 'Norte', codigo: 'DEL_NORTE' },
          { id: '30000000-0000-4000-8000-000000000002', nombre: 'Sur', codigo: 'DEL_SUR' },
        ],
        especialidades: [],
        cargos: [],
      }),
    },
  };
});

vi.mock('@/services/recursosService', () => ({
  getRecursos: vi.fn().mockResolvedValue({
    data: [
      {
        id: 'e1000000-0000-4000-8000-000000000002',
        nombre: 'Camioneta 4x4 Navara',
        esIndividual: true,
        estado: 'DISPONIBLE',
        detalles: { patente: 'CD-FG-23', modelo: 'Navara' },
      },
    ],
    meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
  }),
}));

vi.mock('@/services/empleadosService', () => ({
  empleadosService: {
    getEmpleadosPaginado: vi.fn().mockResolvedValue({
      data: [
        {
          usuario_id: 'c1000000-0000-4000-8000-000000000001',
          personal_id: 'b1000000-0000-4000-8000-000000000001',
          nombres: 'Carlos',
          apellidos: 'Muñoz',
          rut: '12.345.678-9',
          rol_codigo: 'PATRULLA_VERIFICADORA',
          usuario_activo: true,
          delegacion_nombre: 'Norte',
          cargo: 'Evaluador Táctico',
        },
      ],
      meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
    }),
  },
}));

vi.mock('@/services/patrullasService', () => ({
  DEFAULT_ENCARGADO_ID: '00000000-0000-4000-8000-000000000003',
  patrullasService: {
    listar: vi.fn(),
    crear: vi.fn(),
  },
}));

const mockPatrullas: PatrullaVerificadoraDTO[] = [
  {
    id: 'f1000000-0000-4000-8000-000000000001',
    codigo: 'PV-COSTA-01',
    nombre: 'Patrulla Rápida Costa-1',
    estado: 'DISPONIBLE',
    delegacion: {
      id: '30000000-0000-4000-8000-000000000003',
      nombre: 'Costa',
      codigo: 'DEL_COSTA',
    },
    lider: {
      id: '00000000-0000-4000-8000-000000000003',
      nombre: 'Encargado de Operaciones',
      email: 'encargado@valdivia.cl',
      telefono: '+56911112222',
      rut: '33333333-3',
    },
    integrantes: [],
    misionActiva: null,
    actualizadoEn: '2026-10-25T10:00:00.000Z',
  },
];

const renderWithSession = (permisos: string[] = ['recursos:crear', 'recursos:leer'], esAdmin = false) => {
  const mockContextValue = {
    usuarioActivo: {
      id: '00000000-0000-4000-8000-000000000001',
      nombre: 'Administrador General',
      email: 'admin@valdivia.cl',
      rut: '11.111.111-1',
      rol: esAdmin ? 'Administrador' : 'Operador',
      esAdmin,
      color: '#1B6F7D',
      permisos,
    },
    usuarios: [],
    cambiarUsuarioPorId: vi.fn(),
    cambiarUsuarioPorRol: vi.fn(),
    actualizarPermisosUsuario: vi.fn(),
    refrescarPermisos: vi.fn(),
    tienePermiso: (p: string) => permisos.includes(p),
    hasPermission: (p: string) => permisos.includes(p),
    hasAnyPermission: (plist: string[]) => plist.some((p) => permisos.includes(p)),
    isMounted: true,
  };

  return render(
    <SimulatedSessionContext.Provider value={mockContextValue as any}>
      <AdminPatrullasClient />
    </SimulatedSessionContext.Provider>
  );
};

describe('AdminPatrullasClient (Pestaña dedicada de Patrullas Verificadoras)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    vi.mocked(patrullasServiceModule.patrullasService.listar).mockResolvedValue({
      exito: true,
      data: mockPatrullas,
      meta: { total: 1, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
      mensaje: 'OK',
    });
  });

  it('1. bloquea el acceso si el usuario carece de permisos de lectura y creación', () => {
    renderWithSession([]);

    expect(screen.getByText(/Acceso Restringido/i)).toBeInTheDocument();
    expect(
      screen.getByText(/No dispone de los privilegios requeridos para consultar el registro de patrullas verificadoras/i)
    ).toBeInTheDocument();
  });

  it('2. renderiza la vista institucional con resumen de dotación y lista de patrullas', async () => {
    renderWithSession(['recursos:leer']);

    expect(screen.getByRole('heading', { name: /Patrullas Verificadoras/i })).toBeInTheDocument();
    expect(screen.getByText('Total registradas:')).toBeInTheDocument();
    expect(screen.getByText('Disponibles:')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Patrulla Rápida Costa-1')).toBeInTheDocument();
      expect(screen.getByText('Costa')).toBeInTheDocument();
    });

    // Sin permiso recursos:crear no debe ver el botón de nueva patrulla
    expect(screen.queryByTestId('btn-nueva-patrulla')).not.toBeInTheDocument();
  });

  it('3. muestra el botón "+ Nueva Patrulla" cuando el usuario cuenta con permiso recursos:crear', async () => {
    renderWithSession(['recursos:leer', 'recursos:crear']);

    const btnNueva = screen.getByTestId('btn-nueva-patrulla');
    expect(btnNueva).toBeInTheDocument();
    expect(btnNueva).toHaveTextContent('Nueva Patrulla');

    // Al hacer clic, debe abrir el modal de creación
    fireEvent.click(btnNueva);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Registrar Nueva Patrulla Verificadora/i })).toBeInTheDocument();
    });
  });

  it('4. abre automáticamente el modal de creación si se recibe query param ?nuevo=1', async () => {
    mockSearchParams = new URLSearchParams('nuevo=1');

    renderWithSession(['recursos:leer', 'recursos:crear']);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Registrar Nueva Patrulla Verificadora/i })).toBeInTheDocument();
    });
  });

  it('5. cierra el modal al pulsar el botón Cancelar o la X', async () => {
    renderWithSession(['recursos:leer', 'recursos:crear']);

    const btnNueva = screen.getByTestId('btn-nueva-patrulla');
    fireEvent.click(btnNueva);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Registrar Nueva Patrulla Verificadora/i })).toBeInTheDocument();
    });

    const btnCerrar = screen.getByRole('button', { name: /Cerrar modal de alta de patrulla/i });
    fireEvent.click(btnCerrar);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Registrar Nueva Patrulla Verificadora/i })).not.toBeInTheDocument();
    });
  });
});
