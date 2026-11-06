'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { z } from 'zod';
import { catalogosService } from '@/services/catalogosService';
import { getRecursos } from '@/services/recursosService';
import { empleadosService } from '@/services/empleadosService';
import { patrullasService, DEFAULT_ENCARGADO_ID } from '@/services/patrullasService';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import { sanitizarMensajeServidor } from '@/lib/utils/errorUtils';
import type { CatalogoItem } from '@/types/catalogos';
import type { RecursoItem } from '@/types/recurso';
import type { EmpleadoUsuario } from '@/types/empleados';
import type { PatrullaVerificadoraDTO, EditarPatrullaInputDTO, EstadoPatrullaEnum } from '@/types/patrullas';

export const ESTADOS_PATRULLA_BLOQUEADOS: EstadoPatrullaEnum[] = [
  'EN_VERIFICACION',
  'EN_MISION',
  'EN_PREVENCION',
  'EN_RECUPERACION',
];

export const editarPatrullaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, 'El nombre de la patrulla debe tener al menos 3 caracteres.')
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
  const [patrullasRegistradas, setPatrullasRegistradas] = useState<PatrullaVerificadoraDTO[]>([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState<boolean>(true);
  const [errorCatalogos, setErrorCatalogos] = useState<string | null>(null);

  // Mapas reactivos de asignaciones previas (con deduplicación estricta por ID)
  const mapaPatrullasPorPersonal = useMemo(() => {
    const mapa: Record<string, Array<{ id: string; codigo?: string; nombre: string }>> = {};
    for (const pat of patrullasRegistradas) {
      if (pat.integrantes) {
        for (const i of pat.integrantes) {
          const key = i.id;
          if (!mapa[key]) mapa[key] = [];
          if (!mapa[key].some((entry) => entry.id === pat.id)) {
            mapa[key].push({ id: pat.id, codigo: pat.codigo, nombre: pat.nombre });
          }
        }
      }
    }
    return mapa;
  }, [patrullasRegistradas]);

  const mapaPatrullasPorVehiculo = useMemo(() => {
    const mapa: Record<string, Array<{ id: string; codigo?: string; nombre: string }>> = {};
    for (const pat of patrullasRegistradas) {
      if (pat.vehiculo?.id) {
        const vId = pat.vehiculo.id;
        if (!mapa[vId]) mapa[vId] = [];
        if (!mapa[vId].some((entry) => entry.id === pat.id)) {
          mapa[vId].push({ id: pat.id, codigo: pat.codigo, nombre: pat.nombre });
        }
      }
    }
    return mapa;
  }, [patrullasRegistradas]);

  // Estados de retroalimentación de servidor
  const [serverError, setServerError] = useState<string | null>(null);
  const [esConflicto, setEsConflicto] = useState<boolean>(false);
  const [serverFieldErrors, setServerFieldErrors] = useState<Array<{ campo: string; mensaje: string }>>([]);
  const [updatedPatrulla, setUpdatedPatrulla] = useState<PatrullaVerificadoraDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Comprobar bloqueo operativo por estado o misión activa
  const estaBloqueada = useMemo(() => {
    return (
      ESTADOS_PATRULLA_BLOQUEADOS.includes(patrulla.estado) ||
      Boolean(patrulla.misionActiva)
    );
  }, [patrulla.estado, patrulla.misionActiva]);

  const mensajeBloqueo = estaBloqueada
    ? 'No es posible editar la patrulla mientras se encuentre en misión activa o en un estado operativo activo (verificación, prevención o recuperación).'
    : null;

  // Carga de catálogos y combinación de recursos
  const cargarCatalogos = useCallback(async () => {
    setCargandoCatalogos(true);
    setErrorCatalogos(null);

    try {
      const [catRes, recursosRes, personalRes, patrullasRes] = await Promise.allSettled([
        catalogosService.getCatalogos(),
        getRecursos({ pagina: 1, limite: 100, esIndividual: true }),
        empleadosService.getEmpleadosPaginado({ limite: 100 }),
        typeof patrullasService?.listar === 'function'
          ? patrullasService.listar({ limit: 100 }).catch(() => ({ exito: false, data: [] }))
          : Promise.resolve({ exito: false, data: [] }),
      ]);

      // 1. Delegaciones
      if (catRes.status === 'fulfilled' && catRes.value.delegaciones) {
        setDelegaciones(catRes.value.delegaciones);
      }

      // 2. Vehículos: Disponibles o Asignados (para posibilitar uso compartido), excluyendo inoperativos
      const vehiculosLista: RecursoItem[] = [];
      if (recursosRes.status === 'fulfilled' && recursosRes.value.data) {
        const disponibles = recursosRes.value.data.filter(
          (r) => r.esIndividual && r.estado !== 'NO_DISPONIBLE' && r.estado !== 'EN_MANTENCION'
        );
        vehiculosLista.push(...disponibles);
      }

      // Si la patrulla ya tiene un vehículo asignado y no está en la lista, incluirlo
      if (patrulla.vehiculo) {
        const existe = vehiculosLista.some((v) => v.id === patrulla.vehiculo?.id);
        if (!existe) {
          vehiculosLista.unshift({
            id: patrulla.vehiculo.id,
            nombre: patrulla.vehiculo.nombre,
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
      const rawPersonal =
        personalRes.status === 'fulfilled' && personalRes.value.data
          ? personalRes.value.data
          : [];

      if (rawPersonal.length > 0) {
        const candidatos = rawPersonal.filter(
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
            const matchingEmpleado = rawPersonal.find((p) => p.personal_id === integrante.id);
            const realUsuarioId = integrante.usuarioId || matchingEmpleado?.usuario_id || '';

            personalLista.unshift({
              usuario_id: realUsuarioId,
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

      // 4. Patrullas registradas para mapeo de dotación y vehículos compartidos
      if (patrullasRes.status === 'fulfilled' && (patrullasRes.value as { data?: PatrullaVerificadoraDTO[] })?.data) {
        setPatrullasRegistradas((patrullasRes.value as { data: PatrullaVerificadoraDTO[] }).data);
      }
    } catch {
      setErrorCatalogos('Error al cargar datos auxiliares para la edición de patrullas.');
    } finally {
      setCargandoCatalogos(false);
    }
  }, [patrulla]);

  useEffect(() => {
    let activo = true;

    async function inicializar() {
      if (activo) {
        await cargarCatalogos();
      }
    }

    inicializar();

    return () => {
      activo = false;
    };
  }, [cargarCatalogos]);

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

  const handleTogglePersonal = useCallback(
    (personalId: string, usuarioId: string) => {
      setFormData((prev) => {
        const yaSeleccionado = prev.personalIds.includes(personalId);
        const funcionario = personalElegible.find((p) => p.personal_id === personalId);
        const esIntegranteActual = patrulla.integrantes?.some((i) => i.id === personalId);

        // Se permite asignar personal aunque ya pertenezca a otra patrulla (duplicación controlada).
        // Solo se bloquea si el funcionario se encuentra inoperativo (licencia, descanso, inactivo).
        const isInoperativo =
          funcionario?.estado_operativo === 'descanso' ||
          funcionario?.estado_operativo === 'licencia' ||
          funcionario?.estado_operativo === 'inactivo' ||
          funcionario?.usuario_activo === false;

        if (!yaSeleccionado && funcionario && isInoperativo && !esIntegranteActual) {
          return prev;
        }

        let nuevosIds: string[];
        let nuevoLider = prev.usuarioLiderId;

        // BUG-H84-WEB-02: Resolver el usuario_id fidedigno del funcionario
        const resolvedUsuarioId = usuarioId || funcionario?.usuario_id || '';

        if (yaSeleccionado) {
          nuevosIds = prev.personalIds.filter((id) => id !== personalId);
          // Si removemos al líder, reasignar automáticamente al primer integrante restante
          const eraLider = nuevoLider === resolvedUsuarioId;
          if (eraLider) {
            if (nuevosIds.length > 0) {
              const primerRestanteId = nuevosIds[0];
              const primerRestante = personalElegible.find((p) => p.personal_id === primerRestanteId);
              nuevoLider = primerRestante?.usuario_id || '';
            } else {
              nuevoLider = '';
            }
          }
        } else {
          nuevosIds = [...prev.personalIds, personalId];
          // Si no había líder, asignar estrictamente el usuario_id (nunca el personal_id)
          if (!nuevoLider) {
            nuevoLider = resolvedUsuarioId;
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
    },
    [personalElegible, patrulla.integrantes]
  );

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
        // Actualizar datos de inmediato en memoria para que no requiera recarga
        await cargarCatalogos();
        onGuardadoExitoso?.(res.data);
      } else {
        setShowConfirmModal(false);
        const mensajeSanitizado = sanitizarMensajeServidor(res.mensaje);
        setServerError(mensajeSanitizado);

        if (res.esConflicto) {
          setEsConflicto(true);
          const mensajeLower = (res.mensaje || '').toLowerCase();
          if (mensajeLower.includes('vehículo') || mensajeLower.includes('vehiculo')) {
            setServerFieldErrors([{ campo: 'vehiculoId', mensaje: mensajeSanitizado }]);
          } else if (mensajeLower.includes('funcionario') || mensajeLower.includes('personal')) {
            setServerFieldErrors([{ campo: 'personalIds', mensaje: mensajeSanitizado }]);
          } else {
            setServerFieldErrors([{ campo: 'nombre', mensaje: mensajeSanitizado }]);
          }
        } else if (res.erroresValidacion) {
          setServerFieldErrors(
            res.erroresValidacion.map((err) => ({
              campo: err.campo,
              mensaje: sanitizarMensajeServidor(err.mensaje),
            }))
          );
        }
      }
    } catch {
      setShowConfirmModal(false);
      setServerError('Ocurrió un error inesperado al intentar guardar los cambios de la patrulla.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validationResult, estaBloqueada, patrulla.id, usuarioActivo, cargarCatalogos, onGuardadoExitoso]);

  return {
    formData,
    touched,
    delegaciones,
    vehiculosDisponibles,
    personalElegible,
    patrullasRegistradas,
    mapaPatrullasPorPersonal,
    mapaPatrullasPorVehiculo,
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
    recargarDatos: cargarCatalogos,
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
