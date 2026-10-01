import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecursosHeader from '../RecursosHeader';
import RecursosEmptyState from '../RecursosEmptyState';
import RecursoRow from '../RecursoRow';
import BadgeEstado from '../BadgeEstado';
import NuevoRecursoClient from '../NuevoRecursoClient';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';
import { USUARIOS_SIMULADOS_SISTEMA, type UsuarioSimulado } from '@/config/usuariosSimulados';
import type { RecursoItem } from '@/types/recurso';

// Mock de useRouter para evitar errores de navegación de Next.js
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/admin/recursos',
}));

// Mock de RecursoForm para simplificar renderizado en tests de ruta
vi.mock('@/components/admin/RecursoForm', () => ({
  default: () => <div data-testid="recurso-form-mock">Formulario de Registro</div>,
}));

const mockRecurso: RecursoItem = {
  id: 'rec-001',
  nombre: 'Bomba de Achique 3"',
  descripcion: 'Motobomba para inundaciones',
  tipo: 'Motobomba',
  esIndividual: true,
  cantidadDisponible: 3,
  cantidadInventario: 5,
  cantidadEnUso: 2,
  cantidadMinima: 1,
  estado: 'EN_MANTENCION',
  delegacionId: 'del-central',
  delegacion: { id: 'del-central', nombre: 'Delegación Central' },
  detalles: { patente: 'BB-CC-11' },
  latitud: -39.8142,
  longitud: -73.2459,
  creadoEn: '2026-03-01T10:00:00Z',
  actualizadoEn: '2026-03-01T12:00:00Z',
};

const createMockSession = (
  permisos: string[] = ['recursos:leer'],
  usuario: Partial<UsuarioSimulado> = {}
) => {
  const usuarioActivo: UsuarioSimulado = {
    id: '00000000-0000-4000-8000-000000000010',
    nombre: 'Supervisor Estratégico',
    email: 'supervisor@valdivia.cl',
    rut: '44.444.444-4',
    rol: 'Supervisor Estratégico',
    esAdmin: false,
    delegacion: 'Delegación Central',
    ...usuario,
  };

  const setPermisos = new Set(permisos);

  return {
    usuarioActivo,
    setUsuarioActivo: vi.fn(),
    cambiarUsuarioPorId: vi.fn(),
    usuariosDisponibles: USUARIOS_SIMULADOS_SISTEMA,
    permisos: setPermisos,
    cargandoPermisos: false,
    refrescarPermisos: vi.fn(),
    hasPermission: (codigo: string) => setPermisos.has(codigo),
    hasAnyPermission: (codigos: string[]) => codigos.some((c) => setPermisos.has(c)),
    usuarioDetalleServidor: null,
  };
};

