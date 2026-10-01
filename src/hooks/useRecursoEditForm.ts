'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type {
  RecursoItem,
  RecursoEditFormState,
  RecursoDetallesFormFields,
  SubtipoDetalle,
  EditarRecursoDTO,
} from '@/types/recurso';
import type { ApiFieldError } from '@/types/common';
import {
  actualizarRecurso,
  getRecursoById,
  RecursoServiceError,
} from '@/services/recursosService';
import { getErrorMessage } from '@/lib/utils/errorUtils';

const DEFAULT_VALDIVIA_LAT = -39.8142;
const DEFAULT_VALDIVIA_LNG = -73.2459;

export function inferSubtipo(
  esIndividual: boolean,
  detalles?: Record<string, unknown>
): SubtipoDetalle {
  if (!esIndividual) return 'NINGUNO';
  if (!detalles) return 'GENERAL';

  if (detalles.kilometraje !== undefined || detalles.tipoCombustible || detalles.capacidadPasajeros) {
    return 'VEHICULO';
  }
  if (detalles.tipoGrua || detalles.horometro !== undefined || detalles.capacidadCargaKg) {
    return 'MAQUINARIA';
  }
  if (detalles.caudalMaximoLpm !== undefined || detalles.diametroPulgadas !== undefined) {
    return 'MOTOBOMBA';
  }
  if (detalles.numeroSerie || detalles.patente) {
    return 'SERIALIZADO';
  }
  return 'GENERAL';
}

export function populateDetallesFormFields(
  detalles?: Record<string, unknown>
): RecursoDetallesFormFields {
  return {
    patente: detalles?.patente ? String(detalles.patente) : '',
    numeroSerie: detalles?.numeroSerie ? String(detalles.numeroSerie) : '',
    marca: detalles?.marca ? String(detalles.marca) : '',
    modelo: detalles?.modelo ? String(detalles.modelo) : '',
    anio: detalles?.anio !== undefined && detalles?.anio !== null ? String(detalles.anio) : '',
    kilometraje: detalles?.kilometraje !== undefined && detalles?.kilometraje !== null ? String(detalles.kilometraje) : '',
    tipoCombustible: (detalles?.tipoCombustible as RecursoDetallesFormFields['tipoCombustible']) || '',
    capacidadPasajeros: detalles?.capacidadPasajeros !== undefined && detalles?.capacidadPasajeros !== null ? String(detalles.capacidadPasajeros) : '',
    numeroChasis: detalles?.numeroChasis ? String(detalles.numeroChasis) : '',
    capacidadCargaKg: detalles?.capacidadCargaKg !== undefined && detalles?.capacidadCargaKg !== null ? String(detalles.capacidadCargaKg) : '',
    alcanceMaximoMetros: detalles?.alcanceMaximoMetros !== undefined && detalles?.alcanceMaximoMetros !== null ? String(detalles.alcanceMaximoMetros) : '',
    tipoGrua: detalles?.tipoGrua ? String(detalles.tipoGrua) : '',
    horometro: detalles?.horometro !== undefined && detalles?.horometro !== null ? String(detalles.horometro) : '',
    caudalMaximoLpm: detalles?.caudalMaximoLpm !== undefined && detalles?.caudalMaximoLpm !== null ? String(detalles.caudalMaximoLpm) : '',
    diametroPulgadas: detalles?.diametroPulgadas !== undefined && detalles?.diametroPulgadas !== null ? String(detalles.diametroPulgadas) : '',
    potenciaHp: detalles?.potenciaHp !== undefined && detalles?.potenciaHp !== null ? String(detalles.potenciaHp) : '',
  };
}

interface UseRecursoEditFormProps {
  recursoInicial: RecursoItem | null;
  usuarioActivoId: string;
  onGuardadoExitoso: (recursoActualizado: RecursoItem) => void;
  onCerrar: () => void;
}

