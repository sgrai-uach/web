import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RecursosTabla from '../RecursosTabla';
import RecursosFiltros from '../RecursosFiltros';
import BadgeEstado from '../BadgeEstado';
import AccesoDenegadoState from '../AccesoDenegadoState';
import RecursoRow from '../RecursoRow';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';
import { USUARIOS_SIMULADOS_SISTEMA, type UsuarioSimulado } from '@/config/usuariosSimulados';
import type { RecursoItem, EstadoRecurso } from '@/types/recurso';

// Mock de hook useCatalogos
vi.mock('@/hooks/useCatalogos', () => ({
  useCatalogos: () => ({
    nombresDelegaciones: ['Norte', 'Sur', 'Costa', 'Calle Calle'],
    resolverNombre: (id: string) => (id.includes('1') ? 'Norte' : undefined),
    cargando: false,
  }),
}));

const mockRecursosInventario: RecursoItem[] = [
  {
    id: 'rec-001',
    nombre: 'Camioneta Rescate 4x4',
    descripcion: 'Vehículo todoterreno para emergencias y traslado',
    tipo: 'Vehículo o Maquinaria',
    esIndividual: true,
    estado: 'DISPONIBLE',
    cantidadDisponible: 1,
    cantidadInventario: 1,
    cantidadEnUso: 0,
    cantidadMinima: 0,
    latitud: -39.8142,
    longitud: -73.2459,
    delegacion: { id: 'del-1', codigo: 'DEL_NORTE', nombre: 'Delegación Norte' },
    detalles: { patente: 'ABCD-12', marca: 'Toyota', modelo: 'Hilux', anio: 2023 },
    creadoPorId: 'usr-admin',
    creadoEn: '2026-09-15T08:00:00Z',
    actualizadoEn: '2026-09-15T08:00:00Z',
  },
  {
    id: 'rec-002',
    nombre: 'Motobomba de Achique 3"',
    descripcion: 'Bomba para extracción de agua en anegamientos',
    tipo: 'Vehículo o Maquinaria',
    esIndividual: true,
    estado: 'ASIGNADO',
    cantidadDisponible: 0,
    cantidadInventario: 1,
    cantidadEnUso: 1,
    cantidadMinima: 0,
    latitud: -39.8200,
    longitud: -73.2400,
    delegacion: { id: 'del-2', codigo: 'DEL_SUR', nombre: 'Delegación Sur' },
    detalles: { numeroSerie: 'MB-9921', caudalMaximoLpm: 1200 },
    creadoPorId: 'usr-admin',
    creadoEn: '2026-09-15T08:30:00Z',
    actualizadoEn: '2026-09-15T08:30:00Z',
  },
  {
    id: 'rec-003',
    nombre: 'Sacos de Arena',
    descripcion: 'Contención para desbordes de cauces y anegamientos',
    tipo: 'Material o Insumo',
    esIndividual: false,
    estado: 'DISPONIBLE',
    cantidadDisponible: 450,
    cantidadInventario: 500,
    cantidadEnUso: 50,
    cantidadMinima: 100,
    latitud: -39.8142,
    longitud: -73.2459,
    delegacion: null,
    detalles: {},
    creadoPorId: 'usr-admin',
    creadoEn: '2026-09-15T09:00:00Z',
    actualizadoEn: '2026-09-15T09:00:00Z',
  },
];

