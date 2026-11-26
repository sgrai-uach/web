'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Boxes, CalendarClock, Plus, Trash2, Truck } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import InlineNotice from '@/components/ui/InlineNotice';
import { useOptionalToast } from '@/components/ui/Toast';
import { getRecursos } from '@/services/recursosService';
import { patrullasService } from '@/services/patrullasService';
import {
  editarOperativoRecuperacion,
  RecuperacionServiceError,
} from '@/services/recuperacionService';
import { editarOperativoRecuperacionSchema } from '@/lib/validations/recuperacion';
import type {
  EditarOperativoRecuperacionData,
  EditarOperativoRecuperacionInput,
  OperativoRecuperacionDetalle,
} from '@/types/recuperacion';
import type { RecursoItem } from '@/types/recurso';
import type { PatrullaVerificadoraDTO } from '@/types/patrullas';
import styles from './ModalEditarOperativoRecuperacion.module.css';

interface FilaRecursoEdicion {
  idTemporal: string;
  recursoId: string;
  cantidad: string;
}

interface SnapshotInicialEdicion {
  id: string;
  actualizadoEn: string;
  descripcion: string;
  fechaEstimadaFin: string;
  patrullaId: string;
  recursos: Array<{ recursoId: string; cantidad: number }>;
}

export interface ModalEditarOperativoRecuperacionProps {
  isOpen: boolean;
  operativo: OperativoRecuperacionDetalle;
  onClose: () => void;
  onSuccess: (actualizado: EditarOperativoRecuperacionData) => void;
  userId?: string;
}

