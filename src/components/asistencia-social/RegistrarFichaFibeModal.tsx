'use client';

import React, { useState } from 'react';
import { AlertCircle, FileCheck2, MapPin } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/ui/Button';
import {
  registrarFichaFibe,
  AsistenciaSocialServiceError,
} from '@/services/asistenciaSocialService';
import {
  NIVELES_DANO_VIVIENDA_FIBE,
  registrarFichaFibeSchema,
  type EventoAsistenciaSocialItem,
  type NivelCompromisoViviendaSocial,
} from '@/types/asistenciaSocial';
import styles from './RegistrarFichaFibeModal.module.css';

interface RegistrarFichaFibeModalProps {
  isOpen: boolean;
  onClose: () => void;
  evento: EventoAsistenciaSocialItem | null;
  usuarioId?: string;
  onRegistrada: (eventoActualizado: EventoAsistenciaSocialItem) => void;
}

export default function RegistrarFichaFibeModal({
  isOpen,
  onClose,
  evento,
  usuarioId,
  onRegistrada,
}: RegistrarFichaFibeModalProps) {
  const nivelInicial =
    evento?.nivelDanoVivienda ??
    (evento?.detallesEvaluacion?.nivelCompromisoVivienda as
      | NivelCompromisoViviendaSocial
      | undefined) ??
    '';

  const [folioFibe, setFolioFibe] = useState(evento?.folioFibe ?? '');
  const [personasAfectadas, setPersonasAfectadas] = useState<string>(
    evento?.personasAfectadas !== undefined && evento?.personasAfectadas !== null
      ? String(evento.personasAfectadas)
      : '0'
  );
  const [nivelDanoVivienda, setNivelDanoVivienda] = useState<string>(nivelInicial || '');
  const [observacionesSociales, setObservacionesSociales] = useState<string>(
    evento?.observacionesFibe ?? ''
  );

  const [guardando, setGuardando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [erroresCampo, setErroresCampo] = useState<Record<string, string>>({});

  if (!isOpen || !evento) return null;

  const esEdicion = evento.estado === 'EN_EVALUACION_FIBE' && Boolean(evento.folioFibe);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorGeneral(null);
    setErroresCampo({});

    const personasNum =
      personasAfectadas.trim() === '' ? undefined : Number(personasAfectadas);

    const inputParse = {
      folioFibe,
      ...(personasNum !== undefined ? { personasAfectadas: personasNum } : {}),
      ...(nivelDanoVivienda ? { nivelDanoVivienda } : {}),
      observacionesSociales: observacionesSociales.trim() === '' ? null : observacionesSociales,
    };

    const validacion = registrarFichaFibeSchema.safeParse(inputParse);
    if (!validacion.success) {
      const nuevosErrores: Record<string, string> = {};
      validacion.error.issues.forEach((issue) => {
        const campo = String(issue.path[0] || '');
        if (campo && !nuevosErrores[campo]) {
          nuevosErrores[campo] = issue.message;
        }
      });
      setErroresCampo(nuevosErrores);
      setErrorGeneral('Revise los campos marcados antes de guardar la Ficha FIBE.');
      return;
    }

    setGuardando(true);
    try {
      const actualizado = await registrarFichaFibe(
        evento.id,
        {
          folioFibe: validacion.data.folioFibe,
          personasAfectadas: validacion.data.personasAfectadas,
          nivelDanoVivienda: validacion.data.nivelDanoVivienda,
          observacionesSociales: validacion.data.observacionesSociales,
        },
        usuarioId
      );
      onRegistrada(actualizado);
      onClose();
    } catch (err: unknown) {
      if (err instanceof AsistenciaSocialServiceError) {
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setErroresCampo(err.fieldErrors);
        }
        setErrorGeneral(err.message);
      } else {
        setErrorGeneral('Ocurrió un error inesperado al registrar la Ficha FIBE.');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={
        esEdicion
          ? `Editar Ficha FIBE — ${evento.codigo}`
          : `Registrar Ficha FIBE — ${evento.codigo}`
      }
      onClose={guardando ? () => {} : onClose}
      maxWidth="640px"
      actions={
        <div className={styles.actionsRow}>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={guardando}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-registrar-ficha-fibe"
            variant="primary"
            size="md"
            disabled={guardando}
            style={{
              backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
              color: 'var(--color-white, #FFFFFF)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FileCheck2 size={16} />
            <span>
              {guardando
                ? 'Guardando Ficha FIBE...'
                : esEdicion
                  ? 'Actualizar Ficha FIBE'
                  : 'Guardar Ficha FIBE'}
            </span>
          </Button>
        </div>
      }
    >
      <div className={styles.resumenEvento}>
        <div className={styles.resumenTop}>
          <span className={styles.codigoEvento}>{evento.codigo}</span>
          <span className={styles.estadoTag}>{evento.estado.replace(/_/g, ' ')}</span>
        </div>
        <div className={styles.direccionTexto}>
          <MapPin size={14} color="var(--color-primary-teal, #1B6F7D)" />
          <span>{evento.direccionTexto}</span>
        </div>
      </div>

      {errorGeneral && (
        <div role="alert" className={styles.alertaError}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{errorGeneral}</span>
        </div>
      )}

      <form id="form-registrar-ficha-fibe" onSubmit={handleSubmit} className={styles.formGrid} noValidate>
        <div className={styles.fieldGroup}>
          <label htmlFor="fibe-folio" className={styles.label}>
            Folio oficial de Ficha FIBE
            <span className={styles.requiredMark}>*</span>
          </label>
          <input
            id="fibe-folio"
            name="folioFibe"
            type="text"
            maxLength={50}
            placeholder="Ej. FIBE-2026-0001"
            value={folioFibe}
            onChange={(e) => {
              setFolioFibe(e.target.value.toUpperCase());
              if (erroresCampo.folioFibe) {
                setErroresCampo((prev) => {
                  const next = { ...prev };
                  delete next.folioFibe;
                  return next;
                });
              }
            }}
            disabled={guardando}
            className={`${styles.input} ${erroresCampo.folioFibe ? styles.inputError : ''}`}
            aria-invalid={Boolean(erroresCampo.folioFibe)}
            aria-describedby={erroresCampo.folioFibe ? 'fibe-folio-error' : 'fibe-folio-help'}
          />
          {erroresCampo.folioFibe ? (
            <span id="fibe-folio-error" role="alert" className={styles.fieldError}>
              {erroresCampo.folioFibe}
            </span>
          ) : (
            <span id="fibe-folio-help" className={styles.helperText}>
              Formato alfanumérico y guiones, sin espacios (máx. 50 caracteres). Debe ser único en el expediente DGRD.
            </span>
          )}
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label htmlFor="fibe-personas" className={styles.label}>
              Integrantes familiares evaluados
            </label>
            <input
              id="fibe-personas"
              name="personasAfectadas"
              type="number"
              min={0}
              step={1}
              value={personasAfectadas}
              onChange={(e) => setPersonasAfectadas(e.target.value)}
              disabled={guardando}
              className={`${styles.input} ${erroresCampo.personasAfectadas ? styles.inputError : ''}`}
              aria-invalid={Boolean(erroresCampo.personasAfectadas)}
            />
            {erroresCampo.personasAfectadas ? (
              <span role="alert" className={styles.fieldError}>
                {erroresCampo.personasAfectadas}
              </span>
            ) : (
              <span className={styles.helperText}>
                Precargado con el catastro preliminar del caso social.
              </span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="fibe-nivel-dano" className={styles.label}>
              Nivel de daño en vivienda
            </label>
            <select
              id="fibe-nivel-dano"
              name="nivelDanoVivienda"
              value={nivelDanoVivienda}
              onChange={(e) => setNivelDanoVivienda(e.target.value)}
              disabled={guardando}
              className={`${styles.select} ${erroresCampo.nivelDanoVivienda ? styles.inputError : ''}`}
              aria-invalid={Boolean(erroresCampo.nivelDanoVivienda)}
            >
              <option value="">Seleccione nivel de daño...</option>
              {NIVELES_DANO_VIVIENDA_FIBE.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {erroresCampo.nivelDanoVivienda && (
              <span role="alert" className={styles.fieldError}>
                {erroresCampo.nivelDanoVivienda}
              </span>
            )}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="fibe-observaciones" className={styles.label}>
            Observaciones sociales de la emergencia
          </label>
          <textarea
            id="fibe-observaciones"
            name="observacionesSociales"
            maxLength={2000}
            placeholder="Registre antecedentes sociales relevantes levantados en terreno..."
            value={observacionesSociales}
            onChange={(e) => setObservacionesSociales(e.target.value)}
            disabled={guardando}
            className={`${styles.textarea} ${erroresCampo.observacionesSociales ? styles.inputError : ''}`}
            aria-invalid={Boolean(erroresCampo.observacionesSociales)}
          />
          <div className={styles.observacionesFooter}>
            {erroresCampo.observacionesSociales ? (
              <span role="alert" className={styles.fieldError}>
                {erroresCampo.observacionesSociales}
              </span>
            ) : (
              <span className={styles.helperText}>
                Opcional. Información oficial para el expediente DGRD.
              </span>
            )}
            <span className={styles.helperText}>{observacionesSociales.length}/2000</span>
          </div>
        </div>
      </form>
    </Modal>
  );
}
