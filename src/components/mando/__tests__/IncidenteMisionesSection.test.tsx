import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IncidenteMisionesSection } from '../drawer/IncidenteMisionesSection';
import type { IncidenteDetalle } from '@/services/incidentesService';

describe('Componente IncidenteMisionesSection', () => {
  const mockMisiones: IncidenteDetalle['misiones'] = [
    {
      id: 'm1000000-0000-4000-8000-000000000001',
      codigo: 'MIS-2026-0001',
      titulo: 'Despeje de cables',
      descripcion: 'Poda urgente',
      tipoMision: 'ATENCION_CUADRILLA',
      estado: 'EN_CURSO',
      prioridad: 'ALTA',
      justificacionRechazo: null,
      cuadrilla: {
        id: 'c1',
        nombre: 'Cuadrilla Alfa 1',
        estado: 'EN_MISION',
      },
      patrulla: null,
      fechaInicio: '2026-10-02T14:00:00Z',
      fechaCierre: null,
      creadoEn: '2026-10-02T13:30:00Z',
    },
  ];

  it('debe mostrar mensaje amigable cuando no hay misiones despachadas', () => {
    render(<IncidenteMisionesSection misiones={[]} />);
    expect(
      screen.getByText('No se han despachado misiones operativas para este caso.')
    ).toBeDefined();
  });

  it('debe renderizar la tarjeta de la misión y el botón "Ver Detalles"', () => {
    const handleVerDetalles = vi.fn();

    render(
      <IncidenteMisionesSection
        misiones={mockMisiones}
        onVerDetalleMision={handleVerDetalles}
      />
    );

    expect(screen.getByText('MIS-2026-0001')).toBeDefined();
    expect(screen.getByText('Despeje de cables')).toBeDefined();
    expect(screen.getByText('En curso')).toBeDefined();
    expect(screen.getByText(/Atención de cuadrilla/i)).toBeDefined();
    expect(screen.getByText(/\(En misión\)/i)).toBeDefined();

    const btnVerDetalles = screen.getByRole('button', {
      name: /Ver detalles de la misión MIS-2026-0001/i,
    });
    expect(btnVerDetalles).toBeDefined();

    fireEvent.click(btnVerDetalles);
    expect(handleVerDetalles).toHaveBeenCalledWith(
      'm1000000-0000-4000-8000-000000000001'
    );
  });

  it('debe renderizar el botón "Ver Cuadrilla" y llamar a onVerDetalleCuadrilla al hacer clic', () => {
    const handleVerCuadrilla = vi.fn();

    render(
      <IncidenteMisionesSection
        misiones={mockMisiones}
        onVerDetalleCuadrilla={handleVerCuadrilla}
      />
    );

    const btnVerCuadrilla = screen.getByRole('button', {
      name: /Ver ficha de la cuadrilla Cuadrilla Alfa 1/i,
    });
    expect(btnVerCuadrilla).toBeDefined();

    fireEvent.click(btnVerCuadrilla);
    expect(handleVerCuadrilla).toHaveBeenCalledWith('c1');
  });

  it('debe mostrar el botón de despachar patrulla verificadora cuando el incidente está en REPORTADO aunque tenga misiones previas no activas (BUG-02)', () => {
    const handleAsignarPatrulla = vi.fn();

    render(
      <IncidenteMisionesSection
        misiones={mockMisiones}
        incidenteEstado="REPORTADO"
        onAsignarPatrulla={handleAsignarPatrulla}
      />
    );

    const btnDespachar = screen.getByRole('button', {
      name: /Despachar Patrulla Verificadora/i,
    });
    expect(btnDespachar).toBeDefined();

    fireEvent.click(btnDespachar);
    expect(handleAsignarPatrulla).toHaveBeenCalled();
  });

  it('no debe mostrar el botón de despacho si puedeAsignar es false (BUG-03)', () => {
    const handleAsignarPatrulla = vi.fn();

    render(
      <IncidenteMisionesSection
        misiones={[]}
        incidenteEstado="REPORTADO"
        onAsignarPatrulla={handleAsignarPatrulla}
        puedeAsignar={false}
      />
    );

    expect(
      screen.queryByRole('button', { name: /Despachar Patrulla Verificadora/i })
    ).toBeNull();
  });

  it('debe renderizar chip semántico de rechazo y bloque de justificación cuando la misión fue rechazada', () => {
    const misionRechazada: IncidenteDetalle['misiones'][number] = {
      id: 'm-rechazada-1',
      codigo: 'MIS-2026-9001',
      titulo: 'Evaluación de desborde',
      descripcion: 'Evaluar altura de agua',
      tipoMision: 'VERIFICACION',
      estado: 'RECHAZADA',
      prioridad: 'CRITICA',
      justificacionRechazo: 'Vía cortada por derrumbe previo, imposible acceder con vehículo 4x4.',
      cuadrilla: null,
      patrulla: {
        id: 'pat-1',
        nombre: 'Patrulla Isla Teja',
        estado: 'DISPONIBLE',
      },
      fechaInicio: null,
      fechaCierre: null,
      creadoEn: '2026-11-10T08:00:00Z',
    };

    render(<IncidenteMisionesSection misiones={[misionRechazada]} />);

    expect(screen.getByText('Rechazada')).toBeDefined();
    expect(screen.getByText(/Verificación en terreno/i)).toBeDefined();
    expect(screen.getByText(/Patrulla Isla Teja/i)).toBeDefined();
    expect(screen.getByText(/\(Disponible\)/i)).toBeDefined();
    expect(screen.getByText(/Motivo de Rechazo en Terreno:/i)).toBeDefined();
    expect(
      screen.getByText('Vía cortada por derrumbe previo, imposible acceder con vehículo 4x4.')
    ).toBeDefined();
  });

  it('debe priorizar las misiones en proceso al inicio y agrupar las rechazadas en un menú desplegable colapsado', () => {
    const misionEnCurso: IncidenteDetalle['misiones'][number] = {
      id: 'm-activa-1',
      codigo: 'MIS-2026-1002',
      titulo: 'Atención con cuadrilla en terreno',
      descripcion: 'Despeje de ramas',
      tipoMision: 'ATENCION_CUADRILLA',
      estado: 'EN_CURSO',
      prioridad: 'ALTA',
      justificacionRechazo: null,
      cuadrilla: {
        id: 'c-1',
        nombre: 'Cuadrilla Las Ánimas',
        estado: 'EN_MISION',
      },
      patrulla: null,
      fechaInicio: '2026-11-10T09:00:00Z',
      fechaCierre: null,
      creadoEn: '2026-11-10T08:30:00Z',
    };

    const misionRechazada1: IncidenteDetalle['misiones'][number] = {
      id: 'm-rech-1',
      codigo: 'MIS-2026-9001',
      titulo: 'Verificación inicial',
      descripcion: 'Evaluación rápida',
      tipoMision: 'VERIFICACION',
      estado: 'RECHAZADA',
      prioridad: 'MEDIA',
      justificacionRechazo: 'Terreno inaccesible por inundación de calzada.',
      cuadrilla: null,
      patrulla: {
        id: 'p-1',
        nombre: 'Patrulla Centro',
        estado: 'DISPONIBLE',
      },
      fechaInicio: null,
      fechaCierre: null,
      creadoEn: '2026-11-10T07:00:00Z',
    };

    const misionRechazada2: IncidenteDetalle['misiones'][number] = {
      id: 'm-rech-2',
      codigo: 'MIS-2026-9002',
      titulo: 'Segunda verificación',
      descripcion: 'Intento con patrulla alternativa',
      tipoMision: 'VERIFICACION',
      estado: 'RECHAZADA',
      prioridad: 'MEDIA',
      justificacionRechazo: 'Falla mecánica en vehículo de patrulla.',
      cuadrilla: null,
      patrulla: {
        id: 'p-2',
        nombre: 'Patrulla Norte',
        estado: 'DISPONIBLE',
      },
      fechaInicio: null,
      fechaCierre: null,
      creadoEn: '2026-11-10T07:30:00Z',
    };

    // Pasamos las 3 misiones (rechazadas primero en el array para comprobar que el componente las reordena)
    render(
      <IncidenteMisionesSection
        misiones={[misionRechazada1, misionRechazada2, misionEnCurso]}
      />
    );

    // 1. La misión en proceso debe aparecer visible inmediatamente
    expect(screen.getByText('MIS-2026-1002')).toBeDefined();
    expect(screen.getByText('Atención con cuadrilla en terreno')).toBeDefined();
    expect(screen.getByText('Cuadrilla Las Ánimas')).toBeDefined();

    // 2. Debe existir el menú desplegable de rechazos indicando la cantidad de rechazos (2)
    const triggerRechazos = screen.getByLabelText(/Desplegar misiones rechazadas \(2\)/i);
    expect(triggerRechazos).toBeDefined();
    expect(triggerRechazos.getAttribute('aria-expanded')).toBe('false');

    // 3. Al estar colapsado, los motivos individuales de rechazo NO deben estar visibles en pantalla
    expect(screen.queryByText('Terreno inaccesible por inundación de calzada.')).toBeNull();
    expect(screen.queryByText('Falla mecánica en vehículo de patrulla.')).toBeNull();

    // 4. Al hacer clic en el menú desplegable, se abren las tarjetas de rechazo
    fireEvent.click(triggerRechazos);
    expect(triggerRechazos.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Terreno inaccesible por inundación de calzada.')).toBeDefined();
    expect(screen.getByText('Falla mecánica en vehículo de patrulla.')).toBeDefined();
    expect(screen.getByText('MIS-2026-9001')).toBeDefined();
    expect(screen.getByText('MIS-2026-9002')).toBeDefined();

    // 5. Al volver a hacer clic, se colapsan nuevamente
    fireEvent.click(triggerRechazos);
    expect(triggerRechazos.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('Terreno inaccesible por inundación de calzada.')).toBeNull();
  });

  it('debe mostrar el acceso directo al último reporte realizado de las misiones activas y permitir acceder a todos los reportes de la misión (HU-38)', () => {
    const handleVerReportesMision = vi.fn();
    const misionVerificacionActiva: IncidenteDetalle['misiones'][number] = {
      id: 'm-verif-1',
      codigo: 'MIS-2026-0050',
      titulo: 'Verificación de inundación',
      descripcion: 'Evaluar viviendas afectadas',
      tipoMision: 'VERIFICACION',
      estado: 'EN_CURSO',
      prioridad: 'CRITICA',
      justificacionRechazo: null,
      cuadrilla: null,
      patrulla: {
        id: 'pat-1',
        nombre: 'Patrulla Calle Calle',
        estado: 'EN_VERIFICACION',
      },
      fechaInicio: '2026-11-11T10:00:00Z',
      fechaCierre: null,
      creadoEn: '2026-11-11T09:45:00Z',
    };

    const mockReportesTerreno: NonNullable<IncidenteDetalle['reportesEvaluacionTerreno']> = [
      {
        id: 'rep-v2',
        misionId: 'm-verif-1',
        versionReporte: 2,
        esRectificacion: true,
        etiquetaReporte: 'Reporte de Evaluación #2 (Rectificación)',
        prioridadSugerida: 'ALTA',
        prioridadAsignada: 'CRITICA',
        justificacionPrioridad: 'Sube nivel del agua e ingresa a vivienda de adulto mayor con discapacidad.',
        resumenTecnico: 'Rectificación: 5 personas afectadas, se solicita cuadrilla pesada.',
        accionesRealizadas: 'Corte preventivo de energía.',
        danosEstimados: 'Primer piso anegado.',
        observaciones: 'Requiere motobomba.',
        personasAfectadas: 5,
        requiereApoyoAdicional: true,
        evaluacion: {
          nucleoFamiliarTotal: 5,
          cantidadNinos: 2,
          cantidadAdultosMayores: 1,
          personasDiscapacitadas: 1,
          mascotasAfectadas: 2,
          nivelCompromisoVivienda: 'GRAVE_INHABITABLE',
        },
        evaluador: {
          id: 'u-pat-1',
          nombre: 'Inspector Terreno',
          email: 'inspector@valdivia.cl',
        },
        creadoEn: '2026-11-11T10:30:00Z',
      },
      {
        id: 'rep-v1',
        misionId: 'm-verif-1',
        versionReporte: 1,
        esRectificacion: false,
        etiquetaReporte: 'Reporte de Evaluación #1 (Inicial)',
        prioridadSugerida: 'MEDIA',
        prioridadAsignada: 'ALTA',
        justificacionPrioridad: 'Riesgo de ingreso a vivienda.',
        resumenTecnico: 'Evaluación inicial en terreno.',
        accionesRealizadas: null,
        danosEstimados: null,
        observaciones: null,
        personasAfectadas: 3,
        requiereApoyoAdicional: false,
        evaluacion: {
          nucleoFamiliarTotal: 3,
        },
        evaluador: {
          id: 'u-pat-1',
          nombre: 'Inspector Terreno',
          email: 'inspector@valdivia.cl',
        },
        creadoEn: '2026-11-11T10:10:00Z',
      },
    ];

    render(
      <IncidenteMisionesSection
        misiones={[misionVerificacionActiva]}
        reportesEvaluacionTerreno={mockReportesTerreno}
        onVerReportesMision={handleVerReportesMision}
      />
    );

    const bloqueUltimoReporte = screen.getByTestId('ultimo-reporte-mision-m-verif-1');
    expect(bloqueUltimoReporte).toBeDefined();
    expect(bloqueUltimoReporte.textContent).toContain('Reporte #2 — Rectificación Vigente');
    expect(bloqueUltimoReporte.textContent).toContain('Prioridad sugerida: Alta');
    expect(bloqueUltimoReporte.textContent).toContain('Prioridad confirmada: Crítica');
    expect(bloqueUltimoReporte.textContent).toContain(
      'Sube nivel del agua e ingresa a vivienda de adulto mayor con discapacidad.'
    );
    expect(bloqueUltimoReporte.textContent).toContain('Núcleo familiar: 5 pers.');
    expect(bloqueUltimoReporte.textContent).toContain('Niños: 2');
    expect(bloqueUltimoReporte.textContent).toContain('Discapacidad: 1');
    expect(bloqueUltimoReporte.textContent).toContain('Mascotas: 2');
    expect(bloqueUltimoReporte.textContent).toContain('Grave / Inhabitable');

    // Clic en acceso directo "Ver Último Reporte"
    const btnUltimo = screen.getByRole('button', {
      name: /Ver último reporte de la misión MIS-2026-0050/i,
    });
    fireEvent.click(btnUltimo);
    expect(handleVerReportesMision).toHaveBeenCalledWith('m-verif-1', 'rep-v2');

    // Clic en "Ver Todos los Reportes (2)"
    const btnTodos = screen.getByRole('button', {
      name: /Ver todos los reportes de la misión MIS-2026-0050/i,
    });
    expect(btnTodos.textContent).toContain('Ver Todos los Reportes (2)');
    fireEvent.click(btnTodos);
    expect(handleVerReportesMision).toHaveBeenCalledWith('m-verif-1');
  });

  describe('HU-35: Trazabilidad y monitoreo de notificaciones de patrulla', () => {
    const estadosTrazabilidad = [
      {
        estado: 'PENDIENTE_ENVIO' as const,
        textoEsperado: 'Patrulla sin señal / offline',
        bg: 'rgb(236, 239, 243)', // #ECEFF3
        color: 'rgb(59, 63, 69)', // #3B3F45
      },
      {
        estado: 'ENVIADA' as const,
        textoEsperado: 'Alerta emitida al móvil',
        bg: 'rgb(255, 243, 224)', // #FFF3E0
        color: 'rgb(230, 81, 0)', // #E65100
      },
      {
        estado: 'RECIBIDA' as const,
        textoEsperado: 'Recibida en móvil de terreno',
        bg: 'rgb(232, 245, 233)', // #E8F5E9
        color: 'rgb(46, 125, 50)', // #2E7D32
      },
      {
        estado: 'LEIDA' as const,
        textoEsperado: 'Leída por operador en terreno',
        bg: 'rgb(224, 242, 241)', // #E0F2F1
        color: 'rgb(20, 80, 90)', // #14505A
      },
    ];

    estadosTrazabilidad.forEach(({ estado, textoEsperado, bg, color }) => {
      it(`debe renderizar el badge de trazabilidad con texto y estilo correcto para estado ${estado}`, () => {
        const misionesConTrazabilidad: IncidenteDetalle['misiones'] = [
          {
            ...mockMisiones[0],
            id: `mision-${estado.toLowerCase()}`,
            trazabilidadNotificacion: estado,
          },
        ];

        render(<IncidenteMisionesSection misiones={misionesConTrazabilidad} />);

        const badge = screen.getByTestId(`badge-trazabilidad-mision-${estado.toLowerCase()}`);
        expect(badge).toBeDefined();
        expect(badge.textContent).toBe(textoEsperado);

        // Estilos: esquinas rectas obligatorias (borderRadius: 0), borde y colores
        expect(badge.style.borderRadius).toBe('0px');
        expect(badge.style.backgroundColor).toBe(bg);
        expect(badge.style.color).toBe(color);
        expect(badge.style.border).toContain('1px solid');
      });
    });

    it('no debe renderizar el badge de trazabilidad si la misión no tiene trazabilidadNotificacion', () => {
      render(<IncidenteMisionesSection misiones={mockMisiones} />);

      expect(
        screen.queryByTestId(`badge-trazabilidad-${mockMisiones[0].id}`)
      ).toBeNull();
    });

    it('debe mostrar aviso SIN CONFIRMACIÓN DE LECTURA en misiones activas con patrulla sin acuse aún', () => {
      const misionesPatrullaSinAcuse: IncidenteDetalle['misiones'] = [
        {
          ...mockMisiones[0],
          id: 'mision-patrulla-sin-acuse',
          tipoMision: 'VERIFICACION',
          estado: 'DESPACHADA',
          cuadrilla: null,
          patrulla: {
            id: 'pat-1',
            nombre: 'Patrulla Las Ánimas',
            estado: 'EN_VERIFICACION',
          },
        },
      ];

      render(<IncidenteMisionesSection misiones={misionesPatrullaSinAcuse} />);

      expect(
        screen.queryByTestId('badge-trazabilidad-mision-patrulla-sin-acuse')
      ).toBeNull();
      const aviso = screen.getByTestId('aviso-trazabilidad-sin-acuse-mision-patrulla-sin-acuse');
      expect(aviso.textContent).toContain('SIN CONFIRMACIÓN DE LECTURA');
    });

    it('debe certificar la ausencia total de caracteres emojis en el contenedor renderizado', () => {
      const misionesConTrazabilidad: IncidenteDetalle['misiones'] = estadosTrazabilidad.map(
        ({ estado }, idx) => ({
          ...mockMisiones[0],
          id: `mision-emoji-check-${idx}`,
          trazabilidadNotificacion: estado,
        })
      );

      const { container } = render(
        <IncidenteMisionesSection misiones={misionesConTrazabilidad} />
      );

      // Verificación estricta de ausencia de emojis (Unicode Pictographic)
      const emojiRegex = /\p{Extended_Pictographic}/u;
      expect(container.textContent).not.toMatch(emojiRegex);
      expect(container.innerHTML).not.toMatch(emojiRegex);
    });

    it('debe renderizar la línea de tiempo horizontal conectada con estados progresivos y nodos cuadrados (borderRadius: 0)', () => {
      const casosTimeline = [
        { estado: 'PENDIENTE_ENVIO' as const, esperados: ['actual', 'pendiente', 'pendiente'] },
        { estado: 'ENVIADA' as const, esperados: ['completado', 'actual', 'pendiente'] },
        { estado: 'RECIBIDA' as const, esperados: ['completado', 'completado', 'actual'] },
        { estado: 'LEIDA' as const, esperados: ['completado', 'completado', 'completado'] },
      ];

      casosTimeline.forEach(({ estado, esperados }) => {
        const misionId = `mision-tl-${estado.toLowerCase()}`;
        const { container } = render(
          <IncidenteMisionesSection
            misiones={[
              {
                ...mockMisiones[0],
                id: misionId,
                trazabilidadNotificacion: estado,
              },
            ]}
          />
        );

        const timeline = screen.getByTestId(`timeline-trazabilidad-${misionId}`);
        expect(timeline.getAttribute('role')).toBe('list');

        [1, 2, 3].forEach((num, idx) => {
          const step = screen.getByTestId(`timeline-step-${misionId}-${num}`);
          expect(step.getAttribute('data-estado')).toBe(esperados[idx]);
          const node = step.querySelector('span[style*="border-radius"]');
          expect(node).not.toBeNull();
          expect((node as HTMLElement).style.borderRadius).toBe('0px');
        });

        expect(container.textContent).not.toMatch(/\p{Extended_Pictographic}/u);
      });
    });
  });

  describe('HU-41: Rechazo de misión por cuadrilla operativa', () => {
    it('debe mostrar aviso de reasignación y justificación de rechazo cuando una cuadrilla rechazó la misión', () => {
      render(
        <IncidenteMisionesSection
          incidenteEstado="VERIFICANDO"
          misiones={[
            {
              ...mockMisiones[0],
              estado: 'RECHAZADA',
              justificacionRechazo:
                'Camión tolva presenta falla hidráulica en ruta de salida desde base.',
              cuadrilla: {
                id: 'c1',
                nombre: 'Cuadrilla Vías y Canales 1',
                estado: 'DISPONIBLE',
              },
            },
          ]}
        />
      );

      expect(screen.getByTestId('aviso-rechazo-cuadrilla-reasignacion')).toBeDefined();
      expect(screen.getByText(/Motivo de Rechazo en Terreno:/i)).toBeDefined();
      expect(
        screen.getByText(
          'Camión tolva presenta falla hidráulica en ruta de salida desde base.'
        )
      ).toBeDefined();
    });
  });
});
