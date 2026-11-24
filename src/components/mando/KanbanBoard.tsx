'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  useIncidentesKanban,
} from '@/hooks/useIncidentesKanban';
import { useIncidentesKpis } from '@/hooks/useIncidentesKpis';
import { usePrevencionSocket } from '@/hooks/usePrevencionSocket';
import { useRecuperacionSocket } from '@/hooks/useRecuperacionSocket';
import { useToast } from '@/components/ui/Toast';
import type { EstadoIncidente, IncidenteResumen } from '@/services/incidentesService';
import type { EventoPrevencionDTO } from '@/types/evento-prevencion';
import type { EventoRecuperacionResponse } from '@/types/recuperacion';
import type {
  MisionRechazadaPayload,
  MisionActualizadaPayload,
  CuadrillaActualizadaPayload,
  RecursoActualizadoPayload,
  IncidenteActualizadoPayload,
  IncidenteCreadoPayload,
} from '@/hooks/useEncargadoKanbanSocket';
import type { MisionActualizadaPayload } from '@/types/misiones';
import {
  esJustificacionSinCambios,
  esReporteCierreCuadrilla,
  esReporteVerificacionCierre,
  formatearCantidadMaterial,
  formatearDictamenTerreno,
  formatearEstadoTerreno,
  formatearHorasHombre,
  formatearNombreCuadrilla,
  formatearNombrePatrulla,
  formatearPrioridad,
  formatearCompromisoVivienda,
  formatearEstado,
  fueTipologiaModificada,
  normalizarMaterialesConsumidos,
} from '@/lib/utils/estadoUtils';
import { KanbanHeader } from './KanbanHeader';
import { KanbanFiltros } from './KanbanFiltros';
import { KanbanColumn } from './KanbanColumn';
import { IncidentesKpiCards } from './IncidentesKpiCards';
import { IncidenteDetalleDrawer } from './IncidenteDetalleDrawer';
import { AccesoDenegado } from './AccesoDenegado';
import { MisionesModal } from './misiones/MisionesModal';
import { MisionDetalleModal } from './mision/MisionDetalleModal';
import { AsignarPatrullaModal } from './patrullas/AsignarPatrullaModal';
import { PanelPatrullasModal } from './patrullas/PanelPatrullasModal';
import { ModalCrearEventoPrevencion } from './ModalCrearEventoPrevencion';
import { ModalCrearEventoRecuperacion } from './ModalCrearEventoRecuperacion';
import { MapaOperativoMando } from './MapaOperativoMando';
import { KanbanViewSwitcher } from './KanbanViewSwitcher';
import CuadrillaDetalleDrawer from '@/components/admin/cuadrillas/CuadrillaDetalleDrawer';
import { cuadrillasService } from '@/services/cuadrillasService';
import type { CuadrillaItem } from '@/types/cuadrilla';
import { usePuedeAsignarMision } from '@/hooks/usePuedeAsignarMision';
import { usePuedeCrearEventoAtp } from '@/hooks/usePuedeCrearEventoAtp';
import { extraerEstadoInicialNotificacion } from '@/lib/socket/trazabilidadConfig';
import { setTrazabilidadEstado } from '@/lib/socket/trazabilidadStore';
import InlineNotice from '@/components/ui/InlineNotice';
import styles from '@/styles/mando.module.css';

const TITULOS_COLUMNAS = {
  REPORTADO: 'Reportado',
  VERIFICANDO: 'En Verificación',
  EN_ATENCION: 'En Atención',
  RESUELTO: 'Resuelto',
  NO_ABORDABLE: 'No Abordable',
} as const;

