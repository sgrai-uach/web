import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IncidenteCard } from '../IncidenteCard';
import { ModalDerivarAsistenciaSocial } from '../ModalDerivarAsistenciaSocial';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import * as useAsistentesModule from '@/hooks/useAsistentesSociales';
import * as asistenciaSocialService from '@/services/asistenciaSocialService';
import type { IncidenteResumen } from '@/services/incidentesService';

vi.mock('@/hooks/useAsistentesSociales');

function HarnessDerivacionPostIncidente({ inicial }: { inicial: IncidenteResumen }) {
  const [incidente, setIncidente] = useState<IncidenteResumen>(inicial);
  const [modalAbierto, setModalAbierto] = useState(false);
  const { showSuccess } = useToast();

  return (
    <div>
      <IncidenteCard
        incidente={incidente}
        onClick={vi.fn()}
        onDerivarAsistenciaSocial={() => setModalAbierto(true)}
        puedeDerivarAsistenciaSocial
      />
      <ModalDerivarAsistenciaSocial
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        incidente={incidente}
        usuarioId="enc-1"
        onDerivado={(res) => {
          setIncidente((prev) => ({
            ...prev,
            asistenciaSocial: {
              id: res.evento.id,
              codigo: res.evento.codigo,
              estado: res.evento.estado,
              asistenteSocialId: res.evento.asistenteSocialId ?? null,
              asistenteSocialNombre: res.evento.asistenteSocialNombre ?? null,
            },
          }));
          showSuccess(
            `Incidente derivado a Asistencia Social (DGRD) (${res.evento.codigo}).`,
            'Derivación a Asistencia Social',
            { icon: 'asistencia_social', dedupKey: `asoc-creada:${res.evento.id}` }
          );
        }}
      />
    </div>
  );
}

describe('Flujo E2E Frontend: Derivación a Asistencia Social post-incidente RESUELTO (HU-25)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAsistentesModule.useAsistentesSociales).mockReturnValue({
      asistentes: [
        {
          usuarioId: 'asoc-1',
          rut: '16.543.210-1',
          nombreCompleto: 'Camila Soto Méndez',
          delegacionId: 'del-1',
          delegacionNombre: 'Centro',
          estadoOperativo: 'disponible',
          casosFibeAsignados: 1,
        },
      ],
      meta: { total: 1, pagina: 1, limite: 50, totalPaginas: 1 },
      cargando: false,
      error: null,
      statusCode: null,
      recargar: vi.fn().mockResolvedValue(undefined),
    });
  });

  it('completa el flujo desde tarjeta RESUELTO -> Modal -> POST -> Toast -> actualización reactiva de tarjeta', async () => {
    const spyDerivar = vi
      .spyOn(asistenciaSocialService, 'derivarIncidenteAAsistenciaSocial')
      .mockResolvedValueOnce({
        evento: {
          id: 'ev-e2e-1',
          codigo: 'AS-2026-0777',
          descripcion: 'Derivación FIBE',
          tipoAfectacion: 'INCENDIO_HABITACIONAL',
          personasAfectadas: 5,
          familiasAfectadas: 1,
          direccionTexto: 'Pasaje Los Roble 88',
          latitud: -39.82,
          longitud: -73.24,
          prioridad: 'CRITICA',
          estado: 'ASIGNADO',
          incidenteId: 'inc-e2e-1',
          asistenteSocialId: 'asoc-1',
          asistenteSocialNombre: 'Camila Soto Méndez',
          creadoEn: '2026-11-21T15:00:00Z',
          actualizadoEn: '2026-11-21T15:00:00Z',
        },
        accion: 'CREADO',
        hitoRegistrado: {
          hito: 'DERIVACION_ASISTENCIA_SOCIAL',
          descripcion: 'Derivado a Camila Soto Méndez',
        },
      });

    const incidenteInicial: IncidenteResumen = {
      id: 'inc-e2e-1',
      codigo: 'INC-2026-0777',
      tipoAfectacion: 'Incendio habitacional',
      descripcion: 'Vivienda con daño mayor, 5 personas damnificadas',
      direccion: 'Pasaje Los Roble 88',
      estado: 'RESUELTO',
      prioridad: 'CRITICA',
      personasAfectadas: 5,
      requiereAsistenciaSocial: true,
      creadoEn: '2026-11-21T10:00:00Z',
      actualizadoEn: '2026-11-21T14:50:00Z',
    };

    const { container } = render(
      <ToastProvider>
        <HarnessDerivacionPostIncidente inicial={incidenteInicial} />
      </ToastProvider>
    );

    // 1. Botón visible en tarjeta RESUELTO
    const botonDerivar = screen.getByRole('button', {
      name: /Derivar incidente INC-2026-0777 a Asistencia Social/i,
    });
    fireEvent.click(botonDerivar);

    // 2. Se abre el modal con el selector de disponibles
    expect(screen.getByText(/Derivar a Asistencia Social — INC-2026-0777/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /Camila Soto Méndez/i }));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Derivación/i }));

    // 3. Se invoca el servicio, se cierra modal, aparece toast y la tarjeta pasa a Derivado FIBE
    await waitFor(() => {
      expect(spyDerivar).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('badge-derivado-fibe')).toHaveTextContent('Derivado FIBE');
      expect(screen.getByTestId('resumen-derivacion-social-card')).toHaveTextContent(
        'Camila Soto Méndez'
      );
      expect(screen.getByText(/Derivación a Asistencia Social/i)).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('button', {
        name: /Derivar incidente INC-2026-0777 a Asistencia Social/i,
      })
    ).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/albergue|dideco/i);
  });
});
