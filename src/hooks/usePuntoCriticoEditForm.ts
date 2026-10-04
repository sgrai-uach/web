'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  PuntoCriticoItem,
  PuntoCriticoEditFormState,
  PuntoCriticoFormErrors,
  ActualizarPuntoCriticoDTO,
  DelegacionResumen,
} from '@/types/puntoCritico';
import {
  actualizarPuntoCritico,
  getPuntoCriticoById,
  PuntoCriticoServiceError,
} from '@/services/puntosCriticosService';
import { DELEGACIONES_MUNICIPALES } from '@/hooks/usePuntosCriticos';
import { getErrorMessage } from '@/lib/utils/errorUtils';

export const VALDIVIA_CENTRO_LAT = -39.81422;
export const VALDIVIA_CENTRO_LNG = -73.24589;

export interface UsePuntoCriticoEditFormProps {
  puntoInicial: PuntoCriticoItem | null;
  usuarioActivoId: string;
  onGuardadoExitoso: (puntoActualizado: PuntoCriticoItem) => void;
  onCerrar: () => void;
}

export function usePuntoCriticoEditForm({
  puntoInicial,
  usuarioActivoId,
  onGuardadoExitoso,
  onCerrar,
}: UsePuntoCriticoEditFormProps) {
  const [formData, setFormData] = useState<PuntoCriticoEditFormState>(() => ({
    nombre: puntoInicial?.nombre || '',
    descripcion: puntoInicial?.descripcion || '',
    tipoRiesgo: puntoInicial?.tipoRiesgo || '',
    prioridad: puntoInicial?.prioridad || 'MEDIA',
    delegacionId: puntoInicial?.delegacion?.id || '',
    latitud: puntoInicial?.latitud ?? VALDIVIA_CENTRO_LAT,
    longitud: puntoInicial?.longitud ?? VALDIVIA_CENTRO_LNG,
  }));

  const [initialCoords, setInitialCoords] = useState<{ latitud: number; longitud: number }>(() => ({
    latitud: puntoInicial?.latitud ?? VALDIVIA_CENTRO_LAT,
    longitud: puntoInicial?.longitud ?? VALDIVIA_CENTRO_LNG,
  }));

  const [delegaciones, setDelegaciones] = useState<DelegacionResumen[]>(DELEGACIONES_MUNICIPALES);
  const [clientErrors, setClientErrors] = useState<PuntoCriticoFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [cargandoDetalle, setCargandoDetalle] = useState<boolean>(false);

  // Cargar lista de delegaciones desde /api/catalogos con fallback
  useEffect(() => {
    let activo = true;

    async function cargarCatalogos() {
      try {
        const res = await fetch('/api/catalogos');
        if (res.ok) {
          const json = await res.json();
          if (activo && json.data?.delegaciones && Array.isArray(json.data.delegaciones)) {
            setDelegaciones(json.data.delegaciones);
          }
        }
      } catch {
        // En caso de fallo de red o endpoint ausente, se conserva DELEGACIONES_MUNICIPALES
      }
    }

    cargarCatalogos();

    return () => {
      activo = false;
    };
  }, []);

  // Precargar datos del punto crítico al abrir o cambiar puntoInicial
  useEffect(() => {
    if (!puntoInicial) {
      return;
    }

    let activo = true;

    async function cargarDetalleFresco() {
      if (!puntoInicial) return;
      setCargandoDetalle(true);
      setClientErrors({});
      setServerError(null);

      try {
        const detalle = await getPuntoCriticoById(puntoInicial.id, usuarioActivoId);
        if (!activo) return;

        setFormData({
          nombre: detalle.nombre || '',
          descripcion: detalle.descripcion || '',
          tipoRiesgo: detalle.tipoRiesgo || '',
          prioridad: detalle.prioridad || 'MEDIA',
          delegacionId: detalle.delegacion?.id || '',
          latitud: detalle.latitud,
          longitud: detalle.longitud,
        });
        setInitialCoords({ latitud: detalle.latitud, longitud: detalle.longitud });
      } catch {
        if (!activo) return;
        const lat = puntoInicial.latitud ?? VALDIVIA_CENTRO_LAT;
        const lng = puntoInicial.longitud ?? VALDIVIA_CENTRO_LNG;
        setFormData({
          nombre: puntoInicial.nombre || '',
          descripcion: puntoInicial.descripcion || '',
          tipoRiesgo: puntoInicial.tipoRiesgo || '',
          prioridad: puntoInicial.prioridad || 'MEDIA',
          delegacionId: puntoInicial.delegacion?.id || '',
          latitud: lat,
          longitud: lng,
        });
        setInitialCoords({ latitud: lat, longitud: lng });
      } finally {
        if (activo) {
          setCargandoDetalle(false);
        }
      }
    }

    cargarDetalleFresco();

    return () => {
      activo = false;
    };
  }, [puntoInicial, usuarioActivoId]);

  const handleFieldChange = useCallback(
    (field: keyof PuntoCriticoEditFormState, value: string | number) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Limpiar error del campo al editar
      setClientErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
      setServerError(null);
    },
    []
  );

  const handleCoordsChange = useCallback(
    (coords: { latitud: number; longitud: number } | null) => {
      if (!coords) return;
      setFormData((prev) => ({
        ...prev,
        latitud: coords.latitud,
        longitud: coords.longitud,
      }));

      setClientErrors((prev) => {
        if (!prev.latitud && !prev.longitud) return prev;
        const next = { ...prev };
        delete next.latitud;
        delete next.longitud;
        return next;
      });
      setServerError(null);
    },
    []
  );

  const handleCenterValdivia = useCallback(() => {
    handleCoordsChange({ latitud: VALDIVIA_CENTRO_LAT, longitud: VALDIVIA_CENTRO_LNG });
  }, [handleCoordsChange]);

  const handleResetCoords = useCallback(() => {
    handleCoordsChange(initialCoords);
  }, [handleCoordsChange, initialCoords]);

  const validate = useCallback((): boolean => {
    const errors: PuntoCriticoFormErrors = {};

    // 1. Nombre
    const nombreTrim = formData.nombre.trim();
    if (!nombreTrim) {
      errors.nombre = 'El nombre del punto crítico es obligatorio.';
    } else if (nombreTrim.length < 3) {
      errors.nombre = 'El nombre debe tener al menos 3 caracteres.';
    } else if (nombreTrim.length > 150) {
      errors.nombre = 'El nombre no puede exceder 150 caracteres.';
    }

    // 2. Prioridad
    if (!formData.prioridad) {
      errors.prioridad = 'Debe seleccionar un nivel de prioridad.';
    } else if (!['BAJA', 'MEDIA', 'ALTA', 'CRITICA'].includes(formData.prioridad)) {
      errors.prioridad = 'Prioridad inválida.';
    }

    // 3. Tipo de Riesgo
    if (formData.tipoRiesgo && formData.tipoRiesgo.length > 100) {
      errors.tipoRiesgo = 'El tipo de riesgo no puede superar los 100 caracteres.';
    }

    // 4. Descripción
    if (formData.descripcion && formData.descripcion.length > 1000) {
      errors.descripcion = 'La descripción no puede exceder los 1000 caracteres.';
    }

    // 5. Coordenadas
    const lat = typeof formData.latitud === 'number' ? formData.latitud : parseFloat(formData.latitud);
    const lng = typeof formData.longitud === 'number' ? formData.longitud : parseFloat(formData.longitud);

    if (isNaN(lat)) {
      errors.latitud = 'La latitud debe ser un valor numérico.';
    } else if (lat < -90 || lat > 90) {
      errors.latitud = 'La latitud debe encontrarse entre -90 y 90 grados.';
    }

    if (isNaN(lng)) {
      errors.longitud = 'La longitud debe ser un valor numérico.';
    } else if (lng < -180 || lng > 180) {
      errors.longitud = 'La longitud debe encontrarse entre -180 y 180 grados.';
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      if (!puntoInicial) return;

      if (!validate()) {
        return;
      }

      setIsSubmitting(true);
      setServerError(null);

      const lat = typeof formData.latitud === 'number' ? formData.latitud : parseFloat(formData.latitud);
      const lng = typeof formData.longitud === 'number' ? formData.longitud : parseFloat(formData.longitud);

      const payload: ActualizarPuntoCriticoDTO = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() ? formData.descripcion.trim() : null,
        tipoRiesgo: formData.tipoRiesgo.trim() ? formData.tipoRiesgo.trim() : null,
        prioridad: formData.prioridad,
        delegacionId: formData.delegacionId ? formData.delegacionId : null,
        latitud: parseFloat(lat.toFixed(6)),
        longitud: parseFloat(lng.toFixed(6)),
      };

      try {
        const respuesta = await actualizarPuntoCritico(
          puntoInicial.id,
          payload,
          usuarioActivoId
        );

        // Mapear respuesta a PuntoCriticoItem
        const itemActualizado: PuntoCriticoItem = {
          id: respuesta.id,
          codigo: respuesta.codigo,
          nombre: respuesta.nombre,
          descripcion: respuesta.descripcion,
          tipoRiesgo: respuesta.tipoRiesgo,
          prioridad: respuesta.prioridad,
          activo: respuesta.activo,
          estadoTexto: respuesta.estadoTexto,
          latitud: respuesta.latitud,
          longitud: respuesta.longitud,
          delegacion: respuesta.delegacion,
          creadoEn: respuesta.creadoEn,
        };

        onGuardadoExitoso(itemActualizado);
      } catch (err: unknown) {
        if (err instanceof PuntoCriticoServiceError) {
          if (err.apiError.statusCode === 409) {
            setServerError(
              err.apiError.message ||
                'No es posible modificar este punto crítico porque se encuentra inactivo.'
            );
          } else if (err.apiError.statusCode === 403) {
            setServerError(
              'No cuenta con permisos de Administrador para modificar puntos críticos.'
            );
          } else {
            setServerError(err.apiError.message || 'Error al guardar los cambios del punto crítico.');
          }
        } else {
          setServerError(getErrorMessage(err) || 'Error inesperado al conectar con el servidor.');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [puntoInicial, formData, usuarioActivoId, validate, onGuardadoExitoso]
  );

  return {
    formData,
    initialCoords,
    delegaciones,
    clientErrors,
    serverError,
    isSubmitting,
    cargandoDetalle,
    handleFieldChange,
    handleCoordsChange,
    handleCenterValdivia,
    handleResetCoords,
    handleSubmit,
    onCerrar,
  };
}
