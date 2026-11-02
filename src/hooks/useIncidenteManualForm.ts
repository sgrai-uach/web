'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  obtenerTiposAfectacion,
  crearIncidenteManual,
  type CrearIncidenteManualPayload,
} from '@/services/incidentesManualesService';
import {
  incidenteManualSchema,
  TIPOS_AFECTACION_FALLBACK,
  type OrigenReporte,
  type PrioridadIncidente,
  type DuplicadoItem,
  type IncidenteCreadoExito,
} from '@/types/incidente-manual';
import { formatearRut } from '@/lib/validations/rut';
import { useVerificarDuplicado } from '@/hooks/useVerificarDuplicado';
import {
  geocodificarDireccionEnValdivia,
  geocodificacionInversaEnValdivia,
} from '@/lib/maps/geocoding';
import { useOptionalToast } from '@/components/ui/Toast';

interface UseIncidenteManualFormOptions {
  operadorId: string;
  onExito?: (datos: IncidenteCreadoExito) => void;
}

export function useIncidenteManualForm({
  operadorId,
  onExito,
}: UseIncidenteManualFormOptions) {
  const toast = useOptionalToast();

  const [tiposAfectacion, setTiposAfectacion] = useState<string[]>(TIPOS_AFECTACION_FALLBACK);
  const [cargandoTipos, setCargandoTipos] = useState(true);

  const [origenReporte, setOrigenReporte] = useState<OrigenReporte>('LLAMADA_TELEFONICA');
  const [tipoAfectacion, setTipoAfectacion] = useState<string>(TIPOS_AFECTACION_FALLBACK[0]);

  const [descripcion, setDescripcion] = useState<string>('');
  const [direccion, setDireccion] = useState<string>('');
  const [informanteNombre, setInformanteNombre] = useState<string>('');
  const [informanteRut, setInformanteRut] = useState<string>('');
  const [informanteTelefono, setInformanteTelefono] = useState<string>('');
  const [prioridad, setPrioridad] = useState<PrioridadIncidente>('MEDIA');
  const [coordenadas, setCoordenadas] = useState<{ latitud: number; longitud: number } | null>(null);
  const [geocodificandoMapa, setGeocodificandoMapa] = useState<boolean>(false);

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<boolean>(false);

  const [modalDuplicadosAbierto, setModalDuplicadosAbierto] = useState<boolean>(false);
  const [coincidenciasConflicto, setCoincidenciasConflicto] = useState<DuplicadoItem[]>([]);
  const [mensajeConflicto, setMensajeConflicto] = useState<string>('');
  const [resultadoExitoso, setResultadoExitoso] = useState<IncidenteCreadoExito | null>(null);

  const { consultando: verificandoDuplicados, coincidencias: duplicadosPreventivos } =
    useVerificarDuplicado({
      direccion,
      tipoAfectacion,
      latitud: coordenadas?.latitud,
      longitud: coordenadas?.longitud,
      operadorId,
    });

  useEffect(() => {
    let activo = true;
    obtenerTiposAfectacion().then((tipos) => {
      if (activo) {
        setTiposAfectacion(tipos);
        if (tipos.length > 0) {
          setTipoAfectacion(tipos[0]);
        }
        setCargandoTipos(false);
      }
    });
    return () => {
      activo = false;
    };
  }, []);

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formated = formatearRut(raw, false);
    setInformanteRut(formated);
    if (errores.informanteRut) {
      setErrores((prev) => {
        const c = { ...prev };
        delete c.informanteRut;
        return c;
      });
    }
  };

  const handleSincronizarMapaConDireccion = useCallback(async () => {
    if (direccion.trim().length < 4) return;
    setGeocodificandoMapa(true);
    try {
      const coords = await geocodificarDireccionEnValdivia(direccion.trim());
      if (coords) setCoordenadas(coords);
    } finally {
      setGeocodificandoMapa(false);
    }
  }, [direccion]);

  const handleUserSelectLocation = useCallback(
    async (coords: { latitud: number; longitud: number }) => {
      setCoordenadas(coords);
      try {
        const direccionInversa = await geocodificacionInversaEnValdivia(
          coords.latitud,
          coords.longitud
        );
        if (direccionInversa) {
          setDireccion(direccionInversa);
          if (errores.direccion) {
            setErrores((prev) => {
              const c = { ...prev };
              delete c.direccion;
              return c;
            });
          }
        }
      } catch {
        // En caso de fallo de red, se mantienen las coordenadas fijadas sin bloquear
      }
    },
    [errores.direccion]
  );

  const limpiarFormulario = useCallback(() => {
    setOrigenReporte('LLAMADA_TELEFONICA');
    setDescripcion('');
    setDireccion('');
    setInformanteNombre('');
    setInformanteRut('');
    setInformanteTelefono('');
    setPrioridad('MEDIA');
    setCoordenadas(null);
    setErrores({});
    setErrorGeneral(null);
    setModalDuplicadosAbierto(false);
    setCoincidenciasConflicto([]);
    setResultadoExitoso(null);
  }, []);

  const handleSubmit = async (e?: React.FormEvent, forzar = false) => {
    if (e) e.preventDefault();
    setErrorGeneral(null);
    setErrores({});

    const datosAValidar = {
      origenReporte,
      tipoAfectacion,
      descripcion,
      direccion,
      informanteNombre,
      informanteRut,
      informanteTelefono: informanteTelefono || undefined,
      prioridad,
      requiereAsistenciaSocial: false,
      latitud: coordenadas?.latitud,
      longitud: coordenadas?.longitud,
      forzarCreacion: forzar,
    };

    const validacion = incidenteManualSchema.safeParse(datosAValidar);
    if (!validacion.success) {
      const mapaErrores: Record<string, string> = {};
      validacion.error.issues.forEach((issue) => {
        const campo = issue.path[0] as string;
        if (!mapaErrores[campo]) {
          mapaErrores[campo] = issue.message;
        }
      });
      setErrores(mapaErrores);
      toast?.showError(
        'Por favor completa los campos requeridos antes de guardar.',
        'Campos requeridos'
      );
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await crearIncidenteManual(
        datosAValidar as CrearIncidenteManualPayload,
        operadorId
      );
      if (respuesta.tipo === 'EXITO') {
        setModalDuplicadosAbierto(false);
        setResultadoExitoso(respuesta.datos);
        setErrorGeneral(null);
        toast?.showSuccess('Incidente ingresado y verificado exitosamente.');
        onExito?.(respuesta.datos);
      } else if (respuesta.tipo === 'DUPLICADO') {
        setCoincidenciasConflicto(respuesta.coincidencias);
        setMensajeConflicto(respuesta.mensaje);
        setModalDuplicadosAbierto(true);
        setErrorGeneral(null);
        toast?.showWarning(
          `Se detectaron ${respuesta.coincidencias.length} incidentes similares en la misma zona. Revisa la ventana de duplicados.`,
          'Posible duplicado detectado'
        );
      } else if (respuesta.tipo === 'ERROR_VALIDACION') {
        const msg =
          respuesta.errores.length > 0
            ? `${respuesta.mensaje}: ${respuesta.errores.join(', ')}`
            : respuesta.mensaje;
        setErrorGeneral(msg);
        toast?.showError(msg, 'Error de validación');
      } else if (respuesta.tipo === 'NO_AUTORIZADO') {
        const msg = 'Acceso restringido: El operador no posee el permiso crear_incidente_manual.';
        setErrorGeneral(msg);
        toast?.showError(msg, 'No autorizado');
      } else {
        setErrorGeneral(respuesta.mensaje);
        toast?.showError(respuesta.mensaje, 'Error del sistema');
      }
    } catch {
      const msg = 'Error inesperado de red al procesar el reporte.';
      setErrorGeneral(msg);
      toast?.showError(msg, 'Error de conexión');
    } finally {
      setEnviando(false);
    }
  };

  return {
    tiposAfectacion,
    cargandoTipos,
    origenReporte,
    setOrigenReporte,
    tipoAfectacion,
    setTipoAfectacion,
    descripcion,
    setDescripcion,
    direccion,
    setDireccion,
    informanteNombre,
    setInformanteNombre,
    informanteRut,
    handleRutChange,
    informanteTelefono,
    setInformanteTelefono,
    prioridad,
    setPrioridad,
    coordenadas,
    setCoordenadas,
    geocodificandoMapa,
    errores,
    errorGeneral,
    enviando,
    modalDuplicadosAbierto,
    setModalDuplicadosAbierto,
    coincidenciasConflicto,
    mensajeConflicto,
    resultadoExitoso,
    verificandoDuplicados,
    duplicadosPreventivos,
    handleSincronizarMapaConDireccion,
    handleUserSelectLocation,
    limpiarFormulario,
    handleSubmit,
  };
}
