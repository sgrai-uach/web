import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RolDetalleDrawer from '../RolDetalleDrawer';
import * as seguridadService from '@/services/seguridadService';
import type { PermisoCatalogoItem, RolItem } from '@/types/seguridad';

const mockShowError = vi.fn();
const mockShowSuccess = vi.fn();

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    showError: mockShowError,
    showSuccess: mockShowSuccess,
  }),
}));

vi.mock('@/services/seguridadService', () => ({
  obtenerCatalogoPermisos: vi.fn(),
  actualizarPermisosRol: vi.fn(),
  agruparCatalogoPorModulo: vi.fn(),
  agruparPermisosPorModulo: vi.fn(),
}));

describe('RolDetalleDrawer con Edición Integrada (HU-5)', () => {
  const usuarioId = '00000000-0000-4000-8000-000000000001';

  const mockCatalogo: PermisoCatalogoItem[] = [
    {
      id: 'p-1',
      codigo: 'seguridad:roles:gestionar',
      nombre: 'Gestionar Roles y Permisos',
      descripcion: 'Permite asignar o revocar permisos',
      modulo: 'Seguridad',
    },
    {
      id: 'p-2',
      codigo: 'seguridad:roles:leer',
      nombre: 'Visualizar Roles y Permisos',
      descripcion: 'Permite consultar el listado y detalle de perfiles',
      modulo: 'Seguridad',
    },
    {
      id: 'p-3',
      codigo: 'recursos:crear',
      nombre: 'Crear Recursos',
      descripcion: 'Permite registrar nuevos recursos',
      modulo: 'Recursos y Personal',
    },
    {
      id: 'p-4',
      codigo: 'misiones:asignar',
      nombre: 'Asignar Misiones',
      descripcion: 'Permite despachar patrullas y cuadrillas',
      modulo: 'Misiones',
    },
  ];

  const mockRolAdmin: RolItem = {
    id: 'rol-admin',
    nombre: 'Administrador',
    descripcion: 'Acceso total y configuración del sistema',
    activo: true,
    esSistema: true,
    cantidadPermisos: 2,
    permisos: [
      {
        id: 'p-1',
        codigo: 'seguridad:roles:gestionar',
        nombre: 'Gestionar Roles y Permisos',
        descripcion: null,
        modulo: 'Seguridad',
        asignadoEn: '2026-09-01T00:00:00Z',
        asignadoPorId: null,
      },
      {
        id: 'p-2',
        codigo: 'seguridad:roles:leer',
        nombre: 'Visualizar Roles y Permisos',
        descripcion: null,
        modulo: 'Seguridad',
        asignadoEn: '2026-09-01T00:00:00Z',
        asignadoPorId: null,
      },
    ],
    creadoEn: '2026-09-01T00:00:00Z',
    actualizadoEn: '2026-09-01T00:00:00Z',
  };

  const mockRolDelegado: RolItem = {
    id: 'rol-delegado',
    nombre: 'Delegado de Cuadrilla',
    descripcion: 'Líder operativo en terreno',
    activo: true,
    esSistema: true,
    cantidadPermisos: 0,
    permisos: [],
    creadoEn: '2026-09-01T00:00:00Z',
    actualizadoEn: '2026-09-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(seguridadService.obtenerCatalogoPermisos).mockResolvedValue(mockCatalogo);
    vi.mocked(seguridadService.agruparCatalogoPorModulo).mockImplementation((items) => {
      const acc: Record<string, PermisoCatalogoItem[]> = {};
      items.forEach((item) => {
        if (!acc[item.modulo]) acc[item.modulo] = [];
        acc[item.modulo].push(item);
      });
      return acc;
    });
    vi.mocked(seguridadService.agruparPermisosPorModulo).mockImplementation((items) => {
      const acc: Record<string, Array<(typeof items)[number]>> = {};
      items.forEach((item) => {
        const mod = item.modulo || 'General';
        if (!acc[mod]) acc[mod] = [];
        acc[mod].push(item);
      });
      return acc;
    });
  });

  it('no renderiza nada si rol es nulo', () => {
    const { container } = render(
      <RolDetalleDrawer
        rol={null}
        usuarioId={usuarioId}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('muestra estado vacío y botón Asignar Permisos en perfil con 0 permisos en modo lectura', () => {
    render(
      <RolDetalleDrawer
        rol={mockRolDelegado}
        usuarioId={usuarioId}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Sin permisos asignados')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Asignar Permisos Ahora/i })).toBeInTheDocument();
  });

  it('transiciona a modo edición al hacer clic en "Modificar Permisos" y despliega el catálogo', async () => {
    render(
      <RolDetalleDrawer
        rol={mockRolDelegado}
        usuarioId={usuarioId}
        onClose={vi.fn()}
      />
    );

    const botonModificar = screen.getByRole('button', { name: /Modificar Permisos/i });
    fireEvent.click(botonModificar);

    await waitFor(() => {
      expect(screen.getByText(/Modo Edición/i)).toBeInTheDocument();
      expect(screen.getByText('Crear Recursos')).toBeInTheDocument();
      expect(screen.getByText('Asignar Misiones')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Guardar Cambios/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
  });

  it('bloquea la desmarcación de seguridad:roles:gestionar Y seguridad:roles:leer en Administrador', async () => {
    render(
      <RolDetalleDrawer
        rol={mockRolAdmin}
        usuarioId={usuarioId}
        onClose={vi.fn()}
      />
    );

    // Iniciar edición
    fireEvent.click(screen.getByRole('button', { name: /Modificar Permisos/i }));

    await waitFor(() => {
      expect(screen.getByText('Gestionar Roles y Permisos')).toBeInTheDocument();
      expect(screen.getByText('Visualizar Roles y Permisos')).toBeInTheDocument();
    });

    const checkGestionar = screen.getByLabelText(/Permiso Gestionar Roles y Permisos/i);
    const checkLeer = screen.getByLabelText(/Permiso Visualizar Roles y Permisos/i);

    expect(checkGestionar).toBeDisabled();
    expect(checkGestionar).toBeChecked();

    expect(checkLeer).toBeDisabled();
    expect(checkLeer).toBeChecked();

    const protegidos = screen.getAllByText(/Protegido/i);
    expect(protegidos.length).toBeGreaterThanOrEqual(2);
  });

  it('permite marcar permisos inactivos y guardar cambios en el Drawer persistiendo en BD', async () => {
    vi.mocked(seguridadService.actualizarPermisosRol).mockResolvedValueOnce({
      message: 'Permisos actualizados correctamente en la base de datos',
    });

    const onRolActualizadoMock = vi.fn();

    render(
      <RolDetalleDrawer
        rol={mockRolDelegado}
        usuarioId={usuarioId}
        onClose={vi.fn()}
        onRolActualizado={onRolActualizadoMock}
      />
    );

    // Iniciar edición desde el botón del SinPermisosState
    fireEvent.click(screen.getByRole('button', { name: /Asignar Permisos Ahora/i }));

    await waitFor(() => {
      expect(screen.getByText('Crear Recursos')).toBeInTheDocument();
    });

    const botonGuardar = screen.getByRole('button', { name: /Guardar Cambios/i });
    expect(botonGuardar).toBeDisabled();

    // Marcar permiso p-3
    const checkCrear = screen.getByLabelText(/Permiso Crear Recursos/i);
    expect(checkCrear).not.toBeChecked();

    fireEvent.click(checkCrear);
    expect(checkCrear).toBeChecked();
    expect(botonGuardar).not.toBeDisabled();

    // Guardar cambios
    fireEvent.click(botonGuardar);

    await waitFor(() => {
      expect(seguridadService.actualizarPermisosRol).toHaveBeenCalledWith(
        'rol-delegado',
        ['p-3'],
        usuarioId
      );
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Permisos actualizados correctamente en la base de datos',
        'Permisos Guardados'
      );
      expect(onRolActualizadoMock).toHaveBeenCalled();
    });
  });

  it('permite cancelar edición y descartar cambios volviendo a modo lectura', async () => {
    render(
      <RolDetalleDrawer
        rol={mockRolDelegado}
        usuarioId={usuarioId}
        onClose={vi.fn()}
      />
    );

    // Iniciar edición
    fireEvent.click(screen.getByRole('button', { name: /Modificar Permisos/i }));

    await waitFor(() => {
      expect(screen.getByText('Crear Recursos')).toBeInTheDocument();
    });

    // Marcar un permiso
    fireEvent.click(screen.getByLabelText(/Permiso Crear Recursos/i));

    // Cancelar edición
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));

    // Vuelve al estado de lectura de 0 permisos
    expect(screen.getByText('Sin permisos asignados')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Modificar Permisos/i })).toBeInTheDocument();
  });
});