export function useRecursoEditForm({
  recursoInicial,
  usuarioActivoId,
  onGuardadoExitoso,
  onCerrar,
}: UseRecursoEditFormProps) {
  const [formData, setFormData] = useState<RecursoEditFormState | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState<boolean>(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<ApiFieldError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Inicializar o recargar datos al cambiar de recursoInicial
  useEffect(() => {
    if (!recursoInicial) {
      return;
    }

    let activo = true;

    async function cargarDetalleFresco() {
      if (!recursoInicial) return;
      setCargandoDetalle(true);
      setErrorCarga(null);
      setServerError(null);
      setServerFieldErrors([]);
      setTouched({});

      try {
        const fresco = await getRecursoById(recursoInicial.id, usuarioActivoId);
        if (!activo) return;

        setFormData({
          id: fresco.id,
          nombre: fresco.nombre,
          descripcion: fresco.descripcion || '',
          esIndividual: fresco.esIndividual,
          tipo: fresco.tipo,
          cantidadInventario: fresco.cantidadInventario,
          cantidadMinima: fresco.cantidadMinima,
          cantidadEnUso: fresco.cantidadEnUso,
          enMantencion: fresco.estado === 'EN_MANTENCION',
          latitud: fresco.latitud,
          longitud: fresco.longitud,
          subtipoDetalle: inferSubtipo(fresco.esIndividual, fresco.detalles),
          detalles: populateDetallesFormFields(fresco.detalles),
        });
      } catch {
        if (!activo) return;
        // Fallback con datos recibidos inicialmente
        setFormData({
          id: recursoInicial.id,
          nombre: recursoInicial.nombre,
          descripcion: recursoInicial.descripcion || '',
          esIndividual: recursoInicial.esIndividual,
          tipo: recursoInicial.tipo,
          cantidadInventario: recursoInicial.cantidadInventario,
          cantidadMinima: recursoInicial.cantidadMinima,
          cantidadEnUso: recursoInicial.cantidadEnUso,
          enMantencion: recursoInicial.estado === 'EN_MANTENCION',
          latitud: recursoInicial.latitud,
          longitud: recursoInicial.longitud,
          subtipoDetalle: inferSubtipo(recursoInicial.esIndividual, recursoInicial.detalles),
          detalles: populateDetallesFormFields(recursoInicial.detalles),
        });
      } finally {
        if (activo) setCargandoDetalle(false);
      }
    }

    cargarDetalleFresco();

    return () => {
      activo = false;
    };
  }, [recursoInicial, usuarioActivoId]);

  // Validaciones del cliente
  const clientErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!formData) return errs;

    if (!formData.nombre || formData.nombre.trim().length < 3) {
      errs.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (formData.esIndividual) {
      if (Number(formData.cantidadInventario) !== 1) {
        errs.cantidadInventario = 'Para activos individuales la cantidad fija debe ser 1';
      }
    } else {
      if (
        formData.cantidadInventario === '' ||
        formData.cantidadInventario === undefined ||
        Number.isNaN(Number(formData.cantidadInventario))
      ) {
        errs.cantidadInventario = 'La cantidad es obligatoria';
      } else {
        const cant = Number(formData.cantidadInventario);
        if (cant < 0 || !Number.isInteger(cant)) {
          errs.cantidadInventario = 'La cantidad debe ser un número entero mayor o igual a 0';
        } else if (cant < formData.cantidadEnUso) {
          errs.cantidadInventario = `No puedes reducir el inventario a menos de ${formData.cantidadEnUso} unidades que están actualmente desplegadas en terreno`;
        }
      }
    }

    if (
      formData.cantidadMinima !== '' &&
      formData.cantidadMinima !== undefined &&
      (Number.isNaN(Number(formData.cantidadMinima)) ||
        Number(formData.cantidadMinima) < 0 ||
        !Number.isInteger(Number(formData.cantidadMinima)))
    ) {
      errs.cantidadMinima = 'La cantidad mínima debe ser un número entero mayor o igual a 0';
    }

    const lat = Number(formData.latitud);
    if (formData.latitud === '' || Number.isNaN(lat) || lat < -90 || lat > 90) {
      errs.latitud = 'Latitud inválida (-90 a 90)';
    }

    const lng = Number(formData.longitud);
    if (formData.longitud === '' || Number.isNaN(lng) || lng < -180 || lng > 180) {
      errs.longitud = 'Longitud inválida (-180 a 180)';
    }

    return errs;
  }, [formData]);

  const isValid = useMemo(() => {
    return Object.keys(clientErrors).length === 0;
  }, [clientErrors]);

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleFieldChange = useCallback(
    <K extends keyof RecursoEditFormState>(field: K, value: RecursoEditFormState[K]) => {
      setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
    },
    []
  );

  const handleDetalleChange = useCallback(
    <K extends keyof RecursoDetallesFormFields>(field: K, value: RecursoDetallesFormFields[K]) => {
      setFormData((prev) =>
        prev
          ? {
              ...prev,
              detalles: {
                ...prev.detalles,
                [field]: value,
              },
            }
          : prev
      );
    },
    []
  );

  const handleCoordsChange = useCallback(
    ({ latitud, longitud }: { latitud: number; longitud: number }) => {
      setFormData((prev) => (prev ? { ...prev, latitud, longitud } : prev));
      setTouched((prev) => ({ ...prev, latitud: true, longitud: true }));
    },
    []
  );

  const handleCenterValdivia = useCallback(() => {
    handleCoordsChange({
      latitud: DEFAULT_VALDIVIA_LAT,
      longitud: DEFAULT_VALDIVIA_LNG,
    });
  }, [handleCoordsChange]);

  const handleIntegerKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'Enter',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ];
    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData) return;

      setTouched({
        nombre: true,
        cantidadInventario: true,
        cantidadMinima: true,
        latitud: true,
        longitud: true,
      });

      if (!isValid || isSubmitting) {
        return;
      }

      setIsSubmitting(true);
      setServerError(null);
      setServerFieldErrors([]);

      try {
        let cleanDetalles: EditarRecursoDTO['detalles'] | undefined;
        if (formData.esIndividual && formData.detalles) {
          const temp: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(formData.detalles)) {
            if (v !== undefined && v !== '' && !Number.isNaN(v)) {
              if (
                [
                  'anio',
                  'kilometraje',
                  'capacidadPasajeros',
                  'capacidadCargaKg',
                  'alcanceMaximoMetros',
                  'horometro',
                  'caudalMaximoLpm',
                  'diametroPulgadas',
                  'potenciaHp',
                ].includes(k)
              ) {
                temp[k] = Number(v);
              } else {
                temp[k] = v;
              }
            }
          }
          if (Object.keys(temp).length > 0) {
            cleanDetalles = temp as EditarRecursoDTO['detalles'];
          }
        }

        const payload: EditarRecursoDTO = {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim() !== '' ? formData.descripcion.trim() : null,
          cantidadInventario: formData.esIndividual ? 1 : Number(formData.cantidadInventario),
          cantidadMinima:
            formData.cantidadMinima !== '' ? Number(formData.cantidadMinima) : 0,
          latitud: Number(formData.latitud),
          longitud: Number(formData.longitud),
          enMantencion: formData.enMantencion,
          ...(formData.esIndividual ? { detalles: cleanDetalles || {} } : {}),
        };

        const recursoActualizado = await actualizarRecurso(
          formData.id,
          payload,
          usuarioActivoId
        );

        onGuardadoExitoso(recursoActualizado);
        onCerrar();
      } catch (err: unknown) {
        if (err instanceof RecursoServiceError) {
          setServerError(err.apiError.message);
          setServerFieldErrors(err.apiError.errors || []);
        } else {
          setServerError(getErrorMessage(err));
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, isValid, isSubmitting, usuarioActivoId, onGuardadoExitoso, onCerrar]
  );

  return {
    formData,
    cargandoDetalle,
    errorCarga,
    touched,
    serverError,
    serverFieldErrors,
    isSubmitting,
    isValid,
    clientErrors,
    handleBlur,
    handleFieldChange,
    handleDetalleChange,
    handleCoordsChange,
    handleCenterValdivia,
    handleIntegerKeyDown,
    handleSubmit,
  };
}
