'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { cuadrillasService, CuadrillaServiceError } from '@/services/cuadrillasService';
import type {
  CuadrillaItem,
  DelegacionResumen,
  PersonalCandidatoDelegado,
  PersonalOperativoDisponible,
  RecursoInventarioDisponible,
  FormErrorCuadrilla,
  ItemRecursoCuadrillaInput,
  ItemTrabajadorCuadrillaInput,
} from '@/types/cuadrilla';

export interface RecursoSeleccionadoState {
  recursoId: string;
  nombre: string;
  cantidad: number;
  esIndividual: boolean;
  maxDisponible?: number;
}

export interface TrabajadorSeleccionadoState {
  personalId: string;
  usuarioId?: string;
  nombre: string;
  rut?: string | null;
  cargo?: string | null;
  especialidad?: string | null;
}

export interface UseCuadrillaEditFormProps {
  cuadrilla: CuadrillaItem | null;
  onGuardadoExitoso: (cuadrillaActualizada: CuadrillaItem) => void;
  onCerrar: () => void;
}

export function useCuadrillaEditForm({
  cuadrilla,
  onGuardadoExitoso,
  onCerrar,
}: UseCuadrillaEditFormProps) {
  // Campos del formulario
  const [nombre, setNombre] = useState<string>('');
  const [delegacionId, setDelegacionId] = useState<string>('');
  const [delegadoSeleccionado, setDelegadoSeleccionado] = useState<PersonalCandidatoDelegado | null>(null);
  const [recursosSeleccionados, setRecursosSeleccionados] = useState<RecursoSeleccionadoState[]>([]);
  const [trabajadoresSeleccionados, setTrabajadoresSeleccionados] = useState<TrabajadorSeleccionadoState[]>([]);

  // Catálogos auxiliares
  const [delegaciones, setDelegaciones] = useState<DelegacionResumen[]>([]);
  const [candidatosDelegados, setCandidatosDelegados] = useState<PersonalCandidatoDelegado[]>([]);
  const [personalDisponible, setPersonalDisponible] = useState<PersonalOperativoDisponible[]>([]);
  const [recursosDisponibles, setRecursosDisponibles] = useState<RecursoInventarioDisponible[]>([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState<boolean>(true);

  // Estados de envío y validación
  const [guardando, setGuardando] = useState<boolean>(false);
  const [errores, setErrores] = useState<FormErrorCuadrilla>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [bloqueadoPorConflicto, setBloqueadoPorConflicto] = useState<boolean>(false);

  // Carga inicial y precarga de los datos de la cuadrilla a editar
  useEffect(() => {
    let activo = true;

    async function cargarCatalogosYDatos() {
      if (!cuadrilla) return;
      try {
        setBloqueadoPorConflicto(false);
        setCargandoCatalogos(true);
        setErrorGeneral(null);

        const [delegs, delegados, personal, recursos] = await Promise.all([
          cuadrillasService.obtenerDelegaciones(),
          cuadrillasService.obtenerCandidatosDelegados(),
          cuadrillasService.obtenerPersonalOperativoDisponible(),
          cuadrillasService.obtenerRecursosDisponibles(),
        ]);

        if (!activo) return;

        setDelegaciones(delegs);
        setCandidatosDelegados(delegados);
        setPersonalDisponible(personal);
        setRecursosDisponibles(recursos);

        // Precargar datos de la cuadrilla
        setNombre(cuadrilla.nombre);
        setDelegacionId(cuadrilla.delegacion.id);

        if (cuadrilla.delegado) {
          setDelegadoSeleccionado({
            id: cuadrilla.delegado.id,
            nombreCompleto: cuadrilla.delegado.nombre,
            rut: cuadrilla.delegado.rut || '',
            email: cuadrilla.delegado.email,
            rolNombre: 'Delegado de Cuadrilla',
            rolCodigo: 'DELEGADO_CUADRILLA',
            delegacionNombre: cuadrilla.delegacion.nombre,
            estadoOperativo: 'disponible',
          });
        }

        // Precargar recursos asignados resolviendo stock real
        setRecursosSeleccionados(
          (cuadrilla.recursos || []).map((r) => {
            const stockDisponible = recursos.find((rec) => rec.id === r.recursoId)?.cantidadDisponible ?? 0;
            const maxReal = r.esIndividual
              ? 1
              : Math.max(r.cantidadAsignada, stockDisponible + r.cantidadAsignada);

            return {
              recursoId: r.recursoId,
              nombre: r.nombre,
              cantidad: r.cantidadAsignada,
              esIndividual: r.esIndividual,
              maxDisponible: maxReal,
            };
          })
        );

        // Precargar trabajadores asignados
        setTrabajadoresSeleccionados(
          (cuadrilla.trabajadores || []).map((t) => ({
            personalId: t.personalId,
            usuarioId: t.usuarioId,
            nombre: t.nombre,
            rut: t.rut,
            cargo: t.cargo,
            especialidad: t.especialidad,
          }))
        );
      } catch {
        if (activo) {
          setErrorGeneral('No fue posible cargar los catálogos de recursos y personal. Intente nuevamente.');
        }
      } finally {
        if (activo) {
          setCargandoCatalogos(false);
        }
      }
    }

    const timer = setTimeout(() => {
      cargarCatalogosYDatos();
    }, 0);

    return () => {
      activo = false;
      clearTimeout(timer);
    };
  }, [cuadrilla]);

  // Verificar si la cuadrilla está en misión activa (o si se detectó concurrencia 409)
  const estaEnMision = useMemo(() => {
    if (!cuadrilla) return false;
    const estado = (cuadrilla.estado || '').toUpperCase();
    return estado === 'EN_MISION' || estado === 'EN_TRANSITO' || estado === 'EN_OPERACION';
  }, [cuadrilla]);

  const estaEnMisionEfectivo = estaEnMision || bloqueadoPorConflicto;

  // Asignar Delegado con validación de Norma ICS (remover de operarios si ya estaba)
  const handleSetDelegadoSeleccionado = useCallback((delegado: PersonalCandidatoDelegado | null) => {
    setDelegadoSeleccionado(delegado);
    if (delegado) {
      setTrabajadoresSeleccionados((prev) => prev.filter((t) => t.usuarioId !== delegado.id));
    }
    setErrores((prev) => ({ ...prev, usuarioDelegadoId: undefined, trabajadores: undefined }));
  }, []);

  // Gestión de Trabajadores (con validación de Norma ICS)
  const agregarTrabajador = useCallback((trabajador: PersonalOperativoDisponible) => {
    if (delegadoSeleccionado && trabajador.usuarioId === delegadoSeleccionado.id) {
      setErrores((prev) => ({
        ...prev,
        trabajadores: 'Por principio de cadena de mando ICS, el funcionario designado como Delegado no puede asignarse como personal operativo subordinado.',
      }));
      return;
    }

    setTrabajadoresSeleccionados((prev) => {
      if (prev.some((t) => t.personalId === trabajador.id)) return prev;
      return [
        ...prev,
        {
          personalId: trabajador.id,
          usuarioId: trabajador.usuarioId,
          nombre: trabajador.nombre,
          rut: trabajador.rut,
          cargo: trabajador.cargo,
          especialidad: trabajador.especialidad,
        },
      ];
    });
    setErrores((prev) => ({ ...prev, trabajadores: undefined }));
  }, [delegadoSeleccionado]);

  const removerTrabajador = useCallback((personalId: string) => {
    setTrabajadoresSeleccionados((prev) => prev.filter((t) => t.personalId !== personalId));
  }, []);

  // Gestión de Recursos
  const agregarRecurso = useCallback((recurso: RecursoInventarioDisponible, cantidad: number = 1) => {
    setRecursosSeleccionados((prev) => {
      const existe = prev.find((r) => r.recursoId === recurso.id);
      if (existe) {
        if (recurso.esIndividual) return prev; // No sumar más de 1 en individuales
        const maxPermitido = existe.maxDisponible || recurso.cantidadDisponible;
        const nuevaCantidad = Math.min(existe.cantidad + cantidad, maxPermitido);
        return prev.map((r) =>
          r.recursoId === recurso.id ? { ...r, cantidad: Math.max(1, nuevaCantidad) } : r
        );
      }
      const maxPermitido = recurso.esIndividual ? 1 : Math.max(1, recurso.cantidadDisponible);
      return [
        ...prev,
        {
          recursoId: recurso.id,
          nombre: recurso.nombre,
          cantidad: recurso.esIndividual ? 1 : Math.min(cantidad, maxPermitido),
          esIndividual: recurso.esIndividual,
          maxDisponible: maxPermitido,
        },
      ];
    });
    setErrores((prev) => ({ ...prev, recursos: undefined }));
  }, []);

  const removerRecurso = useCallback((recursoId: string) => {
    setRecursosSeleccionados((prev) => prev.filter((r) => r.recursoId !== recursoId));
  }, []);

  const cambiarCantidadRecurso = useCallback((recursoId: string, cantidad: number) => {
    if (cantidad < 1) return;
    setRecursosSeleccionados((prev) =>
      prev.map((r) => {
        if (r.recursoId === recursoId) {
          if (r.esIndividual) return { ...r, cantidad: 1 };
          const cantidadAjustada = r.maxDisponible ? Math.min(cantidad, r.maxDisponible) : cantidad;
          return { ...r, cantidad: Math.max(1, cantidadAjustada) };
        }
        return r;
      })
    );
  }, []);

  // Validación y envío del formulario
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cuadrilla) return;

    // 1. Bloqueo frontal si la cuadrilla está en misión activa
    if (estaEnMisionEfectivo) {
      setErrorGeneral('No es posible modificar los datos ni la dotación de una cuadrilla que se encuentra actualmente en misión activa.');
      return;
    }

    const nuevosErrores: FormErrorCuadrilla = {};

    if (!nombre.trim() || nombre.trim().length < 3) {
      nuevosErrores.nombre = 'El nombre de la cuadrilla debe tener al menos 3 caracteres.';
    }

    if (!delegacionId) {
      nuevosErrores.delegacionId = 'Debe seleccionar una delegación municipal base.';
    }

    if (!delegadoSeleccionado) {
      nuevosErrores.usuarioDelegadoId = 'Debe designar un Delegado responsable de la cuadrilla.';
    }

    // Validar Norma ICS: Delegado no puede ser subordinado
    if (
      delegadoSeleccionado &&
      trabajadoresSeleccionados.some((t) => t.usuarioId === delegadoSeleccionado.id)
    ) {
      nuevosErrores.trabajadores =
        'Por principio de cadena de mando ICS, el delegado no puede formar parte de la dotación operativa subordinada.';
    }

    // Validar topes de stock de recursos
    const recursoExcedido = recursosSeleccionados.find(
      (r) => r.maxDisponible && r.cantidad > r.maxDisponible
    );
    if (recursoExcedido) {
      nuevosErrores.recursos = `La cantidad asignada para "${recursoExcedido.nombre}" (${recursoExcedido.cantidad}) excede el stock disponible (${recursoExcedido.maxDisponible}).`;
    }

    if (Object.keys(nuevosErrores).length > 0 || !delegadoSeleccionado) {
      setErrores(nuevosErrores);
      return;
    }

    try {
      setGuardando(true);
      setErrorGeneral(null);
      setErrores({});

      const payloadRecursos: ItemRecursoCuadrillaInput[] = recursosSeleccionados.map((r) => ({
        recursoId: r.recursoId,
        cantidad: r.esIndividual ? 1 : r.cantidad,
      }));

      const payloadTrabajadores: ItemTrabajadorCuadrillaInput[] = trabajadoresSeleccionados.map((t) => ({
        personalId: t.personalId,
      }));

      const cuadrillaActualizada = await cuadrillasService.actualizarCuadrilla(cuadrilla.id, {
        nombre: nombre.trim(),
        delegacionId,
        usuarioDelegadoId: delegadoSeleccionado.id,
        recursos: payloadRecursos,
        trabajadores: payloadTrabajadores,
      });

      onGuardadoExitoso(cuadrillaActualizada);
      onCerrar();
    } catch (err: unknown) {
      if (err instanceof CuadrillaServiceError) {
        if (err.codigo === 'CUADRILLA_EN_MISION') {
          setBloqueadoPorConflicto(true);
          setErrorGeneral('Esta cuadrilla fue asignada a una misión activa en terreno. No es posible modificar sus datos ni su dotación.');
          return;
        }
        if (err.campo === 'nombre') {
          setErrores({ nombre: err.message });
        } else if (err.campo === 'recursos') {
          setErrores({ recursos: err.message });
        } else if (err.campo === 'trabajadores') {
          setErrores({ trabajadores: err.message });
        } else {
          setErrorGeneral(err.message);
        }
      } else {
        setErrorGeneral(err instanceof Error ? err.message : 'Error inesperado al actualizar la cuadrilla.');
      }
    } finally {
      setGuardando(false);
    }
  };

  return {
    nombre,
    setNombre,
    delegacionId,
    setDelegacionId,
    delegadoSeleccionado,
    setDelegadoSeleccionado: handleSetDelegadoSeleccionado,
    recursosSeleccionados,
    trabajadoresSeleccionados,
    delegaciones,
    candidatosDelegados,
    personalDisponible,
    recursosDisponibles,
    cargandoCatalogos,
    guardando,
    errores,
    errorGeneral,
    estaEnMision: estaEnMisionEfectivo,
    agregarTrabajador,
    removerTrabajador,
    agregarRecurso,
    removerRecurso,
    cambiarCantidadRecurso,
    handleSubmit,
  };
}
