'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, ClipboardCheck, PackageCheck } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import InlineNotice from '@/components/ui/InlineNotice';
import { useOptionalToast } from '@/components/ui/Toast';
import {
  cerrarOperativoRecuperacion,
  RecuperacionServiceError,
} from '@/services/recuperacionService';
import { cerrarOperativoRecuperacionSchema } from '@/lib/validations/recuperacion';
import type {
  CerrarOperativoRecuperacionData,
  CerrarOperativoRecuperacionInput,
  ConsumoRecursoCierreItem,
  OperativoRecuperacionDetalle,
} from '@/types/recuperacion';
import styles from './ModalCerrarOperativoRecuperacion.module.css';

export interface ModalCerrarOperativoRecuperacionProps {
  isOpen: boolean;
  operativo: OperativoRecuperacionDetalle;
  onClose: () => void;
  onSuccess: (resultado: CerrarOperativoRecuperacionData) => void;
  userId?: string;
}

function construirConsumosIniciales(
  operativo: OperativoRecuperacionDetalle
): Record<string, number> {
  const iniciales: Record<string, number> = {};
  const reportados = new Map(
    (operativo.reportePatrulla?.consumos ?? []).map((c) => [
      c.recursoId,
      c.cantidadConsumida,
    ])
  );
  for (const rec of operativo.recursos ?? []) {
    iniciales[rec.recursoId] = reportados.get(rec.recursoId) ?? rec.cantidadAsignada;
  }
  return iniciales;
}

export const ModalCerrarOperativoRecuperacion: React.FC<
  ModalCerrarOperativoRecuperacionProps
