import { describe, it, expect, vi, beforeEach } from 'vitest';
import { consultarSeguimientoIncidente } from '../seguimiento';
import apiClient from '../client';

vi.mock('../client', () => ({
  default: {
    GET: vi.fn(),
  },
}));

describe('consultarSeguimientoIncidente', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe rechazar códigos con longitud distinta a 8 dígitos o no numéricos con error 400', async () => {
    const res1 = await consultarSeguimientoIncidente('');
    expect(res1.exito).toBe(false);
    expect(res1.codigoError).toBe(400);

    const res2 = await consultarSeguimientoIncidente('12345');
    expect(res2.exito).toBe(false);
    expect(res2.codigoError).toBe(400);

    const res3 = await consultarSeguimientoIncidente('abcdefgh');
    expect(res3.exito).toBe(false);
    expect(res3.codigoError).toBe(400);

    expect(apiClient.GET).not.toHaveBeenCalled();
  });

  it('debe retornar los datos estructurados ante una respuesta exitosa HTTP 200', async () => {
    const mockDatos = {
      codigoSeguimiento: '58291045',
      estado: 'EN_ATENCION' as const,
      estadoEtiqueta: 'En Atención',
      estadoDescripcion: 'El incidente fue confirmado en terreno y una cuadrilla operativa municipal está trabajando en el lugar.',
      tipoAfectacion: 'Anegamiento',
      direccionAproximada: 'Av. Alemania 550',
      descripcion: 'Acumulación de agua frente al paradero',
      creadoEn: '2026-09-20T10:15:00.000Z',
      actualizadoEn: '2026-09-20T11:30:00.000Z',
      esDuplicado: false,
    };

    (apiClient.GET as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        message: 'Reporte encontrado exitosamente.',
        data: mockDatos,
      },
      error: undefined,
      response: { ok: true, status: 200 } as Response,
    });

    const resultado = await consultarSeguimientoIncidente('58291045');

    expect(resultado.exito).toBe(true);
    expect(resultado.datos).toEqual(mockDatos);
    expect(resultado.mensaje).toBe('Reporte encontrado exitosamente.');
    expect(apiClient.GET).toHaveBeenCalledWith('/api/incidentes/avisos/seguimiento/{codigo}', {
      params: { path: { codigo: '58291045' } },
    });
  });

  it('debe retornar mensaje amigable de código no encontrado ante HTTP 404', async () => {
    (apiClient.GET as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: undefined,
      error: { message: 'No encontrado' },
      response: { ok: false, status: 404 } as Response,
    });

    const resultado = await consultarSeguimientoIncidente('99999999');

    expect(resultado.exito).toBe(false);
    expect(resultado.codigoError).toBe(404);
    expect(resultado.mensaje).toContain('No encontramos ningún reporte con el código ingresado');
  });

  it('debe manejar errores de servidor HTTP 500 con mensaje de contingencia', async () => {
    (apiClient.GET as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: undefined,
      error: { message: 'Error interno en la base de datos' },
      response: { ok: false, status: 500 } as Response,
    });

    const resultado = await consultarSeguimientoIncidente('58291045');

    expect(resultado.exito).toBe(false);
    expect(resultado.codigoError).toBe(500);
    expect(resultado.mensaje).toBe('Error interno en la base de datos');
  });

  it('debe capturar excepciones de red y retornar mensaje de error de conexión', async () => {
    (apiClient.GET as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Failed to fetch')
    );

    const resultado = await consultarSeguimientoIncidente('58291045');

    expect(resultado.exito).toBe(false);
    expect(resultado.codigoError).toBe(500);
    expect(resultado.mensaje).toContain('Error de conexión');
  });
});