describe('H50: Control de Acceso por Permisos Granulares en Recursos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. RecursosHeader — Visibilidad del botón "Registrar Nuevo Recurso"', () => {
    it('NO renderiza el botón de nuevo recurso si puedeCrear es false (ej. Supervisor)', () => {
      render(
        <RecursosHeader
          totalRecursos={12}
          tieneAcceso={true}
          puedeCrear={false}
        />
      );

      // El título y contador están presentes
      expect(screen.getByRole('heading', { name: 'Inventario Logístico' })).toBeDefined();
      expect(screen.getByText('12 recursos')).toBeDefined();

      // El botón NO debe existir en el DOM
      const botonNuevo = screen.queryByRole('link', { name: /Registrar Nuevo Recurso/i });
      expect(botonNuevo).toBeNull();
    });

    it('SÍ renderiza el botón de nuevo recurso si puedeCrear es true (ej. Admin o funcionario con permiso)', () => {
      render(
        <RecursosHeader
          totalRecursos={12}
          tieneAcceso={true}
          puedeCrear={true}
        />
      );

      const botonNuevo = screen.getByRole('link', { name: /Registrar Nuevo Recurso/i });
      expect(botonNuevo).toBeDefined();
      expect(botonNuevo.getAttribute('href')).toBe('/admin/recursos/nuevo');
    });

    it('NO renderiza el botón si tieneAcceso es false aunque puedeCrear sea true', () => {
      render(
        <RecursosHeader
          totalRecursos={0}
          tieneAcceso={false}
          puedeCrear={true}
        />
      );

      const botonNuevo = screen.queryByRole('link', { name: /Registrar Nuevo Recurso/i });
      expect(botonNuevo).toBeNull();
    });
  });

  describe('2. RecursosEmptyState — Visibilidad condicionada en estado vacío', () => {
    it('NO renderiza el botón "Registrar Nuevo Recurso" si puedeCrear es false', () => {
      render(
        <RecursosEmptyState
          esFiltroActivo={false}
          puedeCrear={false}
        />
      );

      expect(screen.getByText('No hay recursos registrados')).toBeDefined();
      expect(
        screen.getByText(/Actualmente no existen recursos ingresados en el inventario logístico municipal/i)
      ).toBeDefined();

      const botonNuevo = screen.queryByRole('link', { name: /Registrar Nuevo Recurso/i });
      expect(botonNuevo).toBeNull();
    });

    it('SÍ renderiza el botón si puedeCrear es true en estado sin registros', () => {
      render(
        <RecursosEmptyState
          esFiltroActivo={false}
          puedeCrear={true}
        />
      );

      const botonNuevo = screen.getByRole('link', { name: /Registrar Nuevo Recurso/i });
      expect(botonNuevo).toBeDefined();
      expect(botonNuevo.getAttribute('href')).toBe('/admin/recursos/nuevo');
    });

    it('muestra únicamente el botón de "Limpiar Filtros" si hay filtros activos y puedeCrear es false', () => {
      const handleLimpiar = vi.fn();
      render(
        <RecursosEmptyState
          esFiltroActivo={true}
          onLimpiarFiltros={handleLimpiar}
          puedeCrear={false}
        />
      );

      expect(screen.getByRole('button', { name: /Limpiar Filtros/i })).toBeDefined();
      expect(screen.queryByRole('link', { name: /Registrar Nuevo Recurso/i })).toBeNull();
    });
  });

  describe('3. NuevoRecursoClient — Protección estricta de la ruta de creación', () => {
    it('bloquea la vista y muestra AccesoDenegadoState si el usuario carece de recursos:crear', () => {
      const mockSessionSupervisor = createMockSession(['recursos:leer']);

      render(
        <SimulatedSessionContext.Provider value={mockSessionSupervisor}>
          <NuevoRecursoClient />
        </SimulatedSessionContext.Provider>
      );

      // Debe mostrar el componente de acceso denegado
      expect(screen.getByText(/Acceso Restringido/i)).toBeDefined();
      expect(screen.getByText(/Permisos insuficientes para el Registro de Recursos/i)).toBeDefined();
      expect(screen.getByRole('link', { name: /Volver al Inventario/i })).toBeDefined();

      // En ningún caso debe renderizar el formulario
      expect(screen.queryByTestId('recurso-form-mock')).toBeNull();
      expect(screen.queryByText(/Registrar Nuevo Recurso/i)).toBeNull();
    });

    it('permite el acceso y renderiza el formulario a cualquier usuario con recursos:crear', () => {
      // Incluso con un rol personalizado distinto, si tiene recursos:crear tiene acceso
      const mockSessionConPermiso = createMockSession(['recursos:leer', 'recursos:crear'], {
        rol: 'Encargado de Logística',
      });

      render(
        <SimulatedSessionContext.Provider value={mockSessionConPermiso}>
          <NuevoRecursoClient />
        </SimulatedSessionContext.Provider>
      );

      expect(screen.getByText('Registrar Nuevo Recurso')).toBeDefined();
      expect(screen.getByTestId('recurso-form-mock')).toBeDefined();
      expect(screen.queryByText(/Acceso Restringido/i)).toBeNull();
    });
  });

  describe('4. RecursoRow y BadgeEstado — Etiquetas legibles y modo solo lectura', () => {
    it('muestra el estado en formato legible amigable sin strings crudos en mayúsculas', () => {
      const { container } = render(<BadgeEstado estado="EN_MANTENCION" />);

      // Debe mostrar "En Mantención"
      expect(screen.getByText('En Mantención')).toBeDefined();
      // NO debe tener el string en mayúsculas crudo
      expect(container.textContent).not.toContain('EN_MANTENCION');
    });

    it('formatea correctamente todos los estados del catálogo de recursos', () => {
      const estados = [
        { codigo: 'DISPONIBLE' as const, label: 'Disponible' },
        { codigo: 'ASIGNADO' as const, label: 'En Terreno / Asignado' },
        { codigo: 'EN_MANTENCION' as const, label: 'En Mantención' },
        { codigo: 'BAJO_STOCK' as const, label: 'Bajo Stock (Alerta)' },
        { codigo: 'NO_DISPONIBLE' as const, label: 'No Disponible' },
      ];

      for (const { codigo, label } of estados) {
        const { unmount } = render(<BadgeEstado estado={codigo} />);
        expect(screen.getByText(label)).toBeDefined();
        unmount();
      }
    });

    it('RecursoRow renderiza el botón "Ver Ficha" y ninguna acción destructiva o de edición', () => {
      const onSeleccionar = vi.fn();

      render(
        <table>
          <tbody>
            <RecursoRow
              recurso={mockRecurso}
              indice={0}
              onSeleccionar={onSeleccionar}
            />
          </tbody>
        </table>
      );

      // Ver ficha está disponible
      expect(screen.getByRole('button', { name: /Ver Ficha/i })).toBeDefined();

      // No existen botones de mutación como Editar o Eliminar
      expect(screen.queryByRole('button', { name: /Editar/i })).toBeNull();
      expect(screen.queryByRole('button', { name: /Eliminar/i })).toBeNull();
    });
  });

  describe('5. Catálogo de Sesión Simulada — Configuración del Supervisor', () => {
    it('el catálogo contiene al Supervisor Estratégico con el email institucional supervisor@valdivia.cl', () => {
      const supervisor = USUARIOS_SIMULADOS_SISTEMA.find(
        (u) => u.email === 'supervisor@valdivia.cl'
      );

      expect(supervisor).toBeDefined();
      expect(supervisor?.id).toBe('00000000-0000-4000-8000-000000000010');
      expect(supervisor?.rol).toBe('Supervisor Estratégico');
      expect(supervisor?.esAdmin).toBe(false);
    });
  });
});
