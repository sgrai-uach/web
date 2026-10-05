'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCatalogos } from '@/hooks/useCatalogos';
import { DELEGACIONES_MUNICIPALES } from '@/hooks/usePuntosCriticos';
import { crearPuntoCritico, PuntoCriticoServiceError } from '@/services/puntosCriticosService';
import { useToast } from '@/components/ui/Toast';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import type {
  PrioridadPuntoCritico,
  PuntoCriticoDetalle,
  CrearPuntoCriticoInput,
} from '@/types/puntoCritico';

export interface PuntoCriticoFormData {
  nombre: string;
  descripcion: string;
  tipoRiesgoSelect: string;
  otroTipoRiesgo: string;
  nivelPrioridad: PrioridadPuntoCritico;
  delegacionId: string;
  lat: number | string;
  lng: number | string;
  radioMetros: number | string;
  activo: boolean;
}

export interface PuntoCriticoFormErrors {
  nombre?: string;
  tipoRiesgo?: string;
  coordenadas?: string;
  lat?: string;
  lng?: string;
  radioMetros?: string;
  general?: string;
}

const INITIAL_FORM_DATA: PuntoCriticoFormData = {
  nombre: '',
  descripcion: '',
  tipoRiesgoSelect: 'Inundación',
  otroTipoRiesgo: '',
  nivelPrioridad: 'MEDIA',
  delegacionId: '',
  lat: -39.81422,
  lng: -73.24589,
  radioMetros: 50,
  activo: true,
};

