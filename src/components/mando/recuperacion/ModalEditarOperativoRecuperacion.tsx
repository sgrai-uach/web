'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  cantidad: number;
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
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let activo = true;

    queueMicrotask(() => {
      if (!activo) return;
      setDescripcion(operativo.descripcion ?? '');
      setFechaEstimadaFin(isoToDatetimeLocal(operativo.fechaEstimadaFin));
      setPatrullaId(operativo.patrulla?.id ?? '');
      setFilasRecursos(
        operativo.recursos.map((rec, idx) => ({
          idTemporal: `rec-init-${idx}-${rec.recursoId}`,
          recursoId: rec.recursoId,
          cantidad: rec.cantidadAsignada,
        }))
      );
      setErroresCampos({});
      setErrorGeneral(null);
      setCargandoCatalogos(true);
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
  }, [isOpen, operativo, userId]);

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

    return Array.from(mapa.values());
  }, [operativo.patrulla, patrullas]);

  const opcionesRecursos = useMemo(() => {
    const mapa = new Map<string, { value: string; label: string }>();

    for (const r of inventario) {
      const stock = r.cantidadDisponible ?? 0;
      mapa.set(r.id, {
        value: r.id,
        label: `${r.nombre} (Stock bodega: ${stock})`,
      });
    }

    for (const r of operativo.recursos) {
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
      { idTemporal: `rec-new-${Date.now()}-${Math.random()}`, recursoId: '', cantidad: 1 },
    ]);
  };

  const handleEliminarRecurso = (idTemporal: string) => {
    setFilasRecursos((prev) => prev.filter((item) => item.idTemporal !== idTemporal));
  };

  const handleCambiarRecurso = (
    idTemporal: string,
    campo: 'recursoId' | 'cantidad',
    valor: string | number
  ) => {
    setFilasRecursos((prev) =>
      prev.map((item) =>
        item.idTemporal === idTemporal ? { ...item, [campo]: valor } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroresCampos({});
    setErrorGeneral(null);

    const payload: EditarOperativoRecuperacionInput = {};
    const nuevosErrores: Record<string, string> = {};

    const descInicial = (operativo.descripcion ?? '').trim();
    const descActual = descripcion.trim();
    if (descActual !== descInicial) {
      payload.descripcion = descActual === '' ? null : descActual;
    }

    const fechaInicial = isoToDatetimeLocal(operativo.fechaEstimadaFin);
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

    const patrullaInicial = operativo.patrulla?.id ?? '';
    if (patrullaId && patrullaId !== patrullaInicial) {
      payload.patrullaId = patrullaId;
    }

    // Validar filas de recursos y verificar si hubo cambios respecto a la dotación inicial
    const recursosActualesNormalizados: Array<{ recursoId: string; cantidad: number }> = [];
    const vistos = new Set<string>();

    for (const fila of filasRecursos) {
      if (!fila.recursoId) {
        nuevosErrores.recursos = 'Debe seleccionar un recurso en todas las filas agregadas.';
        break;
      }
      if (vistos.has(fila.recursoId)) {
        nuevosErrores.recursos = 'No puede repetir el mismo recurso en múltiples filas.';
        break;
      }
      if (!Number.isInteger(fila.cantidad) || fila.cantidad < 1) {
        nuevosErrores.recursos = 'Todas las cantidades de recursos deben ser enteros mayores o iguales a 1.';
        break;
      }
      vistos.add(fila.recursoId);
      recursosActualesNormalizados.push({
        recursoId: fila.recursoId,
        cantidad: fila.cantidad,
      });
    }

    if (!nuevosErrores.recursos) {
      const recursosIniciales = operativo.recursos.map((r) => ({
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

    if (Object.keys(nuevosErrores).length > 0) {
      setErroresCampos(nuevosErrores);
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
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setErroresCampos(err.fieldErrors);
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
            disabled={isSubmitting || cargandoCatalogos}
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
          disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting || cargandoCatalogos}
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
              disabled={isSubmitting}
            >
              <Plus size={14} style={{ marginRight: '4px' }} />
              <span>Agregar recurso</span>
            </Button>
          </div>
          <p className={styles.helperNote}>
            Al modificar esta lista se reemplaza la dotación completa del operativo y se ajusta el stock en bodega automáticamente.
          </p>

          <div className={styles.recursosList}>
            {filasRecursos.map((fila, idx) => (
              <div key={fila.idTemporal} className={styles.recursoRow}>
                <Select
                  label={idx === 0 ? 'Recurso / Insumo' : undefined}
                  aria-label={`Recurso fila ${idx + 1}`}
                  value={fila.recursoId}
                  onChange={(e) =>
                    handleCambiarRecurso(fila.idTemporal, 'recursoId', e.target.value)
                  }
                  options={opcionesRecursos}
                  disabled={isSubmitting || cargandoCatalogos}
                />
                <Input
                  label={idx === 0 ? 'Cantidad' : undefined}
                  aria-label={`Cantidad fila ${idx + 1}`}
                  type="number"
                  min={1}
                  step={1}
                  value={fila.cantidad}
                  onChange={(e) =>
                    handleCambiarRecurso(
                      fila.idTemporal,
                      'cantidad',
                      Number.parseInt(e.target.value, 10) || 0
                    )
                  }
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Quitar recurso fila ${idx + 1}`}
                  onClick={() => handleEliminarRecurso(fila.idTemporal)}
                  disabled={isSubmitting}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            ))}
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
