import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import PuntosCriticosPage from '../page';
import * as usePuntosCriticosModule from '@/hooks/usePuntosCriticos';
import * as sessionContextModule from '@/context/SimulatedSessionContext';
import type { PuntoCriticoItem } from '@/types/puntoCritico';

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}));

const mockPunto: PuntoCriticoItem = {
  id: '40000000-0000-4000-8000-000000000001',
  codigo: 'PC-ANG-01',
  nombre: 'Sector Humedal Angachilla',
  descripcion: 'Zona baja con riesgo de anegamiento',
  tipoRiesgo: 'Inundación y anegamiento',
  prioridad: 'ALTA',
  activo: true,
  estadoTexto: 'Activo',
  latitud: -39.8456,
  longitud: -73.2389,
  delegacion: {
    id: '30000000-0000-4000-8000-000000000002',
    codigo: 'DEL_SUR',
    nombre: 'Delegación Municipal Sur',
  },
  creadoEn: '2026-06-15T12:00:00.000Z',
};

describe('PuntosCriticosPage - RBAC y Renderizado (CA-1, CA-4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el módulo de puntos críticos si el usuario tiene rol Administrador', () => {
    vi.spyOn(sessionContextModule, 'useSimulatedSession').mockReturnValue({
      usuarioActivo: {
        id: '00000000-0000-4000-8000-000000000001',
        nombre: 'Administrador General',
        email: 'admin@valdivia.cl',
        rut: '11.111.111-1',
        rol: 'Administrador',
        esAdmin: true,
      },
      setUsuarioActivo: vi.fn(),
      cambiarUsuarioPorId: vi.fn(),
      usuariosDisponibles: [],
      permisos: new Set(['puntos_criticos:leer']),
      cargandoPermisos: false,
      refrescarPermisos: vi.fn(),
      hasPermission: vi.fn().mockReturnValue(true),
      hasAnyPermission: vi.fn().mockReturnValue(true),
      usuarioDetalleServidor: null,
    });

    vi.spyOn(usePuntosCriticosModule, 'usePuntosCriticos').mockReturnValue({
      puntosCriticos: [mockPunto],
      meta: { total: 1, pagina: 1, limite: 10, totalPaginas: 1 },
      cargando: false,
      error: null,
      statusCode: 200,
      removerPuntoLocalmente: vi.fn(),
    });

    render(<PuntosCriticosPage />);

    expect(screen.getByText('Puntos Críticos y Sectores Vulnerables')).toBeInTheDocument();
    expect(screen.getByText('PC-ANG-01')).toBeInTheDocument();
  });

  it('debe renderizar AccesoDenegadoState si el usuario carece de permiso o recibe 403 Forbidden (CA-4)', () => {
    vi.spyOn(sessionContextModule, 'useSimulatedSession').mockReturnValue({
      usuarioActivo: {
        id: '00000000-0000-4000-8000-000000000002',
        nombre: 'Operador Call Center',
        email: 'callcenter@valdivia.cl',
        rut: '22.222.222-2',
        rol: 'Call Center',
        esAdmin: false,
      },
      setUsuarioActivo: vi.fn(),
      cambiarUsuarioPorId: vi.fn(),
      usuariosDisponibles: [],
      permisos: new Set(),
      cargandoPermisos: false,
      refrescarPermisos: vi.fn(),
      hasPermission: vi.fn().mockReturnValue(false),
      hasAnyPermission: vi.fn().mockReturnValue(false),
      usuarioDetalleServidor: null,
    });

    vi.spyOn(usePuntosCriticosModule, 'usePuntosCriticos').mockReturnValue({
      puntosCriticos: [],
      meta: { total: 0, pagina: 1, limite: 10, totalPaginas: 1 },
      cargando: false,
      error: new Error('Acceso no autorizado'),
      statusCode: 403,
      recargar: vi.fn(),
      removerPuntoLocalmente: vi.fn(),
    });

    render(<PuntosCriticosPage />);

    expect(screen.getByText('Acceso Restringido')).toBeInTheDocument();
    expect(
      screen.getByText(/No cuenta con los permisos necesarios para acceder a esta sección/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/puede solicitarlos a un administrador/i)
    ).toBeInTheDocument();
    expect(screen.queryByText('PC-ANG-01')).toBeNull();
  });

  it('debe permitir el acceso a un usuario NO Administrador si cuenta con el permiso puntos_criticos:leer (CA-4)', () => {
    vi.spyOn(sessionContextModule, 'useSimulatedSession').mockReturnValue({
      usuarioActivo: {
        id: '00000000-0000-4000-8000-000000000003',
        nombre: 'Encargado de Emergencias',
        email: 'encargado@valdivia.cl',
        rut: '33.333.333-3',
        rol: 'Encargado',
        esAdmin: false,
      },
      setUsuarioActivo: vi.fn(),
      cambiarUsuarioPorId: vi.fn(),
      usuariosDisponibles: [],
      permisos: new Set(['puntos_criticos:leer']),
      cargandoPermisos: false,
      refrescarPermisos: vi.fn(),
      hasPermission: vi.fn((codigo: string) => codigo === 'puntos_criticos:leer'),
      hasAnyPermission: vi.fn().mockReturnValue(true),
      usuarioDetalleServidor: null,
    });

    vi.spyOn(usePuntosCriticosModule, 'usePuntosCriticos').mockReturnValue({
      puntosCriticos: [mockPunto],
      meta: { total: 1, pagina: 1, limite: 10, totalPaginas: 1 },
      cargando: false,
      error: null,
      statusCode: 200,
      recargar: vi.fn(),
      removerPuntoLocalmente: vi.fn(),
    });

    render(<PuntosCriticosPage />);

    expect(screen.getByText('Puntos Críticos y Sectores Vulnerables')).toBeInTheDocument();
    expect(screen.getByText('PC-ANG-01')).toBeInTheDocument();
    expect(screen.queryByText('Acceso Restringido')).toBeNull();
  });

  it('debe permitir el acceso si la API responde 200 OK autorizando al usuario aunque su rol sea distinto de Administrador', () => {
    vi.spyOn(sessionContextModule, 'useSimulatedSession').mockReturnValue({
      usuarioActivo: {
        id: '00000000-0000-4000-8000-000000000004',
        nombre: 'Supervisor Operativo',
        email: 'supervisor@valdivia.cl',
        rut: '44.444.444-4',
        rol: 'Supervisor',
        esAdmin: false,
      },
      setUsuarioActivo: vi.fn(),
      cambiarUsuarioPorId: vi.fn(),
      usuariosDisponibles: [],
      permisos: new Set(),
      cargandoPermisos: false,
      refrescarPermisos: vi.fn(),
      hasPermission: vi.fn().mockReturnValue(false),
      hasAnyPermission: vi.fn().mockReturnValue(false),
      usuarioDetalleServidor: null,
    });

    vi.spyOn(usePuntosCriticosModule, 'usePuntosCriticos').mockReturnValue({
      puntosCriticos: [mockPunto],
      meta: { total: 1, pagina: 1, limite: 10, totalPaginas: 1 },
      cargando: false,
      error: null,
      statusCode: 200,
      recargar: vi.fn(),
      removerPuntoLocalmente: vi.fn(),
    });

    render(<PuntosCriticosPage />);

    expect(screen.getByText('Puntos Críticos y Sectores Vulnerables')).toBeInTheDocument();
    expect(screen.getByText('PC-ANG-01')).toBeInTheDocument();
    expect(screen.queryByText('Acceso Restringido')).toBeNull();
  });

  describe('Interacción de Eliminación y Modos de Vista (HU-56)', () => {
    beforeEach(() => {
      vi.spyOn(sessionContextModule, 'useSimulatedSession').mockReturnValue({
        usuarioActivo: {
          id: '00000000-0000-4000-8000-000000000001',
          nombre: 'Administrador General',
          email: 'admin@valdivia.cl',
          rut: '11.111.111-1',
          rol: 'Administrador',
          esAdmin: true,
        },
        setUsuarioActivo: vi.fn(),
        cambiarUsuarioPorId: vi.fn(),
        usuariosDisponibles: [],
        permisos: new Set(['puntos_criticos:leer', 'puntos_criticos:eliminar']),
        cargandoPermisos: false,
        refrescarPermisos: vi.fn(),
        hasPermission: vi.fn().mockReturnValue(true),
        hasAnyPermission: vi.fn().mockReturnValue(true),
        usuarioDetalleServidor: null,
      });
    });

    it('debe permitir alternar entre Vista Tabla y Vista Mapa', async () => {
      vi.spyOn(usePuntosCriticosModule, 'usePuntosCriticos').mockReturnValue({
        puntosCriticos: [mockPunto],
        meta: { total: 1, pagina: 1, limite: 10, totalPaginas: 1 },
        cargando: false,
        error: null,
        statusCode: 200,
        recargar: vi.fn(),
        removerPuntoLocalmente: vi.fn(),
      });

      render(<PuntosCriticosPage />);

      const btnMapa = screen.getByRole('button', { name: /vista mapa/i });
      expect(btnMapa).toBeInTheDocument();

      const { fireEvent } = await import('@testing-library/react');
      fireEvent.click(btnMapa);

      expect(screen.getByRole('button', { name: /vista tabla/i })).toBeInTheDocument();
    });

    it('debe abrir el modal de confirmación al hacer clic en Desactivar desde la tabla', async () => {
      vi.spyOn(usePuntosCriticosModule, 'usePuntosCriticos').mockReturnValue({
        puntosCriticos: [mockPunto],
        meta: { total: 1, pagina: 1, limite: 10, totalPaginas: 1 },
        cargando: false,
        error: null,
        statusCode: 200,
        recargar: vi.fn(),
        removerPuntoLocalmente: vi.fn(),
      });

      render(<PuntosCriticosPage />);

      const { fireEvent } = await import('@testing-library/react');
      const botonDesactivar = screen.getByRole('button', {
        name: `Desactivar punto crítico ${mockPunto.codigo}`,
      });

      fireEvent.click(botonDesactivar);

      expect(screen.getByText(/¿Está seguro de desactivar este punto crítico\?/i)).toBeInTheDocument();
    });
  });
});