const createMockSessionEncargado = (permisos: string[] = ['recursos:leer', 'incidentes:kanban']) => {
  const usuarioActivo: UsuarioSimulado = {
    id: '00000000-0000-4000-8000-000000000003',
    nombre: 'Encargado de Operaciones',
    email: 'encargado@valdivia.cl',
    rut: '33.333.333-3',
    rol: 'Encargado',
    esAdmin: false,
    delegacion: 'Delegación Central',
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

describe('HU-14: Visualización de Recursos Disponibles y Asignados (Encargado)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CA-1: Listado y tabla centralizada de recursos existentes en inventario', () => {
    it('debe presentar la tabla con encabezados institucionales y renderizar los recursos registrados', () => {
      render(
        <RecursosTabla
          recursos={mockRecursosInventario}
          cargando={false}
          esFiltroActivo={false}
          onLimpiarFiltros={vi.fn()}
        />
      );

      // Encabezados requeridos
      expect(screen.getByText('Recurso / Identificador')).toBeDefined();
      expect(screen.getByText('Tipo')).toBeDefined();
      expect(screen.getByText('Disponibilidad y Stock')).toBeDefined();
      expect(screen.getByText('Procedencia Territorial')).toBeDefined();
      expect(screen.getByText('Estado')).toBeDefined();

      // Filas de recursos
      expect(screen.getByText('Camioneta Rescate 4x4')).toBeDefined();
      expect(screen.getByText('Motobomba de Achique 3"')).toBeDefined();
      expect(screen.getByText('Sacos de Arena')).toBeDefined();
    });

    it('debe desplegar el desglose cuantitativo de disponibilidad, stock total y unidades en terreno', () => {
      render(
        <table>
          <tbody>
            <RecursoRow
              recurso={mockRecursosInventario[0]}
              indice={0}
              onSeleccionar={vi.fn()}
            />
          </tbody>
        </table>
      );

      // Disponibilidad 1 disp. / 1 tot. y 0 en terreno
      expect(screen.getByText(/1 disp\./i)).toBeDefined();
      expect(screen.getByText(/\/ 1 tot\./i)).toBeDefined();
      expect(screen.getByText(/0 en terreno/i)).toBeDefined();
    });
  });

  describe('CA-2: Visualización del estado de disponibilidad actual mediante badges cromáticos', () => {
    it('debe renderizar el badge verde para recurso DISPONIBLE', () => {
      render(<BadgeEstado estado="DISPONIBLE" />);

      const badge = screen.getByText('Disponible');
      expect(badge).toBeDefined();
      expect(badge.style.color).toBe('rgb(46, 125, 50)'); // #2E7D32
      expect(badge.style.backgroundColor).toBe('rgb(232, 245, 233)'); // #E8F5E9
    });

    it('debe renderizar el badge azul para recurso ASIGNADO en terreno', () => {
      render(<BadgeEstado estado="ASIGNADO" />);

      const badge = screen.getByText('En Terreno / Asignado');
      expect(badge).toBeDefined();
      expect(badge.style.color).toBe('rgb(21, 101, 192)'); // #1565C0
      expect(badge.style.backgroundColor).toBe('rgb(227, 242, 253)'); // #E3F2FD
    });

    it('debe renderizar badge EN_MANTENCION con alerta ámbar para recursos no operativos', () => {
      render(<BadgeEstado estado="EN_MANTENCION" />);

      const badge = screen.getByText('En Mantención');
      expect(badge).toBeDefined();
      expect(badge.style.color).toBe('rgb(230, 81, 0)'); // #E65100
      expect(badge.style.backgroundColor).toBe('rgb(255, 243, 224)'); // #FFF3E0
    });
  });

  describe('CA-3: Filtrado de recursos por estado ("Disponibles" o "Asignados")', () => {
    it('debe permitir seleccionar el filtro de estado "DISPONIBLE" y emitir el cambio', () => {
      const handleCambiarEstado = vi.fn();

      render(
        <RecursosFiltros
          busqueda=""
          estado={undefined}
          onCambiarBusqueda={vi.fn()}
          onCambiarEstado={handleCambiarEstado}
          onCambiarDelegacion={vi.fn()}
          onCambiarEsIndividual={vi.fn()}
          onLimpiarFiltros={vi.fn()}
        />
      );

      const selectEstado = screen.getByLabelText(/Estado Operativo/i);
      fireEvent.change(selectEstado, { target: { value: 'DISPONIBLE' } });

      expect(handleCambiarEstado).toHaveBeenCalledWith('DISPONIBLE');
    });

    it('debe permitir seleccionar el filtro de estado "ASIGNADO" para recursos en terreno', () => {
      const handleCambiarEstado = vi.fn();

      render(
        <RecursosFiltros
          busqueda=""
          estado={undefined}
          onCambiarBusqueda={vi.fn()}
          onCambiarEstado={handleCambiarEstado}
          onCambiarDelegacion={vi.fn()}
          onCambiarEsIndividual={vi.fn()}
          onLimpiarFiltros={vi.fn()}
        />
      );

      const selectEstado = screen.getByLabelText(/Estado Operativo/i);
      fireEvent.change(selectEstado, { target: { value: 'ASIGNADO' } });

      expect(handleCambiarEstado).toHaveBeenCalledWith('ASIGNADO');
    });

    it('debe filtrar la tabla mostrando únicamente los recursos acordes al filtro activo', () => {
      const recursosFiltrados = mockRecursosInventario.filter((r) => r.estado === 'DISPONIBLE');

      render(
        <RecursosTabla
          recursos={recursosFiltrados}
          cargando={false}
          esFiltroActivo={true}
          onLimpiarFiltros={vi.fn()}
        />
      );

      expect(screen.getByText('Camioneta Rescate 4x4')).toBeDefined();
      expect(screen.getByText('Sacos de Arena')).toBeDefined();
      expect(screen.queryByText('Motobomba de Achique 3"')).toBeNull();
    });
  });

  describe('CA-4: Control de acceso RBAC — Restricción exclusiva para rol Encargado / autorizados', () => {
    it('debe verificar que el usuario activo posee rol "Encargado" y email institucional "encargado@valdivia.cl"', () => {
      const mockSession = createMockSessionEncargado(['recursos:leer']);

      expect(mockSession.usuarioActivo.rol).toBe('Encargado');
      expect(mockSession.usuarioActivo.email).toBe('encargado@valdivia.cl');
      expect(mockSession.hasPermission('recursos:leer')).toBe(true);
    });

    it('debe renderizar AccesoDenegadoState si el usuario carece del permiso de lectura', () => {
      render(
        <AccesoDenegadoState
          rolUsuario="Informante Ciudadano"
          onCambiarAAdmin={vi.fn()}
        />
      );

      expect(screen.getByText('Acceso Restringido')).toBeDefined();
      expect(screen.getByText(/Permisos insuficientes para el Inventario Logístico/i)).toBeDefined();
      expect(screen.getByText(/con perfil «Informante Ciudadano»/i)).toBeDefined();
    });
  });

  describe('CA-5: Reflejo reactivo de datos actualizados ante asignación de recursos', () => {
    it('debe reflejar el cambio inmediato de estado y conteo cuando un recurso es asignado', () => {
      // Simular recurso inicialmente disponible
      const recursoInicial: RecursoItem = {
        ...mockRecursosInventario[0],
        estado: 'DISPONIBLE',
        cantidadDisponible: 1,
        cantidadEnUso: 0,
      };

      const { rerender } = render(
        <table>
          <tbody>
            <RecursoRow
              recurso={recursoInicial}
              indice={0}
              onSeleccionar={vi.fn()}
            />
          </tbody>
        </table>
      );

      expect(screen.getByText('Disponible')).toBeDefined();
      expect(screen.getByText(/0 en terreno/i)).toBeDefined();

      // Simular actualización reactiva tras despacho de misión: recurso asignado a cuadrilla
      const recursoAsignado: RecursoItem = {
        ...recursoInicial,
        estado: 'ASIGNADO',
        cantidadDisponible: 0,
        cantidadEnUso: 1,
      };

      rerender(
        <table>
          <tbody>
            <RecursoRow
              recurso={recursoAsignado}
              indice={0}
              onSeleccionar={vi.fn()}
            />
          </tbody>
        </table>
      );

      expect(screen.getByText('En Terreno / Asignado')).toBeDefined();
      expect(screen.getByText(/1 en terreno/i)).toBeDefined();
      expect(screen.getByText(/0 disp\./i)).toBeDefined();
      expect(screen.queryByText('Disponible')).toBeNull();
    });
  });
});
