'use client';

import { useCallback, useMemo, useState } from 'react';
import { useCatalogos } from '@/hooks/useCatalogos';
import { DELEGACIONES_MUNICIPALES } from '@/hooks/usePuntosCriticos';
import { useToast } from '@/components/ui/Toast';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import {
  crearEventoAtp,
  EventoAtpServiceError,
} from '@/services/eventosAtpService';
import type { ApiFieldError } from '@/types/common';
import type {
  CrearEventoAtpInput,
  DelegacionEventoAtpOption,
  EventoAtpDetalle,
  NivelAlertaEventoAtp,
  TipoAmenazaEventoAtp,
} from '@/types/eventoAtp';

export interface EventoAtpFormData {
  codigo: string;
  nombre: string;
  descripcion: string;
  tipoAmenaza: TipoAmenazaEventoAtp;
  nivelAlerta: NivelAlertaEventoAtp;
  fechaInicio: string;
  fechaTermino: string;
  delegacionIds: string[];
}

export interface EventoAtpFormErrors {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  tipoAmenaza?: string;
  nivelAlerta?: string;
  fechaInicio?: string;
  fechaTermino?: string;
  delegacionIds?: string;
  general?: string;
}

const INITIAL_FORM_DATA: EventoAtpFormData = {
  codigo: '',
  nombre: '',
  descripcion: '',
  tipoAmenaza: 'METEOROLOGICA',
  nivelAlerta: 'VERDE',
  fechaInicio: '',
  fechaTermino: '',
  delegacionIds: [],
};

/**
 * Etiquetas legibles de los campos para los mensajes de validación del servidor.
 * Se mantienen locales al módulo ATP para no alterar el diccionario global.
 */
const ETIQUETAS_CAMPOS_ATP: Record<string, string> = {
  codigo: 'Código identificador',
  nombre: 'Nombre del evento',
  descripcion: 'Descripción del evento',
  tipoAmenaza: 'Tipo de amenaza',
  tipo_amenaza: 'Tipo de amenaza',
  nivelAlerta: 'Nivel de alerta',
  nivel_alerta: 'Nivel de alerta',
  fechaInicio: 'Fecha y hora de inicio',
  fecha_inicio: 'Fecha y hora de inicio',
  fechaTermino: 'Fecha y hora de término',
  fecha_termino: 'Fecha y hora de término',
  delegacionIds: 'Delegaciones afectadas',
  delegacion_ids: 'Delegaciones afectadas',
};

function esFechaValida(valor: string): boolean {
  return Boolean(valor) && !Number.isNaN(Date.parse(valor));
}