> = ({ isOpen, operativo, onClose, onSuccess, userId }) => {
  const toast = useOptionalToast();

  const [resumenCierre, setResumenCierre] = useState<string>(
    () => operativo.reportePatrulla?.resumen ?? ''
  );
  const [consumosPorRecurso, setConsumosPorRecurso] = useState<Record<string, number>>(
    () => construirConsumosIniciales(operativo)
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [erroresCampos, setErroresCampos] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const prevStateRef = useRef<{ isOpen: boolean; id: string }>({
    isOpen,
    id: operativo.id,
  });

  useEffect(() => {
    const prev = prevStateRef.current;
    const debeReiniciar =
      isOpen && (!prev.isOpen || prev.id !== operativo.id);
    prevStateRef.current = { isOpen, id: operativo.id };

    if (!debeReiniciar) return;

    setResumenCierre(operativo.reportePatrulla?.resumen ?? '');
    setConsumosPorRecurso(construirConsumosIniciales(operativo));
    setErroresCampos({});
    setErrorGeneral(null);
  }, [isOpen, operativo]);

  const resumenTotales = useMemo(() => {
    let asignado = 0;
    let consumido = 0;
    let devuelto = 0;

    for (const rec of operativo.recursos ?? []) {
      const c = consumosPorRecurso[rec.recursoId] ?? rec.cantidadAsignada;
      const cValido = Number.isFinite(c) ? Math.max(0, Math.min(rec.cantidadAsignada, c)) : 0;
      asignado += rec.cantidadAsignada;
      consumido += cValido;
      devuelto += Math.max(0, rec.cantidadAsignada - cValido);
    }

    return { asignado, consumido, devuelto };
  }, [operativo.recursos, consumosPorRecurso]);

  const handleChangeConsumo = (recursoId: string, valorRaw: string) => {
    const parsed = valorRaw === '' ? 0 : Number.parseInt(valorRaw, 10);
    setConsumosPorRecurso((prev) => ({
      ...prev,
      [recursoId]: Number.isNaN(parsed) ? 0 : parsed,
    }));
    setErroresCampos((prev) => {
      if (!prev[`consumo_${recursoId}`]) return prev;
      const copia = { ...prev };
      delete copia[`consumo_${recursoId}`];
      return copia;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroresCampos({});
    setErrorGeneral(null);

    const nuevosErrores: Record<string, string> = {};
    const consumosPayload: ConsumoRecursoCierreItem[] = [];

    for (const rec of operativo.recursos ?? []) {
      const cantidadConsumida = consumosPorRecurso[rec.recursoId] ?? rec.cantidadAsignada;
      if (!Number.isInteger(cantidadConsumida) || cantidadConsumida < 0) {
        nuevosErrores[`consumo_${rec.recursoId}`] =
          'La cantidad consumida debe ser un entero mayor o igual a 0.';
      } else if (cantidadConsumida > rec.cantidadAsignada) {
        nuevosErrores[`consumo_${rec.recursoId}`] =
          `No puede superar las ${rec.cantidadAsignada} unidades asignadas.`;
      } else {
        consumosPayload.push({
          recursoId: rec.recursoId,
          cantidadConsumida,
        });
      }
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErroresCampos(nuevosErrores);
      return;
    }

    const payload: CerrarOperativoRecuperacionInput = {
      resumenCierre: resumenCierre.trim(),
      consumos: consumosPayload,
    };

    const validacion = cerrarOperativoRecuperacionSchema.safeParse(payload);
    if (!validacion.success) {
      const fieldErrs: Record<string, string> = {};
      for (const issue of validacion.error.issues) {
        const pathKey = issue.path[0] ? String(issue.path[0]) : 'general';
        if (!fieldErrs[pathKey]) {
          fieldErrs[pathKey] = issue.message;
        }
      }
      setErroresCampos(fieldErrs);
      if (fieldErrs.general) {
        setErrorGeneral(fieldErrs.general);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO(HU-32): Cuando se integre HU-32, contemplar reservas con cantidad_en_uso además del descuento directo de H74.
      const respuesta = await cerrarOperativoRecuperacion(
        operativo.id,
        validacion.data,
        userId
      );

      const totalDevuelto = respuesta.data.recursosReintegrados.reduce(
        (acc, item) => acc + item.cantidadDevuelta,
        0
      );

      const detallePatrulla = respuesta.data.patrullaLiberada
        ? ` Patrulla "${respuesta.data.patrullaLiberada.nombre}" liberada a DISPONIBLE.`
        : '';

      toast?.showSuccess(
        `Operativo ${operativo.codigo} declarado concluido. Se reintegraron ${totalDevuelto} unidades al inventario.${detallePatrulla}`,
        'Operativo Concluido'
      );

      onSuccess(respuesta.data);
      onClose();
    } catch (err: unknown) {
      if (err instanceof RecuperacionServiceError) {
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setErroresCampos(err.fieldErrors);
        }
        setErrorGeneral(err.message);
        toast?.showError(err.message, 'No se pudo concluir el operativo');
      } else {
        const msg =
          err instanceof Error
            ? err.message
            : 'Error inesperado al concluir el operativo de recuperación.';
        setErrorGeneral(msg);
        toast?.showError(msg, 'Error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Declarar Conclusión de Operativo"
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
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
            form="form-cerrar-operativo-recuperacion"
            variant="primary"
            size="md"
            disabled={isSubmitting}
          >
            <CheckCircle2 size={15} style={{ marginRight: '6px' }} />
            <span>
              {isSubmitting ? 'Concluyendo...' : 'Confirmar y Declarar Concluido'}
            </span>
          </Button>
        </div>
      }
    >
      <form
        id="form-cerrar-operativo-recuperacion"
        onSubmit={handleSubmit}
        className={styles.form}
        noValidate
      >
        <div className={styles.metaBanner}>
          <div className={styles.metaHeaderRow}>
            <span className={styles.metaCodigo}>{operativo.codigo}</span>
            <span className={styles.metaSector}>{operativo.sector}</span>
          </div>
          <span className={styles.metaNombre}>{operativo.nombre}</span>
          {operativo.patrulla && (
            <span className={styles.metaPatrulla}>
              Patrulla asignada: <strong>{operativo.patrulla.nombre}</strong> (se liberará a DISPONIBLE)
            </span>
          )}
        </div>

        {operativo.reportePatrulla ? (
          <InlineNotice variant="success">
            Datos precargados desde el reporte enviado por la patrulla en terreno. Confirma para concluir formalmente el operativo, reintegrar remanentes al inventario y liberar la patrulla.
          </InlineNotice>
        ) : (
          <InlineNotice variant="info">
            Al confirmar, el operativo pasará a estado <strong>Completada</strong>, la misión táctica quedará cerrada, la patrulla pasará a <strong>Disponible</strong> y los insumos no consumidos se reintegrarán automáticamente al inventario de bodega.
          </InlineNotice>
        )}

        {errorGeneral && <InlineNotice variant="error">{errorGeneral}</InlineNotice>}

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>
              <ClipboardCheck size={15} />
              <span>Resumen formal de cierre</span>
            </div>
            <span className={styles.charCounter}>
              {resumenCierre.trim().length} / 2000 caracteres
            </span>
          </div>
          <Textarea
            id="resumen-cierre-operativo"
            aria-label="Resumen formal de cierre"
            required
            rows={4}
            maxLength={2000}
            value={resumenCierre}
            onChange={(e) => setResumenCierre(e.target.value)}
            placeholder="Describe las ayudas entregadas, familias atendidas o labores de rehabilitación realizadas en el sector (mínimo 10 caracteres)..."
            error={erroresCampos.resumenCierre}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>
              <PackageCheck size={15} />
              <span>
                Balance de consumo y devolución de insumos ({(operativo.recursos ?? []).length})
              </span>
            </div>
          </div>
          <p className={styles.helperNote}>
            Indica cuántas unidades se consumieron en terreno. La diferencia respecto a lo asignado se devolverá automáticamente al inventario disponible.
          </p>

          {(operativo.recursos ?? []).length === 0 ? (
            <p className={styles.helperNote}>
              Este operativo no registra insumos asignados.
            </p>
          ) : (
            <>
              <div className={styles.tableWrapper}>
                <table className={styles.consumosTable}>
                  <thead>
                    <tr>
                      <th>Insumo / Recurso</th>
                      <th>Asignado</th>
                      <th>Consumido</th>
                      <th>A devolver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(operativo.recursos ?? []).map((rec) => {
                      const consumido =
                        consumosPorRecurso[rec.recursoId] ?? rec.cantidadAsignada;
                      const devuelto = Math.max(0, rec.cantidadAsignada - consumido);
                      const errorFila = erroresCampos[`consumo_${rec.recursoId}`];

                      return (
                        <tr key={rec.recursoId}>
                          <td>
                            <div>{rec.nombre}</div>
                            {errorFila && (
                              <span className={styles.errorText} role="alert">
                                {errorFila}
                              </span>
                            )}
                          </td>
                          <td>{rec.cantidadAsignada}</td>
                          <td style={{ width: '120px' }}>
                            <Input
                              aria-label={`Cantidad consumida de ${rec.nombre}`}
                              type="number"
                              min={0}
                              max={rec.cantidadAsignada}
                              step={1}
                              value={consumido}
                              onChange={(e) =>
                                handleChangeConsumo(rec.recursoId, e.target.value)
                              }
                              disabled={isSubmitting}
                            />
                          </td>
                          <td>
                            <span
                              className={`${styles.devolverBadge} ${
                                devuelto === 0 ? styles.devolverBadgeZero : ''
                              }`}
                            >
                              {devuelto} un.
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className={styles.summaryBar}>
                <span>
                  Total asignado: <strong>{resumenTotales.asignado}</strong> un.
                </span>
                <span>
                  Consumido: <strong>{resumenTotales.consumido}</strong> un.
                </span>
                <span>
                  A reintegrar a bodega: <strong>{resumenTotales.devuelto}</strong> un.
                </span>
              </div>
            </>
          )}
        </div>
      </form>
    </Modal>
  );
};
