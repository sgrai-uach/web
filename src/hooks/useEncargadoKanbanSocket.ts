'use client';

import { useEffect, useState, useRef } from 'react';
import { getSocket } from '@/lib/socket/client';
import { suscribirSalasSocket } from '@/lib/socket/roomManager';
import { esPayloadTrazabilidadValido } from '@/lib/socket/trazabilidadConfig';
import { setTrazabilidadEstado } from '@/lib/socket/trazabilidadStore';
import type {
  EstadoIncidente,
  PrioridadIncidente,
  ReporteEvaluacionTerreno,
} from '@/services/incidentesService';
import type { DictamenAtencionTerreno } from '@/types/misiones';
import {
  esJustificacionSinCambios,
  esReporteCierreCuadrilla,
  esReporteVerificacionCierre,
  formatearDictamenTerreno,
  formatearEstado,
  formatearEstadoTerreno,
  formatearPrioridad,
  fueTipologiaModificada,
  normalizarMaterialesConsumidos,
} from '@/lib/utils/estadoUtils';
import type { EstadoRecurso } from '@/types/recurso';

export interface IncidenteCreadoPayload {
  evento: 'incidente:creado';
  datos: {
    id: string;
    codigo: string;
    tipoAfectacion: string;
    direccion: string;
    latitud: number;
    longitud: number;
    estado: 'REPORTADO';
    prioridad: PrioridadIncidente;
    creadoEn: string;
  };
  emitidoEn: string;
}

export interface IncidenteActualizadoPayload {
  evento: 'incidente:actualizado';
  /** Indica que el payload fue sintetizado desde mision:actualizada para sincronizar el tablero sin emitir toast duplicado */
  esSintetico?: boolean;
  datos: {
    id: string;
    codigo: string;
    nuevoEstado: EstadoIncidente;
    prioridad: PrioridadIncidente;
    prioridadSugerida?: PrioridadIncidente | null;
    justificacionPrioridad?: string | null;
    requiereAsistenciaSocial?: boolean;
    verificado?: boolean;
    dictamen?: DictamenAtencionTerreno | null;
    motivoNoAbordable?: string | null;
    fechaCierre?: string | null;
    tipoIncidenteId?: string;
    tipoAnterior?: string;
    tipoAfectacion?: string;
    justificacion?: string;
    reporteTerreno?: ReporteEvaluacionTerreno | null;
    actualizadoEn: string;
  };
  emitidoEn: string;
}

export interface MisionRechazadaPayload {
  misionId: string;
  codigo: string;
  tipoMision: string;
  motivo: string;
  justificacionRechazo?: string;
  cuadrillaId?: string | null;
  cuadrillaNombre?: string | null;
  patrullaId?: string | null;
  patrullaNombre?: string | null;
  incidenteId?: string | null;
  incidenteCodigo?: string | null;
  rechazadoPorId?: string | null;
  rechazadoEn?: string;
}

export interface CuadrillaActualizadaPayload {
  id: string;
  nombre?: string;
  estado: string;
  delegacionId?: string | null;
}

export interface MisionHitoSocketPayload {
  id?: string;
  hito: string;
  descripcion?: string;
  registradoPorId?: string | null;
  creadoEn?: string;
}

export interface MisionActualizadaPayload {
  id?: string;
  misionId: string;
  codigo: string;
  tipoMision?: string;
  estado: string;
  prioridad?: PrioridadIncidente | string;
  fechaInicio?: string | null;
  fechaCierre?: string | null;
  hito?: MisionHitoSocketPayload | string | null;
  incidenteId?: string | null;
  incidenteCodigo?: string | null;
  cuadrillaId?: string | null;
  cuadrillaNombre?: string | null;
  patrullaId?: string | null;
  patrullaNombre?: string | null;
  actualizadoEn?: string;
  reporteTerreno?: ReporteEvaluacionTerreno | null;
}

export interface RecursoActualizadoPayload {
  id: string;
  nombre?: string;
  estado: EstadoRecurso | string;
  cantidadInventario?: number;
  cantidadEnUso?: number;
  cantidadDisponible?: number;
  cantidadMinima?: number;
  esIndividual?: boolean;
  delegacionId?: string | null;
}

export interface NotificacionTrazabilidadPayload {
  notificacionId: string;
  misionId: string;
  patrullaId: string;
  estado: 'PENDIENTE_ENVIO' | 'ENVIADA' | 'RECIBIDA' | 'LEIDA';
  intentosEnvio?: number;
  creadaAt?: string;
  enviadaAt?: string | null;
  recibidaAt?: string | null;
  leidaAt?: string | null;
  actualizadoEn?: string;
}

