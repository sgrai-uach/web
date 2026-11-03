'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import InlineNotice from '@/components/ui/InlineNotice';
import { cuadrillasService } from '@/services/cuadrillasService';
import { misionesService } from '@/services/misionesService';
import type { IncidenteDetalle } from '@/services/incidentesService';
import type { CuadrillaItem } from '@/types/cuadrilla';
import type { PrioridadMision, DespacharCuadrillaResponse } from '@/types/misiones';
import { HardHat, AlertTriangle, Truck } from 'lucide-react';
import styles from './ModalAsignarCuadrilla.module.css';

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

  // Campos del formulario
  const [cuadrillaId, setCuadrillaId] = useState<string>('');
  const [prioridad, setPrioridad] = useState<PrioridadMision>('MEDIA');
  const [titulo, setTitulo] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');

  // Estados de envío y feedback
  const [enviando, setEnviando] = useState<boolean>(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);

  // 1. Detección de misión de verificación previa
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

  // 2. Validación crítica: El Encargado no puede asignar cuadrilla si la patrulla aún está verificando
  const verificacionPendiente = useMemo(() => {
    if (!misionVerificacion) return false;
    const estadosEnCurso = [
      'PLANIFICADA',
      'ASIGNADA',
      'DESPACHADA',
      'EN_CAMINO',
      'EN_SITIO',
      'EN_CURSO',
    ];
    return estadosEnCurso.includes((misionVerificacion.estado || '').toUpperCase());
  }, [misionVerificacion]);

  // Cargar cuadrillas disponibles y reiniciar campos al abrir
  useEffect(() => {
    if (!isOpen || !incidente) return;

    // Inicializar campos
    setPrioridad((incidente.prioridad as PrioridadMision) || 'MEDIA');
    setTitulo(`Atención táctica - ${incidente.codigo}`);
    setDescripcion('');
    setCuadrillaId('');
    setErrorApi(null);
    setErrorCargaCuadrillas(null);

    let isMounted = true;
    setCargandoCuadrillas(true);

    cuadrillasService.obtenerCuadrillas({ pagina: 1, limite: 100, estado: 'DISPONIBLE' })
      .then((res) => {
        if (!isMounted) return;
        setCuadrillasDisponibles(res.cuadrillas || []);
        setCargandoCuadrillas(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setErrorCargaCuadrillas('No se pudo cargar la dotación de cuadrillas disponibles.');
        setCargandoCuadrillas(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, incidente]);

  if (!isOpen || !incidente) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (verificacionPendiente) {
      setErrorApi(
        'No es posible despachar cuadrilla: la patrulla verificadora aún se encuentra en terreno evaluando el incidente.'
      );
      return;
    }

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
            <strong>Estado actual:</strong> {incidente.estado} | <strong>Prioridad:</strong> {incidente.prioridad}
          </div>
        </div>

        {/* Validación 1: Verificación técnica en curso (Bloqueante) */}
        {verificacionPendiente && (
          <div className={styles.patrullaBloqueadaCard} role="alert">
            <AlertTriangle size={18} aria-hidden="true" style={{ flexShrink: 0 }} />
            <div>
              <strong>Evaluación técnica en terreno en curso</strong>
              <div>
                La patrulla verificadora{' '}
                <strong>{patrullaAsignada?.nombre || 'asignada'}</strong> aún se encuentra evaluando el
                incidente (misión {misionVerificacion?.codigo}, estado:{' '}
                <em>{misionVerificacion?.estado}</em>).
              </div>
              <div style={{ marginTop: '4px', fontWeight: 600 }}>
                Según el protocolo ICS, debe esperar a que la patrulla concluya la verificación técnica antes
                de despachar cuadrillas pesadas.
              </div>
            </div>
          </div>
        )}

        {/* Alerta de error API */}
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
                disabled={verificacionPendiente || enviando}
                required
              >
                <option value="">-- Seleccionar cuadrilla operativa disponible --</option>
                {cuadrillasDisponibles.map((cuad) => (
                  <option key={cuad.id} value={cuad.id}>
                    {cuad.nombre} ({cuad.delegacion?.nombre || 'Valdivia'} -{' '}
                    {cuad.totalTrabajadores ?? 0} integrantes)
                  </option>
                ))}
              </Select>
            )}
            
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
              disabled={verificacionPendiente || enviando}
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
              disabled={verificacionPendiente || enviando}
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
              disabled={verificacionPendiente || enviando}
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
              verificacionPendiente ||
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
