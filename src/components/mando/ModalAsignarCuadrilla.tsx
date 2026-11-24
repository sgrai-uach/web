'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import InlineNotice from '@/components/ui/InlineNotice';
import { cuadrillasService } from '@/services/cuadrillasService';
import { misionesService } from '@/services/misionesService';
import { getRecursos } from '@/services/recursosService';
import { getSocket } from '@/lib/socket/client';
import type { IncidenteDetalle } from '@/services/incidentesService';
import type { CuadrillaItem } from '@/types/cuadrilla';
import type { RecursoItem } from '@/types/recurso';
import type { PrioridadMision, DespacharCuadrillaResponse } from '@/types/misiones';
import { formatearEstado, formatearPrioridad } from '@/lib/utils/estadoUtils';
import {
  AlertTriangle,
  HardHat,
  Package,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Truck,
} from 'lucide-react';
import styles from './ModalAsignarCuadrilla.module.css';

function calcularTotalIntegrantesCuadrilla(cuad: CuadrillaItem): number {
  const trabajadores = Array.isArray(cuad.trabajadores) ? cuad.trabajadores : [];
  const baseTrabajadores =
    trabajadores.length > 0 ? trabajadores.length : (cuad.totalTrabajadores ?? 0);
  const delegadoYaIncluido =
    Boolean(cuad.delegado?.id) &&
    trabajadores.some((t) => t.usuarioId === cuad.delegado?.id);
  const sumaDelegado = cuad.delegado && !delegadoYaIncluido ? 1 : 0;
  return baseTrabajadores + sumaDelegado;
}

export interface ModalAsignarCuadrillaProps {
  isOpen: boolean;
  onClose: () => void;
  incidente: IncidenteDetalle | null;
  userId?: string;
  onSuccess?: (resultado: DespacharCuadrillaResponse['data']) => void;
}

const OPCIONES_PRIORIDAD = [
  { value: 'BAJA', label: 'Baja - Atención rutinaria' },
  { value: 'MEDIA', label: 'Media - Atención estándar' },
  { value: 'ALTA', label: 'Alta - Respuesta prioritaria' },
  { value: 'CRITICA', label: 'Crítica - Despliegue inmediato' },
];

interface RecursoAdicionalSeleccionado {
  recursoId: string;
  nombre: string;
  cantidad: number;
  cantidadDisponible: number;
  esIndividual: boolean;
}

