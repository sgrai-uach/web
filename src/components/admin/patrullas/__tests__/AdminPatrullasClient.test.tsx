import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminPatrullasClient from '../AdminPatrullasClient';
import { SimulatedSessionContext, type SimulatedSessionContextType } from '@/context/SimulatedSessionContext';
import * as patrullasServiceModule from '@/services/patrullasService';
import * as catalogosServiceModule from '@/services/catalogosService';
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
    editar: vi.fn(),
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
      id: 'c1000000-0000-4000-8000-000000000001',
      nombre: 'Carlos Muñoz',
      email: 'carlos@valdivia.cl',
      telefono: '+56911112222',
      rut: '12.345.678-9',
    },
    integrantes: [
      {
        id: 'b1000000-0000-4000-8000-000000000001',
        usuarioId: 'c1000000-0000-4000-8000-000000000001',
        nombre: 'Carlos Muñoz',
        cargo: 'Evaluador Táctico',
        rolEnPatrulla: 'LIDER',
      },
    ],
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
    <SimulatedSessionContext.Provider value={mockContextValue as unknown as SimulatedSessionContextType}>
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

  describe('HU-84: Acción Editar Patrulla y Bloqueo Operativo', () => {
    const patrullaActiva: PatrullaVerificadoraDTO = {
      id: 'f1000000-0000-4000-8000-000000000002',
      codigo: 'PV-SUR-02',
      nombre: 'Patrulla Sur Operativa',
      estado: 'EN_VERIFICACION',
      delegacion: { id: '30000000-0000-4000-8000-000000000002', nombre: 'Sur', codigo: 'DEL_SUR' },
      misionActiva: {
        id: 'mis-2',
        codigo: 'MIS-2026-002',
        titulo: 'Verificar anegamiento sector Angachilla',
        tipoMision: 'VERIFICACION',
        estado: 'EN_CURSO',
        prioridad: 'ALTA',
      },
      integrantes: [],
      actualizadoEn: '2026-10-26T11:00:00.000Z',
    };

    it('6. muestra el botón "Editar Patrulla" habilitado para patrullas DISPONIBLES y abre el modal', async () => {
      renderWithSession(['recursos:leer', 'recursos:editar']);

      await waitFor(() => {
        expect(screen.getByText('Patrulla Rápida Costa-1')).toBeInTheDocument();
      });

      const btnEditar = screen.getByTestId('btn-editar-patrulla-f1000000-0000-4000-8000-000000000001');
      expect(btnEditar).toBeInTheDocument();
      expect(btnEditar).not.toBeDisabled();

      fireEvent.click(btnEditar);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Editar Patrulla Verificadora/i })).toBeInTheDocument();
        expect(screen.getByDisplayValue('Patrulla Rápida Costa-1')).toBeInTheDocument();
      });
    });

    it('7. deshabilita "Editar Patrulla" con tooltip reglamentario cuando la patrulla está EN_VERIFICACION o en misión activa', async () => {
      vi.mocked(patrullasServiceModule.patrullasService.listar).mockResolvedValue({
        exito: true,
        data: [patrullaActiva],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
        mensaje: 'OK',
      });

      renderWithSession(['recursos:leer', 'recursos:editar']);

      await waitFor(() => {
        expect(screen.getByText('Patrulla Sur Operativa')).toBeInTheDocument();
      });

      const btnEditar = screen.getByTestId('btn-editar-patrulla-f1000000-0000-4000-8000-000000000002');
      expect(btnEditar).toBeDisabled();

      const mensajeEsperado =
        'No es posible editar la patrulla mientras se encuentre en verificación o en misión activa';
      expect(btnEditar).toHaveAttribute('aria-label', mensajeEsperado);
    });

    it('8. abre el drawer de detalle unitario al presionar "Ver Ficha" y muestra la auditoría actualizado_en', async () => {
      renderWithSession(['recursos:leer', 'recursos:editar']);

      await waitFor(() => {
        expect(screen.getByText('Patrulla Rápida Costa-1')).toBeInTheDocument();
      });

      const btnVerFicha = screen.getByTestId('btn-ver-detalle-f1000000-0000-4000-8000-000000000001');
      fireEvent.click(btnVerFicha);

      await waitFor(() => {
        expect(screen.getByTestId('patrulla-detalle-drawer')).toBeInTheDocument();
        expect(screen.getByTestId('drawer-actualizado-en')).toBeInTheDocument();
      });
    });

    it('9. BUG-H84-WEB-05: al editar desde el drawer, mantiene la ficha técnica abierta y sincronizada con los datos actualizados tras guardar', async () => {
      const patrullaActualizada: PatrullaVerificadoraDTO = {
        ...mockPatrullas[0],
        nombre: 'Patrulla Rápida Costa Modificada',
      };

      vi.mocked(patrullasServiceModule.patrullasService.editar).mockResolvedValueOnce({
        exito: true,
        mensaje: 'Patrulla modificada exitosamente.',
        data: patrullaActualizada,
      });

      renderWithSession(['recursos:leer', 'recursos:editar']);

      await waitFor(() => {
        expect(screen.getByText('Patrulla Rápida Costa-1')).toBeInTheDocument();
      });

      // 1. Abrir Drawer de detalle
      const btnVerFicha = screen.getByTestId('btn-ver-detalle-f1000000-0000-4000-8000-000000000001');
      fireEvent.click(btnVerFicha);

      await waitFor(() => {
        expect(screen.getByTestId('patrulla-detalle-drawer')).toBeInTheDocument();
      });

      // 2. Click en "Editar Patrulla" dentro del Drawer
      const btnDrawerEditar = screen.getByTestId('btn-drawer-editar-patrulla');
      fireEvent.click(btnDrawerEditar);

      // 3. Modal de edición se abre
      await waitFor(() => {
        expect(screen.getByTestId('modal-editar-patrulla')).toBeInTheDocument();
      });

      // 4. Modificar nombre y confirmar guardado
      const inputNombre = screen.getByDisplayValue('Patrulla Rápida Costa-1');
      fireEvent.change(inputNombre, { target: { value: 'Patrulla Rápida Costa Modificada' } });

      const btnGuardarModal = screen.getByTestId('btn-guardar-cambios-patrulla');
      fireEvent.click(btnGuardarModal);

      await waitFor(() => {
        expect(screen.getByTestId('btn-confirmar-guardar-edicion')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByTestId('btn-confirmar-guardar-edicion'));

      // 5. El modal se cierra y el Drawer sigue abierto exhibiendo el nuevo nombre actualizado
      await waitFor(() => {
        expect(screen.queryByTestId('modal-editar-patrulla')).not.toBeInTheDocument();
        expect(screen.getByTestId('patrulla-detalle-drawer')).toBeInTheDocument();
        expect(screen.getByText('Patrulla Rápida Costa Modificada')).toBeInTheDocument();
      });
    });

    it('10. renderiza la acción "Desactivar" con permiso recursos:eliminar y abre PatrullaDesactivarModal', async () => {
      renderWithSession(['recursos:leer', 'recursos:eliminar']);

      await waitFor(() => {
        expect(screen.getByText('Patrulla Rápida Costa-1')).toBeInTheDocument();
      });

      const btnDesactivar = screen.getByTestId('btn-desactivar-patrulla-f1000000-0000-4000-8000-000000000001');
      expect(btnDesactivar).toBeInTheDocument();
      expect(btnDesactivar).not.toBeDisabled();

      fireEvent.click(btnDesactivar);

      await waitFor(() => {
        expect(screen.getByTestId('patrulla-desactivar-modal')).toBeInTheDocument();
        expect(screen.getByText('Desactivar Patrulla Verificadora')).toBeInTheDocument();
      });
    });

    it('11. deshabilita la acción "Desactivar" si la patrulla posee misiones activas o no está disponible', async () => {
      vi.mocked(patrullasServiceModule.patrullasService.listar).mockResolvedValue({
        exito: true,
        data: [patrullaActiva],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
        mensaje: 'OK',
      });

      renderWithSession(['recursos:leer', 'recursos:eliminar']);

      await waitFor(() => {
        expect(screen.getByText('Patrulla Sur Operativa')).toBeInTheDocument();
      });

      const btnDesactivar = screen.getByTestId('btn-desactivar-patrulla-f1000000-0000-4000-8000-000000000002');
      expect(btnDesactivar).toBeDisabled();

      const mensajeEsperado =
        'No es posible desactivar la patrulla mientras se encuentre en verificación o en misión activa';
      expect(btnDesactivar).toHaveAttribute('aria-label', mensajeEsperado);
    });

    it('12. BUG-H85-WEB-02: aplica política Fail-Closed no renderizando botón Desactivar sin permiso recursos:eliminar', async () => {
      renderWithSession(['recursos:leer']);

      await waitFor(() => {
        expect(screen.getByText('Patrulla Rápida Costa-1')).toBeInTheDocument();
      });
      const btnDesactivar = screen.queryByTestId('btn-desactivar-patrulla-f1000000-0000-4000-8000-000000000001');
      expect(btnDesactivar).not.toBeInTheDocument();
      expect(btnDesactivar).not.toBeInTheDocument();
    });
  });
});
