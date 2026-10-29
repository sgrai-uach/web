'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { z } from 'zod';
import { catalogosService } from '@/services/catalogosService';
import { getRecursos } from '@/services/recursosService';
import { empleadosService } from '@/services/empleadosService';
import { patrullasService, DEFAULT_ENCARGADO_ID } from '@/services/patrullasService';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import type { CatalogoItem } from '@/types/catalogos';
import type { RecursoItem } from '@/types/recurso';
import type { EmpleadoUsuario } from '@/types/empleados';
import type { PatrullaVerificadoraDTO, EditarPatrullaInputDTO } from '@/types/patrullas';

export const editarPatrullaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .max(100, 'El nombre no puede exceder 100 caracteres.')
    .optional(),
  delegacionId: z
    .string({ message: 'Debe seleccionar una delegación municipal base.' })
    .min(1, 'Debe seleccionar una delegación municipal base.')
    .uuid('Debe seleccionar una delegación municipal válida.'),
  vehiculoId: z
    .string()
    .uuid('El vehículo seleccionado debe ser un UUID válido.')
    .nullable()
    .optional(),
  personalIds: z
    .array(z.string().uuid())
    .min(1, 'Debe asignar al menos un funcionario con rol PATRULLA_VERIFICADORA a la dotación.'),
  usuarioLiderId: z
    .string()
    .uuid('El líder de patrulla debe ser un UUID válido.')
    .nullable()
    .optional(),
});

export interface EditarPatrullaFormState {
  nombre: string;
  delegacionId: string;
  vehiculoId: string;
  personalIds: string[];
  usuarioLiderId: string;
}