export const ModalAsignarCuadrilla: React.FC<ModalAsignarCuadrillaProps> = ({
  isOpen,
  onClose,
  incidente,
  userId,
  onSuccess,
}) => {
  const [cuadrillasDisponibles, setCuadrillasDisponibles] = useState<CuadrillaItem[]>([]);
  const [cargandoCuadrillas, setCargandoCuadrillas] = useState<boolean>(false);
  const [errorCargaCuadrillas, setErrorCargaCuadrillas] = useState<string | null>(null);

  const [recursosInventario, setRecursosInventario] = useState<RecursoItem[]>([]);
  const [cargandoRecursos, setCargandoRecursos] = useState<boolean>(false);
  const [recursoSeleccionadoId, setRecursoSeleccionadoId] = useState<string>('');
  const [cantidadRecursoInput, setCantidadRecursoInput] = useState<number>(1);
  const [recursosAdicionales, setRecursosAdicionales] = useState<RecursoAdicionalSeleccionado[]>(
    []
  );

  // Campos del formulario inicializados de forma reactiva a partir del incidente
  const [cuadrillaId, setCuadrillaId] = useState<string>('');
  const [prioridad, setPrioridad] = useState<PrioridadMision>(
    (incidente?.prioridad as PrioridadMision) || 'MEDIA'
  );
  const [titulo, setTitulo] = useState<string>(
    incidente
      ? incidente.estado === 'EN_ATENCION'
        ? `Apoyo táctico - ${incidente.codigo}`
        : `Atención táctica - ${incidente.codigo}`
      : ''
  );
  const [descripcion, setDescripcion] = useState<string>('');

  // Estados de envío y feedback
  const [enviando, setEnviando] = useState<boolean>(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const incidenteRef = useRef<IncidenteDetalle | null>(incidente);
  useEffect(() => {
    incidenteRef.current = incidente;
  }, [incidente]);

  // 1. Detección de misión de verificación previa y cuadrillas activas
  const misionVerificacion = useMemo(() => {
    if (!incidente?.misiones) return null;
    return (
      incidente.misiones.find(
        (m) =>
          m.tipoMision === 'VERIFICACION' &&
          m.estado !== 'CANCELADA' &&
          m.estado !== 'RECHAZADA'
      ) || null
    );
  }, [incidente]);

  const patrullaAsignada = misionVerificacion?.patrulla;

  const misionesCuadrillaActivas = useMemo(() => {
    if (!incidente?.misiones) return [];
    return incidente.misiones.filter(
      (m) =>
        (m.tipoMision === 'ATENCION_CUADRILLA' || Boolean(m.cuadrilla)) &&
        ['PLANIFICADA', 'DESPACHADA', 'EN_CURSO'].includes(m.estado)
    );
  }, [incidente]);

  const cuadrillaSeleccionada = useMemo(
    () => cuadrillasDisponibles.find((c) => c.id === cuadrillaId) || null,
    [cuadrillasDisponibles, cuadrillaId]
  );

  // Cargar cuadrillas disponibles y reiniciar campos únicamente al abrir o cambiar el ID del incidente
  const incidenteIdActual = incidente?.id;
  useEffect(() => {
    const incActual = incidenteRef.current;
    if (!isOpen || !incActual || !incidenteIdActual) return;

    let isMounted = true;

    Promise.resolve()
      .then(() => {
        if (!isMounted) return;
        setPrioridad((incActual.prioridad as PrioridadMision) || 'MEDIA');
        setTitulo(
          incActual.estado === 'EN_ATENCION'
            ? `Apoyo táctico - ${incActual.codigo}`
            : `Atención táctica - ${incActual.codigo}`
        );
        setDescripcion('');
        setCuadrillaId('');
        setRecursosAdicionales([]);
        setRecursoSeleccionadoId('');
        setCantidadRecursoInput(1);
        setErrorApi(null);
        setErrorCargaCuadrillas(null);
        setCargandoCuadrillas(true);
        setCargandoRecursos(true);

        const cargaCuadrillas = cuadrillasService
          .obtenerCuadrillas({ pagina: 1, limite: 100, estado: 'DISPONIBLE' })
          .then((res) => {
            if (!isMounted || !res) return;
            setCuadrillasDisponibles(res.cuadrillas || []);
            setCargandoCuadrillas(false);
          })
          .catch(() => {
            if (!isMounted) return;
            setErrorCargaCuadrillas('No se pudo cargar la dotación de cuadrillas disponibles.');
            setCargandoCuadrillas(false);
          });

        const cargaRecursos = getRecursos({ pagina: 1, limite: 100 }, userId)
          .then((res) => {
            if (!isMounted) return;
            setRecursosInventario(Array.isArray(res?.data) ? res.data : []);
            setCargandoRecursos(false);
          })
          .catch(() => {
            if (!isMounted) return;
            setRecursosInventario([]);
            setCargandoRecursos(false);
          });

        return Promise.all([cargaCuadrillas, cargaRecursos]);
      })
      .catch(() => {
        if (!isMounted) return;
        setCargandoCuadrillas(false);
        setCargandoRecursos(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, incidenteIdActual, userId]);

  // Refrescar lista de cuadrillas disponibles en vivo cuando alguna pasa a DISPONIBLE (H68)
  useEffect(() => {
    if (!isOpen || !incidenteIdActual) return;
    let isMounted = true;

    try {
      const socket = getSocket();
      if (!socket || typeof socket.on !== 'function') return;

      const unirseSalas = () => {
        socket.emit('join', 'encargado');
        socket.emit('unirse', 'sala:encargados');
      };

      if (!socket.connected && typeof socket.connect === 'function') {
        socket.connect();
      }
      if (socket.connected) {
        unirseSalas();
      }

      const handleCuadrillaActualizada = (rawPayload: unknown) => {
        const p = rawPayload as Record<string, unknown> | null | undefined;
        const raw = (p?.datos || p?.data || rawPayload) as Record<string, unknown> | null | undefined;
        const estado = typeof raw?.estado === 'string' ? raw.estado.toUpperCase() : '';
        const id =
          typeof raw?.id === 'string'
            ? raw.id
            : typeof raw?.cuadrillaId === 'string'
              ? raw.cuadrillaId
              : '';
        if (estado === 'DISPONIBLE' || id) {
          void cuadrillasService
            .obtenerCuadrillas({ pagina: 1, limite: 100, estado: 'DISPONIBLE' })
            .then((res) => {
              if (isMounted && res?.cuadrillas) {
                setCuadrillasDisponibles(res.cuadrillas);
              }
            })
            .catch(() => {
              // Ignorar error silencioso en refresco en vivo
            });
        }
      };

      socket.on('connect', unirseSalas);
      socket.on('cuadrilla:actualizada', handleCuadrillaActualizada);

      return () => {
        isMounted = false;
        socket.off('connect', unirseSalas);
        socket.off('cuadrilla:actualizada', handleCuadrillaActualizada);
      };
    } catch {
      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, incidenteIdActual]);

  const recursosElegibles = useMemo(() => {
    const yaSeleccionadosIds = new Set(recursosAdicionales.map((r) => r.recursoId));
    const recursosEnCuadrilla = new Set(
      (cuadrillaSeleccionada?.recursos || []).map((cr) => cr.recursoId)
    );
    return recursosInventario.filter(
      (rec) =>
        rec.cantidadDisponible > 0 &&
        rec.estado !== 'EN_MANTENCION' &&
        rec.estado !== 'NO_DISPONIBLE' &&
        !yaSeleccionadosIds.has(rec.id) &&
        !(rec.esIndividual && recursosEnCuadrilla.has(rec.id))
    );
  }, [recursosInventario, recursosAdicionales, cuadrillaSeleccionada]);

  // Al cambiar de cuadrilla (o actualizarse su dotación en vivo), retirar de recursosAdicionales
  // los recursos individuales que la cuadrilla seleccionada ya posee en su dotación activa.
  useEffect(() => {
    if (!cuadrillaSeleccionada) return;
    const recursosEnCuadrilla = new Set(
      (cuadrillaSeleccionada.recursos || []).map((cr) => cr.recursoId)
    );
    if (recursosEnCuadrilla.size === 0) return;

    let activo = true;
    Promise.resolve().then(() => {
      if (!activo) return;
      setRecursosAdicionales((prev) => {
        const filtrados = prev.filter(
          (item) => !(item.esIndividual && recursosEnCuadrilla.has(item.recursoId))
        );
        return filtrados.length === prev.length ? prev : filtrados;
      });
      setRecursoSeleccionadoId((prevId) => {
        if (!prevId) return prevId;
        const candidato = recursosInventario.find((r) => r.id === prevId);
        return candidato?.esIndividual && recursosEnCuadrilla.has(prevId) ? '' : prevId;
      });
    });
    return () => {
      activo = false;
    };
  }, [cuadrillaSeleccionada, recursosInventario]);

  const recursoCandidatoActual = useMemo(
    () => recursosElegibles.find((r) => r.id === recursoSeleccionadoId) || null,
    [recursosElegibles, recursoSeleccionadoId]
  );

  if (!isOpen || !incidente) return null;

  const handleAgregarRecurso = () => {
    if (!recursoCandidatoActual) return;
    const cantidadFinal = recursoCandidatoActual.esIndividual
      ? 1
      : Math.max(1, Math.min(recursoCandidatoActual.cantidadDisponible, cantidadRecursoInput || 1));
    setRecursosAdicionales((prev) => [
      ...prev,
      {
        recursoId: recursoCandidatoActual.id,
        nombre: recursoCandidatoActual.nombre,
        cantidad: cantidadFinal,
        cantidadDisponible: recursoCandidatoActual.cantidadDisponible,
        esIndividual: recursoCandidatoActual.esIndividual,
      },
    ]);
    setRecursoSeleccionadoId('');
    setCantidadRecursoInput(1);
  };

  const handleActualizarCantidadRecurso = (recursoIdTarget: string, nuevaCantidad: number) => {
    setRecursosAdicionales((prev) =>
      prev.map((item) => {
        if (item.recursoId !== recursoIdTarget) return item;
        if (item.esIndividual) return { ...item, cantidad: 1 };
        const clamped = Math.max(1, Math.min(item.cantidadDisponible, nuevaCantidad || 1));
        return { ...item, cantidad: clamped };
      })
    );
  };

  const handleQuitarRecurso = (recursoIdTarget: string) => {
    setRecursosAdicionales((prev) => prev.filter((item) => item.recursoId !== recursoIdTarget));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cuadrillaId) {
      setErrorApi('Debe seleccionar una cuadrilla operativa para realizar el despacho.');
      return;
    }

    try {
      setEnviando(true);
      setErrorApi(null);

      const res = await misionesService.despacharCuadrilla(
        {
          tipoMision: 'ATENCION_CUADRILLA',
          incidenteId: incidente.id,
          cuadrillaId,
          titulo: titulo.trim() || undefined,
          descripcion: descripcion.trim() || undefined,
          prioridad,
          ...(recursosAdicionales.length > 0
            ? {
                recursosAdicionales: recursosAdicionales.map(({ recursoId, cantidad }) => ({
                  recursoId,
                  cantidad,
                })),
              }
            : {}),
        },
        userId
      );

      if (!res.exito || !res.datos) {
        setErrorApi(res.mensaje || 'Error al procesar el despacho de la cuadrilla operativa.');
        setEnviando(false);
        return;
      }

      // Éxito: notificar al padre y cerrar modal
      onSuccess?.(res.datos);
      onClose();
    } catch {
      setErrorApi('Ocurrió un error inesperado al comunicarse con el servidor.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Despachar Cuadrilla Operativa"
      onClose={onClose}
      maxWidth="620px"
    >
      <form onSubmit={handleSubmit} className={styles.container}>
        {/* Resumen del incidente */}
        <div className={styles.incidenteInfoBox}>
          <div className={styles.incidenteInfoTitulo}>
            <Truck size={16} aria-hidden="true" />
            <span>Incidente: {incidente.codigo} - {incidente.tipoAfectacion}</span>
          </div>
          <div className={styles.incidenteInfoDetalle}>
            <strong>Ubicación:</strong> {incidente.direccion}
          </div>
          <div className={styles.incidenteInfoDetalle}>
            <strong>Estado actual:</strong> {formatearEstado(incidente.estado)} |{' '}
            <strong>Prioridad:</strong> {formatearPrioridad(incidente.prioridad)}
          </div>
        </div>

        {/* Contexto de apoyo en terreno y cuadrillas activas en EN_ATENCION (HU-44) */}
        {incidente.estado === 'EN_ATENCION' && misionesCuadrillaActivas.length > 0 && (
          <div className={styles.cuadrillasActivasCard} data-testid="modal-cuadrillas-activas">
            <strong>Cuadrillas actualmente desplegadas en este incidente:</strong>
            {misionesCuadrillaActivas.map((m) => (
              <span key={m.id}>
                • {m.cuadrilla?.nombre || 'Cuadrilla asignada'} ({m.codigo} · {formatearEstado(m.estado)})
              </span>
            ))}
          </div>
        )}

        {incidente.apoyoSolicitado && (
          <div
            className={
              incidente.requiereCuadrillaAdicional
                ? styles.contextoApoyoRojoCard
                : styles.contextoApoyoAmbarCard
            }
            data-testid="modal-contexto-apoyo"
            role="status"
          >
            <AlertTriangle
              size={18}
              aria-hidden="true"
              color={
                incidente.requiereCuadrillaAdicional
                  ? 'var(--color-danger, #D32F2F)'
                  : 'var(--color-warning, #E65100)'
              }
              style={{ flexShrink: 0 }}
            />
            <div>
              <strong>
                {incidente.requiereCuadrillaAdicional
                  ? 'Cuadrilla adicional solicitada desde terreno'
                  : 'Apoyo adicional solicitado desde terreno'}
              </strong>
              <div>
                {incidente.detalleApoyoRequerido?.trim() ||
                  'Se solicitaron refuerzos para continuar la atención en terreno.'}
              </div>
            </div>
          </div>
        )}

        {/* Tarjeta Regla de Negocio ICS §3.2: Relevo táctico cuando la patrulla continúa activa */}
        {patrullaAsignada && misionVerificacion?.estado !== 'COMPLETADA' && (
          <div className={styles.patrullaRelevoCard} role="status">
            <ShieldCheck size={18} aria-hidden="true" style={{ flexShrink: 0 }} />
            <div>
              <strong>Regla de Negocio ICS §3.2 (Relevo Táctico)</strong>
              <div>
                Al confirmar el despacho de la cuadrilla, la patrulla verificadora{' '}
                <strong>{patrullaAsignada.nombre}</strong> será automáticamente relevada a estado{' '}
                <strong>Disponible</strong> y su misión previa se marcará como <strong>Completada</strong>.
              </div>
            </div>
          </div>
        )}

        {/* Tarjeta de antecedentes técnicos: cuando la patrulla ya concluyó la evaluación */}
        {patrullaAsignada && misionVerificacion?.estado === 'COMPLETADA' && (
          <div className={styles.patrullaConcluidaCard} role="status">
            <CheckCircle2 size={18} aria-hidden="true" style={{ flexShrink: 0 }} />
            <div>
              <strong>Diagnóstico Técnico en Terreno Completado</strong>
              <div>
                Evaluación técnica en terreno finalizada por la patrulla{' '}
                <strong>{patrullaAsignada.nombre}</strong>. La unidad ya se encuentra liberada y en estado{' '}
                <strong>Disponible</strong>.
              </div>
            </div>
          </div>
        )}

        {/* Alerta de error API (incluyendo 409 Conflict VERIFICACION_EN_CURSO) */}
        {errorApi && (
          <InlineNotice variant="error">
            {errorApi}
          </InlineNotice>
        )}

        {errorCargaCuadrillas && (
          <InlineNotice variant="warning">
            {errorCargaCuadrillas}
          </InlineNotice>
        )}

        {/* Formulario */}
        <div className={styles.formGrid}>
          {/* Selector de cuadrilla */}
          <div className={styles.formGroup}>
            <label htmlFor="selector-cuadrilla-despacho" className={styles.formLabel}>
              <HardHat size={14} aria-hidden="true" />
              <span>Cuadrilla Operativa</span>
              <span className={styles.requiredMark}>*</span>
            </label>

            {cargandoCuadrillas ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted, #5F676E)' }}>
                Consultando cuadrillas disponibles...
              </div>
            ) : cuadrillasDisponibles.length === 0 ? (
              <InlineNotice variant="warning">
                No hay cuadrillas operativas disponibles en este momento.
              </InlineNotice>
            ) : (
              <Select
                id="selector-cuadrilla-despacho"
                aria-label="Cuadrilla Operativa"
                value={cuadrillaId}
                onChange={(e) => setCuadrillaId(e.target.value)}
                disabled={enviando}
                required
              >
                <option value="">-- Seleccionar cuadrilla operativa disponible --</option>
                {cuadrillasDisponibles.map((cuad) => {
                  const totalIntegrantes = calcularTotalIntegrantesCuadrilla(cuad);
                  return (
                    <option key={cuad.id} value={cuad.id}>
                      {cuad.nombre} ({cuad.delegacion?.nombre || 'Valdivia'} -{' '}
                      {totalIntegrantes} {totalIntegrantes === 1 ? 'integrante' : 'integrantes'})
                    </option>
                  );
                })}
              </Select>
            )}
            {cuadrillaSeleccionada && (() => {
              const totalIntegrantes = calcularTotalIntegrantesCuadrilla(cuadrillaSeleccionada);
              const recursosCuadrilla = Array.isArray(cuadrillaSeleccionada.recursos)
                ? cuadrillaSeleccionada.recursos
                : [];
              return (
                <>
                  <span className={styles.helperText}>
                    Dotación: {totalIntegrantes} {totalIntegrantes === 1 ? 'integrante' : 'integrantes'}
                    {cuadrillaSeleccionada.delegado?.nombre
                      ? ` • Delegado: ${cuadrillaSeleccionada.delegado.nombre}`
                      : ''}
                  </span>
                  <div
                    className={styles.dotacionActualBox}
                    data-testid="dotacion-actual-cuadrilla"
                  >
                    <strong>Dotación de recursos actual de la cuadrilla:</strong>{' '}
                    {recursosCuadrilla.length === 0 ? (
                      <span style={{ color: 'var(--color-text-muted, #5F676E)' }}>
                        Sin recursos asignados previamente.
                      </span>
                    ) : (
                      <span>
                        {recursosCuadrilla
                          .map((r) => `${r.nombre} (×${r.cantidadAsignada})`)
                          .join(', ')}
                      </span>
                    )}
                  </div>
                </>
              );
            })()}
          </div>

          {/* Selector opcional de recursos adicionales para incorporar permanentemente a la cuadrilla (HU-44) */}
          <div className={styles.formGroup}>
            <label htmlFor="selector-recurso-adicional" className={styles.formLabel}>
              <Package size={14} aria-hidden="true" />
              <span>Agregar Recurso Adicional a la Cuadrilla (Opcional)</span>
            </label>
            <div className={styles.recursosAdicionalesBox}>
              {cargandoRecursos ? (
                <span className={styles.helperText}>Consultando inventario de recursos...</span>
              ) : (
                <div className={styles.recursosSelectorRow}>
                  <div style={{ flex: '1 1 220px' }}>
                    <Select
                      id="selector-recurso-adicional"
                      aria-label="Recurso adicional para la cuadrilla"
                      value={recursoSeleccionadoId}
                      onChange={(e) => {
                        setRecursoSeleccionadoId(e.target.value);
                        setCantidadRecursoInput(1);
                      }}
                      disabled={enviando || recursosElegibles.length === 0}
                    >
                      <option value="">
                        {recursosElegibles.length === 0
                          ? '-- Sin recursos elegibles disponibles en inventario --'
                          : '-- Seleccionar recurso adicional del inventario --'}
                      </option>
                      {recursosElegibles.map((rec) => (
                        <option key={rec.id} value={rec.id}>
                          {rec.nombre} (Disp: {rec.cantidadDisponible}
                          {rec.esIndividual ? ' · Individual' : ''}
                          {rec.estado === 'BAJO_STOCK' ? ' · Bajo stock' : ''})
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div style={{ width: '90px' }}>
                    <Input
                      id="input-cantidad-recurso-adicional"
                      type="number"
                      aria-label="Cantidad de recurso adicional"
                      min={1}
                      max={recursoCandidatoActual?.esIndividual ? 1 : recursoCandidatoActual?.cantidadDisponible || 999}
                      value={recursoCandidatoActual?.esIndividual ? 1 : cantidadRecursoInput}
                      onChange={(e) => setCantidadRecursoInput(Number(e.target.value))}
                      disabled={enviando || !recursoCandidatoActual || recursoCandidatoActual.esIndividual}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={<Plus size={14} />}
                    onClick={handleAgregarRecurso}
                    disabled={enviando || !recursoCandidatoActual}
                    data-testid="btn-agregar-recurso-adicional"
                  >
                    Agregar
                  </Button>
                </div>
              )}

              {recursosAdicionales.length > 0 && (
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
                  data-testid="lista-recursos-adicionales-seleccionados"
                >
                  {recursosAdicionales.map((item) => (
                    <div key={item.recursoId} className={styles.recursoItemRow}>
                      <span>
                        <strong>{item.nombre}</strong>
                        {item.esIndividual ? ' (Individual)' : ` (Disp: ${item.cantidadDisponible})`}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Input
                          type="number"
                          aria-label={`Cantidad para ${item.nombre}`}
                          min={1}
                          max={item.esIndividual ? 1 : item.cantidadDisponible}
                          value={item.cantidad}
                          onChange={(e) =>
                            handleActualizarCantidadRecurso(item.recursoId, Number(e.target.value))
                          }
                          disabled={enviando || item.esIndividual}
                          style={{ width: '70px' }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 size={14} />}
                          aria-label={`Quitar ${item.nombre}`}
                          onClick={() => handleQuitarRecurso(item.recursoId)}
                          disabled={enviando}
                        >
                          Quitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <span className={styles.helperText}>
                Los recursos adicionales quedarán vinculados de forma permanente a la dotación activa de la cuadrilla hasta su edición posterior.
              </span>
            </div>
          </div>

          {/* Selector de Prioridad */}
          <div className={styles.formGroup}>
            <label htmlFor="selector-prioridad-mision" className={styles.formLabel}>
              Prioridad de Despacho
            </label>
            <Select
              id="selector-prioridad-mision"
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as PrioridadMision)}
              options={OPCIONES_PRIORIDAD}
              disabled={enviando}
            />
            <span className={styles.helperText}>
              Heredada inicialmente de la prioridad asignada al incidente.
            </span>
          </div>

          {/* Título de la misión */}
          <div className={styles.formGroup}>
            <label htmlFor="input-titulo-mision" className={styles.formLabel}>
              Título de la Misión Táctica
            </label>
            <Input
              id="input-titulo-mision"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Atención táctica - INC-2026-0001"
              disabled={enviando}
            />
          </div>

          {/* Descripción / Instrucciones */}
          <div className={styles.formGroup}>
            <label htmlFor="textarea-descripcion-mision" className={styles.formLabel}>
              Instrucciones Específicas para la Cuadrilla (Opcional)
            </label>
            <Textarea
              id="textarea-descripcion-mision"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describa el trabajo a efectuar: despeje de calzada, uso de motobomba, corte de ramas caídas, etc."
              rows={3}
              disabled={enviando}
            />
          </div>
        </div>

        {/* Acciones */}
        <div className={styles.modalActions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={enviando}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={
              !cuadrillaId ||
              cuadrillasDisponibles.length === 0 ||
              enviando
            }
          >
            {enviando ? 'Despachando...' : 'Confirmar y Despachar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
