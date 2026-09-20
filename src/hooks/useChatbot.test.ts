import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useChatbot } from './useChatbot';
import * as avisosApi from '@/lib/api/avisos';

vi.mock('@/lib/api/avisos', () => ({
  TIPOS_AFECTACION_DEFAULT: ['Anegamiento', 'Caída de árbol', 'Otro'],
  obtenerTiposAfectacion: vi.fn().mockResolvedValue(['Anegamiento', 'Caída de árbol', 'Otro']),
  enviarAvisoIncidente: vi.fn(),
}));

describe('useChatbot', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('debe inicializarse en el paso TIPO_AFECTACION con mensajes de bienvenida', async () => {
    const { result } = renderHook(() => useChatbot());

    expect(result.current.paso).toBe('TIPO_AFECTACION');
    expect(result.current.mensajes.length).toBeGreaterThan(0);
    expect(result.current.mensajes[0].remitente).toBe('bot');
  });

  it('debe avanzar a DIRECCION al seleccionar tipo de afectación', () => {
    const { result } = renderHook(() => useChatbot());

    act(() => {
      result.current.seleccionarTipoAfectacion('Anegamiento');
    });

    expect(result.current.datos.tipoAfectacion).toBe('Anegamiento');
    expect(result.current.paso).toBe('DIRECCION');
  });

  it('debe validar la dirección antes de permitir avanzar a DESCRIPCION', () => {
    const { result } = renderHook(() => useChatbot());

    act(() => {
      result.current.seleccionarTipoAfectacion('Anegamiento');
    });

    // Intento con dirección vacía o muy corta
    act(() => {
      result.current.enviarTexto('Av.');
    });

    expect(result.current.paso).toBe('DIRECCION');
    expect(result.current.errorInput).not.toBeNull();

    // Dirección válida
    act(() => {
      result.current.enviarTexto('Av. Alemania 550, Valdivia');
    });

    expect(result.current.datos.direccion).toBe('Av. Alemania 550, Valdivia');
    expect(result.current.paso).toBe('DESCRIPCION');
    expect(result.current.errorInput).toBeNull();
  });

  it('debe permitir omitir descripción o ingresar una breve y avanzar a NOMBRE', () => {
    const { result } = renderHook(() => useChatbot());

    act(() => {
      result.current.seleccionarTipoAfectacion('Anegamiento');
      result.current.enviarTexto('Av. Alemania 550, Valdivia');
    });

    act(() => {
      result.current.procesarDescripcion('OMITIR');
    });

    expect(result.current.paso).toBe('NOMBRE');
    expect(result.current.datos.descripcion).toBe('');
  });

  it('debe validar el nombre del informante (mínimo 3 caracteres)', () => {
    const { result } = renderHook(() => useChatbot());

    act(() => {
      result.current.seleccionarTipoAfectacion('Anegamiento');
      result.current.enviarTexto('Av. Alemania 550, Valdivia');
      result.current.procesarDescripcion('OMITIR');
    });

    act(() => {
      result.current.enviarTexto('J');
    });

    expect(result.current.paso).toBe('NOMBRE');
    expect(result.current.errorInput).not.toBeNull();

    act(() => {
      result.current.enviarTexto('Juan Pérez');
    });

    expect(result.current.paso).toBe('RUT');
    expect(result.current.datos.informanteNombre).toBe('Juan Pérez');
  });

  it('debe validar el RUT chileno con Módulo 11 antes de avanzar a TELEFONO', () => {
    const { result } = renderHook(() => useChatbot());

    act(() => {
      result.current.seleccionarTipoAfectacion('Anegamiento');
      result.current.enviarTexto('Av. Alemania 550, Valdivia');
      result.current.procesarDescripcion('OMITIR');
      result.current.enviarTexto('Juan Pérez');
    });

    // RUT inválido
    act(() => {
      result.current.enviarTexto('11.111.111-2');
    });

    expect(result.current.paso).toBe('RUT');
    expect(result.current.errorInput).not.toBeNull();

    // RUT válido
    act(() => {
      result.current.enviarTexto('11.111.111-1');
    });

    expect(result.current.paso).toBe('TELEFONO');
    expect(result.current.errorInput).toBeNull();
    expect(result.current.datos.informanteRut).toBe('11111111-1');
  });

  it('debe exigir número de teléfono obligatorio y validar su formato antes de CONFIRMACION', () => {
    const { result } = renderHook(() => useChatbot());

    act(() => {
      result.current.seleccionarTipoAfectacion('Anegamiento');
      result.current.enviarTexto('Av. Alemania 550, Valdivia');
      result.current.procesarDescripcion('OMITIR');
      result.current.enviarTexto('Juan Pérez');
      result.current.enviarTexto('11.111.111-1');
    });

    // Intento con teléfono vacío
    act(() => {
      result.current.enviarTexto('   ');
    });

    expect(result.current.paso).toBe('TELEFONO');
    expect(result.current.errorInput).not.toBeNull();

    // Intento con formato no chileno
    act(() => {
      result.current.enviarTexto('1234');
    });

    expect(result.current.paso).toBe('TELEFONO');
    expect(result.current.errorInput).not.toBeNull();

    // Teléfono chileno válido
    act(() => {
      result.current.enviarTexto('+56912345678');
    });

    expect(result.current.paso).toBe('CONFIRMACION');
    expect(result.current.errorInput).toBeNull();
    expect(result.current.datos.informanteTelefono).toBe('+56912345678');
  });

  it('debe procesar el envío exitoso de un nuevo reporte (201 Created)', async () => {
    vi.mocked(avisosApi.enviarAvisoIncidente).mockResolvedValueOnce({
      exito: true,
      esDuplicado: false,
      codigoSeguimiento: '84920194',
      mensaje: 'Aviso registrado exitosamente.',
    });

    const { result } = renderHook(() => useChatbot());

    act(() => {
      result.current.seleccionarTipoAfectacion('Anegamiento');
      result.current.enviarTexto('Av. Alemania 550, Valdivia');
      result.current.procesarDescripcion('OMITIR');
      result.current.enviarTexto('Juan Pérez');
      result.current.enviarTexto('11.111.111-1');
      result.current.enviarTexto('+56912345678');
    });

    await act(async () => {
      await result.current.confirmarYEnviarReporte();
    });

    expect(result.current.paso).toBe('FINALIZADO');
    expect(result.current.resultadoFinal?.codigoSeguimiento).toBe('84920194');
    expect(result.current.resultadoFinal?.esDuplicado).toBe(false);
  });

  it('debe procesar el reporte duplicado (200 OK modelo SAESA)', async () => {
    vi.mocked(avisosApi.enviarAvisoIncidente).mockResolvedValueOnce({
      exito: true,
      esDuplicado: true,
      codigoSeguimiento: '84920194',
      mensaje: 'Aviso asociado a incidente existente en la zona.',
    });

    const { result } = renderHook(() => useChatbot());

    act(() => {
      result.current.seleccionarTipoAfectacion('Anegamiento');
      result.current.enviarTexto('Av. Alemania 550, Valdivia');
      result.current.procesarDescripcion('OMITIR');
      result.current.enviarTexto('Juan Pérez');
      result.current.enviarTexto('11.111.111-1');
      result.current.enviarTexto('+56912345678');
    });

    await act(async () => {
      await result.current.confirmarYEnviarReporte();
    });

    expect(result.current.paso).toBe('FINALIZADO');
    expect(result.current.resultadoFinal?.esDuplicado).toBe(true);
    expect(result.current.resultadoFinal?.codigoSeguimiento).toBe('84920194');
  });

  it('debe permitir solicitar modificación sin borrar los datos del reporte', () => {
    const { result } = renderHook(() => useChatbot());

    act(() => {
      result.current.seleccionarTipoAfectacion('Anegamiento');
      result.current.enviarTexto('Av. Alemania 550, Valdivia');
      result.current.procesarDescripcion('OMITIR');
      result.current.enviarTexto('Juan Pérez');
      result.current.enviarTexto('11.111.111-1');
      result.current.enviarTexto('+56912345678');
    });

    expect(result.current.paso).toBe('CONFIRMACION');

    act(() => {
      result.current.solicitarModificacion();
    });

    expect(result.current.paso).toBe('MODIFICAR_SELECCION');
    // Verifica que ningún dato previo fue borrado
    expect(result.current.datos.tipoAfectacion).toBe('Anegamiento');
    expect(result.current.datos.direccion).toBe('Av. Alemania 550, Valdivia');
    expect(result.current.datos.informanteNombre).toBe('Juan Pérez');
    expect(result.current.datos.informanteRut).toBe('11111111-1');
    expect(result.current.datos.informanteTelefono).toBe('+56912345678');
  });

  it('debe permitir modificar solo el tipo de afectación y volver a CONFIRMACION manteniendo los otros datos', () => {
    const { result } = renderHook(() => useChatbot());

    act(() => {
      result.current.seleccionarTipoAfectacion('Anegamiento');
      result.current.enviarTexto('Av. Alemania 550, Valdivia');
      result.current.procesarDescripcion('OMITIR');
      result.current.enviarTexto('Juan Pérez');
      result.current.enviarTexto('11.111.111-1');
      result.current.enviarTexto('+56912345678');
    });

    act(() => {
      result.current.solicitarModificacion();
    });

    act(() => {
      result.current.seleccionarCampoModificar('MOD_TIPO');
    });

    expect(result.current.paso).toBe('MODIFICAR_TIPO');

    act(() => {
      result.current.actualizarTipoModificado('Caída de árbol');
    });

    expect(result.current.paso).toBe('CONFIRMACION');
    expect(result.current.datos.tipoAfectacion).toBe('Caída de árbol');
    // Los demás campos deben mantenerse exactamente iguales
    expect(result.current.datos.direccion).toBe('Av. Alemania 550, Valdivia');
    expect(result.current.datos.informanteNombre).toBe('Juan Pérez');
    expect(result.current.datos.informanteTelefono).toBe('+56912345678');
  });

  it('debe permitir modificar la dirección con validación sin alterar el resto del reporte', () => {
    const { result } = renderHook(() => useChatbot());

    act(() => {
      result.current.seleccionarTipoAfectacion('Anegamiento');
      result.current.enviarTexto('Av. Alemania 550, Valdivia');
      result.current.procesarDescripcion('OMITIR');
      result.current.enviarTexto('Juan Pérez');
      result.current.enviarTexto('11.111.111-1');
      result.current.enviarTexto('+56912345678');
    });

    act(() => {
      result.current.solicitarModificacion();
    });

    act(() => {
      result.current.seleccionarCampoModificar('MOD_DIRECCION');
    });

    expect(result.current.paso).toBe('MODIFICAR_DIRECCION');

    // Intento con dirección inválida (muy corta)
    act(() => {
      result.current.enviarTexto('Av.');
    });

    expect(result.current.paso).toBe('MODIFICAR_DIRECCION');
    expect(result.current.errorInput).not.toBeNull();

    // Dirección válida
    act(() => {
      result.current.enviarTexto('Los Boldos con Las Encinas, Isla Teja');
    });

    expect(result.current.paso).toBe('CONFIRMACION');
    expect(result.current.datos.direccion).toBe('Los Boldos con Las Encinas, Isla Teja');
    expect(result.current.datos.tipoAfectacion).toBe('Anegamiento');
    expect(result.current.datos.informanteNombre).toBe('Juan Pérez');
  });

  it('debe permitir cancelar la modificación y retornar a CONFIRMACION con los datos intactos', () => {
    const { result } = renderHook(() => useChatbot());

    act(() => {
      result.current.seleccionarTipoAfectacion('Anegamiento');
      result.current.enviarTexto('Av. Alemania 550, Valdivia');
      result.current.procesarDescripcion('OMITIR');
      result.current.enviarTexto('Juan Pérez');
      result.current.enviarTexto('11.111.111-1');
      result.current.enviarTexto('+56912345678');
    });

    act(() => {
      result.current.solicitarModificacion();
    });

    act(() => {
      result.current.seleccionarCampoModificar('MOD_CANCELAR');
    });

    expect(result.current.paso).toBe('CONFIRMACION');
    expect(result.current.datos.direccion).toBe('Av. Alemania 550, Valdivia');
    expect(result.current.datos.informanteTelefono).toBe('+56912345678');
  });

  it('debe restaurar borrador guardado en localStorage tras el montaje inicial', async () => {
    const borradorGuardado = {
      paso: 'DIRECCION',
      datos: {
        tipoAfectacion: 'Anegamiento',
        direccion: '',
        descripcion: '',
        informanteNombre: '',
        informanteRut: '',
        informanteTelefono: '',
      },
      mensajes: [
        { id: '1', remitente: 'bot', contenido: 'Hola', tipo: 'texto', timestamp: 1 },
        { id: '2', remitente: 'usuario', contenido: 'Anegamiento', tipo: 'texto', timestamp: 2 },
      ],
    };

    localStorage.setItem('sgrai_chat_draft', JSON.stringify(borradorGuardado));

    const { result } = renderHook(() => useChatbot());

    await waitFor(() => {
      expect(result.current.paso).toBe('DIRECCION');
    });

    expect(result.current.datos.tipoAfectacion).toBe('Anegamiento');
    expect(result.current.mensajes.length).toBe(2);
    expect(result.current.isHydrated).toBe(true);
  });
});