function isoToDatetimeLocal(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function normalizarRecursosParaComparacion(
  items: Array<{ recursoId: string; cantidad: number }>
): string {
  return JSON.stringify(
    [...items]
      .sort((a, b) => a.recursoId.localeCompare(b.recursoId))
      .map((item) => ({ recursoId: item.recursoId, cantidad: item.cantidad }))
  );
}

export const ModalEditarOperativoRecuperacion: React.FC<
  ModalEditarOperativoRecuperacionProps
> = ({ isOpen, operativo, onClose, onSuccess, userId }) => {
  const toast = useOptionalToast();

  const [descripcion, setDescripcion] = useState<string>('');
  const [fechaEstimadaFin, setFechaEstimadaFin] = useState<string>('');
  const [patrullaId, setPatrullaId] = useState<string>('');
  const [filasRecursos, setFilasRecursos] = useState<FilaRecursoEdicion[]>([]);

  const [inventario, setInventario] = useState<RecursoItem[]>([]);
  const [patrullas, setPatrullas] = useState<PatrullaVerificadoraDTO[]>([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [erroresCampos, setErroresCampos] = useState<Record<string, string>>({});
  const [erroresFilasRecursos, setErroresFilasRecursos] = useState<Record<number, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [conflictoEstadoBloqueado, setConflictoEstadoBloqueado] = useState<boolean>(false);
  const [avisoActualizacionRemota, setAvisoActualizacionRemota] = useState<boolean>(false);

  const estabaAbiertoRef = useRef<boolean>(false);
  const snapshotInicialRef = useRef<SnapshotInicialEdicion | null>(null);

  const esEstadoCerrado =
    operativo.estado === 'COMPLETADA' ||
    operativo.estado === 'CANCELADA' ||
    conflictoEstadoBloqueado;

  // Inicializa el formulario solo al abrir el modal o al cambiar de operativo.id (BUG-H74-WEB-01).
  useEffect(() => {
    if (!isOpen) {
      estabaAbiertoRef.current = false;
      snapshotInicialRef.current = null;
      return;
    }

    const recienAbierto = !estabaAbiertoRef.current;
    const cambioOperativo = snapshotInicialRef.current?.id !== operativo.id;

    if (recienAbierto || cambioOperativo) {
      estabaAbiertoRef.current = true;
      const descInit = operativo.descripcion ?? '';
      const fechaInit = isoToDatetimeLocal(operativo.fechaEstimadaFin);
      const patrullaInit = operativo.patrulla?.id ?? '';
      const recursosInit = (operativo.recursos ?? []).map((r) => ({
        recursoId: r.recursoId,
        cantidad: r.cantidadAsignada,
      }));

      snapshotInicialRef.current = {
        id: operativo.id,
        actualizadoEn: operativo.actualizadoEn,
        descripcion: descInit.trim(),
        fechaEstimadaFin: fechaInit,
        patrullaId: patrullaInit,
        recursos: recursosInit,
      };

      queueMicrotask(() => {
        setDescripcion(descInit);
        setFechaEstimadaFin(fechaInit);
        setPatrullaId(patrullaInit);
        setFilasRecursos(
          (operativo.recursos ?? []).map((rec, idx) => ({
            idTemporal: `rec-init-${idx}-${rec.recursoId}`,
            recursoId: rec.recursoId,
            cantidad: String(rec.cantidadAsignada),
          }))
        );
        setErroresCampos({});
        setErroresFilasRecursos({});
        setErrorGeneral(null);
        setConflictoEstadoBloqueado(false);
        setAvisoActualizacionRemota(false);
      });
    } else if (
      snapshotInicialRef.current &&
      operativo.actualizadoEn !== snapshotInicialRef.current.actualizadoEn
    ) {
      queueMicrotask(() => {
        setAvisoActualizacionRemota(true);
      });
    }
  }, [isOpen, operativo]);

  // Carga catálogos solo al abrir el modal o cambiar userId (no en re-renders del operativo).
  useEffect(() => {
    if (!isOpen) return;

    let activo = true;
    queueMicrotask(() => {
      if (activo) setCargandoCatalogos(true);
    });

    void (async () => {
      try {
        const [resRecursos, resPatrullas] = await Promise.all([
          getRecursos({ pagina: 1, limite: 100 }, userId).catch(() => ({
            data: [],
            meta: { total: 0, pagina: 1, limite: 100, totalPaginas: 1 },
          })),
          patrullasService.listar({ limit: 100 }, userId).catch(() => ({
            exito: false,
            data: [],
            meta: { total: 0, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrev: false },
          })),
        ]);

        if (!activo) return;

        if (Array.isArray(resRecursos?.data)) {
          setInventario(resRecursos.data);
        }
        if (Array.isArray(resPatrullas?.data)) {
          setPatrullas(resPatrullas.data);
        }
      } finally {
        if (activo) {
          setCargandoCatalogos(false);
        }
      }
    })();

    return () => {
      activo = false;
    };
  }, [isOpen, userId]);

  const inventarioMap = useMemo(() => {
    const map = new Map<string, RecursoItem>();
    for (const r of inventario) {
      map.set(r.id, r);
    }
    return map;
  }, [inventario]);

  const opcionesPatrulla = useMemo(() => {
    const mapa = new Map<string, { value: string; label: string }>();

    if (operativo.patrulla) {
      mapa.set(operativo.patrulla.id, {
        value: operativo.patrulla.id,
        label: `${operativo.patrulla.nombre} (Actual - ${operativo.patrulla.estado})`,
      });
    }

    for (const p of patrullas) {
      if (p.id === operativo.patrulla?.id) continue;
      if (p.estado === 'DISPONIBLE') {
        mapa.set(p.id, {
          value: p.id,
          label: `${p.nombre} (DISPONIBLE)`,
        });
      }
    }

    const opciones = Array.from(mapa.values());
    if (!operativo.patrulla || patrullaId === '') {
      return [{ value: '', label: 'Seleccione una patrulla...' }, ...opciones];
    }
    return opciones;
  }, [operativo.patrulla, patrullas, patrullaId]);

  const opcionesRecursos = useMemo(() => {
    const asignadosIds = new Set((operativo.recursos ?? []).map((r) => r.recursoId));
    const mapa = new Map<string, { value: string; label: string }>();

    for (const r of inventario) {
      const noDisponible =
        r.estado === 'NO_DISPONIBLE' || r.estado === 'EN_MANTENCION';
      if (noDisponible && !asignadosIds.has(r.id)) {
        continue;
      }
      const stock = r.cantidadDisponible ?? 0;
      const etiquetaIndividual = r.esIndividual ? ' · Activo único' : '';
      mapa.set(r.id, {
        value: r.id,
        label: `${r.nombre} (Stock bodega: ${stock}${etiquetaIndividual})`,
      });
    }

    for (const r of operativo.recursos ?? []) {
      if (!mapa.has(r.recursoId)) {
        mapa.set(r.recursoId, {
          value: r.recursoId,
          label: `${r.nombre} (Asignado: ${r.cantidadAsignada})`,
        });
      }
    }

    return [
      { value: '', label: 'Seleccione un recurso...' },
      ...Array.from(mapa.values()),
    ];
  }, [inventario, operativo.recursos]);

  const handleAgregarRecurso = () => {
    setFilasRecursos((prev) => [
      ...prev,
      { idTemporal: `rec-new-${Date.now()}-${Math.random()}`, recursoId: '', cantidad: '1' },
    ]);
  };

  const handleEliminarRecurso = (idTemporal: string) => {
    setFilasRecursos((prev) => prev.filter((item) => item.idTemporal !== idTemporal));
    setErroresFilasRecursos({});
  };

  const handleCambiarRecurso = (
    idTemporal: string,
    campo: 'recursoId' | 'cantidad',
    valor: string
  ) => {
    setFilasRecursos((prev) =>
      prev.map((item) => {
        if (item.idTemporal !== idTemporal) return item;
        if (campo === 'recursoId') {
          const recursoMeta = inventarioMap.get(valor);
          return {
            ...item,
            recursoId: valor,
            cantidad: recursoMeta?.esIndividual ? '1' : item.cantidad,
          };
        }
        return { ...item, cantidad: valor };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (esEstadoCerrado) return;

    setErroresCampos({});
    setErroresFilasRecursos({});
    setErrorGeneral(null);

    const snapshot = snapshotInicialRef.current;
    const payload: EditarOperativoRecuperacionInput = {};
    const nuevosErrores: Record<string, string> = {};
    const nuevosErroresFilas: Record<number, string> = {};

    const descInicial = snapshot?.descripcion ?? (operativo.descripcion ?? '').trim();
    const descActual = descripcion.trim();
    if (descActual !== descInicial) {
      payload.descripcion = descActual === '' ? null : descActual;
    }

    const fechaInicial = snapshot?.fechaEstimadaFin ?? isoToDatetimeLocal(operativo.fechaEstimadaFin);
    if (fechaEstimadaFin !== fechaInicial) {
      if (fechaEstimadaFin === '') {
        payload.fechaEstimadaFin = null;
      } else {
        const fechaDate = new Date(fechaEstimadaFin);
        const creadoDate = new Date(operativo.creadoEn);
        if (Number.isNaN(fechaDate.getTime())) {
          nuevosErrores.fechaEstimadaFin = 'La fecha estimada de término no es válida.';
        } else if (fechaDate.getTime() < creadoDate.getTime()) {
          nuevosErrores.fechaEstimadaFin =
            'La fecha estimada de término no puede ser anterior a la fecha de creación del operativo.';
        } else {
          payload.fechaEstimadaFin = fechaDate.toISOString();
        }
      }
    }

    const patrullaInicial = snapshot?.patrullaId ?? (operativo.patrulla?.id ?? '');
    if (patrullaId && patrullaId !== patrullaInicial) {
      payload.patrullaId = patrullaId;
    }

    const recursosActualesNormalizados: Array<{ recursoId: string; cantidad: number }> = [];
    const vistos = new Set<string>();

    filasRecursos.forEach((fila, idx) => {
      if (!fila.recursoId) {
        nuevosErroresFilas[idx] = 'Debe seleccionar un recurso.';
        return;
      }
      if (vistos.has(fila.recursoId)) {
        nuevosErroresFilas[idx] = 'Este recurso ya fue agregado en otra fila.';
        return;
      }
      const cantidadStr = fila.cantidad.trim();
      if (!/^\d+$/.test(cantidadStr)) {
        nuevosErroresFilas[idx] = 'La cantidad debe ser un número entero mayor o igual a 1.';
        return;
      }
      const cantidadNum = Number(cantidadStr);
      if (!Number.isSafeInteger(cantidadNum) || cantidadNum < 1) {
        nuevosErroresFilas[idx] = 'La cantidad debe ser un número entero mayor o igual a 1.';
        return;
      }
      const recursoMeta = inventarioMap.get(fila.recursoId);
      if (recursoMeta?.esIndividual && cantidadNum !== 1) {
        nuevosErroresFilas[idx] = 'Los activos individuales solo admiten cantidad 1.';
        return;
      }
      vistos.add(fila.recursoId);
      recursosActualesNormalizados.push({
        recursoId: fila.recursoId,
        cantidad: cantidadNum,
      });
    });

    if (Object.keys(nuevosErroresFilas).length > 0) {
      nuevosErrores.recursos = 'Revise las filas de recursos marcadas con error.';
    } else {
      const recursosIniciales =
        snapshot?.recursos ??
        (operativo.recursos ?? []).map((r) => ({
          recursoId: r.recursoId,
          cantidad: r.cantidadAsignada,
        }));
      if (
        normalizarRecursosParaComparacion(recursosActualesNormalizados) !==
        normalizarRecursosParaComparacion(recursosIniciales)
      ) {
        payload.recursos = recursosActualesNormalizados;
      }
    }

    if (Object.keys(nuevosErrores).length > 0 || Object.keys(nuevosErroresFilas).length > 0) {
      setErroresCampos(nuevosErrores);
      setErroresFilasRecursos(nuevosErroresFilas);
      return;
    }

    const validacion = editarOperativoRecuperacionSchema.safeParse(payload);
    if (!validacion.success) {
      const fieldErrs: Record<string, string> = {};
      let msgGeneral: string | null = null;
      for (const issue of validacion.error.issues) {
        const pathKey = issue.path[0] ? String(issue.path[0]) : '';
        if (pathKey && !fieldErrs[pathKey]) {
          fieldErrs[pathKey] = issue.message;
        } else if (!msgGeneral) {
          msgGeneral = issue.message;
        }
      }
      setErroresCampos(fieldErrs);
      if (msgGeneral) setErrorGeneral(msgGeneral);
      return;
    }

    setIsSubmitting(true);
    try {
      const respuesta = await editarOperativoRecuperacion(
        operativo.id,
        validacion.data as EditarOperativoRecuperacionInput,
        userId
      );
      toast?.showSuccess(
        respuesta.message || 'Planificación del operativo actualizada correctamente.'
      );
      onSuccess(respuesta.data);
      onClose();
    } catch (err: unknown) {
      if (err instanceof RecuperacionServiceError) {
        if (err.tipoConflicto === 'ESTADO_BLOQUEADO') {
          setConflictoEstadoBloqueado(true);
        }
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          const mapeados: Record<string, string> = {};
          const filasErr: Record<number, string> = {};
          for (const [key, msg] of Object.entries(err.fieldErrors)) {
            const matchFila = /^recursos\.(\d+)\./.exec(key);
            if (matchFila) {
              const filaIdx = Number(matchFila[1]);
              filasErr[filaIdx] = msg;
              if (!mapeados.recursos) mapeados.recursos = msg;
            } else {
              mapeados[key] = msg;
            }
          }
          setErroresCampos(mapeados);
          setErroresFilasRecursos(filasErr);
        }
        setErrorGeneral(err.message);
        toast?.showError(err.message);
      } else {
        const fallback =
          err instanceof Error
            ? err.message
            : 'No fue posible actualizar la planificación del operativo.';
        setErrorGeneral(fallback);
        toast?.showError(fallback);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Editar Planificación del Operativo"
      onClose={isSubmitting ? () => {} : onClose}
      maxWidth="660px"
      actions={
        <div className={styles.actionsRow}>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-editar-operativo-recuperacion"
            variant="primary"
            size="md"
            disabled={isSubmitting || cargandoCatalogos || esEstadoCerrado}
          >
            {isSubmitting ? 'Guardando cambios...' : 'Guardar Planificación'}
          </Button>
        </div>
      }
    >
      <form
        id="form-editar-operativo-recuperacion"
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className={styles.metaBanner}>
          <span className={styles.metaCodigo}>{operativo.codigo}</span>
          <span className={styles.metaNombre}>{operativo.nombre}</span>
        </div>

        {esEstadoCerrado && (
          <InlineNotice variant="warning">
            Este operativo se encuentra en estado cerrado ({operativo.estado}). La edición de planificación está bloqueada.
          </InlineNotice>
        )}

        {avisoActualizacionRemota && !esEstadoCerrado && (
          <InlineNotice variant="info">
            Este operativo recibió una actualización externa mientras lo editabas. Tus cambios actuales en el formulario se conservan.
          </InlineNotice>
        )}

        {errorGeneral && (
          <InlineNotice variant="error">{errorGeneral}</InlineNotice>
        )}

        <Textarea
          label="Descripción de tareas e indicaciones"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Detalle las tareas operativas y sectores a cubrir..."
          rows={3}
          error={erroresCampos.descripcion}
          helperText="Mínimo 3 caracteres y máximo 1000. También actualiza la misión asociada."
          disabled={isSubmitting || esEstadoCerrado}
        />

        <div className={styles.section}>
          <div className={styles.sectionLabel}>
            <CalendarClock size={15} />
            <span>Fecha estimada de término</span>
          </div>
          <Input
            type="datetime-local"
            aria-label="Fecha estimada de término"
            value={fechaEstimadaFin}
            onChange={(e) => setFechaEstimadaFin(e.target.value)}
            error={erroresCampos.fechaEstimadaFin}
            helperText="Opcional. No puede ser anterior a la fecha de creación del operativo."
            disabled={isSubmitting || esEstadoCerrado}
          />
        </div>

        <div className={styles.section}>
          <div className={styles.sectionLabel}>
            <Truck size={15} />
            <span>Patrulla verificadora asignada</span>
          </div>
          <Select
            aria-label="Patrulla verificadora asignada"
            value={patrullaId}
            onChange={(e) => setPatrullaId(e.target.value)}
            options={opcionesPatrulla}
            error={erroresCampos.patrullaId}
            helperText="Si selecciona otra patrulla disponible, la patrulla actual quedará liberada automáticamente."
            disabled={isSubmitting || cargandoCatalogos || esEstadoCerrado}
          />
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>
              <Boxes size={15} />
              <span>Dotación de insumos y recursos ({filasRecursos.length})</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAgregarRecurso}
              disabled={isSubmitting || esEstadoCerrado}
            >
              <Plus size={14} style={{ marginRight: '4px' }} />
              <span>Agregar recurso</span>
            </Button>
          </div>
          <p className={styles.helperNote}>
            Al modificar esta lista se reemplaza la dotación completa del operativo y se ajusta el stock en bodega automáticamente.
          </p>

          <div className={styles.recursosList}>
            {filasRecursos.map((fila, idx) => {
              const recursoMeta = inventarioMap.get(fila.recursoId);
              const esIndividual = Boolean(recursoMeta?.esIndividual);
              return (
                <div key={fila.idTemporal}>
                  <div className={styles.recursoRow}>
                    <Select
                      label={idx === 0 ? 'Recurso / Insumo' : undefined}
                      aria-label={`Recurso fila ${idx + 1}`}
                      value={fila.recursoId}
                      onChange={(e) =>
                        handleCambiarRecurso(fila.idTemporal, 'recursoId', e.target.value)
                      }
                      options={opcionesRecursos}
                      disabled={isSubmitting || cargandoCatalogos || esEstadoCerrado}
                    />
                    <Input
                      label={idx === 0 ? 'Cantidad' : undefined}
                      aria-label={`Cantidad fila ${idx + 1}`}
                      type="number"
                      min={1}
                      max={esIndividual ? 1 : undefined}
                      step={1}
                      value={fila.cantidad}
                      onChange={(e) =>
                        handleCambiarRecurso(fila.idTemporal, 'cantidad', e.target.value)
                      }
                      disabled={isSubmitting || esEstadoCerrado || esIndividual}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Quitar recurso fila ${idx + 1}`}
                      onClick={() => handleEliminarRecurso(fila.idTemporal)}
                      disabled={isSubmitting || esEstadoCerrado}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                  {erroresFilasRecursos[idx] && (
                    <span className={styles.errorText} role="alert">
                      {erroresFilasRecursos[idx]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {erroresCampos.recursos && (
            <span className={styles.errorText} role="alert">
              {erroresCampos.recursos}
            </span>
          )}
        </div>
      </form>
    </Modal>
  );
};
