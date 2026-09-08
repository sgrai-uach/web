'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  obtenerTiposAfectacion,
  enviarAvisoIncidente,
  TIPOS_AFECTACION_DEFAULT,
  type CrearAvisoPayload,
  type ResultadoAviso,
} from '@/lib/api/avisos';
import { validarRutChileno, formatearRut } from '@/lib/validations/rut';
import { validarTelefonoChileno, normalizarTelefonoParaEnvio } from '@/lib/validations/telefono';

export type PasoChat =
  | 'INICIO'
  | 'TIPO_AFECTACION'
  | 'DIRECCION'
  | 'DESCRIPCION'
  | 'NOMBRE'
  | 'RUT'
  | 'TELEFONO'
  | 'CONFIRMACION'
  | 'ENVIANDO'
  | 'FINALIZADO';

export interface MensajeChat {
  id: string;
  remitente: 'bot' | 'usuario';
  contenido: string;
  tipo?: 'texto' | 'opciones' | 'resumen' | 'resultado';
  opciones?: Array<{ label: string; value: string }>;
  datosResumen?: DatosReporte;
  resultado?: ResultadoAviso;
  timestamp: number;
}

export interface DatosReporte {
  tipoAfectacion: string;
  direccion: string;
  descripcion: string;
  informanteNombre: string;
  informanteRut: string;
  informanteTelefono: string;
}

const LOCAL_STORAGE_KEY = 'sgrai_chat_draft';

const DATOS_INICIALES: DatosReporte = {
  tipoAfectacion: '',
  direccion: '',
  descripcion: '',
  informanteNombre: '',
  informanteRut: '',
  informanteTelefono: '',
};

function getMensajesIniciales(tipos = TIPOS_AFECTACION_DEFAULT): MensajeChat[] {
  return [
    {
      id: 'msg-bienvenida-1',
      remitente: 'bot',
      contenido:
        'Hola, soy el asistente virtual de la Dirección de Gestión de Riesgos de Desastres (DGRD) de la Municipalidad de Valdivia. Te guiaré paso a paso para reportar un incidente de forma rápida.',
      tipo: 'texto',
      timestamp: 1,
    },
    {
      id: 'msg-bienvenida-2',
      remitente: 'bot',
      contenido: '¿Qué tipo de situación o afectación necesitas reportar?',
      tipo: 'opciones',
      opciones: tipos.map((t) => ({ label: t, value: t })),
      timestamp: 2,
    },
  ];
}

function cargarBorradorInicial(): { paso: PasoChat; datos: DatosReporte; mensajes: MensajeChat[] } {
  if (typeof window !== 'undefined') {
    try {
      const borrador = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (borrador) {
        const parsed = JSON.parse(borrador);
        if (parsed.datos && parsed.paso && parsed.paso !== 'FINALIZADO' && parsed.mensajes?.length > 0) {
          return { paso: parsed.paso, datos: parsed.datos, mensajes: parsed.mensajes };
        }
      }
    } catch {
      // Ignorar error de parsing
    }
  }
  return {
    paso: 'TIPO_AFECTACION',
    datos: DATOS_INICIALES,
    mensajes: getMensajesIniciales(),
  };
}

