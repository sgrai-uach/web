import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NuevoPatrullaClient from '../NuevoPatrullaClient';
import PatrullaForm from '../PatrullaForm';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';
import * as patrullasServiceModule from '@/services/patrullasService';
import * as catalogosServiceModule from '@/services/catalogosService';
import * as recursosServiceModule from '@/services/recursosService';
import * as empleadosServiceModule from '@/services/empleadosService';

// Mock de useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/gestion/admin/patrullas/nuevo',
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
    crear: vi.fn(),
  },
}));

const renderWithSession = (permisos: string[] = ['recursos:crear']) => {
  const mockContextValue = {
    usuarioActivo: {
      id: '00000000-0000-4000-8000-000000000001',
      nombre: 'Administrador General',
      email: 'admin@valdivia.cl',
      rut: '11.111.111-1',
      rol: 'Administrador',
      esAdmin: true,
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
    isMounted: true,
  };

  return render(
    <SimulatedSessionContext.Provider value={mockContextValue as any}>
      <NuevoPatrullaClient />
    </SimulatedSessionContext.Provider>
  );
};

describe('NuevoPatrullaClient y PatrullaForm (HU-83: Alta de Patrullas Verificadoras)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. bloquea el acceso y muestra AccesoDenegadoState si carece de permiso recursos:crear', () => {
    renderWithSession(['recursos:leer']); // No tiene recursos:crear

    expect(screen.getByText(/Acceso Restringido/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Permisos insuficientes para el Registro de Patrullas Verificadoras/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/Registrar Nueva Patrulla Verificadora/i)).not.toBeInTheDocument();
  });

  it('2. renderiza la interfaz completa cuando el usuario está autorizado con recursos:crear', async () => {
    renderWithSession(['recursos:crear']);

    expect(screen.getByText(/Registrar Nueva Patrulla Verificadora/i)).toBeInTheDocument();
    expect(screen.getByText(/Identificación de la Patrulla/i)).toBeInTheDocument();
    expect(screen.getByText(/Delegación Municipal Base/i)).toBeInTheDocument();
    expect(screen.getByText(/Vehículo Institucional Asignado/i)).toBeInTheDocument();
    expect(screen.getByText(/Dotación y Personal Asignado/i)).toBeInTheDocument();

    // Comprobar que cargue la delegación y el personal en los selectores
    await waitFor(() => {
      expect(screen.getByText(/Carlos Muñoz/i)).toBeInTheDocument();
    });
  });

  it('3. resalta errores de validación si se intenta enviar el formulario incompleto', async () => {
    renderWithSession(['recursos:crear']);

    const submitBtn = screen.getByRole('button', { name: /Guardar Patrulla/i });
    fireEvent.click(submitBtn);

    // Debe mostrar error de código y de delegación
    await waitFor(() => {
      expect(screen.getByText(/El código identificador debe tener al menos 3 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/Debe seleccionar una delegación municipal base/i)).toBeInTheDocument();
    });
  });

  it('4. completa el flujo de creación con modal de confirmación y pantalla de éxito', async () => {
    vi.mocked(patrullasServiceModule.patrullasService.crear).mockResolvedValue({
      exito: true,
      mensaje: 'Patrulla verificadora registrada exitosamente.',
      data: {
        id: 'f1000000-0000-4000-8000-000000000099',
        codigo: 'PV-NORTE-01',
        nombre: 'Patrulla Rápida Norte 1',
        estado: 'DISPONIBLE',
      },
    });

    renderWithSession(['recursos:crear']);

    // Esperar a que cargue el personal
    await waitFor(() => {
      expect(screen.getByText(/Carlos Muñoz/i)).toBeInTheDocument();
    });

    // 1. Llenar Código
    const codigoInput = screen.getByLabelText(/Código Identificador/i);
    fireEvent.change(codigoInput, { target: { value: 'PV-NORTE-01' } });

    // 2. Seleccionar Delegación
    const delegacionSelect = screen.getByLabelText(/Delegación Base/i);
    fireEvent.change(delegacionSelect, {
      target: { value: '30000000-0000-4000-8000-000000000001' },
    });

    // 3. Seleccionar Personal
    const personalItem = screen.getByText(/Carlos Muñoz/i).closest('[role="checkbox"]')!;
    fireEvent.click(personalItem);

    // 4. Hacer clic en Guardar Patrulla -> debe abrir modal
    const submitBtn = screen.getByRole('button', { name: /Guardar Patrulla/i });
    fireEvent.click(submitBtn);

    // Modal de confirmación abierto
    await waitFor(() => {
      expect(screen.getByText(/Confirmar Alta de Patrulla Verificadora/i)).toBeInTheDocument();
    });

    // 5. Confirmar guardado en el modal
    const confirmBtn = screen.getByRole('button', { name: /Confirmar y Dar de Alta/i });
    fireEvent.click(confirmBtn);

    // 6. Verificar que se llame al servicio y aparezca la pantalla de éxito
    await waitFor(() => {
      expect(screen.getByText(/Patrulla Verificadora Registrada Exitosamente/i)).toBeInTheDocument();
    });

    expect(patrullasServiceModule.patrullasService.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        codigo: 'PV-NORTE-01',
        delegacionId: '30000000-0000-4000-8000-000000000001',
        personalIds: ['b1000000-0000-4000-8000-000000000001'],
      }),
      '00000000-0000-4000-8000-000000000001'
    );
    expect(screen.getAllByText(/DISPONIBLE/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('link', { name: /Ir a Centro de Mando/i })).toBeInTheDocument();
  });
});
