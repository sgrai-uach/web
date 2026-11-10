import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModalAsignarCuadrilla } from '../ModalAsignarCuadrilla';
import { cuadrillasService } from '@/services/cuadrillasService';
import { misionesService } from '@/services/misionesService';
import type { IncidenteDetalle } from '@/services/incidentesService';
import type { CuadrillaItem } from '@/types/cuadrilla';

describe('ModalAsignarCuadrilla (HU-21 / Regla ICS §3.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockIncidenteConPatrullaEnCurso: IncidenteDetalle = {
    id: 'inc-01',
    codigo: 'INC-2026-0001',
    codigoSeguimiento: '112233',
    tipoAfectacion: 'Desborde de Río',
    descripcion: 'Agua anega calzada',
    direccion: 'Costanera Arturo Prat',
    latitud: -39.81,
    longitud: -73.24,
    estado: 'VERIFICANDO',
    prioridad: 'ALTA',
    requiereAsistenciaSocial: false,
    fuenteOrigen: 'CALL_CENTER',
    informante: null,
    delegacion: null,
    misiones: [
      {
        id: 'mis-verif-01',
        codigo: 'MIS-2026-0010',
        titulo: 'Verificar nivel de inundación',
        descripcion: 'Inspección visual en sitio',
        tipoMision: 'VERIFICACION',
        estado: 'EN_SITIO', // En curso -> relevo táctico pendiente según ICS §3.2
        prioridad: 'ALTA',
        justificacionRechazo: null,
        patrulla: {
          id: 'pat-01',
          nombre: 'Patrulla Rápida Costa 1',
          estado: 'EN_TERRENO',
        },
        cuadrilla: null,
        fechaInicio: '2026-10-02T10:00:00Z',
        fechaCierre: null,
        creadoEn: '2026-10-02T09:30:00Z',
      },
    ],
    recursosAsociados: [],
    creadoEn: '2026-10-02T09:00:00Z',
    actualizadoEn: '2026-10-02T10:00:00Z',
  };

  const mockIncidenteVerificacionConcluida: IncidenteDetalle = {
    ...mockIncidenteConPatrullaEnCurso,
    id: 'inc-02',
    codigo: 'INC-2026-0002',
    estado: 'VERIFICANDO',
    misiones: [
      {
        ...mockIncidenteConPatrullaEnCurso.misiones[0],
        estado: 'COMPLETADA', // Ya terminó de verificar -> antecedente técnico cerrado
      },
    ],
  };

  const mockCuadrillasDisponibles: CuadrillaItem[] = [
    {
      id: 'cuad-01',
      nombre: 'Cuadrilla Vías y Canales 1',
      estado: 'DISPONIBLE',
      delegacionId: 'del-01',
      delegacionNombre: 'Costera',
      usuarioDelegadoId: 'usr-01',
      totalTrabajadores: 6,
      totalRecursos: 2,
      creadoEn: '2026-01-01T00:00:00Z',
    },
    {
      id: 'cuad-02',
      nombre: 'Cuadrilla Emergencias Viales 2',
      estado: 'DISPONIBLE',
      delegacionId: 'del-02',
      delegacionNombre: 'Sur',
      usuarioDelegadoId: 'usr-02',
      totalTrabajadores: 4,
      totalRecursos: 1,
      creadoEn: '2026-01-01T00:00:00Z',
    },
  ];

  it('no se renderiza si isOpen es false o incidente es null', () => {
    const { container } = render(
      <ModalAsignarCuadrilla
        isOpen={false}
        onClose={vi.fn()}
        incidente={mockIncidenteConPatrullaEnCurso}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('muestra la tarjeta de relevo táctico ICS §3.2 cuando la patrulla sigue asociada a la verificación', async () => {
    vi.spyOn(cuadrillasService, 'obtenerCuadrillas').mockResolvedValueOnce({
      cuadrillas: mockCuadrillasDisponibles,
      meta: { total: 2, pagina: 1, limite: 10, paginasTotales: 1 },
    });

    render(
      <ModalAsignarCuadrilla
        isOpen={true}
        onClose={vi.fn()}
        incidente={mockIncidenteConPatrullaEnCurso}
      />
    );

    // Debe mostrar la tarjeta informativa de la regla ICS §3.2 explicando que la patrulla será relevada
    expect(screen.getByText(/Regla de Negocio ICS §3.2 \(Relevo Táctico\)/i)).toBeDefined();
    expect(screen.getByText(/Patrulla Rápida Costa 1/i)).toBeDefined();
    expect(screen.getByText(/será automáticamente relevada a estado/i)).toBeDefined();

    // Esperar a que se listen las cuadrillas disponibles en el selector
    await waitFor(() => {
      expect(screen.getByText(/Cuadrilla Vías y Canales 1/i)).toBeDefined();
    });

    // El botón debe permanecer habilitable una vez seleccionada la cuadrilla (no vetado de antemano)
    const selectCuadrilla = screen.getByRole('combobox', { name: /Cuadrilla Operativa/i });
    fireEvent.change(selectCuadrilla, { target: { value: 'cuad-01' } });

    const submitBtn = screen.getByRole('button', { name: /Confirmar y Despachar/i });
    expect(submitBtn.hasAttribute('disabled')).toBe(false);
  });

  it('muestra antecedente técnico cerrado y permite despachar cuando la verificación ya terminó', async () => {
    vi.spyOn(cuadrillasService, 'obtenerCuadrillas').mockResolvedValueOnce({
      cuadrillas: mockCuadrillasDisponibles,
      meta: { total: 2, pagina: 1, limite: 10, paginasTotales: 1 },
    });

    const mockDespachoResultado = {
      mision: {
        id: 'mis-atencion-01',
        codigo: 'MIS-2026-0020',
        tipoMision: 'ATENCION_CUADRILLA',
        estado: 'DESPACHADA',
        fechaInicio: null,
      },
      cuadrilla: {
        id: 'cuad-01',
        nombre: 'Cuadrilla Vías y Canales 1',
        estado: 'EN_MISION',
      },
      incidente: {
        id: 'inc-02',
        codigo: 'INC-2026-0002',
        estado: 'EN_ATENCION',
        prioridad: 'ALTA',
      },
      patrullaLiberada: {
        id: 'pat-01',
        nombre: 'Patrulla Rápida Costa 1',
        estado: 'DISPONIBLE',
        misionPreviaId: 'mis-verif-01',
      },
    };

    vi.spyOn(misionesService, 'despacharCuadrilla').mockResolvedValueOnce({
      exito: true,
      datos: mockDespachoResultado,
      mensaje: 'Cuadrilla despachada y patrulla liberada.',
    });

    const mockOnSuccess = vi.fn();
    const mockOnClose = vi.fn();

    render(
      <ModalAsignarCuadrilla
        isOpen={true}
        onClose={mockOnClose}
        incidente={mockIncidenteVerificacionConcluida}
        onSuccess={mockOnSuccess}
      />
    );

    // Debe mostrar la tarjeta de antecedente técnico cerrado
    expect(screen.getByText(/Diagnóstico Técnico en Terreno Completado/i)).toBeDefined();
    expect(screen.getByText(/Evaluación técnica en terreno finalizada por la patrulla/i)).toBeDefined();

    // Esperar a que se listen las cuadrillas disponibles en el selector
    await waitFor(() => {
      expect(screen.getByText(/Cuadrilla Vías y Canales 1/i)).toBeDefined();
      expect(screen.getByText(/Cuadrilla Emergencias Viales 2/i)).toBeDefined();
    });

    // Seleccionar cuadrilla
    const selectCuadrilla = screen.getByRole('combobox', { name: /Cuadrilla Operativa/i });
    fireEvent.change(selectCuadrilla, { target: { value: 'cuad-01' } });

    // Confirmar formulario
    const submitBtn = screen.getByRole('button', { name: /Confirmar y Despachar/i });
    expect(submitBtn.hasAttribute('disabled')).toBe(false);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(misionesService.despacharCuadrilla).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoMision: 'ATENCION_CUADRILLA',
          incidenteId: 'inc-02',
          cuadrillaId: 'cuad-01',
          prioridad: 'ALTA',
        }),
        undefined
      );
      expect(mockOnSuccess).toHaveBeenCalledWith(mockDespachoResultado);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('despliega error si el backend responde con conflicto 409 VERIFICACION_EN_CURSO', async () => {
    vi.spyOn(cuadrillasService, 'obtenerCuadrillas').mockResolvedValueOnce({
      cuadrillas: mockCuadrillasDisponibles,
      meta: { total: 2, pagina: 1, limite: 10, paginasTotales: 1 },
    });

    vi.spyOn(misionesService, 'despacharCuadrilla').mockResolvedValueOnce({
      exito: false,
      codigoError: 409,
      codigo: 'VERIFICACION_EN_CURSO',
      mensaje: 'Conflicto: la patrulla aún está evaluando el sitio.',
    });

    render(
      <ModalAsignarCuadrilla
        isOpen={true}
        onClose={vi.fn()}
        incidente={mockIncidenteConPatrullaEnCurso}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Cuadrilla Vías y Canales 1/i)).toBeDefined();
    });

    const selectCuadrilla = screen.getByRole('combobox', { name: /Cuadrilla Operativa/i });
    fireEvent.change(selectCuadrilla, { target: { value: 'cuad-01' } });

    const submitBtn = screen.getByRole('button', { name: /Confirmar y Despachar/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Conflicto: la patrulla aún está evaluando el sitio/i)).toBeDefined();
    });
  });

  it('muestra el aviso de advertencia cuando no hay cuadrillas operativas disponibles', async () => {
    vi.spyOn(cuadrillasService, 'obtenerCuadrillas').mockResolvedValueOnce({
      cuadrillas: [],
      meta: { total: 0, pagina: 1, limite: 10, paginasTotales: 0 },
    });

    render(
      <ModalAsignarCuadrilla
        isOpen={true}
        onClose={vi.fn()}
        incidente={mockIncidenteVerificacionConcluida}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No hay cuadrillas operativas disponibles en este momento.')).toBeDefined();
    });

    // No debe haber texto de ayuda debajo
    expect(screen.queryByText(/Únicamente se listan dotaciones/i)).toBeNull();
  });
});
