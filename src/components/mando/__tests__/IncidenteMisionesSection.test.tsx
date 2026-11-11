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

    expect(screen.getByText('MIS-2026-0001: Despeje de cables')).toBeDefined();
    expect(screen.getByText('EN_CURSO')).toBeDefined();

    const btnVerDetalles = screen.getByRole('button', {
      name: /Ver detalles de la misión MIS-2026-0001/i,
    });
    expect(btnVerDetalles).toBeDefined();

    fireEvent.click(btnVerDetalles);
    expect(handleVerDetalles).toHaveBeenCalledWith(
      'm1000000-0000-4000-8000-000000000001'
    );
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
  });
});