export function useEventoAtpForm() {
  const { showSuccess, showError } = useToast();

  let usuarioActivoId = DEFAULT_ADMIN_USER_ID;
  try {
    const session = useSimulatedSession();
    if (session?.usuarioActivo?.id) {
      usuarioActivoId = session.usuarioActivo.id;
    }
  } catch {
    // Permite utilizar el hook fuera de SimulatedSessionProvider (tests aislados).
  }

  const { catalogos, cargando: cargandoCatalogos } = useCatalogos();

  const [formData, setFormData] =
    useState<EventoAtpFormData>(INITIAL_FORM_DATA);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<ApiFieldError[]>(
    []
  );
  const [createdEvento, setCreatedEvento] = useState<EventoAtpDetalle | null>(
    null
  );

  const delegaciones = useMemo<DelegacionEventoAtpOption[]>(() => {
    if (catalogos?.delegaciones && catalogos.delegaciones.length > 0) {
      return catalogos.delegaciones;
    }
    return DELEGACIONES_MUNICIPALES;
  }, [catalogos?.delegaciones]);

  const clientErrors = useMemo<EventoAtpFormErrors>(() => {
    const errs: EventoAtpFormErrors = {};

    const codigo = formData.codigo.trim();
    if (codigo) {
      if (codigo.length < 3) {
        errs.codigo = 'El código debe tener al menos 3 caracteres.';
      } else if (codigo.length > 30) {
        errs.codigo = 'El código no puede superar los 30 caracteres.';
      } else if (!/^[A-Za-z0-9-]+$/.test(codigo)) {
        errs.codigo =
          'El código solo puede contener letras, números y guiones.';
      }
    }

    const nombre = formData.nombre.trim();
    if (!nombre || nombre.length < 3) {
      errs.nombre =
        'El nombre del evento es obligatorio y debe contener al menos 3 caracteres.';
    } else if (nombre.length > 150) {
      errs.nombre = 'El nombre del evento no puede superar los 150 caracteres.';
    }

    const descripcion = formData.descripcion.trim();
    if (!descripcion || descripcion.length < 10) {
      errs.descripcion =
        'La descripción es obligatoria y debe contener al menos 10 caracteres.';
    } else if (descripcion.length > 2000) {
      errs.descripcion = 'La descripción no puede superar los 2000 caracteres.';
    }

    if (!formData.tipoAmenaza) {
      errs.tipoAmenaza = 'Debe seleccionar un tipo de amenaza.';
    }

    if (!formData.nivelAlerta) {
      errs.nivelAlerta = 'Debe seleccionar un nivel de alerta.';
    }

    if (!esFechaValida(formData.fechaInicio)) {
      errs.fechaInicio = 'Debe indicar una fecha y hora de inicio válida.';
    }

    if (!esFechaValida(formData.fechaTermino)) {
      errs.fechaTermino = 'Debe indicar una fecha y hora de término válida.';
    } else if (
      esFechaValida(formData.fechaInicio) &&
      esFechaValida(formData.fechaTermino) &&
      Date.parse(formData.fechaTermino) < Date.parse(formData.fechaInicio)
    ) {
      errs.fechaTermino =
        'La fecha y hora de término debe ser mayor o igual a la fecha y hora de inicio.';
    }

    return errs;
  }, [formData]);

  const serverFieldErrorMap = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    serverFieldErrors.forEach((err) => {
      if (err.campo && err.mensaje) {
        map[err.campo] = err.mensaje;
      }
    });
    return map;
  }, [serverFieldErrors]);

  const isValid = Object.keys(clientErrors).length === 0;
  const totalDelegaciones = delegaciones.length;
  const todasSeleccionadas =
    totalDelegaciones > 0 &&
    formData.delegacionIds.length === totalDelegaciones;

  const handleFieldChange = useCallback(
    <K extends keyof EventoAtpFormData>(
      field: K,
      value: EventoAtpFormData[K]
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setServerError(null);
      setServerFieldErrors([]);
    },
    []
  );

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const toggleDelegacion = useCallback((delegacionId: string) => {
    setFormData((prev) => {
      const seleccionada = prev.delegacionIds.includes(delegacionId);
      return {
        ...prev,
        delegacionIds: seleccionada
          ? prev.delegacionIds.filter((id) => id !== delegacionId)
          : [...prev.delegacionIds, delegacionId],
      };
    });
    setServerError(null);
    setServerFieldErrors([]);
  }, []);

  const seleccionarTodasDelegaciones = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      delegacionIds: delegaciones.map((delegacion) => delegacion.id),
    }));
    setServerError(null);
    setServerFieldErrors([]);
  }, [delegaciones]);

  const limpiarDelegaciones = useCallback(() => {
    setFormData((prev) => ({ ...prev, delegacionIds: [] }));
    setServerError(null);
    setServerFieldErrors([]);
  }, []);

  const handleReset = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setTouched({});
    setServerError(null);
    setServerFieldErrors([]);
    setCreatedEvento(null);
  }, []);

  const handleSubmit = useCallback(
    async (event?: React.FormEvent) => {
      if (event) event.preventDefault();

      setTouched({
        codigo: true,
        nombre: true,
        descripcion: true,
        tipoAmenaza: true,
        nivelAlerta: true,
        fechaInicio: true,
        fechaTermino: true,
      });

      if (!isValid) {
        showError(
          'Por favor corrija los campos marcados antes de guardar.',
          'Formulario Incompleto'
        );
        return;
      }

      setIsSubmitting(true);
      setServerError(null);
      setServerFieldErrors([]);

      try {
        const codigo = formData.codigo.trim();
        const payload: CrearEventoAtpInput = {
          codigo: codigo ? codigo.toUpperCase() : undefined,
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim(),
          tipoAmenaza: formData.tipoAmenaza,
          nivelAlerta: formData.nivelAlerta,
          fechaInicio: formData.fechaInicio,
          fechaTermino: formData.fechaTermino,
          delegacionIds: formData.delegacionIds,
        };

        const nuevoEvento = await crearEventoAtp(payload);

        setCreatedEvento(nuevoEvento);
        showSuccess(
          `Evento ATP ${nuevoEvento.codigo} registrado exitosamente.`,
          'Registro Exitoso'
        );
      } catch (err: unknown) {
        if (err instanceof EventoAtpServiceError) {
          const mensaje =
            err.message || 'Datos de creación del Evento ATP inválidos.';
          setServerError(mensaje);
          setServerFieldErrors(err.apiError.errors || err.apiError.detalles || []);
          showError(mensaje, 'Error al guardar');
        } else {
          const mensaje =
            (err as Error)?.message ||
            'Ocurrió un error inesperado al registrar el Evento ATP.';
          setServerError(mensaje);
          setServerFieldErrors([]);
          showError(mensaje, 'Error al guardar');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [isValid, formData, showError, showSuccess]
  );

  return {
    formData,
    touched,
    clientErrors,
    serverFieldErrors,
    serverFieldErrorMap,
    isValid,
    isSubmitting,
    serverError,
    createdEvento,
    delegaciones,
    cargandoCatalogos,
    todasSeleccionadas,
    usuarioActivoId,
    handleFieldChange,
    handleBlur,
    toggleDelegacion,
    seleccionarTodasDelegaciones,
    limpiarDelegaciones,
    handleReset,
    handleSubmit,
  };
}

/**
 * Traduce el identificador técnico de un campo del módulo ATP a una etiqueta legible.
 */
export function traducirCampoEventoAtp(campo?: string): string {
  if (!campo) return '';
  return ETIQUETAS_CAMPOS_ATP[campo] || ETIQUETAS_CAMPOS_ATP[campo.toLowerCase()] || campo;
}
