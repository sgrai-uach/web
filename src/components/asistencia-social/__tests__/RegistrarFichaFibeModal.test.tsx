import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegistrarFichaFibeModal from '../RegistrarFichaFibeModal';
import * as asistenciaSocialService from '@/services/asistenciaSocialService';
import type { EventoAsistenciaSocialItem } from '@/types/asistenciaSocial';

describe('RegistrarFichaFibeModal (HU-71)', () => {
  const mockEventoAsignado: EventoAsistenciaSocialItem = {
    id: '70000000-0000-4000-8000-000000000010',
    codigo: 'AS-2026-0010',
    descripcion: 'Vivienda con filtración severa en techumbre.',
    tipoAfectacion: 'DANO_ESTRUCTURAL',
    personasAfectadas: 4,
    familiasAfectadas: 1,
    direccionTexto: 'Avenida Picarte 2100',
    latitud: -39.8234,
    longitud: -73.2189,
    prioridad: 'ALTA',
    estado: 'ASIGNADO',
    contactoNombre: 'María González',
    contactoTelefono: '+56912345678',
    contactoRut: null,
    delegacionId: null,
    delegacionNombre: 'Delegación Municipal Sur',
    incidenteId: null,
    asistenteSocialId: 'asoc-1',
    asistenteSocialNombre: 'Camila Valenzuela',
    detallesEvaluacion: {
      nivelCompromisoVivienda: 'MODERADO',
    },
    creadoPor: { id: 'user-1', nombre: 'Encargado' },
    creadoEn: '2026-10-05T12:00:00.000Z',
    actualizadoEn: '2026-10-05T12:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('precarga integrantes y nivel de daño preliminar y guarda Ficha FIBE exitosamente', async () => {
    const actualizado: EventoAsistenciaSocialItem = {
      ...mockEventoAsignado,
      estado: 'EN_EVALUACION_FIBE',
      folioFibe: 'FIBE-2026-0001',
      nivelDanoVivienda: 'GRAVE_INHABITABLE',
      observacionesFibe: 'Familia derivada a evaluación habitacional DGRD.',
    };

    const spyRegistrar = vi
      .spyOn(asistenciaSocialService, 'registrarFichaFibe')
      .mockResolvedValueOnce(actualizado);

    const onRegistrada = vi.fn();
    const onClose = vi.fn();

    render(
      <RegistrarFichaFibeModal
        isOpen={true}
        onClose={onClose}
        evento={mockEventoAsignado}
        usuarioId="asoc-1"
        onRegistrada={onRegistrada}
      />
    );

    const inputFolio = screen.getByLabelText(/Folio oficial de Ficha FIBE/i) as HTMLInputElement;
    const inputPersonas = screen.getByLabelText(/Integrantes familiares evaluados/i) as HTMLInputElement;
    const selectNivel = screen.getByLabelText(/Nivel de daño en vivienda/i) as HTMLSelectElement;
    const textareaObs = screen.getByLabelText(/Observaciones sociales de la emergencia/i) as HTMLTextAreaElement;

    expect(inputPersonas.value).toBe('4');
    expect(selectNivel.value).toBe('MODERADO');

    fireEvent.change(inputFolio, { target: { value: 'fibe-2026-0001' } });
    expect(inputFolio.value).toBe('FIBE-2026-0001');

    fireEvent.change(selectNivel, { target: { value: 'GRAVE_INHABITABLE' } });
    fireEvent.change(textareaObs, {
      target: { value: 'Familia derivada a evaluación habitacional DGRD.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Guardar Ficha FIBE/i }));

    await waitFor(() => {
      expect(spyRegistrar).toHaveBeenCalledWith(
        mockEventoAsignado.id,
        {
          folioFibe: 'FIBE-2026-0001',
          personasAfectadas: 4,
          nivelDanoVivienda: 'GRAVE_INHABITABLE',
          observacionesSociales: 'Familia derivada a evaluación habitacional DGRD.',
        },
        'asoc-1'
      );
      expect(onRegistrada).toHaveBeenCalledWith(actualizado);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('valida folio obligatorio y formato alfanumérico sin espacios', async () => {
    const spyRegistrar = vi.spyOn(asistenciaSocialService, 'registrarFichaFibe');

    render(
      <RegistrarFichaFibeModal
        isOpen={true}
        onClose={vi.fn()}
        evento={mockEventoAsignado}
        onRegistrada={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Guardar Ficha FIBE/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/El folio oficial de la Ficha FIBE es obligatorio/i)
      ).toBeDefined();
    });

    const inputFolio = screen.getByLabelText(/Folio oficial de Ficha FIBE/i);
    fireEvent.change(inputFolio, { target: { value: 'FIBE 2026/01' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Ficha FIBE/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/solo puede contener letras, números y guiones/i)
      ).toBeDefined();
    });

    expect(spyRegistrar).not.toHaveBeenCalled();
  });

  it('muestra error junto al campo folioFibe cuando la API retorna 409 Conflict por folio duplicado', async () => {
    vi.spyOn(asistenciaSocialService, 'registrarFichaFibe').mockRejectedValueOnce(
      new asistenciaSocialService.AsistenciaSocialServiceError(
        'El folio FIBE-2026-0001 ya está registrado en otro expediente activo.',
        {
          statusCode: 409,
          fieldErrors: {
            folioFibe: 'El folio FIBE-2026-0001 ya está registrado en otro expediente activo.',
          },
        }
      )
    );

    render(
      <RegistrarFichaFibeModal
        isOpen={true}
        onClose={vi.fn()}
        evento={mockEventoAsignado}
        onRegistrada={vi.fn()}
      />
    );

    const inputFolio = screen.getByLabelText(/Folio oficial de Ficha FIBE/i);
    fireEvent.change(inputFolio, { target: { value: 'FIBE-2026-0001' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Ficha FIBE/i }));

    await waitFor(() => {
      const alertas = screen.getAllByText(
        /El folio FIBE-2026-0001 ya está registrado en otro expediente activo\./i
      );
      expect(alertas.length).toBeGreaterThanOrEqual(1);
      expect(inputFolio.getAttribute('aria-invalid')).toBe('true');
    });
  });
});
