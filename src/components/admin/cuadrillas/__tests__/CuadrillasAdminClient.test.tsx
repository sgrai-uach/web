import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CuadrillasAdminClient from '../CuadrillasAdminClient';
import * as SimulatedSessionModule from '@/context/SimulatedSessionContext';

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

vi.mock('@/hooks/useCuadrillas', () => ({
  useCuadrillas: () => ({
    cuadrillas: [],
    meta: { total: 0, pagina: 1, limite: 10, paginasTotales: 1 },
    cargando: false,
    actualizarCuadrillaEnLista: vi.fn(),
    removerCuadrillaDeLista: vi.fn(),
    recargar: vi.fn(),
  }),
}));

vi.mock('@/services/cuadrillasService', () => ({
  cuadrillasService: {
    obtenerDelegaciones: vi.fn().mockResolvedValue([]),
    desactivarCuadrilla: vi.fn(),
  },
}));

describe('CuadrillasAdminClient RBAC (HU-82 / BUG-H82-WEB-03)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe bloquear el acceso y mostrar AccesoDenegadoState si el usuario carece del permiso recursos:leer', () => {
    vi.spyOn(SimulatedSessionModule, 'useSimulatedSession').mockReturnValue({
      usuarioActivo: {
        id: 'usr-callcenter',
        nombre: 'Operador Call Center',
        rol: 'Call Center',
        rut: '12.345.678-9',
        email: 'callcenter@valdivia.cl',
        avatarColor: '#1B6F7D',
        permisos: ['avisos:leer'],
      },
      hasPermission: (permiso: string) => permiso === 'avisos:leer',
      isMounted: true,
      usuariosDisponibles: [],
      cambiarUsuarioPorId: vi.fn(),
      setUsuarioActivo: vi.fn(),
      usuarioDetalle: null,
      cargandoDetalle: false,
    });

    render(<CuadrillasAdminClient />);

    expect(screen.getByText(/Acceso Restringido/i)).toBeDefined();
    expect(screen.getByText(/Visualización del Inventario Logístico/i)).toBeDefined();
  });

  it('debe permitir la visualización de la interfaz si el usuario posee recursos:leer', () => {
    vi.spyOn(SimulatedSessionModule, 'useSimulatedSession').mockReturnValue({
      usuarioActivo: {
        id: 'usr-admin',
        nombre: 'Administrador Municipal',
        rol: 'Administrador',
        rut: '11.111.111-1',
        email: 'admin@valdivia.cl',
        avatarColor: '#1B6F7D',
        permisos: ['recursos:leer', 'cuadrillas:eliminar'],
      },
      hasPermission: (permiso: string) => permiso === 'recursos:leer' || permiso === 'cuadrillas:eliminar',
      isMounted: true,
      usuariosDisponibles: [],
      cambiarUsuarioPorId: vi.fn(),
      setUsuarioActivo: vi.fn(),
      usuarioDetalle: null,
      cargandoDetalle: false,
    });

    render(<CuadrillasAdminClient />);

    expect(screen.getByRole('heading', { level: 1, name: 'Cuadrillas Operativas' })).toBeDefined();
    expect(screen.queryByText(/Acceso Restringido/i)).toBeNull();
  });
});
