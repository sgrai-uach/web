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
import type { PatrullaVerificadoraDTO, CrearPatrullaInputDTO } from '@/types/patrullas';

export const nuevaPatrullaSchema = z.object({
  codigo: z
    .string({ message: 'El código identificador es obligatorio.' })
    .trim()
    .min(3, 'El código identificador debe tener al menos 3 caracteres.')
    .max(50, 'El código identificador no puede exceder 50 caracteres.')
    .regex(
      /^[A-Za-z0-9\-_]+$/,
      'El código solo puede contener letras, números, guiones y guiones bajos (ej. PV-NORTE-01).'
    ),
  nombre: z
    .string()
    .trim()
    .max(100, 'El nombre no puede exceder 100 caracteres.')
    .refine((val) => !val || val.length >= 3, {
      message: 'El nombre debe tener al menos 3 caracteres.',
    })
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

export interface NuevaPatrullaFormState {
  codigo: string;
  nombre: string;
  delegacionId: string;
  vehiculoId: string;
  personalIds: string[];
  usuarioLiderId: string;
}

export const initialPatrullaFormState: NuevaPatrullaFormState = {
  codigo: '',
  nombre: '',
  delegacionId: '',
  vehiculoId: '',
  personalIds: [],
  usuarioLiderId: '',
};

export function useNuevaPatrullaForm() {
  const [formData, setFormData] = useState<NuevaPatrullaFormState>(initialPatrullaFormState);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { usuarioActivo } = useSimulatedSession();

  // Estados de catálogos y datos para selectores
  const [delegaciones, setDelegaciones] = useState<CatalogoItem[]>([]);
  const [vehiculosDisponibles, setVehiculosDisponibles] = useState<RecursoItem[]>([]);
  const [personalElegible, setPersonalElegible] = useState<EmpleadoUsuario[]>([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState<boolean>(true);
  const [errorCatalogos, setErrorCatalogos] = useState<string | null>(null);

  // Estados de retroalimentación de envío
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<Array<{ campo: string; mensaje: string }>>([]);
  const [createdPatrulla, setCreatedPatrulla] = useState<PatrullaVerificadoraDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Carga inicial de dependencias del formulario
  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
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

        // 2. Vehículos disponibles
        if (recursosRes.status === 'fulfilled' && recursosRes.value.data) {
          // Filtrar recursos que sean individuales y de tipo vehículo o maquinaria
          const vehiculos = recursosRes.value.data.filter(
            (r) => r.esIndividual && r.estado === 'DISPONIBLE'
          );
          setVehiculosDisponibles(vehiculos);
        }

        // 3. Personal elegible (con rol PATRULLA_VERIFICADORA y ficha operativa en 'personal')
        if (personalRes.status === 'fulfilled' && personalRes.value.data) {
          const personal = personalRes.value.data.filter(
            (p) =>
              p.rol_codigo === 'PATRULLA_VERIFICADORA' &&
              p.personal_id !== null &&
              p.usuario_activo !== false
          );
          setPersonalElegible(personal);
        }
      } catch {
        if (activo) {
          setErrorCatalogos('Error al cargar datos auxiliares (delegaciones, vehículos o personal).');
        }
      } finally {
        if (activo) {
          setCargandoCatalogos(false);
        }
      }
    }

    cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  // Validación reactiva continua con Zod
  const validationResult = useMemo(() => {
    const rawPayload = {
      codigo: formData.codigo,
      nombre: formData.nombre.trim() !== '' ? formData.nombre.trim() : undefined,
      delegacionId: formData.delegacionId,
      vehiculoId: formData.vehiculoId.trim() !== '' ? formData.vehiculoId : null,
      personalIds: formData.personalIds,
      usuarioLiderId: formData.usuarioLiderId.trim() !== '' ? formData.usuarioLiderId : null,
    };

    return nuevaPatrullaSchema.safeParse(rawPayload);
  }, [formData]);

  const isValid = validationResult.success;

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

  // Manejo de cambios en campos
  const handleCodigoChange = useCallback((val: string) => {
    // Sanitizar a mayúsculas y caracteres válidos
    const sanitizado = val.toUpperCase().replace(/\s+/g, '-');
    setFormData((prev) => ({ ...prev, codigo: sanitizado }));
    setServerError(null);
    setServerFieldErrors([]);
  }, []);

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
      const empleado = personalElegible.find((p) => p.personal_id === personalId);

      setFormData((prev) => {
        const yaSeleccionado = prev.personalIds.includes(personalId);

        // ICS Operativo: Solo funcionarios con estado_operativo === 'disponible' pueden ser incorporados
        if (!yaSeleccionado && empleado && empleado.estado_operativo && empleado.estado_operativo !== 'disponible') {
          return prev;
        }

        let nuevosIds: string[];
        let nuevoLider = prev.usuarioLiderId;

        if (yaSeleccionado) {
          nuevosIds = prev.personalIds.filter((id) => id !== personalId);
          // Si quitamos al que era líder, reasignar líder al primero restante
          if (nuevoLider === usuarioId) {
            nuevoLider = '';
          }
        } else {
          nuevosIds = [...prev.personalIds, personalId];
          // Si no hay líder seleccionado aún, asignar al primero
          if (!nuevoLider) {
            nuevoLider = usuarioId;
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
    [personalElegible]
  );

  const handleLiderChange = useCallback((usuarioId: string) => {
    setFormData((prev) => ({ ...prev, usuarioLiderId: usuarioId }));
    setServerError(null);
  }, []);

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Control de Modal de Confirmación
  const handleOpenConfirmModal = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Marcar todos los campos como tocados para revelar errores si los hay
    setTouched({
      codigo: true,
      delegacionId: true,
      personalIds: true,
    });

    if (validationResult.success) {
      setShowConfirmModal(true);
    }
  }, [validationResult]);

  const handleCloseConfirmModal = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  // Envío a API
  const handleConfirmSave = useCallback(async () => {
    if (!validationResult.success) {
      setShowConfirmModal(false);
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    setServerFieldErrors([]);

    const payload: CrearPatrullaInputDTO = {
      codigo: formData.codigo.trim().toUpperCase(),
      nombre: formData.nombre.trim() !== '' ? formData.nombre.trim() : undefined,
      delegacionId: formData.delegacionId,
      vehiculoId: formData.vehiculoId.trim() !== '' ? formData.vehiculoId : null,
      personalIds: formData.personalIds,
      usuarioLiderId: formData.usuarioLiderId.trim() !== '' ? formData.usuarioLiderId : null,
    };

    try {
      const activeUserId = usuarioActivo?.id || DEFAULT_ENCARGADO_ID;
      const res = await patrullasService.crear(payload, activeUserId);

      if (res.exito && res.data) {
        setCreatedPatrulla(res.data);
        setShowConfirmModal(false);
      } else {
        setShowConfirmModal(false);
        setServerError(res.mensaje);

        if (res.esConflicto) {
          setServerFieldErrors([
            { campo: 'codigo', mensaje: 'Ya existe una patrulla registrada con este código.' },
          ]);
        } else if (res.erroresValidacion) {
          setServerFieldErrors(res.erroresValidacion);
        }
      }
    } catch {
      setShowConfirmModal(false);
      setServerError('Ocurrió un error inesperado al intentar guardar la patrulla verificadora.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validationResult, usuarioActivo]);

  const handleReset = useCallback(() => {
    setFormData(initialPatrullaFormState);
    setTouched({});
    setServerError(null);
    setServerFieldErrors([]);
    setCreatedPatrulla(null);
    setShowConfirmModal(false);
  }, []);

  return {
    formData,
    touched,
    delegaciones,
    vehiculosDisponibles,
    personalElegible,
    cargandoCatalogos,
    errorCatalogos,
    serverError,
    serverFieldErrors,
    createdPatrulla,
    isSubmitting,
    showConfirmModal,
    isValid,
    clientErrors,
    handleCodigoChange,
    handleNombreChange,
    handleDelegacionChange,
    handleVehiculoChange,
    handleTogglePersonal,
    handleLiderChange,
    handleBlur,
    handleOpenConfirmModal,
    handleCloseConfirmModal,
    handleConfirmSave,
    handleReset,
  };
}
