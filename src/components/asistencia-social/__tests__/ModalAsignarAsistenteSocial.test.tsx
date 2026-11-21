import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ModalAsignarAsistenteSocial from '../ModalAsignarAsistenteSocial';
import * as asistentesSocialesService from '@/services/asistentesSocialesService';
import * as asistenciaSocialService from '@/services/asistenciaSocialService';
import type { EventoAsistenciaSocialItem } from '@/types/asistenciaSocial';
import type { AsistenteSocialItem } from '@/types/asistenteSocialPersonal';

describe('ModalAsignarAsistenteSocial', () => {
  const mockEvento: EventoAsistenciaSocialItem = {
    id: '70000000-0000-4000-8000-000000000001',
    codigo: 'AS-2026-0001',
    descripcion: 'Vivienda anegada en sector Collico',
    tipoAfectacion: 'VIVIENDA_ANEGADA',
    personasAfectadas: 4,
    familiasAfectadas: 1,
    direccionTexto: 'Calle Los Alerces 1420',
    latitud: -39.8234,
    longitud: -73.2189,
    prioridad: 'ALTA',
    estado: 'PENDIENTE',
    contactoNombre: 'María González',
    contactoTelefono: '+56912345678',
    contactoRut: null,
    delegacionId: '30000000-0000-4000-8000-000000000001',
    delegacionNombre: 'Delegación Municipal Costa',
    incidenteId: null,
    asistenteSocialId: null,
    asistenteSocialNombre: null,
    creadoPor: { id: 'user-1', nombre: 'Encargado' },
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
  };

  const mockDisponibles: AsistenteSocialItem[] = [
    {
      usuarioId: '50000000-0000-4000-8000-000000000001',
      rut: '16.789.012-3',
      nombres: 'Camila Andrea',
      apellidos: 'Valenzuela Castro',
      nombreCompleto: 'Camila Valenzuela Castro',
      email: 'cvalenzuela@valdivia.cl',
      telefono: '+56987654321',
      delegacionId: '30000000-0000-4000-8000-000000000001',
      delegacionCodigo: 'COSTA',
      delegacionNombre: 'Delegación Municipal Costa',
      personalId: '60000000-0000-4000-8000-000000000001',
      estadoOperativo: 'disponible',
      casosFibeAsignados: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista asistentes sociales disponibles y confirma la asignación exitosamente', async () => {
    vi.spyOn(asistentesSocialesService, 'obtenerAsistentesSociales').mockResolvedValue({
      data: mockDisponibles,
      meta: { total: 1, pagina: 1, limite: 50, totalPaginas: 1 },
    });

    const actualizado: EventoAsistenciaSocialItem = {
      ...mockEvento,
      estado: 'ASIGNADO',
      asistenteSocialId: mockDisponibles[0].usuarioId,
      asistenteSocialNombre: mockDisponibles[0].nombreCompleto,
    };

    const spyAsignar = vi
      .spyOn(asistenciaSocialService, 'asignarAsistenteSocial')
      .mockResolvedValueOnce(actualizado);

    const onAsignado = vi.fn();
    const onClose = vi.fn();

    render(
      <ModalAsignarAsistenteSocial
        isOpen={true}
        onClose={onClose}
        evento={mockEvento}
        usuarioId="user-encargado"
        onAsignado={onAsignado}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Camila Valenzuela Castro')).toBeDefined();
    });

    fireEvent.click(screen.getByRole('radio'));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Asignación/i }));

    await waitFor(() => {
      expect(spyAsignar).toHaveBeenCalledWith(
        mockEvento.id,
        mockDisponibles[0].usuarioId,
        'user-encargado'
      );
      expect(onAsignado).toHaveBeenCalledWith(actualizado);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('muestra alerta y recarga disponibles cuando ocurre un error 409 Conflict', async () => {
    const spyObtener = vi
      .spyOn(asistentesSocialesService, 'obtenerAsistentesSociales')
      .mockResolvedValue({
        data: mockDisponibles,
        meta: { total: 1, pagina: 1, limite: 50, totalPaginas: 1 },
      });

    vi.spyOn(asistenciaSocialService, 'asignarAsistenteSocial').mockRejectedValueOnce(
      new asistenciaSocialService.AsistenciaSocialServiceError(
        'El asistente social seleccionado ya no se encuentra disponible.',
        { statusCode: 409 }
      )
    );

    render(
      <ModalAsignarAsistenteSocial
        isOpen={true}
        onClose={vi.fn()}
        evento={mockEvento}
        onAsignado={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Camila Valenzuela Castro')).toBeDefined();
    });

    const llamadasIniciales = spyObtener.mock.calls.length;

    fireEvent.click(screen.getByRole('radio'));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Asignación/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('ya no se encuentra disponible');
      expect(spyObtener.mock.calls.length).toBeGreaterThan(llamadasIniciales);
    });
  });
});
