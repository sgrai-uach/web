'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  recursoFormSchema,
  type RecursoFormInput,
  type RecursoFormState,
  type RecursoDetallesFormFields,
  type CrearRecursoDTO,
} from '@/types/recurso';
import type { ApiFieldError } from '@/types/common';
import { crearRecurso, RecursoServiceError } from '@/services/recursosService';
import { getErrorMessage } from '@/lib/utils/errorUtils';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';

const DEFAULT_VALDIVIA_LAT = -39.8142;
const DEFAULT_VALDIVIA_LNG = -73.2459;

export const initialFormState: RecursoFormState = {
  nombre: '',
  descripcion: '',
  esIndividual: false,
  cantidadInventario: '',
  cantidadMinima: '',
  latitud: '',
  longitud: '',
  subtipoDetalle: 'GENERAL',
  detalles: {
    patente: '',
    numeroSerie: '',
    marca: '',
    modelo: '',
    anio: '',
    kilometraje: '',
    tipoCombustible: '',
    capacidadPasajeros: '',
    numeroChasis: '',
    capacidadCargaKg: '',
    alcanceMaximoMetros: '',
    tipoGrua: '',
    horometro: '',
    caudalMaximoLpm: '',
    diametroPulgadas: '',
    potenciaHp: '',
  },
};

export function useRecursoForm() {
  const [formData, setFormData] = useState<RecursoFormState>(initialFormState);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { usuarioActivo } = useSimulatedSession();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<ApiFieldError[]>([]);
  const [createdResourceName, setCreatedResourceName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Helper para bloquear teclas no numéricas en inputs de enteros
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

  // Validación reactiva continua con Zod
  const validationResult = useMemo(() => {
    const rawPayload: Record<string, unknown> = {
      nombre: formData.nombre,
      descripcion: formData.descripcion || undefined,
      esIndividual: formData.esIndividual,
      cantidadInventario: formData.esIndividual ? 1 : formData.cantidadInventario,
      cantidadMinima: formData.cantidadMinima,
      latitud: formData.latitud,
      longitud: formData.longitud,
    };

    if (formData.esIndividual) {
      const d = formData.detalles;
      rawPayload.detalles = {
        patente: d.patente || undefined,
        numeroSerie: d.numeroSerie || undefined,
        marca: d.marca || undefined,
        modelo: d.modelo || undefined,
        anio: d.anio ? Number(d.anio) : undefined,
        kilometraje: d.kilometraje ? Number(d.kilometraje) : undefined,
        tipoCombustible: d.tipoCombustible || undefined,
        capacidadPasajeros: d.capacidadPasajeros ? Number(d.capacidadPasajeros) : undefined,
        numeroChasis: d.numeroChasis || undefined,
        capacidadCargaKg: d.capacidadCargaKg ? Number(d.capacidadCargaKg) : undefined,
        alcanceMaximoMetros: d.alcanceMaximoMetros ? Number(d.alcanceMaximoMetros) : undefined,
        tipoGrua: d.tipoGrua || undefined,
        horometro: d.horometro ? Number(d.horometro) : undefined,
        caudalMaximoLpm: d.caudalMaximoLpm ? Number(d.caudalMaximoLpm) : undefined,
        diametroPulgadas: d.diametroPulgadas ? Number(d.diametroPulgadas) : undefined,
        potenciaHp: d.potenciaHp ? Number(d.potenciaHp) : undefined,
      };
    }

    return recursoFormSchema.safeParse(rawPayload);
  }, [formData]);

  const clientErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!validationResult.success) {
      for (const issue of validationResult.error.issues) {
        const key = issue.path.join('.');
        if (!errs[key]) {
          errs[key] = issue.message;
        }
      }
    }
    return errs;
  }, [validationResult]);

  const isValid = validationResult.success;

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleFieldChange = useCallback(
    <K extends keyof RecursoFormState>(field: K, value: RecursoFormState[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleEsIndividualChange = useCallback((esIndividual: boolean) => {
    setFormData((prev) => ({
      ...prev,
      esIndividual,
      cantidadInventario: esIndividual
        ? 1
        : prev.cantidadInventario === 1
        ? ''
        : prev.cantidadInventario,
    }));
  }, []);

  const handleDetalleChange = useCallback(
    <K extends keyof RecursoDetallesFormFields>(field: K, value: RecursoDetallesFormFields[K]) => {
      setFormData((prev) => ({
        ...prev,
        detalles: {
          ...prev.detalles,
          [field]: value,
        },
      }));
    },
    []
  );

  const handleCoordsChange = useCallback(
    ({ latitud, longitud }: { latitud: number; longitud: number }) => {
      setFormData((prev) => ({ ...prev, latitud, longitud }));
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

  const handleOpenConfirmModal = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();

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

      setShowConfirmModal(true);
    },
    [isValid, isSubmitting]
  );

  const handleCloseConfirmModal = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  const handleConfirmSave = useCallback(async () => {
    if (!isValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    setServerFieldErrors([]);

    try {
      const validData = validationResult.data as RecursoFormInput;

      let cleanDetalles: CrearRecursoDTO['detalles'] | undefined;
      if (validData.esIndividual && validData.detalles) {
        const temp: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(validData.detalles)) {
          if (v !== undefined && v !== '' && !Number.isNaN(v)) {
            temp[k] = v;
          }
        }
        if (Object.keys(temp).length > 0) {
          cleanDetalles = temp as CrearRecursoDTO['detalles'];
        }
      }

      const payload: CrearRecursoDTO = {
        nombre: validData.nombre,
        esIndividual: validData.esIndividual,
        cantidadInventario: validData.esIndividual ? 1 : validData.cantidadInventario,
        cantidadMinima: validData.cantidadMinima,
        latitud: validData.latitud,
        longitud: validData.longitud,
        descripcion: validData.descripcion || undefined,
        ...(cleanDetalles ? { detalles: cleanDetalles } : {}),
      };

      const creado = await crearRecurso(payload, usuarioActivo.id);

      setShowConfirmModal(false);
      setCreatedResourceName(creado.nombre);
    } catch (err: unknown) {
      setShowConfirmModal(false);
      if (err instanceof RecursoServiceError) {
        setServerError(err.apiError.message);
        setServerFieldErrors(err.apiError.errors || []);
      } else {
        setServerError(getErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [isValid, isSubmitting, validationResult]);

  const handleReset = useCallback(() => {
    setFormData(initialFormState);
    setTouched({});
    setServerError(null);
    setServerFieldErrors([]);
    setCreatedResourceName(null);
    setShowConfirmModal(false);
  }, []);

  return {
    formData,
    touched,
    serverError,
    serverFieldErrors,
    createdResourceName,
    isSubmitting,
    showConfirmModal,
    isValid,
    clientErrors,
    handleIntegerKeyDown,
    handleBlur,
    handleFieldChange,
    handleEsIndividualChange,
    handleDetalleChange,
    handleCoordsChange,
    handleCenterValdivia,
    handleOpenConfirmModal,
    handleCloseConfirmModal,
    handleConfirmSave,
    handleReset,
  };
}