export const KanbanBoard: React.FC = () => {
  const { showInfo, showWarning, showSuccess } = useToast();
  const searchParams = useSearchParams();
  const incidenteIdParam = searchParams?.get('incidenteId') ?? null;
  const [vistaActiva, setVistaActiva] = useState<'kanban' | 'mapa'>('kanban');
  const [misionesModalAbierto, setMisionesModalAbierto] = useState(false);
  const [patrullasModalAbierto, setPatrullasModalAbierto] = useState(false);
  const [misionSeleccionadaId, setMisionSeleccionadaId] = useState<string | null>(null);
  const [incidenteSeleccionadoId, setIncidenteSeleccionadoId] = useState<string | null>(
    incidenteIdParam
  );
  const [prevIncidenteIdParam, setPrevIncidenteIdParam] = useState<string | null>(incidenteIdParam);
  if (incidenteIdParam !== prevIncidenteIdParam) {
    setPrevIncidenteIdParam(incidenteIdParam);
    if (incidenteIdParam) {
      setIncidenteSeleccionadoId(incidenteIdParam);
    }
  }
  const [kpiRefreshTick, setKpiRefreshTick] = useState(0);
  const [modalPrevencionAbierto, setModalPrevencionAbierto] = useState(false);
  const [modalRecuperacionAbierto, setModalRecuperacionAbierto] = useState(false);
  const [eventosPrevencion, setEventosPrevencion] = useState<EventoPrevencionDTO[]>([]);
  const [eventosRecuperacion, setEventosRecuperacion] = useState<EventoRecuperacionResponse[]>([]);
  const [cuadrillaSeleccionadaId, setCuadrillaSeleccionadaId] = useState<string | null>(null);
  const [cuadrillasOperativas, setCuadrillasOperativas] = useState<CuadrillaItem[]>([]);
  const [incidenteParaAsignar, setIncidenteParaAsignar] = useState<IncidenteResumen | null>(null);
  const puedeAsignar = usePuedeAsignarMision();
  const puedeCrearEventoAtp = usePuedeCrearEventoAtp();

  const cargarCuadrillas = useCallback(() => {
    let isMounted = true;
    cuadrillasService
      .obtenerCuadrillas({ pagina: 1, limite: 100 })
      .then((res) => {
        if (isMounted && res.cuadrillas) {
          setCuadrillasOperativas(res.cuadrillas);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return cargarCuadrillas();
  }, [cargarCuadrillas]);

  const ultimosToastsReporteRef = React.useRef<Map<string, number>>(new Map());

  const mostrarToastCierreCuadrilla = React.useCallback(
    (params: {
      incidenteId: string;
      codigo?: string | null;
      prioridad?: IncidenteResumen['prioridad'];
      reporte?: IncidenteActualizadoPayload['datos']['reporteTerreno'];
      misionId?: string;
    }) => {
      const { incidenteId, codigo, prioridad, reporte, misionId } = params;
      const repId = reporte?.id || misionId || '1';
      const ahora = Date.now();
      const claveDedup = `cierre-cuadrilla:${incidenteId}:${repId}`;
      const ultimaVez = ultimosToastsReporteRef.current.get(claveDedup);
      if (ultimaVez && ahora - ultimaVez < 4000) {
        return;
      }
      ultimosToastsReporteRef.current.set(claveDedup, ahora);

      const materiales = normalizarMaterialesConsumidos(reporte?.materialesConsumidos);
      const resumenMateriales =
        materiales.length > 0
          ? materiales
              .slice(0, 2)
              .map(
                (m) =>
                  `${m.nombre || 'Insumo'} (${formatearCantidadMaterial(m.cantidad, m.unidad)})`
              )
              .join(', ') +
            (materiales.length > 2 ? ` y ${materiales.length - 2} más` : '')
          : 'Sin consumo de insumos';

      const estadoTerrenoNorm = (reporte?.estadoTerreno || '').trim().toUpperCase();
      const requiereAlerta =
        estadoTerrenoNorm === 'CRITICO' ||
        estadoTerrenoNorm === 'INACCESIBLE' ||
        estadoTerrenoNorm === 'REQUIERE_SEGUIMIENTO' ||
        Boolean(reporte?.requiereApoyoAdicional) ||
        prioridad === 'CRITICA';

      const detallesCuadrilla: Array<{ label: string; value: string }> = [
        {
          label: 'Estado final del terreno',
          value: formatearEstadoTerreno(reporte?.estadoTerreno),
        },
      ];
      if (typeof reporte?.horasHombre === 'number') {
        detallesCuadrilla.push({
          label: 'Horas hombre',
          value: formatearHorasHombre(reporte.horasHombre),
        });
      }
      detallesCuadrilla.push({
        label: 'Materiales consumidos',
        value: resumenMateriales,
      });
      if (reporte?.requiereApoyoAdicional) {
        detallesCuadrilla.push({
          label: 'Apoyo adicional',
          value: 'Solicitado en terreno',
        });
      }

      const toastCuadrillaOptions = {
        icon: 'cuadrilla' as const,
        codeBadge: codigo || undefined,
        priorityBadge: prioridad,
        dedupKey: claveDedup,
        details: detallesCuadrilla,
        action: {
          label: 'Ver incidente',
          onClick: () => setIncidenteSeleccionadoId(incidenteId),
        },
      };

      const mensajeCuadrilla = `La cuadrilla completó la misión en ${codigo || 'el incidente'}. La unidad volvió a estado Disponible; el incidente permanece En Atención para evaluación final.`;

      if (requiereAlerta) {
        showWarning(
          mensajeCuadrilla,
          'Cierre de Cuadrilla — Atención Requerida',
          toastCuadrillaOptions
        );
      } else {
        showSuccess(
          mensajeCuadrilla,
          'Informe Final de Cuadrilla Recibido',
          toastCuadrillaOptions
        );
      }
    },
    [showWarning, showSuccess]
  );

  const handleReporteTerrenoRecibido = React.useCallback(
    (payload: IncidenteActualizadoPayload) => {
      const rep = payload.datos.reporteTerreno;
      if (!rep) return;

      const ahora = Date.now();
      const claveDedup = `${payload.datos.id}-${rep.id || rep.versionReporte || 1}`;
      const ultimaVez = ultimosToastsReporteRef.current.get(claveDedup);
      if (ultimaVez && ahora - ultimaVez < 4000) {
        return;
      }
      ultimosToastsReporteRef.current.set(claveDedup, ahora);

      const esCierreCuadrilla = esReporteCierreCuadrilla(rep);
      if (esCierreCuadrilla) {
        mostrarToastCierreCuadrilla({
          incidenteId: payload.datos.id,
          codigo: payload.datos.codigo,
          prioridad: payload.datos.prioridad,
          reporte: rep,
          misionId: rep.misionId,
        });

        setKpiRefreshTick((prev) => prev + 1);
        cargarCuadrillas();
        return;
      }

      const numVersion = Number(rep.versionReporte || 1);
      const esRect = Boolean(rep.esRectificacion || numVersion > 1);
      const esCierre =
        esReporteVerificacionCierre(rep) ||
        payload.datos.nuevoEstado === 'NO_ABORDABLE' ||
        Boolean(payload.datos.dictamen);
      const dictamenCierre =
        payload.datos.dictamen ??
        rep.dictamen ??
        (payload.datos.nuevoEstado === 'NO_ABORDABLE' ? 'NO_ABORDABLE' : 'REQUIERE_CUADRILLA');

      const prioridadTexto = formatearPrioridad(payload.datos.prioridad);
      const tituloToast = esCierre
        ? dictamenCierre === 'NO_ABORDABLE'
          ? 'Incidente Declarado No Abordable'
          : 'Informe de Verificación y Cierre'
        : esRect
          ? `Reporte #${numVersion} (Rectificación en Terreno)`
          : 'Reporte #1 (Evaluación en Terreno)';

      const detallesToast: Array<{ label: string; value: string }> = [];

      // Afectación registrada
      const evalData = (rep.evaluacion || {}) as Record<string, unknown>;
      const familiasRaw = Array.isArray(evalData.familias)
        ? (evalData.familias as Record<string, unknown>[])
        : undefined;
      const familiasCount =
        familiasRaw && familiasRaw.length > 0
          ? familiasRaw.length
          : typeof evalData.familiasAfectadas === 'number'
            ? evalData.familiasAfectadas
            : null;
      const personas = rep.personasAfectadas !== null && rep.personasAfectadas !== undefined
        ? Number(rep.personasAfectadas)
        : null;
      const viviendas = rep.evaluacion?.viviendasAfectadas !== null && rep.evaluacion?.viviendasAfectadas !== undefined
        ? Number(rep.evaluacion.viviendasAfectadas)
        : null;

      if (esCierre) {
        detallesToast.push({
          label: 'Dictamen',
          value: formatearDictamenTerreno(dictamenCierre),
        });
        const motivoNoAbordable =
          payload.datos.motivoNoAbordable || rep.motivoNoAbordable;
        if (dictamenCierre === 'NO_ABORDABLE' && motivoNoAbordable) {
          detallesToast.push({
            label: 'Motivo técnico',
            value: motivoNoAbordable,
          });
        }
        if (personas !== null) {
          detallesToast.push({
            label: 'Personas afectadas',
            value: `${personas} persona(s)`,
          });
        }
        const requiereFibeCierre = Boolean(
          payload.datos.requiereAsistenciaSocial ?? rep.requiereAsistenciaSocial
        );
        if (requiereFibeCierre) {
          detallesToast.push({
            label: 'Asistencia social',
            value: 'Requiere levantamiento de Ficha FIBE',
          });
        }
      } else {
        if (personas !== null || viviendas !== null || familiasCount !== null) {
          const partesAfectacion: string[] = [];
          if (familiasCount !== null) {
            partesAfectacion.push(`${familiasCount} ${familiasCount === 1 ? 'familia' : 'familias'}`);
          }
          if (personas !== null) {
            partesAfectacion.push(`${personas} persona(s)`);
          }
          if (viviendas !== null) {
            const compromisoTexto = rep.evaluacion?.nivelCompromisoVivienda
              ? ` (${formatearCompromisoVivienda(String(rep.evaluacion.nivelCompromisoVivienda))})`
              : '';
            partesAfectacion.push(`${viviendas} vivienda(s)${compromisoTexto}`);
          }
          detallesToast.push({
            label: 'Afectación',
            value: partesAfectacion.join(' | '),
          });
        }

        // Prioridad evaluada / sugerida
        if (
          payload.datos.prioridadSugerida &&
          payload.datos.prioridadSugerida !== payload.datos.prioridad
        ) {
          detallesToast.push({
            label: 'Ajuste de prioridad',
            value: `Asignada: ${prioridadTexto} (Sugerida por sistema: ${formatearPrioridad(payload.datos.prioridadSugerida)})`,
          });
        }

        // Acciones realizadas (sin duplicar el string generado de personas/viviendas)
        if (rep.accionesRealizadas && rep.accionesRealizadas.trim()) {
          detallesToast.push({
            label: 'Acciones realizadas',
            value: rep.accionesRealizadas.trim(),
          });
        } else if (payload.datos.justificacion && payload.datos.justificacion.trim()) {
          detallesToast.push({
            label: 'Observación en terreno',
            value: payload.datos.justificacion.trim(),
          });
        }
      }

      const mensajeBase = esCierre
        ? dictamenCierre === 'NO_ABORDABLE'
          ? `La patrulla cerró el incidente ${payload.datos.codigo || ''} declarándolo No Abordable.`
          : `La patrulla finalizó la verificación en ${payload.datos.codigo || ''}. Listo para despacho de cuadrilla.`
        : `Se registró una ${
            esRect ? 'rectificación' : 'evaluación inicial'
          } para el incidente ${payload.datos.codigo || ''}.`;

      const toastOptions = {
        icon: 'reporte' as const,
        codeBadge: payload.datos.codigo,
        priorityBadge: payload.datos.prioridad,
        dedupKey: `reporte-terreno:${payload.datos.id}:${rep.id || numVersion}`,
        details: detallesToast,
        action: {
          label: 'Ver incidente',
          onClick: () => setIncidenteSeleccionadoId(payload.datos.id),
        },
      };

      if (dictamenCierre === 'NO_ABORDABLE' || payload.datos.prioridad === 'CRITICA') {
        showWarning(mensajeBase, tituloToast, toastOptions);
      } else {
        showInfo(mensajeBase, tituloToast, toastOptions);
      }

      setKpiRefreshTick((prev) => prev + 1);
    },
    [mostrarToastCierreCuadrilla, showInfo, showWarning, cargarCuadrillas]
  );

  const ultimosToastsIncidenteRef = React.useRef<Map<string, number>>(new Map());
  const ultimasAceptacionesIncidenteRef = React.useRef<Map<string, number>>(new Map());

  const esToastIncidenteDuplicado = React.useCallback((clave: string, ventanaMs = 4000): boolean => {
    const ahora = Date.now();
    const ultimaVez = ultimosToastsIncidenteRef.current.get(clave);
    if (ultimaVez && ahora - ultimaVez < ventanaMs) {
      return true;
    }
    ultimosToastsIncidenteRef.current.set(clave, ahora);
    return false;
  }, []);

  const handleIncidenteCreadoSocket = React.useCallback(
    (payload: IncidenteCreadoPayload) => {
      const { datos } = payload;
      if (!datos) return;
      if (esToastIncidenteDuplicado(`creado:${datos.id}`)) return;

      showInfo(
        `Nuevo incidente ${datos.codigo} ingresado en ${datos.direccion || 'sector sin dirección'}.`,
        'Nuevo Incidente Reportado',
        {
          icon: 'incidente',
          codeBadge: datos.codigo,
          priorityBadge: datos.prioridad,
          dedupKey: `incidente-creado:${datos.id}`,
          details: [
            { label: 'Tipología', value: datos.tipoAfectacion || 'No clasificada' },
            ...(datos.direccion ? [{ label: 'Ubicación', value: datos.direccion }] : []),
          ],
          action: {
            label: 'Ver incidente',
            onClick: () => setIncidenteSeleccionadoId(datos.id),
          },
        }
      );

      setKpiRefreshTick((prev) => prev + 1);
    },
    [showInfo, esToastIncidenteDuplicado]
  );

  const handleIncidenteActualizadoSocket = React.useCallback(
    (payload: IncidenteActualizadoPayload) => {
      const { datos } = payload;
      if (!datos) return;

      if (payload.esSintetico) {
        setKpiRefreshTick((prev) => prev + 1);
        return;
      }

      const claveDedup = `act:${datos.id}:${datos.nuevoEstado}:${datos.tipoAfectacion || ''}:${datos.dictamen || ''}`;
      if (esToastIncidenteDuplicado(claveDedup)) return;

      const esNoAbordable =
        datos.nuevoEstado === 'NO_ABORDABLE' || datos.dictamen === 'NO_ABORDABLE';
      const esEventoTipologia = Boolean(datos.tipoAfectacion && datos.justificacion);

      if (!esNoAbordable && !esEventoTipologia) {
        const tsAceptacion = ultimasAceptacionesIncidenteRef.current.get(
          `${datos.id}:${datos.nuevoEstado}`
        );
        if (tsAceptacion && Date.now() - tsAceptacion < 6000) {
          return;
        }
      }

      if (esNoAbordable) {
        showWarning(
          `El incidente ${datos.codigo || ''} fue declarado No Abordable en terreno.`,
          'Incidente Declarado No Abordable',
          {
            icon: 'reporte',
            codeBadge: datos.codigo,
            priorityBadge: datos.prioridad,
            dedupKey: claveDedup,
            details: [
              { label: 'Dictamen', value: 'No Abordable' },
              ...(datos.motivoNoAbordable
                ? [{ label: 'Motivo técnico', value: datos.motivoNoAbordable }]
                : []),
            ],
            action: {
              label: 'Ver incidente',
              onClick: () => setIncidenteSeleccionadoId(datos.id),
            },
          }
        );
      } else if (esEventoTipologia) {
        const sinCambiosTipologia = datos.tipoAnterior
          ? !fueTipologiaModificada(datos.tipoAnterior, datos.tipoAfectacion)
          : esJustificacionSinCambios(datos.justificacion);

        showInfo(
          sinCambiosTipologia
            ? `La patrulla ratificó la tipología ${datos.tipoAfectacion} sin modificaciones.`
            : `Tipología reclasificada a ${datos.tipoAfectacion}.`,
          sinCambiosTipologia ? 'Tipología Confirmada en Terreno' : 'Reclasificación en Terreno',
          {
            icon: sinCambiosTipologia ? 'patrulla' : 'reclasificacion',
            codeBadge: datos.codigo,
            priorityBadge: datos.prioridad,
            dedupKey: claveDedup,
            details: [
              {
                label: sinCambiosTipologia ? 'Tipología constatada' : 'Nueva tipología',
                value: datos.tipoAfectacion || 'No especificada',
              },
              ...(datos.justificacion ? [{ label: 'Justificación', value: datos.justificacion }] : []),
            ],
            action: {
              label: 'Ver incidente',
              onClick: () => setIncidenteSeleccionadoId(datos.id),
            },
          }
        );
      } else {
        showInfo(
          `Incidente ${datos.codigo || ''} actualizado a estado ${formatearEstado(datos.nuevoEstado)}.`,
          'Actualización de Incidente',
          {
            icon: 'incidente',
            codeBadge: datos.codigo,
            priorityBadge: datos.prioridad,
            dedupKey: claveDedup,
            action: {
              label: 'Ver incidente',
              onClick: () => setIncidenteSeleccionadoId(datos.id),
            },
          }
        );
      }

      setKpiRefreshTick((prev) => prev + 1);
    },
    [showInfo, showWarning, esToastIncidenteDuplicado]
  );

  const ultimosToastsRechazoRef = React.useRef<Map<string, number>>(new Map());

  const handleMisionRechazadaSocket = React.useCallback(
    (payload: MisionRechazadaPayload) => {
      const claveDedup = payload.misionId || payload.codigo;
      const ahora = Date.now();
      if (claveDedup) {
        const ultimaVez = ultimosToastsRechazoRef.current.get(claveDedup);
        if (ultimaVez && ahora - ultimaVez < 5000) {
          return;
        }
        ultimosToastsRechazoRef.current.set(claveDedup, ahora);
      }

      const esCuadrilla =
        payload.tipoMision === 'ATENCION_CUADRILLA' ||
        Boolean(payload.cuadrillaId || payload.cuadrillaNombre);

      const unidadTexto = esCuadrilla
        ? payload.cuadrillaNombre
          ? `La cuadrilla ${payload.cuadrillaNombre}`
          : 'La cuadrilla operativa'
        : payload.patrullaNombre
          ? `La patrulla ${payload.patrullaNombre}`
          : 'La patrulla verificadora';

      const incidenteTexto = payload.incidenteCodigo
        ? ` del incidente ${payload.incidenteCodigo}`
        : '';
      const motivoTexto =
        payload.motivo || payload.justificacionRechazo || 'Sin justificación especificada';

      showWarning(
        `${unidadTexto} rechazó la misión ${payload.codigo}${incidenteTexto}. La unidad volvió a estado Disponible y la emergencia quedó lista para reasignación.`,
        esCuadrilla ? 'Misión Rechazada por Cuadrilla' : 'Misión Rechazada por Patrulla',
        {
          icon: 'rechazo',
          codeBadge: payload.incidenteCodigo || payload.codigo,
          dedupKey: `mision-rechazada:${payload.misionId || payload.codigo}`,
          details: [
            {
              label: esCuadrilla ? 'Cuadrilla' : 'Patrulla',
              value:
                (esCuadrilla ? payload.cuadrillaNombre : payload.patrullaNombre) ||
                unidadTexto,
            },
            { label: 'Misión', value: payload.codigo },
            { label: 'Motivo', value: motivoTexto },
          ],
          ...(payload.incidenteId
            ? {
                action: {
                  label: 'Ver incidente',
                  onClick: () => setIncidenteSeleccionadoId(payload.incidenteId!),
                },
              }
            : {}),
        }
      );

      setKpiRefreshTick((prev) => prev + 1);
      cargarCuadrillas();
    },
    [showWarning, cargarCuadrillas]
  );

  const handleCuadrillaActualizadaSocket = React.useCallback(
    (payload: CuadrillaActualizadaPayload) => {
      const esDisponible = payload.estado.toUpperCase() === 'DISPONIBLE';
      setCuadrillasOperativas((prev) => {
        const existe = prev.some((c) => c.id === payload.id);
        if (!existe) return prev;
        return prev.map((c) =>
          c.id === payload.id
            ? {
                ...c,
                estado: payload.estado as CuadrillaItem['estado'],
                nombre: payload.nombre || c.nombre,
                misionActiva: esDisponible ? null : c.misionActiva,
              }
            : c
        );
      });
      if (esDisponible) {
        cargarCuadrillas();
      }
    },
    [cargarCuadrillas]
  );

  const handleMisionActualizadaSocket = React.useCallback(
    (payload: MisionActualizadaPayload) => {
      const estadoNorm = (payload.estado || '').toUpperCase();
      const codigoHito =
        typeof payload.hito === 'string'
          ? payload.hito.toUpperCase()
          : payload.hito && typeof payload.hito === 'object' && typeof payload.hito.hito === 'string'
            ? payload.hito.hito.toUpperCase()
            : '';

      if (estadoNorm === 'EN_CURSO' && (!codigoHito || codigoHito === 'MISION_ACEPTADA')) {
        const esCuadrilla = payload.tipoMision === 'ATENCION_CUADRILLA';
        const misionIdRef = payload.misionId || payload.id || payload.codigo;
        const incId = payload.incidenteId;
        const estadoIncidenteObjetivo = esCuadrilla ? 'EN_ATENCION' : 'VERIFICANDO';

        if (incId) {
          ultimasAceptacionesIncidenteRef.current.set(
            `${incId}:${estadoIncidenteObjetivo}`,
            Date.now()
          );
          esToastIncidenteDuplicado(`act:${incId}:${estadoIncidenteObjetivo}::`);
        }

        const tituloToast = esCuadrilla
          ? 'Asignación Aceptada por Cuadrilla'
          : 'Misión Aceptada por Patrulla';
        const nombreUnidad = esCuadrilla
          ? formatearNombreCuadrilla(payload.cuadrillaNombre)
          : formatearNombrePatrulla(payload.patrullaNombre);
        const mensajeToast = esCuadrilla
          ? `${nombreUnidad} aceptó la asignación${payload.codigo ? ` (${payload.codigo})` : ''} e inicia desplazamiento al incidente.`
          : `${nombreUnidad} aceptó la misión${payload.codigo ? ` (${payload.codigo})` : ''} e inicia verificación en terreno.`;

        showInfo(mensajeToast, tituloToast, {
          icon: esCuadrilla ? 'cuadrilla' : 'patrulla',
          codeBadge: payload.incidenteCodigo || payload.codigo || undefined,
          priorityBadge: payload.prioridad || undefined,
          dedupKey: `mision-aceptada:${misionIdRef}`,
          details: [
            { label: esCuadrilla ? 'Cuadrilla' : 'Patrulla', value: nombreUnidad },
            ...(payload.codigo ? [{ label: 'Misión', value: payload.codigo }] : []),
            {
              label: 'Estado Incidente',
              value: esCuadrilla ? 'En Atención' : 'Verificando',
            },
          ],
          action: incId
            ? {
                label: 'Ver incidente',
                onClick: () => setIncidenteSeleccionadoId(incId),
              }
            : undefined,
        });

        setKpiRefreshTick((prev) => prev + 1);
        cargarCuadrillas();
        return;
      }

      if (estadoNorm === 'COMPLETADA') {
        if (
          payload.tipoMision === 'ATENCION_CUADRILLA' &&
          payload.incidenteId &&
          payload.reporteTerreno
        ) {
          mostrarToastCierreCuadrilla({
            incidenteId: payload.incidenteId,
            codigo: payload.incidenteCodigo,
            reporte: payload.reporteTerreno,
            misionId: payload.misionId || payload.id,
          });
        }
        setKpiRefreshTick((prev) => prev + 1);
        cargarCuadrillas();
      }
    },
    [cargarCuadrillas, esToastIncidenteDuplicado, mostrarToastCierreCuadrilla, showInfo]
  );

  const handleRecursoActualizadoSocket = React.useCallback(
    (payload: RecursoActualizadoPayload) => {
      const estadoNorm = (payload.estado || '').toUpperCase();
      if (estadoNorm === 'BAJO_STOCK' || estadoNorm === 'NO_DISPONIBLE') {
        const nombreRecurso = payload.nombre || 'Recurso del inventario';
        const detalleStock =
          typeof payload.cantidadDisponible === 'number'
            ? `${payload.cantidadDisponible} disponible(s)`
            : `Estado: ${formatearEstado(estadoNorm)}`;

        showWarning(
          `El recurso "${nombreRecurso}" pasó a estado ${formatearEstado(estadoNorm)} tras consumo reportado en terreno.`,
          estadoNorm === 'BAJO_STOCK' ? 'Alerta de Bajo Stock' : 'Recurso Sin Disponibilidad',
          {
            icon: 'inventario',
            dedupKey: `recurso-alerta:${payload.id}:${estadoNorm}`,
            details: [
              { label: 'Recurso', value: nombreRecurso },
              { label: 'Disponibilidad', value: detalleStock },
            ],
          }
        );
      }
    },
    [showWarning]
  );

  const {
    userId,
    setUserId,
    columnas,
    paginacionColumna,
    cargando,
    cargandoColumna,
    error,
    esForbidden,
    filtros,
    setFiltros,
    estadosVisibles,
    limpiarFiltros,
    cargarMas,
    recargar,
    moverIncidenteAEstado,
    marcarIncidenteMisionDespachada,
    conectado,
    ultimoEvento,
    totalIncidentesVisibles,
    trazabilidadPorIncidente,
  } = useIncidentesKanban({
    onMisionRechazada: handleMisionRechazadaSocket,
    onMisionActualizada: handleMisionActualizadaSocket,
    onCuadrillaActualizada: handleCuadrillaActualizadaSocket,
    onRecursoActualizado: handleRecursoActualizadoSocket,
    onReporteTerrenoRecibido: handleReporteTerrenoRecibido,
    onIncidenteCreadoSocket: handleIncidenteCreadoSocket,
    onIncidenteActualizadoSocket: handleIncidenteActualizadoSocket,
  });

  const [estadoEnfocado, setEstadoEnfocado] = useState<EstadoIncidente | null>(null);

  // Actualizar cuadrillas operativas ante eventos socket en tiempo real (BUG-H22-WEB-04)
  useEffect(() => {
    if (ultimoEvento) {
      cargarCuadrillas();
    }
  }, [ultimoEvento, cargarCuadrillas]);

  const {
    kpis,
    cargando: cargandoKpis,
    delegacionId,
    setDelegacionId,
    delegaciones,
    refrescarKpis,
    conectado: conectadoKpis,
  } = useIncidentesKpis({ userId });

  useEffect(() => {
    if (kpiRefreshTick > 0) {
      refrescarKpis(false);
    }
  }, [kpiRefreshTick, refrescarKpis]);

  // Hook de tiempo real para eventos de prevención (HU-30)
  usePrevencionSocket({
    onPrevencionCreada: (nuevoEvento) => {
      setEventosPrevencion((prev) => {
        const existe = prev.some((e) => e.id === nuevoEvento.id);
        if (existe) return prev;
        return [nuevoEvento, ...prev];
      });
      showInfo(
        `Nuevo operativo preventivo registrado en ${nuevoEvento.sector || 'sector asignado'}.`,
        'Operación Preventiva en Vivo',
        {
          icon: 'operativo',
          codeBadge: nuevoEvento.codigo,
          details: [
            { label: 'Sector', value: nuevoEvento.sector || 'No especificado' },
            ...(nuevoEvento.puntoCritico?.nombre ? [{ label: 'Punto crítico', value: nuevoEvento.puntoCritico.nombre }] : []),
          ],
        }
      );
    },
  });

  // Hook de tiempo real para eventos de recuperación (HU-29)
  useRecuperacionSocket({
    onRecuperacionCreada: (nuevoEvento) => {
      setEventosRecuperacion((prev) => {
        const existe = prev.some((e) => e.id === nuevoEvento.id);
        if (existe) return prev;
        return [nuevoEvento, ...prev];
      });
      showInfo(
        `Nuevo operativo de recuperación en ${nuevoEvento.sector}.`,
        'Operación Territorial en Vivo',
        {
          icon: 'operativo',
          codeBadge: nuevoEvento.codigo,
          details: [
            { label: 'Sector', value: nuevoEvento.sector },
            ...(nuevoEvento.nombre ? [{ label: 'Operativo', value: nuevoEvento.nombre }] : []),
          ],
        }
      );
    },
  });

  // Lista plana de incidentes para visualizar en el mapa táctico
  const todosLosIncidentes = useMemo(() => {
    return Object.values(columnas).flat();
  }, [columnas]);

  // Manejo de cambio de delegación sincronizado entre KPIs y Kanban
  const handleDelegacionChange = (nuevaDelegacionId: string) => {
    setDelegacionId(nuevaDelegacionId);
    setFiltros({
      ...filtros,
      delegacionId: nuevaDelegacionId || undefined,
    });
  };

  // Manejo de clic en tarjeta de estado
  const handleSelectEstado = (estado: EstadoIncidente) => {
    if (estadoEnfocado === estado) {
      setEstadoEnfocado(null);
      if (filtros.estado === estado) {
        setFiltros({
          ...filtros,
          estado: 'TODOS',
        });
      }
    } else {
      setEstadoEnfocado(estado);
      if (filtros.estado && filtros.estado !== 'TODOS' && filtros.estado !== estado) {
        setFiltros({
          ...filtros,
          estado,
          soloHoy: true,
        });
      } else if (!filtros.soloHoy) {
        setFiltros({
          ...filtros,
          soloHoy: true,
        });
      }

      setTimeout(() => {
        const colEl = document.getElementById(`kanban-col-${estado}`);
        if (colEl) {
          colEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 50);
    }
  };

  const handleRefrescoCompleto = () => {
    refrescarKpis(true);
    recargar();
    cargarCuadrillas();
  };

  const contadoresPorEstado = useMemo(() => {
    const mapa: Record<string, number> = {
      TODOS: totalIncidentesVisibles,
    };
    Object.entries(columnas).forEach(([estado, items]) => {
      mapa[estado] = items.length;
    });
    return mapa;
  }, [columnas, totalIncidentesVisibles]);

  return (
    <div className={styles.pageContainer}>
      <KanbanHeader
        totalIncidentesVisibles={totalIncidentesVisibles}
        conectado={conectado}
        userId={userId}
        setUserId={setUserId}
        onAbrirMisiones={() => setMisionesModalAbierto(true)}
        onAbrirPatrullas={() => setPatrullasModalAbierto(true)}
        onOpenCrearPrevencion={() => setModalPrevencionAbierto(true)}
        onOpenCrearRecuperacion={() => setModalRecuperacionAbierto(true)}
        puedeCrearEventoAtp={puedeCrearEventoAtp}
      />

      {esForbidden ? (
        <AccesoDenegado />
      ) : (
        <>
          <IncidentesKpiCards
            kpis={kpis}
            cargando={cargandoKpis}
            delegacionId={delegacionId}
            onDelegacionChange={handleDelegacionChange}
            delegaciones={delegaciones}
            onRefrescar={handleRefrescoCompleto}
            estadoSeleccionado={estadoEnfocado}
            onSelectEstado={handleSelectEstado}
            conectado={conectadoKpis || conectado}
          />

          <KanbanFiltros
            filtros={filtros}
            onFiltrosChange={setFiltros}
            onLimpiarFiltros={limpiarFiltros}
            onRecargar={handleRefrescoCompleto}
            contadoresPorEstado={contadoresPorEstado}
            cargando={cargando}
          />

          {/* Selector de visualización entre filtros y tablero */}
          <KanbanViewSwitcher
            vistaActiva={vistaActiva}
            onCambiarVista={setVistaActiva}
          />

          {error && !esForbidden && (
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <InlineNotice variant="error">
                {error}
              </InlineNotice>
            </div>
          )}

          {vistaActiva === 'kanban' ? (
            <main className={styles.kanbanArea}>
              <div className={styles.kanbanBoard}>
                {estadosVisibles.map((estado) => (
                  <KanbanColumn
                    key={estado}
                    id={`kanban-col-${estado}`}
                    estado={estado}
                    titulo={TITULOS_COLUMNAS[estado]}
                    incidentes={columnas[estado]}
                    paginacion={paginacionColumna[estado]}
                    cargandoMas={cargandoColumna[estado]}
                    resaltada={estadoEnfocado === estado}
                    onCargarMas={cargarMas}
                    onSeleccionarIncidente={(inc) => setIncidenteSeleccionadoId(inc.id)}
                    onAsignarPatrulla={(inc) => setIncidenteParaAsignar(inc)}
                    puedeAsignarPatrulla={puedeAsignar}
                    trazabilidadPorIncidente={trazabilidadPorIncidente}
                  />
                ))}
              </div>
            </main>
          ) : (
            <main style={{ marginTop: 'var(--space-4, 16px)' }}>
              <MapaOperativoMando
                incidentes={todosLosIncidentes}
                eventosPrevencion={eventosPrevencion}
                eventosRecuperacion={eventosRecuperacion}
                cuadrillas={cuadrillasOperativas}
                onSelectIncidente={(incId) => setIncidenteSeleccionadoId(incId)}
                onSelectCuadrilla={(cuadrillaId) => setCuadrillaSeleccionadaId(cuadrillaId)}
                onCrearPrevencion={() => setModalPrevencionAbierto(true)}
                onCrearRecuperacion={() => setModalRecuperacionAbierto(true)}
              />
            </main>
          )}

          <IncidenteDetalleDrawer
            incidenteId={incidenteSeleccionadoId}
            incidenteCodigo={
              todosLosIncidentes.find((i) => i.id === incidenteSeleccionadoId)?.codigo ?? null
            }
            userId={userId}
            onCerrar={() => setIncidenteSeleccionadoId(null)}
            onSelectCuadrilla={(cuadrillaId) => setCuadrillaSeleccionadaId(cuadrillaId)}
            onIncidenteActualizado={(incId, nuevoEstado) => {
              if (incId && nuevoEstado) {
                moverIncidenteAEstado(incId, nuevoEstado);
              }
              recargar();
              refrescarKpis();
              cargarCuadrillas();
            }}
          />

          {/* Modal de Asignación de Patrulla desde tarjeta Kanban */}
          <AsignarPatrullaModal
            isOpen={!!incidenteParaAsignar}
            onClose={() => setIncidenteParaAsignar(null)}
            incidente={incidenteParaAsignar}
            userId={userId}
            onAsignacionExitosa={(data) => {
              const estadoInicial = extraerEstadoInicialNotificacion(data);
              setTrazabilidadEstado(data.mision.id, estadoInicial, data.incidente.id);
              marcarIncidenteMisionDespachada(data.incidente.id, true);
              recargar();
              refrescarKpis();
              cargarCuadrillas();
              setIncidenteParaAsignar(null);
            }}
          />

          <MisionesModal
            isOpen={misionesModalAbierto}
            onClose={() => setMisionesModalAbierto(false)}
            userId={userId}
          />

          <PanelPatrullasModal
            isOpen={patrullasModalAbierto}
            onClose={() => setPatrullasModalAbierto(false)}
            userId={userId}
            onSelectMision={(misionId) => {
              setMisionSeleccionadaId(misionId);
              setMisionesModalAbierto(true);
            }}
            onSelectIncidente={(incidenteId) => {
              setIncidenteSeleccionadoId(incidenteId);
            }}
          />

          <MisionDetalleModal
            misionId={misionSeleccionadaId}
            onCerrar={() => setMisionSeleccionadaId(null)}
            userId={userId}
            onUbicarEnMapa={(lat, lng, etiqueta) => {
              setMisionSeleccionadaId(null);
              setVistaActiva('mapa');
              showInfo(
                `Coordenadas ${etiqueta ? `(${etiqueta})` : ''}: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
                'Ubicación en Mapa Operativo'
              );
            }}
          />

          <ModalCrearEventoPrevencion
            isOpen={modalPrevencionAbierto}
            onClose={() => setModalPrevencionAbierto(false)}
            userId={userId}
            onSuccess={(eventoCreado) => {
              setEventosPrevencion((prev) => [eventoCreado, ...prev]);
              handleRefrescoCompleto();
            }}
          />

          <ModalCrearEventoRecuperacion
            isOpen={modalRecuperacionAbierto}
            onClose={() => setModalRecuperacionAbierto(false)}
            userId={userId}
            onSuccess={(eventoCreado) => {
              setEventosRecuperacion((prev) => [eventoCreado, ...prev]);
              handleRefrescoCompleto();
            }}
          />

          {/* Drawer de Detalle y Composición de Cuadrilla (HU-22) */}
          <CuadrillaDetalleDrawer
            cuadrillaId={cuadrillaSeleccionadaId}
            isOpen={Boolean(cuadrillaSeleccionadaId)}
            onCerrar={() => setCuadrillaSeleccionadaId(null)}
            onSelectIncidente={(incId) => {
              setCuadrillaSeleccionadaId(null);
              setIncidenteSeleccionadoId(incId);
            }}
            puedeEditar={false}
            puedeEliminar={false}
          />
        </>
      )}
    </div>
  );
};