export function useChatbot() {
  const [estadoInicial] = useState(cargarBorradorInicial);
  const [paso, setPaso] = useState<PasoChat>(estadoInicial.paso);
  const [mensajes, setMensajes] = useState<MensajeChat[]>(estadoInicial.mensajes);
  const [datos, setDatos] = useState<DatosReporte>(estadoInicial.datos);
  const [tiposAfectacion, setTiposAfectacion] = useState<string[]>(TIPOS_AFECTACION_DEFAULT);
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const [errorInput, setErrorInput] = useState<string | null>(null);
  const [resultadoFinal, setResultadoFinal] = useState<ResultadoAviso | null>(null);

  const pasoRef = useRef(estadoInicial.paso);
  const datosRef = useRef(estadoInicial.datos);

  // Mantener las refs sincronizadas en efectos sin mutar durante el render
  useEffect(() => {
    pasoRef.current = paso;
    datosRef.current = datos;
  }, [paso, datos]);

  // Cargar tipos de afectación dinámicos desde la API
  useEffect(() => {
    let montado = true;
    obtenerTiposAfectacion().then((tipos) => {
      if (montado && tipos && tipos.length > 0) {
        setTiposAfectacion(tipos);
        setMensajes((prev) =>
          prev.map((msg) =>
            msg.id === 'msg-bienvenida-2'
              ? { ...msg, opciones: tipos.map((t) => ({ label: t, value: t })) }
              : msg
          )
        );
      }
    });
    return () => {
      montado = false;
    };
  }, []);

  // Guardar borrador en localStorage
  useEffect(() => {
    if (paso === 'FINALIZADO') {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {
        // Ignorar
      }
      return;
    }

    if (mensajes.length > 0) {
      try {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({
            paso,
            datos,
            mensajes,
          })
        );
      } catch {
        // Ignorar
      }
    }
  }, [paso, datos, mensajes]);

  // Agregar mensaje con simulación de escritura
  const agregarMensajeBot = useCallback((
    contenido: string,
    tipo: MensajeChat['tipo'] = 'texto',
    opciones?: MensajeChat['opciones'],
    datosResumen?: DatosReporte,
    resultado?: ResultadoAviso
  ) => {
    setIsBotTyping(true);
    setTimeout(() => {
      const nuevoMensaje: MensajeChat = {
        id: `bot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        remitente: 'bot',
        contenido,
        tipo,
        opciones,
        datosResumen,
        resultado,
        timestamp: Date.now(),
      };
      setMensajes((prev) => [...prev, nuevoMensaje]);
      setIsBotTyping(false);
    }, 380);
  }, []);

  // Agregar mensaje del usuario inmediatamente
  const agregarMensajeUsuario = useCallback((contenido: string) => {
    const nuevoMensaje: MensajeChat = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      remitente: 'usuario',
      contenido,
      tipo: 'texto',
      timestamp: Date.now(),
    };
    setMensajes((prev) => [...prev, nuevoMensaje]);
  }, []);

  // Iniciar la conversación por primera vez
  const iniciarConversacion = useCallback((tipos = TIPOS_AFECTACION_DEFAULT) => {
    pasoRef.current = 'TIPO_AFECTACION';
    setPaso('TIPO_AFECTACION');
    setMensajes(getMensajesIniciales(tipos));
  }, []);

  // Selección de tipo de afectación
  const seleccionarTipoAfectacion = useCallback((tipo: string) => {
    setErrorInput(null);
    agregarMensajeUsuario(tipo);
    datosRef.current = { ...datosRef.current, tipoAfectacion: tipo };
    setDatos((prev) => ({ ...prev, tipoAfectacion: tipo }));
    pasoRef.current = 'DIRECCION';
    setPaso('DIRECCION');

    agregarMensajeBot(
      'Entendido. Por favor, indica la dirección exacta o punto de referencia del incidente en la comuna de Valdivia (ej. Av. Alemania 550 o Los Boldos con Las Encinas).'
    );
  }, [agregarMensajeBot, agregarMensajeUsuario]);

  // Procesar entrada de dirección
  const procesarDireccion = useCallback((direccion: string) => {
    const texto = direccion.trim();
    if (texto.length < 5) {
      setErrorInput('Por favor indica una dirección o ubicación con al menos 5 caracteres.');
      return;
    }

    setErrorInput(null);
    agregarMensajeUsuario(texto);
    datosRef.current = { ...datosRef.current, direccion: texto };
    setDatos((prev) => ({ ...prev, direccion: texto }));
    pasoRef.current = 'DESCRIPCION';
    setPaso('DESCRIPCION');

    agregarMensajeBot(
      '¿Deseas agregar algún detalle adicional sobre lo que ocurre? Puedes describirlo brevemente o presionar "Omitir detalle".',
      'opciones',
      [{ label: 'Omitir detalle', value: 'OMITIR' }]
    );
  }, [agregarMensajeBot, agregarMensajeUsuario]);

  // Procesar descripción (o su omisión)
  const procesarDescripcion = useCallback((descripcion: string) => {
    setErrorInput(null);
    const texto = descripcion.trim();
    const esOmision = texto === 'OMITIR' || texto.toLowerCase() === 'omitir detalle' || texto === '';

    const valorDesc = esOmision ? '' : texto;
    agregarMensajeUsuario(esOmision ? 'Sin detalle adicional' : texto);
    datosRef.current = { ...datosRef.current, descripcion: valorDesc };
    setDatos((prev) => ({ ...prev, descripcion: valorDesc }));

    pasoRef.current = 'NOMBRE';
    setPaso('NOMBRE');
    agregarMensajeBot('Para registrar formalmente tu reporte, ¿cuál es tu nombre completo?');
  }, [agregarMensajeBot, agregarMensajeUsuario]);

  // Procesar nombre del informante
  const procesarNombre = useCallback((nombre: string) => {
    const texto = nombre.trim();
    if (texto.length < 3) {
      setErrorInput('Por favor ingresa tu nombre completo (mínimo 3 letras).');
      return;
    }

    setErrorInput(null);
    agregarMensajeUsuario(texto);
    datosRef.current = { ...datosRef.current, informanteNombre: texto };
    setDatos((prev) => ({ ...prev, informanteNombre: texto }));
    pasoRef.current = 'RUT';
    setPaso('RUT');

    agregarMensajeBot(
      'Ingresa tu RUT (con o sin puntos y con guión, ej. 11.111.111-1 o 11111111-1):'
    );
  }, [agregarMensajeBot, agregarMensajeUsuario]);

  // Procesar RUT del informante con Módulo 11
  const procesarRut = useCallback((rut: string) => {
    const texto = rut.trim();
    if (!validarRutChileno(texto)) {
      setErrorInput('El RUT ingresado no es válido. Verifica los dígitos y el dígito verificador.');
      return;
    }

    const rutFormateado = formatearRut(texto);
    setErrorInput(null);
    agregarMensajeUsuario(rutFormateado);
    datosRef.current = { ...datosRef.current, informanteRut: rutFormateado };
    setDatos((prev) => ({ ...prev, informanteRut: rutFormateado }));
    pasoRef.current = 'TELEFONO';
    setPaso('TELEFONO');

    agregarMensajeBot(
      'Para que nuestros equipos municipales puedan contactarte ante cualquier duda, ingresa tu número de teléfono de contacto (obligatorio, ej. +56912345678 o 912345678):'
    );
  }, [agregarMensajeBot, agregarMensajeUsuario]);

  // Procesar teléfono de contacto (OBLIGATORIO)
  const procesarTelefono = useCallback((telefono: string) => {
    const texto = telefono.trim();
    if (!validarTelefonoChileno(texto)) {
      setErrorInput('El teléfono es obligatorio y debe ser un número chileno válido (ej. 912345678 o +56912345678).');
      return;
    }

    const telNormalizado = normalizarTelefonoParaEnvio(texto);
    setErrorInput(null);
    agregarMensajeUsuario(telNormalizado);

    const datosActualizados: DatosReporte = {
      ...datosRef.current,
      informanteTelefono: telNormalizado,
    };
    datosRef.current = datosActualizados;
    setDatos(datosActualizados);
    pasoRef.current = 'CONFIRMACION';
    setPaso('CONFIRMACION');

    agregarMensajeBot(
      'Por favor revisa el resumen de tu reporte antes de enviarlo:',
      'resumen',
      undefined,
      datosActualizados
    );
  }, [agregarMensajeBot, agregarMensajeUsuario]);

  // Enviar reporte final a la API
  const confirmarYEnviarReporte = useCallback(async () => {
    pasoRef.current = 'ENVIANDO';
    setPaso('ENVIANDO');
    setErrorInput(null);

    const datosActuales = datosRef.current;
    const payload: CrearAvisoPayload = {
      tipoAfectacion: datosActuales.tipoAfectacion,
      direccion: datosActuales.direccion,
      descripcion: datosActuales.descripcion || undefined,
      informanteNombre: datosActuales.informanteNombre,
      informanteRut: datosActuales.informanteRut,
      informanteTelefono: datosActuales.informanteTelefono,
    };

    const res = await enviarAvisoIncidente(payload);
    setResultadoFinal(res);

    if (res.exito) {
      pasoRef.current = 'FINALIZADO';
      setPaso('FINALIZADO');
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {
        // Ignorar
      }

      if (res.esDuplicado) {
        agregarMensajeBot(
          'Aviso recibido: Este incidente ya fue informado previamente en tu sector.',
          'resultado',
          undefined,
          undefined,
          res
        );
      } else {
        agregarMensajeBot(
          '¡Reporte registrado exitosamente en el sistema municipal!',
          'resultado',
          undefined,
          undefined,
          res
        );
      }
    } else {
      pasoRef.current = 'CONFIRMACION';
      setPaso('CONFIRMACION');
      setErrorInput(res.mensaje || 'Error al enviar el reporte.');
      agregarMensajeBot(
        `No pudimos enviar tu aviso: ${res.mensaje}. Puedes reintentar presionado "Confirmar y Enviar Reporte".`,
        'resumen',
        undefined,
        datosActuales
      );
    }
  }, [agregarMensajeBot]);

  // Modificar datos / reiniciar
  const reiniciarReporte = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Ignorar
    }
    setDatos(DATOS_INICIALES);
    datosRef.current = DATOS_INICIALES;
    setResultadoFinal(null);
    setErrorInput(null);
    iniciarConversacion(tiposAfectacion);
  }, [iniciarConversacion, tiposAfectacion]);

  // Manejar envío general de texto según el paso
  const enviarTexto = useCallback((texto: string) => {
    const pasoActual = pasoRef.current;
    if (pasoActual === 'DIRECCION') {
      procesarDireccion(texto);
    } else if (pasoActual === 'DESCRIPCION') {
      procesarDescripcion(texto);
    } else if (pasoActual === 'NOMBRE') {
      procesarNombre(texto);
    } else if (pasoActual === 'RUT') {
      procesarRut(texto);
    } else if (pasoActual === 'TELEFONO') {
      procesarTelefono(texto);
    }
  }, [procesarDireccion, procesarDescripcion, procesarNombre, procesarRut, procesarTelefono]);

  return {
    paso,
    mensajes,
    datos,
    tiposAfectacion,
    isBotTyping,
    errorInput,
    resultadoFinal,
    seleccionarTipoAfectacion,
    enviarTexto,
    procesarDescripcion,
    confirmarYEnviarReporte,
    reiniciarReporte,
  };
}