export interface UseEncargadoKanbanSocketOptions {
  onIncidenteCreado?: (payload: IncidenteCreadoPayload) => void;
  onIncidenteActualizado?: (payload: IncidenteActualizadoPayload) => void;
  onMisionRechazada?: (payload: MisionRechazadaPayload) => void;
  onMisionActualizada?: (payload: MisionActualizadaPayload) => void;
  onCuadrillaActualizada?: (payload: CuadrillaActualizadaPayload) => void;
  onRecursoActualizado?: (payload: RecursoActualizadoPayload) => void;
  onNotificacionTrazabilidadActualizada?: (payload: NotificacionTrazabilidadPayload) => void;
  enabled?: boolean;
}

/**
 * Hook para la conexión en tiempo real del Encargado de Centro de Mando.
 * Se une a la sala 'sala:encargados' y escucha la creación y actualización de incidentes,
 * rechazos, cierres y trazabilidad de misiones, disponibilidad de cuadrillas e inventario.
 */
export function useEncargadoKanbanSocket({
  onIncidenteCreado,
  onIncidenteActualizado,
  onMisionRechazada,
  onMisionActualizada,
  onCuadrillaActualizada,
  onRecursoActualizado,
  onNotificacionTrazabilidadActualizada,
  enabled = true,
}: UseEncargadoKanbanSocketOptions = {}) {
  const [conectado, setConectado] = useState(false);
  const [ultimoEvento, setUltimoEvento] = useState<string | null>(null);

  const creadoRef = useRef(onIncidenteCreado);
  const actualizadoRef = useRef(onIncidenteActualizado);
  const rechazadaRef = useRef(onMisionRechazada);
  const misionActualizadaRef = useRef(onMisionActualizada);
  const cuadrillaActualizadaRef = useRef(onCuadrillaActualizada);
  const recursoActualizadoRef = useRef(onRecursoActualizado);
  const trazabilidadRef = useRef(onNotificacionTrazabilidadActualizada);
  const eventosProcesadosRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    creadoRef.current = onIncidenteCreado;
  }, [onIncidenteCreado]);

  useEffect(() => {
    actualizadoRef.current = onIncidenteActualizado;
  }, [onIncidenteActualizado]);

  useEffect(() => {
    rechazadaRef.current = onMisionRechazada;
  }, [onMisionRechazada]);

  useEffect(() => {
    misionActualizadaRef.current = onMisionActualizada;
  }, [onMisionActualizada]);

  useEffect(() => {
    cuadrillaActualizadaRef.current = onCuadrillaActualizada;
  }, [onCuadrillaActualizada]);

  useEffect(() => {
    recursoActualizadoRef.current = onRecursoActualizado;
  }, [onRecursoActualizado]);

  useEffect(() => {
    trazabilidadRef.current = onNotificacionTrazabilidadActualizada;
  }, [onNotificacionTrazabilidadActualizada]);

  useEffect(() => {
    if (!enabled) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const desuscribirSalas = suscribirSalasSocket(socket, [
      { sala: 'encargado', eventosJoin: ['join'], eventosLeave: ['leave'] },
      { sala: 'sala:encargados', eventosJoin: ['unirse'], eventosLeave: ['salir'] },
      { sala: 'mapa', eventosJoin: ['join', 'unirse'], eventosLeave: ['leave', 'salir'] },
    ]);

    const onConnect = () => {
      setConectado(true);
    };

    const onDisconnect = () => {
      setConectado(false);
    };

    if (socket.connected) {
      queueMicrotask(() => {
        setConectado(true);
      });
    }

    const esEventoDuplicado = (clave: string, ventanaMs = 4000): boolean => {
      const ahora = Date.now();
      const ultimoProc = eventosProcesadosRef.current.get(clave);
      if (ultimoProc && ahora - ultimoProc < ventanaMs) {
        return true;
      }
      eventosProcesadosRef.current.set(clave, ahora);
      return false;
    };

    const handleCreado = (payload: IncidenteCreadoPayload) => {
      const incId = payload?.datos?.id || payload?.datos?.codigo;
      if (incId && esEventoDuplicado(`inc-creado:${incId}`)) {
        return;
      }
      setUltimoEvento(`Nuevo incidente: ${payload?.datos?.codigo || ''}`);
      if (creadoRef.current) {
        creadoRef.current(payload);
      }
    };

    const handleActualizado = (payload: unknown) => {
      const p = payload as Record<string, unknown> | null | undefined;
      const rawDatos = (p?.datos || p?.data || p) as Record<string, unknown> | null | undefined;
      const id =
        typeof rawDatos?.id === 'string'
          ? rawDatos.id
          : typeof rawDatos?.incidenteId === 'string'
            ? rawDatos.incidenteId
            : undefined;
      const nuevoEstado =
        typeof rawDatos?.nuevoEstado === 'string'
          ? rawDatos.nuevoEstado
          : typeof rawDatos?.estado === 'string'
            ? rawDatos.estado
            : undefined;
      if (!id) return;

      const rawReporteObj =
        rawDatos?.reporteTerreno && typeof rawDatos.reporteTerreno === 'object'
          ? (rawDatos.reporteTerreno as Record<string, unknown>)
          : undefined;

      const rawReporte: ReporteEvaluacionTerreno | undefined = rawReporteObj
        ? ({
            ...(rawReporteObj as unknown as ReporteEvaluacionTerreno),
            resumenTecnico:
              typeof rawReporteObj.resumenTecnico === 'string'
                ? rawReporteObj.resumenTecnico
                : typeof rawReporteObj.resumenFaenas === 'string'
                  ? rawReporteObj.resumenFaenas
                  : typeof rawReporteObj.resumen_faenas === 'string'
                    ? rawReporteObj.resumen_faenas
                    : '',
            resumenFaenas:
              typeof rawReporteObj.resumenFaenas === 'string'
                ? rawReporteObj.resumenFaenas
                : typeof rawReporteObj.resumen_faenas === 'string'
                  ? rawReporteObj.resumen_faenas
                  : undefined,
            horasHombre:
              typeof rawReporteObj.horasHombre === 'number'
                ? rawReporteObj.horasHombre
                : typeof rawReporteObj.horas_hombre === 'number'
                  ? rawReporteObj.horas_hombre
                  : undefined,
            materialesConsumidos: normalizarMaterialesConsumidos(
              rawReporteObj.materialesConsumidos ?? rawReporteObj.materiales_consumidos
            ),
            etiquetaReporte:
              typeof rawReporteObj.etiquetaReporte === 'string'
                ? rawReporteObj.etiquetaReporte
                : (rawReporteObj as unknown as ReporteEvaluacionTerreno).etiquetaReporte,
          })
        : undefined;

      const dictamenRaw =
        typeof rawDatos?.dictamen === 'string'
          ? rawDatos.dictamen
          : typeof rawDatos?.dictamenTerreno === 'string'
            ? rawDatos.dictamenTerreno
            : typeof rawReporte?.dictamen === 'string'
              ? rawReporte.dictamen
              : undefined;
      const dictamen =
        dictamenRaw === 'REQUIERE_CUADRILLA' || dictamenRaw === 'NO_ABORDABLE'
          ? (dictamenRaw as DictamenAtencionTerreno)
          : undefined;

      const motivoNoAbordable =
        typeof rawDatos?.motivoNoAbordable === 'string'
          ? rawDatos.motivoNoAbordable
          : typeof rawDatos?.motivo_no_abordable === 'string'
            ? rawDatos.motivo_no_abordable
            : typeof rawReporte?.motivoNoAbordable === 'string'
              ? rawReporte.motivoNoAbordable
              : undefined;

      const fechaCierre =
        typeof rawDatos?.fechaCierre === 'string'
          ? rawDatos.fechaCierre
          : typeof rawDatos?.fecha_cierre === 'string'
            ? rawDatos.fecha_cierre
            : undefined;

      const reporteKey = rawReporte?.id || rawReporte?.versionReporte || '';
      const tipoReporteKey = rawReporte?.tipoReporte || '';
      const tipoKey = typeof rawDatos?.tipoAfectacion === 'string' ? rawDatos.tipoAfectacion : '';
      const dictamenKey = dictamen || '';
      const estadoFallback =
        rawReporte && esReporteCierreCuadrilla(rawReporte) ? 'EN_ATENCION' : 'VERIFICANDO';
      if (
        esEventoDuplicado(
          `inc-act:${id}:${nuevoEstado || estadoFallback}:${tipoReporteKey}:${reporteKey}:${tipoKey}:${dictamenKey}`
        )
      ) {
        return;
      }

      const justificacionPrioridad =
        typeof rawDatos?.justificacionPrioridad === 'string'
          ? rawDatos.justificacionPrioridad
          : typeof rawDatos?.justificacion_prioridad === 'string'
            ? rawDatos.justificacion_prioridad
            : rawReporte?.justificacionPrioridad ?? undefined;

      const prioridadSugerida =
        typeof rawDatos?.prioridadSugerida === 'string'
          ? (rawDatos.prioridadSugerida as PrioridadIncidente)
          : typeof rawDatos?.prioridad_sugerida === 'string'
            ? (rawDatos.prioridad_sugerida as PrioridadIncidente)
            : (rawReporte?.prioridadSugerida as PrioridadIncidente | undefined) ?? undefined;

      const requiereAsistenciaSocial =
        typeof rawDatos?.requiereAsistenciaSocial === 'boolean'
          ? rawDatos.requiereAsistenciaSocial
          : typeof rawDatos?.requiere_asistencia_social === 'boolean'
            ? rawDatos.requiere_asistencia_social
            : typeof rawReporte?.requiereAsistenciaSocial === 'boolean'
              ? rawReporte.requiereAsistenciaSocial
              : undefined;

      const normalizedPayload: IncidenteActualizadoPayload = {
        evento: 'incidente:actualizado',
        datos: {
          id,
          codigo: typeof rawDatos?.codigo === 'string' ? rawDatos.codigo : '',
          nuevoEstado: (nuevoEstado as EstadoIncidente) || estadoFallback,
          prioridad:
            typeof rawDatos?.prioridad === 'string'
              ? (rawDatos.prioridad as PrioridadIncidente)
              : ('MEDIA' as PrioridadIncidente),
          prioridadSugerida,
          justificacionPrioridad,
          requiereAsistenciaSocial,
          verificado:
            typeof rawDatos?.verificado === 'boolean' ? rawDatos.verificado : undefined,
          dictamen,
          motivoNoAbordable,
          fechaCierre,
          tipoIncidenteId:
            typeof rawDatos?.tipoIncidenteId === 'string'
              ? rawDatos.tipoIncidenteId
              : undefined,
          tipoAnterior:
            typeof rawDatos?.tipoAnterior === 'string'
              ? rawDatos.tipoAnterior
              : typeof rawDatos?.tipo_anterior === 'string'
                ? rawDatos.tipo_anterior
                : undefined,
          tipoAfectacion:
            typeof rawDatos?.tipoAfectacion === 'string'
              ? rawDatos.tipoAfectacion
              : undefined,
          justificacion:
            typeof rawDatos?.justificacion === 'string'
              ? rawDatos.justificacion
              : justificacionPrioridad,
          reporteTerreno: rawReporte,
          actualizadoEn:
            typeof rawDatos?.actualizadoEn === 'string'
              ? rawDatos.actualizadoEn
              : new Date().toISOString(),
        },
        emitidoEn:
          typeof p?.emitidoEn === 'string' ? p.emitidoEn : new Date().toISOString(),
      };

      const prioridadLegible = formatearPrioridad(normalizedPayload.datos.prioridad);
      if (
        normalizedPayload.datos.nuevoEstado === 'NO_ABORDABLE' ||
        normalizedPayload.datos.dictamen === 'NO_ABORDABLE'
      ) {
        const motivoTexto = normalizedPayload.datos.motivoNoAbordable
          ? `: ${normalizedPayload.datos.motivoNoAbordable}`
          : '';
        setUltimoEvento(
          `Incidente ${normalizedPayload.datos.codigo || ''} declarado No Abordable en terreno${motivoTexto}`
        );
      } else if (
        normalizedPayload.datos.reporteTerreno &&
        esReporteCierreCuadrilla(normalizedPayload.datos.reporteTerreno)
      ) {
        const terrenoTexto = formatearEstadoTerreno(
          normalizedPayload.datos.reporteTerreno.estadoTerreno
        );
        setUltimoEvento(
          `Informe final de cuadrilla recibido en ${normalizedPayload.datos.codigo || 'incidente'}: Terreno ${terrenoTexto}`
        );
      } else if (
        normalizedPayload.datos.dictamen === 'REQUIERE_CUADRILLA' ||
        (normalizedPayload.datos.reporteTerreno &&
          esReporteVerificacionCierre(normalizedPayload.datos.reporteTerreno))
      ) {
        const dictamenTexto = normalizedPayload.datos.dictamen
          ? formatearDictamenTerreno(normalizedPayload.datos.dictamen)
          : 'Requiere Cuadrilla';
        setUltimoEvento(
          `Verificación finalizada en ${normalizedPayload.datos.codigo || 'incidente'}: ${dictamenTexto} (Prioridad: ${prioridadLegible})`
        );
      } else if (normalizedPayload.datos.reporteTerreno) {
        const numVer = Number(normalizedPayload.datos.reporteTerreno.versionReporte || 1);
        const esRect = Boolean(
          normalizedPayload.datos.reporteTerreno.esRectificacion || numVer > 1
        );
        const etiquetaVer = esRect
          ? `Reporte #${numVer} (Rectificación)`
          : 'Reporte #1 (Evaluación Inicial)';
        setUltimoEvento(
          `${etiquetaVer} recibido en ${normalizedPayload.datos.codigo || 'incidente'} → Prioridad: ${prioridadLegible}`
        );
      } else if (normalizedPayload.datos.tipoAfectacion && normalizedPayload.datos.justificacion) {
        const sinCambiosTipologia = normalizedPayload.datos.tipoAnterior
          ? !fueTipologiaModificada(
              normalizedPayload.datos.tipoAnterior,
              normalizedPayload.datos.tipoAfectacion
            )
          : esJustificacionSinCambios(normalizedPayload.datos.justificacion);

        setUltimoEvento(
          sinCambiosTipologia
            ? `Tipología confirmada sin cambios: ${normalizedPayload.datos.codigo || ''} (${normalizedPayload.datos.tipoAfectacion}, Prioridad: ${prioridadLegible})`
            : `Tipología reclasificada: ${normalizedPayload.datos.codigo || ''} a ${normalizedPayload.datos.tipoAfectacion} (Prioridad: ${prioridadLegible})`
        );
      } else {
        const estadoLegible = formatearEstado(normalizedPayload.datos.nuevoEstado);
        setUltimoEvento(
          `Actualizado: ${normalizedPayload.datos.codigo || ''} → ${estadoLegible} (Prioridad: ${prioridadLegible})`
        );
      }
      if (actualizadoRef.current) {
        actualizadoRef.current(normalizedPayload);
      }
    };

    const handleMisionEvent = (payload: unknown) => {
      const p = payload as Record<string, unknown> | null | undefined;
      const raw = (p?.datos || p?.data || p) as Record<string, unknown> | null | undefined;
      const misionId =
        typeof raw?.misionId === 'string'
          ? raw.misionId
          : typeof raw?.id === 'string'
            ? raw.id
            : '';
      const incidenteId =
        typeof raw?.incidenteId === 'string'
          ? raw.incidenteId
          : typeof raw?.incidente_id === 'string'
            ? raw.incidente_id
            : undefined;
      const estadoMision = typeof raw?.estado === 'string' ? raw.estado : undefined;
      const estadoMisionNorm = estadoMision ? estadoMision.toUpperCase() : '';
      const tipoMision =
        typeof raw?.tipoMision === 'string'
          ? raw.tipoMision
          : typeof raw?.tipo_mision === 'string'
            ? raw.tipo_mision
            : undefined;
      const codigoMision = typeof raw?.codigo === 'string' ? raw.codigo : '';
      const incidenteCodigo =
        typeof raw?.incidenteCodigo === 'string'
          ? raw.incidenteCodigo
          : typeof raw?.incidente_codigo === 'string'
            ? raw.incidente_codigo
            : '';
      const cuadrillaId =
        typeof raw?.cuadrillaId === 'string'
          ? raw.cuadrillaId
          : typeof raw?.cuadrilla_id === 'string'
            ? raw.cuadrilla_id
            : null;
      const cuadrillaNombre =
        typeof raw?.cuadrillaNombre === 'string'
          ? raw.cuadrillaNombre
          : typeof raw?.cuadrilla_nombre === 'string'
            ? raw.cuadrilla_nombre
            : null;
      const patrullaId =
        typeof raw?.patrullaId === 'string'
          ? raw.patrullaId
          : typeof raw?.patrulla_id === 'string'
            ? raw.patrulla_id
            : null;
      const patrullaNombre =
        typeof raw?.patrullaNombre === 'string'
          ? raw.patrullaNombre
          : typeof raw?.patrulla_nombre === 'string'
            ? raw.patrulla_nombre
            : null;
      const fechaInicio =
        typeof raw?.fechaInicio === 'string'
          ? raw.fechaInicio
          : typeof raw?.fecha_inicio === 'string'
            ? raw.fecha_inicio
            : null;
      const actualizadoEn =
        typeof raw?.actualizadoEn === 'string'
          ? raw.actualizadoEn
          : fechaInicio || new Date().toISOString();

      let hitoNormalizado: MisionHitoSocketPayload | string | null = null;
      if (typeof raw?.hito === 'string') {
        hitoNormalizado = raw.hito;
      } else if (raw?.hito && typeof raw.hito === 'object') {
        const rawHito = raw.hito as Record<string, unknown>;
        if (typeof rawHito.hito === 'string') {
          hitoNormalizado = {
            id: typeof rawHito.id === 'string' ? rawHito.id : undefined,
            hito: rawHito.hito,
            descripcion:
              typeof rawHito.descripcion === 'string' ? rawHito.descripcion : undefined,
            registradoPorId:
              typeof rawHito.registradoPorId === 'string' ? rawHito.registradoPorId : null,
            creadoEn: typeof rawHito.creadoEn === 'string' ? rawHito.creadoEn : undefined,
          };
        }
      }

      // Regla de Negocio (H69 / HU-40):
      // - Patrulla VERIFICACION acepta misión (EN_CURSO) -> incidente pasa a VERIFICANDO.
      // - Cuadrilla ATENCION_CUADRILLA acepta asignación (EN_CURSO) -> incidente pasa a EN_ATENCION.
      const claveEnCurso = misionId || codigoMision || incidenteId;
      if (
        claveEnCurso &&
        estadoMisionNorm === 'EN_CURSO' &&
        (!tipoMision || tipoMision === 'VERIFICACION' || tipoMision === 'ATENCION_CUADRILLA')
      ) {
        const esCuadrilla = tipoMision === 'ATENCION_CUADRILLA';
        if (esEventoDuplicado(`mision-ev:${incidenteId || claveEnCurso}:${estadoMisionNorm}:${misionId || codigoMision}`)) {
          return;
        }

        const estadoIncidenteObjetivo: EstadoIncidente = esCuadrilla
          ? 'EN_ATENCION'
          : 'VERIFICANDO';

        if (incidenteId && actualizadoRef.current) {
          const syntheticIncPayload: IncidenteActualizadoPayload = {
            evento: 'incidente:actualizado',
            esSintetico: true,
            datos: {
              id: incidenteId,
              codigo: incidenteCodigo,
              nuevoEstado: estadoIncidenteObjetivo,
              prioridad: (raw?.prioridad as PrioridadIncidente) || 'MEDIA',
              actualizadoEn,
            },
            emitidoEn: new Date().toISOString(),
          };
          actualizadoRef.current(syntheticIncPayload);
        }

        setUltimoEvento(
          esCuadrilla
            ? `Asignación ${codigoMision || misionId} aceptada por cuadrilla: Incidente en atención`
            : `Misión ${codigoMision || misionId} aceptada: Incidente en verificación`
        );

        if (misionActualizadaRef.current) {
          misionActualizadaRef.current({
            id: misionId || codigoMision,
            misionId: misionId || codigoMision,
            codigo: codigoMision,
            tipoMision,
            estado: estadoMisionNorm,
            prioridad:
              typeof raw?.prioridad === 'string'
                ? (raw.prioridad as PrioridadIncidente)
                : undefined,
            fechaInicio,
            hito: hitoNormalizado,
            incidenteId: incidenteId ?? null,
            incidenteCodigo: incidenteCodigo || null,
            cuadrillaId,
            cuadrillaNombre,
            patrullaId,
            patrullaNombre,
            actualizadoEn,
          });
        }
        return;
      }

      // H68: Emitir callback dedicado para mision:actualizada COMPLETADA sin sintetizar incidente:actualizado
      if (estadoMisionNorm === 'COMPLETADA') {
        const claveComp = misionId || codigoMision || incidenteId;
        if (claveComp && esEventoDuplicado(`mision-comp:${claveComp}:${estadoMisionNorm}`)) {
          return;
        }
        const repRaw =
          raw?.reporteTerreno && typeof raw.reporteTerreno === 'object'
            ? (raw.reporteTerreno as ReporteEvaluacionTerreno)
            : null;
        const misionPayload: MisionActualizadaPayload = {
          id: misionId || codigoMision,
          misionId: misionId || codigoMision,
          codigo: codigoMision,
          tipoMision,
          estado: estadoMisionNorm,
          fechaCierre:
            typeof raw?.fechaCierre === 'string'
              ? raw.fechaCierre
              : typeof raw?.fecha_cierre === 'string'
                ? raw.fecha_cierre
                : null,
          hito: hitoNormalizado,
          incidenteId: incidenteId ?? null,
          incidenteCodigo: incidenteCodigo || null,
          cuadrillaId,
          cuadrillaNombre,
          patrullaId,
          patrullaNombre,
          reporteTerreno: repRaw,
        };
        if (codigoMision) {
          setUltimoEvento(`Misión ${codigoMision} completada`);
        }
        if (misionActualizadaRef.current) {
          misionActualizadaRef.current(misionPayload);
        }
      }
    };

    const handleRechazada = (payload: unknown) => {
      const p = payload as Record<string, unknown> | null | undefined;
      const raw = (p?.datos || p?.data || p) as Record<string, unknown> | null | undefined;

      const misionId = typeof raw?.misionId === 'string' ? raw.misionId : (raw?.id as string) || '';
      const codigo = typeof raw?.codigo === 'string' ? raw.codigo : '';
      const tipoMision = typeof raw?.tipoMision === 'string' ? raw.tipoMision : 'VERIFICACION';
      const motivo =
        typeof raw?.motivo === 'string'
          ? raw.motivo
          : typeof raw?.justificacionRechazo === 'string'
            ? raw.justificacionRechazo
            : 'Sin justificación';
      const patrullaId = typeof raw?.patrullaId === 'string' ? raw.patrullaId : null;
      const patrullaNombre = typeof raw?.patrullaNombre === 'string' ? raw.patrullaNombre : null;
      const incidenteId = typeof raw?.incidenteId === 'string' ? raw.incidenteId : null;
      const incidenteCodigo = typeof raw?.incidenteCodigo === 'string' ? raw.incidenteCodigo : null;
      const rechazadoPorId = typeof raw?.rechazadoPorId === 'string' ? raw.rechazadoPorId : null;
      const rechazadoEn =
        typeof raw?.rechazadoEn === 'string' ? raw.rechazadoEn : new Date().toISOString();

      if (!misionId && !codigo) return;

      if (esEventoDuplicado(`${misionId || codigo}-RECHAZADA`, 3000)) {
        return;
      }

      const normalizedPayload: MisionRechazadaPayload = {
        misionId,
        codigo,
        tipoMision,
        motivo,
        justificacionRechazo: motivo,
        cuadrillaId: typeof raw?.cuadrillaId === 'string' ? raw.cuadrillaId : null,
        cuadrillaNombre: typeof raw?.cuadrillaNombre === 'string' ? raw.cuadrillaNombre : null,
        patrullaId,
        patrullaNombre,
        incidenteId,
        incidenteCodigo,
        rechazadoPorId,
        rechazadoEn,
      };

      setUltimoEvento(`Misión rechazada: ${codigo}`);

      if (rechazadaRef.current) {
        rechazadaRef.current(normalizedPayload);
      }
    };

    const handleCuadrillaActualizada = (payload: unknown) => {
      const p = payload as Record<string, unknown> | null | undefined;
      const raw = (p?.datos || p?.data || p) as Record<string, unknown> | null | undefined;
      const id =
        typeof raw?.id === 'string'
          ? raw.id
          : typeof raw?.cuadrillaId === 'string'
            ? raw.cuadrillaId
            : typeof raw?.cuadrilla_id === 'string'
              ? raw.cuadrilla_id
              : '';
      const estado = typeof raw?.estado === 'string' ? raw.estado : '';
      if (!id || !estado) return;

      const estadoUpper = estado.toUpperCase();
      if (esEventoDuplicado(`cuadrilla-act:${id}:${estadoUpper}`)) {
        return;
      }

      const normalizedPayload: CuadrillaActualizadaPayload = {
        id,
        nombre: typeof raw?.nombre === 'string' ? raw.nombre : undefined,
        estado,
        delegacionId:
          typeof raw?.delegacionId === 'string'
            ? raw.delegacionId
            : typeof raw?.delegacion_id === 'string'
              ? raw.delegacion_id
              : null,
      };

      if (estadoUpper === 'DISPONIBLE') {
        setUltimoEvento(
          `Cuadrilla ${normalizedPayload.nombre || id} volvió a estado Disponible`
        );
      } else if (estadoUpper === 'EN_MISION') {
        setUltimoEvento(
          `Cuadrilla ${normalizedPayload.nombre || id} en misión activa`
        );
      }

      if (cuadrillaActualizadaRef.current) {
        cuadrillaActualizadaRef.current(normalizedPayload);
      }
    };

    const handleRecursoActualizado = (payload: unknown) => {
      const p = payload as Record<string, unknown> | null | undefined;
      const raw = (p?.datos || p?.data || p) as Record<string, unknown> | null | undefined;
      const id =
        typeof raw?.id === 'string'
          ? raw.id
          : typeof raw?.recursoId === 'string'
            ? raw.recursoId
            : typeof raw?.recurso_id === 'string'
              ? raw.recurso_id
              : '';
      const estado = typeof raw?.estado === 'string' ? raw.estado : '';
      if (!id || !estado) return;

      const cantInvRaw = raw?.cantidadInventario ?? raw?.cantidad_inventario;
      const cantUsoRaw = raw?.cantidadEnUso ?? raw?.cantidad_en_uso;
      const cantDispRaw = raw?.cantidadDisponible ?? raw?.cantidad_disponible;
      const cantMinRaw = raw?.cantidadMinima ?? raw?.cantidad_minima;

      const cantidadInventario =
        typeof cantInvRaw === 'number' ? cantInvRaw : undefined;
      const cantidadEnUso = typeof cantUsoRaw === 'number' ? cantUsoRaw : undefined;
      const cantidadDisponible =
        typeof cantDispRaw === 'number'
          ? cantDispRaw
          : cantidadInventario !== undefined && cantidadEnUso !== undefined
            ? Math.max(0, cantidadInventario - cantidadEnUso)
            : undefined;
      const cantidadMinima = typeof cantMinRaw === 'number' ? cantMinRaw : undefined;

      if (
        esEventoDuplicado(
          `rec-act:${id}:${estado}:${cantidadInventario ?? ''}:${cantidadEnUso ?? ''}`
        )
      ) {
        return;
      }

      const normalizedPayload: RecursoActualizadoPayload = {
        id,
        nombre: typeof raw?.nombre === 'string' ? raw.nombre : undefined,
        estado,
        cantidadInventario,
        cantidadEnUso,
        cantidadDisponible,
        cantidadMinima,
        esIndividual:
          typeof raw?.esIndividual === 'boolean'
            ? raw.esIndividual
            : typeof raw?.es_individual === 'boolean'
              ? raw.es_individual
              : undefined,
        delegacionId:
          typeof raw?.delegacionId === 'string'
            ? raw.delegacionId
            : typeof raw?.delegacion_id === 'string'
              ? raw.delegacion_id
              : null,
      };

      if (recursoActualizadoRef.current) {
        recursoActualizadoRef.current(normalizedPayload);
      }
    };

    const handleTrazabilidad = (payload: unknown) => {
      if (!esPayloadTrazabilidadValido(payload)) return;

      const typedPayload = payload as NotificacionTrazabilidadPayload;
      setTrazabilidadEstado(typedPayload.misionId, typedPayload.estado);
      setUltimoEvento(`Trazabilidad misión: ${typedPayload.estado}`);
      if (trazabilidadRef.current) {
        trazabilidadRef.current(typedPayload);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('incidente:creado', handleCreado);
    socket.on('incidente:actualizado', handleActualizado);
    socket.on('mision:creada', handleMisionEvent);
    socket.on('mision:actualizada', handleMisionEvent);
    socket.on('mision:rechazada', handleRechazada);
    socket.on('cuadrilla:actualizada', handleCuadrillaActualizada);
    socket.on('recurso:actualizado', handleRecursoActualizado);
    socket.on('notificacion:trazabilidad_actualizada', handleTrazabilidad);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('incidente:creado', handleCreado);
      socket.off('incidente:actualizado', handleActualizado);
      socket.off('mision:creada', handleMisionEvent);
      socket.off('mision:actualizada', handleMisionEvent);
      socket.off('mision:rechazada', handleRechazada);
      socket.off('cuadrilla:actualizada', handleCuadrillaActualizada);
      socket.off('recurso:actualizado', handleRecursoActualizado);
      socket.off('notificacion:trazabilidad_actualizada', handleTrazabilidad);
      desuscribirSalas();
    };
  }, [enabled]);

  return {
    conectado,
    ultimoEvento,
  };
}