export function usePuntoCriticoForm() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  let usuarioActivoId = DEFAULT_ADMIN_USER_ID;
  try {
    const session = useSimulatedSession();
    if (session?.usuarioActivo?.id) {
      usuarioActivoId = session.usuarioActivo.id;
    }
  } catch {
    // Si se utiliza fuera de SimulatedSessionProvider (ej. tests aislados)
  }

  const { catalogos, cargando: cargandoCatalogos } = useCatalogos();

  const [formData, setFormData] = useState<PuntoCriticoFormData>(INITIAL_FORM_DATA);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [createdPunto, setCreatedPunto] = useState<PuntoCriticoDetalle | null>(null);

  // Delegaciones: dinámicas si están disponibles, con fallback local garantizado
  const delegaciones = useMemo(() => {
    if (catalogos?.delegaciones && catalogos.delegaciones.length > 0) {
      return catalogos.delegaciones;
    }
    return DELEGACIONES_MUNICIPALES;
  }, [catalogos?.delegaciones]);

  const tipoRiesgoFinal = useMemo(() => {
    if (formData.tipoRiesgoSelect === 'Otro') {
      return formData.otroTipoRiesgo.trim();
    }
    return formData.tipoRiesgoSelect.trim();
  }, [formData.tipoRiesgoSelect, formData.otroTipoRiesgo]);

  const clientErrors = useMemo<PuntoCriticoFormErrors>(() => {
    const errs: PuntoCriticoFormErrors = {};

    if (!formData.nombre || formData.nombre.trim().length < 3) {
      errs.nombre = 'El nombre es obligatorio y debe contener al menos 3 caracteres.';
    } else if (formData.nombre.trim().length > 150) {
      errs.nombre = 'El nombre no puede exceder los 150 caracteres.';
    }

    if (formData.tipoRiesgoSelect === 'Otro') {
      if (!formData.otroTipoRiesgo || formData.otroTipoRiesgo.trim().length < 3) {
        errs.tipoRiesgo = 'Por favor especifique el tipo de riesgo (mínimo 3 caracteres).';
      }
    } else if (!formData.tipoRiesgoSelect) {
      errs.tipoRiesgo = 'Debe seleccionar un tipo de riesgo.';
    }

    const numLat = typeof formData.lat === 'number' ? formData.lat : parseFloat(String(formData.lat));
    const numLng = typeof formData.lng === 'number' ? formData.lng : parseFloat(String(formData.lng));

    if (isNaN(numLat) || numLat < -90 || numLat > 90) {
      errs.lat = 'La latitud es obligatoria y debe ser un valor válido entre -90 y 90.';
    }

    if (isNaN(numLng) || numLng < -180 || numLng > 180) {
      errs.lng = 'La longitud es obligatoria y debe ser un valor válido entre -180 y 180.';
    }

    const numRadio = typeof formData.radioMetros === 'number' ? formData.radioMetros : parseInt(String(formData.radioMetros), 10);
    if (isNaN(numRadio) || numRadio < 1 || numRadio > 50000) {
      errs.radioMetros = 'El radio de afectación debe ser un número entero entre 1 y 50.000 metros.';
    }

    return errs;
  }, [formData]);

  const isValid = Object.keys(clientErrors).length === 0;

  const handleFieldChange = useCallback(
    <K extends keyof PuntoCriticoFormData>(field: K, value: PuntoCriticoFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setServerError(null);
    },
    []
  );

  const handleBlur = useCallback((field: keyof PuntoCriticoFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleCoordsChange = useCallback((coords: { latitud: number; longitud: number }) => {
    setFormData((prev) => ({
      ...prev,
      lat: coords.latitud,
      lng: coords.longitud,
    }));
    setTouched((prev) => ({ ...prev, lat: true, lng: true }));
  }, []);

  const handleCenterValdivia = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      lat: -39.81422,
      lng: -73.24589,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setTouched({});
    setServerError(null);
    setCreatedPunto(null);
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      // Marcar campos clave como tocados
      setTouched({
        nombre: true,
        tipoRiesgoSelect: true,
        otroTipoRiesgo: true,
        lat: true,
        lng: true,
        radioMetros: true,
      });

      if (!isValid) {
        showError('Por favor corrija los campos marcados antes de guardar.', 'Formulario Incompleto');
        return;
      }

      setIsSubmitting(true);
      setServerError(null);

      try {
        const payload: CrearPuntoCriticoInput = {
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim() ? formData.descripcion.trim() : null,
          tipo_riesgo: tipoRiesgoFinal,
          nivel_prioridad: formData.nivelPrioridad,
          lat: typeof formData.lat === 'number' ? formData.lat : parseFloat(String(formData.lat)),
          lng: typeof formData.lng === 'number' ? formData.lng : parseFloat(String(formData.lng)),
          radio_afectacion_metros:
            typeof formData.radioMetros === 'number'
              ? formData.radioMetros
              : parseInt(String(formData.radioMetros), 10) || 50,
          delegacion_id: formData.delegacionId.trim() ? formData.delegacionId.trim() : null,
          activo: formData.activo,
        };

        const userId = usuarioActivoId;
        const nuevoPunto = await crearPuntoCritico(payload, userId);

        setCreatedPunto(nuevoPunto);
        showSuccess(
          `Punto crítico ${nuevoPunto.codigo} registrado exitosamente.`,
          'Registro Exitoso'
        );

        // Redirigir al listado tras un breve lapso para retroalimentación
        setTimeout(() => {
          const targetPath =
            typeof window !== 'undefined' && window.location.pathname.startsWith('/gestion')
              ? '/gestion/admin/puntos-criticos'
              : '/admin/puntos-criticos';
          router.push(targetPath);
        }, 1200);
      } catch (err: unknown) {
        const msg =
          err instanceof PuntoCriticoServiceError
            ? err.message
            : (err as Error)?.message || 'Ocurrió un error inesperado al registrar el punto crítico.';
        setServerError(msg);
        showError(msg, 'Error al guardar');
      } finally {
        setIsSubmitting(false);
      }
    },
    [isValid, formData, tipoRiesgoFinal, usuarioActivoId, showError, showSuccess, router]
  );

  return {
    formData,
    touched,
    clientErrors,
    isValid,
    isSubmitting,
    serverError,
    createdPunto,
    delegaciones,
    cargandoCatalogos,
    handleFieldChange,
    handleBlur,
    handleCoordsChange,
    handleCenterValdivia,
    handleReset,
    handleSubmit,
  };
}