export function useEditarPatrullaForm(
  patrulla: PatrullaVerificadoraDTO,
  onGuardadoExitoso?: (patrulla: PatrullaVerificadoraDTO) => void
) {
  const { usuarioActivo } = useSimulatedSession();

  // Inicializar estado a partir de los datos actuales de la patrulla
  const [formData, setFormData] = useState<EditarPatrullaFormState>(() => ({
    nombre: patrulla.nombre || '',
    delegacionId: patrulla.delegacion?.id || '',
    vehiculoId: patrulla.vehiculo?.id || '',
    personalIds: patrulla.integrantes?.map((i) => i.id) || [],
    usuarioLiderId: patrulla.lider?.id || '',
  }));

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Catálogos y recursos auxiliares
  const [delegaciones, setDelegaciones] = useState<CatalogoItem[]>([]);
  const [vehiculosDisponibles, setVehiculosDisponibles] = useState<RecursoItem[]>([]);
  const [personalElegible, setPersonalElegible] = useState<EmpleadoUsuario[]>([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState<boolean>(true);
  const [errorCatalogos, setErrorCatalogos] = useState<string | null>(null);

  // Estados de retroalimentación de servidor
  const [serverError, setServerError] = useState<string | null>(null);
  const [esConflicto, setEsConflicto] = useState<boolean>(false);
  const [serverFieldErrors, setServerFieldErrors] = useState<Array<{ campo: string; mensaje: string }>>([]);
  const [updatedPatrulla, setUpdatedPatrulla] = useState<PatrullaVerificadoraDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Comprobar bloqueo operativo por estado o misión activa
  const estaBloqueada = useMemo(() => {
    return patrulla.estado === 'EN_VERIFICACION' || Boolean(patrulla.misionActiva);
  }, [patrulla.estado, patrulla.misionActiva]);

  const mensajeBloqueo = estaBloqueada
    ? 'No es posible editar la patrulla mientras se encuentre en verificación o en misión activa.'
    : null;

  // Carga inicial y combinación de recursos
  useEffect(() => {
    let activo = true;

    async function cargarCatalogos() {
      setCargandoCatalogos(true);
      setErrorCatalogos(null);

      try {
        const [catRes, recursosRes, personalRes] = await Promise.allSettled([
          catalogosService.getCatalogos(),
          getRecursos({ pagina: 1, limite: 100, esIndividual: true, estado: 'DISPONIBLE' }),
          empleadosService.getEmpleadosPaginado({ limite: 100 }),
        ]);

        if (!activo) return;

        // 1. Delegaciones
        if (catRes.status === 'fulfilled' && catRes.value.delegaciones) {
          setDelegaciones(catRes.value.delegaciones);
        }

        // 2. Vehículos: Disponibles + Vehículo actual de la patrulla
        const vehiculosLista: RecursoItem[] = [];
        if (recursosRes.status === 'fulfilled' && recursosRes.value.data) {
          const disponibles = recursosRes.value.data.filter(
            (r) => r.esIndividual && r.estado === 'DISPONIBLE'
          );
          vehiculosLista.push(...disponibles);
        }

        // Si la patrulla ya tiene un vehículo asignado y no está en la lista de disponibles, incluirlo
        if (patrulla.vehiculo) {
          const existe = vehiculosLista.some((v) => v.id === patrulla.vehiculo?.id);
          if (!existe) {
            vehiculosLista.unshift({
              id: patrulla.vehiculo.id,
              nombre: `${patrulla.vehiculo.nombre} (Actualmente asignado)`,
              tipo: 'Vehículo o Maquinaria',
              esIndividual: true,
              estado: 'ASIGNADO',
              cantidadInventario: 1,
              cantidadEnUso: 1,
              cantidadDisponible: 0,
              cantidadMinima: 0,
              latitud: 0,
              longitud: 0,
              descripcion: null,
              creadoPorId: '',
              detalles: (patrulla.vehiculo.detalles as unknown as RecursoItem['detalles']) || {},
              delegacion: patrulla.delegacion
                ? {
                    id: patrulla.delegacion.id,
                    nombre: patrulla.delegacion.nombre,
                    codigo: patrulla.delegacion.codigo,
                  }
                : null,
              creadoEn: '',
              actualizadoEn: '',
            });
          }
        }
        setVehiculosDisponibles(vehiculosLista);

        // 3. Personal elegible
        const personalLista: EmpleadoUsuario[] = [];
        if (personalRes.status === 'fulfilled' && personalRes.value.data) {
          const candidatos = personalRes.value.data.filter(
            (p) =>
              p.rol_codigo === 'PATRULLA_VERIFICADORA' &&
              p.personal_id !== null &&
              p.usuario_activo !== false
          );
          personalLista.push(...candidatos);
        }

        // Asegurar que los integrantes actuales de la patrulla se encuentren en la lista
        if (patrulla.integrantes && patrulla.integrantes.length > 0) {
          for (const integrante of patrulla.integrantes) {
            const yaEsta = personalLista.some((p) => p.personal_id === integrante.id);
            if (!yaEsta) {
              personalLista.unshift({
                usuario_id: integrante.usuarioId || integrante.id,
                nombres: integrante.nombre,
                apellidos: '',
                email: integrante.email || '',
                telefono: integrante.telefono || null,
                rut: integrante.rut || '',
                rol_id: 'rol-pv',
                rol_codigo: 'PATRULLA_VERIFICADORA',
                rol_nombre: 'Patrulla Verificadora',
                personal_id: integrante.id,
                cargo: integrante.cargo || 'Evaluador de Terreno',
                estado_operativo: (integrante.estadoOperativo as EmpleadoUsuario['estado_operativo']) || 'en_patrulla',
                usuario_activo: true,
                delegacion_id: patrulla.delegacion?.id || null,
                delegacion_codigo: patrulla.delegacion?.codigo || null,
                delegacion_nombre: patrulla.delegacion?.nombre || null,
                fecha_ingreso: null,
                fecha_salida: null,
                es_personal: true,
                especialidad: integrante.especialidad || null,
                disponible_terreno: true,
                observaciones: null,
              });
            }
          }
        }
        setPersonalElegible(personalLista);
      } catch {
        if (activo) {
          setErrorCatalogos('Error al cargar datos auxiliares para la edición de patrullas.');
        }
      } finally {
        if (activo) {
          setCargandoCatalogos(false);
        }
      }
    }

    cargarCatalogos();

    return () => {
      activo = false;
    };
  }, [patrulla]);

  // Validación reactiva con Zod
  const validationResult = useMemo(() => {
    const rawPayload = {
      nombre: formData.nombre.trim() !== '' ? formData.nombre.trim() : undefined,
      delegacionId: formData.delegacionId,
      vehiculoId: formData.vehiculoId.trim() !== '' ? formData.vehiculoId : null,
      personalIds: formData.personalIds,
      usuarioLiderId: formData.usuarioLiderId.trim() !== '' ? formData.usuarioLiderId : null,
    };

    return editarPatrullaSchema.safeParse(rawPayload);
  }, [formData]);

  const isValid = validationResult.success && !estaBloqueada;

  const clientErrors = useMemo<Record<string, string>>(() => {
    if (validationResult.success) return {};
    const errors: Record<string, string> = {};
    for (const issue of validationResult.error.issues) {
      const field = issue.path[0] as string;
      if (!errors[field]) {
        errors[field] = issue.message;
      }
    }
    return errors;
  }, [validationResult]);

  // Manejadores de cambios
  const handleNombreChange = useCallback((val: string) => {
    setFormData((prev) => ({ ...prev, nombre: val }));
    setServerError(null);
  }, []);

  const handleDelegacionChange = useCallback((val: string) => {
    setFormData((prev) => ({ ...prev, delegacionId: val }));
    setTouched((prev) => ({ ...prev, delegacionId: true }));
    setServerError(null);
  }, []);

  const handleVehiculoChange = useCallback((val: string) => {
    setFormData((prev) => ({ ...prev, vehiculoId: val }));
    setServerError(null);
  }, []);

  const handleTogglePersonal = useCallback((personalId: string, usuarioId: string) => {
    setFormData((prev) => {
      const yaSeleccionado = prev.personalIds.includes(personalId);
      let nuevosIds: string[];
      let nuevoLider = prev.usuarioLiderId;

      if (yaSeleccionado) {
        nuevosIds = prev.personalIds.filter((id) => id !== personalId);
        // Si removemos al líder, reasignar al primero restante
        if (nuevoLider === usuarioId || nuevoLider === personalId) {
          nuevoLider = '';
        }
      } else {
        nuevosIds = [...prev.personalIds, personalId];
        if (!nuevoLider) {
          nuevoLider = usuarioId || personalId;
        }
      }

      return {
        ...prev,
        personalIds: nuevosIds,
        usuarioLiderId: nuevoLider,
      };
    });

    setTouched((prev) => ({ ...prev, personalIds: true }));
    setServerError(null);
  }, []);

  const handleLiderChange = useCallback((usuarioId: string) => {
    setFormData((prev) => ({ ...prev, usuarioLiderId: usuarioId }));
    setServerError(null);
  }, []);

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Modal de confirmación
  const handleOpenConfirmModal = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setTouched({
      delegacionId: true,
      personalIds: true,
    });

    if (validationResult.success && !estaBloqueada) {
      setShowConfirmModal(true);
    }
  }, [validationResult, estaBloqueada]);

  const handleCloseConfirmModal = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  // Envío final PUT
  const handleConfirmSave = useCallback(async () => {
    if (!validationResult.success || estaBloqueada) {
      setShowConfirmModal(false);
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    setEsConflicto(false);
    setServerFieldErrors([]);

    const payload: EditarPatrullaInputDTO = {
      nombre: formData.nombre.trim() !== '' ? formData.nombre.trim() : undefined,
      delegacionId: formData.delegacionId,
      vehiculoId: formData.vehiculoId.trim() !== '' ? formData.vehiculoId : null,
      personalIds: formData.personalIds,
      usuarioLiderId: formData.usuarioLiderId.trim() !== '' ? formData.usuarioLiderId : null,
    };

    try {
      const activeUserId = usuarioActivo?.id || DEFAULT_ENCARGADO_ID;
      const res = await patrullasService.editar(patrulla.id, payload, activeUserId);

      if (res.exito && res.data) {
        setUpdatedPatrulla(res.data);
        setShowConfirmModal(false);
        onGuardadoExitoso?.(res.data);
      } else {
        setShowConfirmModal(false);
        setServerError(res.mensaje);

        if (res.esConflicto) {
          setEsConflicto(true);
        } else if (res.erroresValidacion) {
          setServerFieldErrors(res.erroresValidacion);
        }
      }
    } catch {
      setShowConfirmModal(false);
      setServerError('Ocurrió un error inesperado al intentar guardar los cambios de la patrulla.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validationResult, estaBloqueada, patrulla.id, usuarioActivo, onGuardadoExitoso]);

  return {
    formData,
    touched,
    delegaciones,
    vehiculosDisponibles,
    personalElegible,
    cargandoCatalogos,
    errorCatalogos,
    serverError,
    esConflicto,
    serverFieldErrors,
    updatedPatrulla,
    isSubmitting,
    showConfirmModal,
    isValid,
    clientErrors,
    estaBloqueada,
    mensajeBloqueo,
    handleNombreChange,
    handleDelegacionChange,
    handleVehiculoChange,
    handleTogglePersonal,
    handleLiderChange,
    handleBlur,
    handleOpenConfirmModal,
    handleCloseConfirmModal,
    handleConfirmSave,
  };
}
