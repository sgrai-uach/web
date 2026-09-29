import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ModalModificarPermisos from '../editor/ModalModificarPermisos';
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
}));

describe('ModalModificarPermisos Component (HU-5)', () => {
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
      codigo: 'recursos:crear',
      nombre: 'Crear Recursos',
      descripcion: 'Permite registrar nuevos recursos',
      modulo: 'Recursos y Personal',
    },
    {
      id: 'p-3',
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
        codigo: 'recursos:crear',
        nombre: 'Crear Recursos',
        descripcion: null,
        modulo: 'Recursos y Personal',
        asignadoEn: '2026-09-01T00:00:00Z',
        asignadoPorId: null,
      },
    ],
    creadoEn: '2026-09-01T00:00:00Z',
    actualizadoEn: '2026-09-01T00:00:00Z',
  };

  const mockRolCallCenter: RolItem = {
    id: 'rol-callcenter',
    nombre: 'Call Center',
    descripcion: 'Recepción y verificación',
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
  });

  it('no renderiza nada si isOpen es falso o rol es nulo', () => {
    const { container } = render(
      <ModalModificarPermisos
        isOpen={false}
        rol={mockRolAdmin}
        usuarioId={usuarioId}
        onClose={vi.fn()}
        onGuardadoExitoso={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza título del rol, módulos y permisos cuando está abierto', async () => {
    render(
      <ModalModificarPermisos
        isOpen={true}
        rol={mockRolCallCenter}
        usuarioId={usuarioId}
        onClose={vi.fn()}
        onGuardadoExitoso={vi.fn()}
      />
    );

    expect(screen.getByText(/Modificar Permisos — Call Center/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Gestionar Roles y Permisos')).toBeInTheDocument();
      expect(screen.getByText('Crear Recursos')).toBeInTheDocument();
      expect(screen.getByText('Asignar Misiones')).toBeInTheDocument();
    });
  });

  it('bloquea la desmarcación del permiso crítico en perfil Administrador (Criterio 3)', async () => {
    render(
      <ModalModificarPermisos
        isOpen={true}
        rol={mockRolAdmin}
        usuarioId={usuarioId}
        onClose={vi.fn()}
        onGuardadoExitoso={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Gestionar Roles y Permisos')).toBeInTheDocument();
    });

    const checkboxGestionar = screen.getByLabelText(/Permiso Gestionar Roles y Permisos/i);
    expect(checkboxGestionar).toBeDisabled();
    expect(checkboxGestionar).toBeChecked();
    expect(screen.getByText(/Protegido/i)).toBeInTheDocument();
  });

  it('permite marcar permisos inactivos y activa el botón Guardar Cambios (Criterios 1, 2, 3)', async () => {
    render(
      <ModalModificarPermisos
        isOpen={true}
        rol={mockRolCallCenter}
        usuarioId={usuarioId}
        onClose={vi.fn()}
        onGuardadoExitoso={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Crear Recursos')).toBeInTheDocument();
    });

    const botonGuardar = screen.getByRole('button', { name: /Guardar Cambios/i });
    expect(botonGuardar).toBeDisabled();

    // Marcar "Crear Recursos"
    const checkboxCrear = screen.getByLabelText(/Permiso Crear Recursos/i);
    expect(checkboxCrear).not.toBeChecked();

    fireEvent.click(checkboxCrear);
    expect(checkboxCrear).toBeChecked();
    expect(botonGuardar).not.toBeDisabled();
  });

  it('ejecuta actualizarPermisosRol y onGuardadoExitoso al guardar cambios (Criterio 4)', async () => {
    vi.mocked(seguridadService.actualizarPermisosRol).mockResolvedValueOnce({
      message: 'Permisos persistidos en BD',
    });

    const onExitoMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <ModalModificarPermisos
        isOpen={true}
        rol={mockRolCallCenter}
        usuarioId={usuarioId}
        onClose={onCloseMock}
        onGuardadoExitoso={onExitoMock}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Crear Recursos')).toBeInTheDocument();
    });

    // Marcar permiso p-2
    fireEvent.click(screen.getByLabelText(/Permiso Crear Recursos/i));

    // Clic en Guardar Cambios
    const botonGuardar = screen.getByRole('button', { name: /Guardar Cambios/i });
    fireEvent.click(botonGuardar);

    await waitFor(() => {
      expect(seguridadService.actualizarPermisosRol).toHaveBeenCalledWith(
        'rol-callcenter',
        ['p-2'],
        usuarioId
      );
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Permisos persistidos en BD',
        'Permisos Guardados'
      );
      expect(onExitoMock).toHaveBeenCalled();
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  it('muestra toast de error si la carga del catálogo falla (Criterio de feedback con toast)', async () => {
    vi.mocked(seguridadService.obtenerCatalogoPermisos).mockRejectedValueOnce(
      new Error('Error de red')
    );

    render(
      <ModalModificarPermisos
        isOpen={true}
        rol={mockRolCallCenter}
        usuarioId={usuarioId}
        onClose={vi.fn()}
        onGuardadoExitoso={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'No fue posible cargar el catálogo de permisos desde el servidor.',
        'Error de Catálogo'
      );
    });
  });

  it('permite filtrar permisos por texto de búsqueda', async () => {
    render(
      <ModalModificarPermisos
        isOpen={true}
        rol={mockRolCallCenter}
        usuarioId={usuarioId}
        onClose={vi.fn()}
        onGuardadoExitoso={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Crear Recursos')).toBeInTheDocument();
    });

    const inputFiltro = screen.getByLabelText('Filtrar permisos');
    fireEvent.change(inputFiltro, { target: { value: 'misiones' } });

    expect(screen.getByText('Asignar Misiones')).toBeInTheDocument();
    expect(screen.queryByText('Crear Recursos')).not.toBeInTheDocument();
  });
});
