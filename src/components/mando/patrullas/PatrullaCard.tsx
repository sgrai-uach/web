'use client';

import React from 'react';
import {
  ShieldCheck,
  Compass,
  ShieldAlert,
  Activity,
  Clock,
  XCircle,
  MapPin,
  UserCheck,
  Users,
  ExternalLink,
  AlertTriangle,
  Edit,
  Eye,
  Trash2,
} from 'lucide-react';
import type { PatrullaVerificadoraDTO, EstadoPatrullaEnum } from '@/types/patrullas';
import styles from './PanelPatrullas.module.css';

export interface PatrullaCardProps {
  patrulla: PatrullaVerificadoraDTO;
  onSelectMision?: (misionId: string) => void;
  onSelectIncidente?: (incidenteId: string) => void;
  onVerDetalle?: (patrulla: PatrullaVerificadoraDTO) => void;
  onEditar?: (patrulla: PatrullaVerificadoraDTO) => void;
  puedeEditar?: boolean;
  onDesactivar?: (patrulla: PatrullaVerificadoraDTO) => void;
  puedeDesactivar?: boolean;
}

const CONFIG_ESTADOS: Record<
  EstadoPatrullaEnum,
  {
    etiqueta: string;
    icono: React.ComponentType<{ size?: number; className?: string }>;
    classNameBadge: string;
  }
> = {
  DISPONIBLE: {
    etiqueta: 'Disponible',
    icono: ShieldCheck,
    classNameBadge: styles.badgeDISPONIBLE,
  },
  EN_VERIFICACION: {
    etiqueta: 'En Verificación',
    icono: Compass,
    classNameBadge: styles.badgeEN_VERIFICACION,
  },
  EN_PREVENCION: {
    etiqueta: 'En Prevención',
    icono: ShieldAlert,
    classNameBadge: styles.badgeEN_PREVENCION,
  },
  EN_RECUPERACION: {
    etiqueta: 'En Recuperación',
    icono: Activity,
    classNameBadge: styles.badgeEN_RECUPERACION,
  },
  EN_MISION: {
    etiqueta: 'En Misión',
    icono: Clock,
    classNameBadge: styles.badgeEN_MISION,
  },
  NO_DISPONIBLE: {
    etiqueta: 'No Disponible',
    icono: XCircle,
    classNameBadge: styles.badgeNO_DISPONIBLE,
  },
};

export const PatrullaCard: React.FC<PatrullaCardProps> = ({
  patrulla,
  onSelectMision,
  onSelectIncidente,
  onVerDetalle,
  onEditar,
  puedeEditar = true,
  onDesactivar,
  puedeDesactivar = false,
}) => {
  const configEstado = CONFIG_ESTADOS[patrulla.estado] || CONFIG_ESTADOS.NO_DISPONIBLE;
  const IconoEstado = configEstado.icono;
  const misionActiva = patrulla.misionActiva;
  const tieneMision = Boolean(misionActiva && patrulla.estado !== 'DISPONIBLE');
  const cantIntegrantes = patrulla.integrantes?.length || 0;
  const estaBloqueada = patrulla.estado === 'EN_VERIFICACION' || Boolean(patrulla.misionActiva);
  const mensajeBloqueo = 'No es posible editar la patrulla mientras se encuentre en verificación o en misión activa';
  const mensajeBloqueoDesactivar = 'No es posible desactivar la patrulla mientras se encuentre en verificación o en misión activa';

  return (
    <article
      className={styles.patrullaCard}
      data-testid={`patrulla-card-${patrulla.id}`}
      aria-label={`Patrulla ${patrulla.nombre} — Estado: ${configEstado.etiqueta}`}
    >
      {/* Header de la tarjeta */}
      <header className={styles.patrullaCardHeader}>
        <h4 className={styles.patrullaCardTitle}>
          <ShieldCheck size={18} color="var(--color-primary-teal, #1B6F7D)" aria-hidden="true" />
          <span>{patrulla.nombre}</span>
        </h4>
        <span
          className={`${styles.badgeEstado} ${configEstado.classNameBadge}`}
          data-testid={`badge-estado-${patrulla.estado.toLowerCase()}`}
        >
          <IconoEstado size={12} aria-hidden="true" />
          <span>{configEstado.etiqueta}</span>
        </span>
      </header>

      {/* Cuerpo con datos institucionales */}
      <div className={styles.patrullaCardBody}>
        {/* Delegación */}
        <div className={styles.metaRow}>
          <MapPin size={15} className={styles.metaIcon} aria-hidden="true" />
          <div>
            <span className={styles.metaLabel}>Delegación:</span>
            <span>{patrulla.delegacion?.nombre || 'Sin delegación asignada'}</span>
            {patrulla.delegacion?.codigo && (
              <span className={styles.metaSubtext}> ({patrulla.delegacion.codigo})</span>
            )}
          </div>
        </div>

        {/* Funcionario Líder */}
        <div className={styles.metaRow}>
          <UserCheck size={15} className={styles.metaIcon} aria-hidden="true" />
          <div>
            <span className={styles.metaLabel}>Líder:</span>
            <span>{patrulla.lider?.nombre || 'Sin funcionario líder asignado'}</span>
            {patrulla.lider?.rut && (
              <div className={styles.metaSubtext}>
                RUT: {patrulla.lider.rut} {patrulla.lider.telefono ? `· Tel: ${patrulla.lider.telefono}` : ''}
              </div>
            )}
          </div>
        </div>

        {/* Bloque de Misión Activa (si se encuentra atendiendo misión o verificación) */}
        {tieneMision && misionActiva && (
          <section className={styles.misionActivaBox} aria-label="Misión en curso">
            <div className={styles.misionActivaHeader}>
              <span>Misión en Curso</span>
              {misionActiva.prioridad && (
                <span style={{ color: 'var(--color-primary-teal-dark, #14505A)' }}>
                  {misionActiva.prioridad}
                </span>
              )}
            </div>

            <div className={styles.misionActivaTitulo}>
              {misionActiva.titulo || `Misión ${misionActiva.codigo}`}
            </div>

            <div className={styles.misionLinksRow}>
              {misionActiva.id && (
                <button
                  type="button"
                  className={styles.linkMision}
                  onClick={() => onSelectMision?.(misionActiva.id)}
                  title={`Ver detalle de la misión ${misionActiva.codigo}`}
                  data-testid={`link-mision-${misionActiva.codigo}`}
                >
                  <span>{misionActiva.codigo}</span>
                  <ExternalLink size={11} aria-hidden="true" />
                </button>
              )}

              {misionActiva.incidenteId && (
                <button
                  type="button"
                  className={styles.linkIncidente}
                  onClick={() => onSelectIncidente?.(misionActiva.incidenteId as string)}
                  title={`Ver detalle del incidente ${misionActiva.incidenteCodigo || ''}`}
                  data-testid={`link-incidente-${misionActiva.incidenteCodigo || 'inc'}`}
                >
                  <AlertTriangle size={11} color="var(--color-warning, #E65100)" aria-hidden="true" />
                  <span>{misionActiva.incidenteCodigo || 'Ver Incidente'}</span>
                  <ExternalLink size={11} aria-hidden="true" />
                </button>
              )}
            </div>

            {misionActiva.incidenteDireccion && (
              <div className={styles.metaSubtext} style={{ marginTop: '2px' }}>
                Lugar: {misionActiva.incidenteDireccion}
              </div>
            )}
          </section>
        )}

        {/* Dotación de integrantes */}
        <div className={styles.integrantesBox}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} color="var(--color-text-muted, #5F676E)" aria-hidden="true" />
            <span>
              Dotación: <strong>{cantIntegrantes}</strong> {cantIntegrantes === 1 ? 'funcionario' : 'funcionarios'}
            </span>
          </div>
          {patrulla.actualizadoEn && (
            <span style={{ fontSize: '11px' }}>
              Act. {new Date(patrulla.actualizadoEn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Acciones de la Tarjeta (Ver Detalle / Editar Patrulla / Desactivar) */}
        {(onVerDetalle || onEditar || (onDesactivar && puedeDesactivar)) && (
          <div className={styles.cardActionsRow} data-testid={`card-actions-${patrulla.id}`}>
            {onVerDetalle && (
              <button
                type="button"
                className={`${styles.btnCardAction} ${styles.btnCardActionSecondary}`}
                onClick={() => onVerDetalle(patrulla)}
                data-testid={`btn-ver-detalle-${patrulla.id}`}
                title="Ver ficha técnica completa de la patrulla"
              >
                <Eye size={13} aria-hidden="true" />
                <span>Ver Ficha</span>
              </button>
            )}

            {onEditar && puedeEditar && (
              <div
                title={estaBloqueada ? mensajeBloqueo : undefined}
                style={{ display: 'inline-block' }}
              >
                <button
                  type="button"
                  className={`${styles.btnCardAction} ${styles.btnCardActionPrimary}`}
                  disabled={estaBloqueada}
                  onClick={() => onEditar(patrulla)}
                  data-testid={`btn-editar-patrulla-${patrulla.id}`}
                  aria-label={estaBloqueada ? mensajeBloqueo : 'Editar Patrulla'}
                >
                  <Edit size={13} aria-hidden="true" />
                  <span>Editar</span>
                </button>
              </div>
            )}

            {onDesactivar && puedeDesactivar && (
              <div
                title={estaBloqueada ? mensajeBloqueoDesactivar : undefined}
                style={{ display: 'inline-block' }}
              >
                <button
                  type="button"
                  className={`${styles.btnCardAction} ${styles.btnCardActionDanger}`}
                  disabled={estaBloqueada}
                  onClick={() => onDesactivar(patrulla)}
                  data-testid={`btn-desactivar-patrulla-${patrulla.id}`}
                  aria-label={estaBloqueada ? mensajeBloqueoDesactivar : 'Desactivar Patrulla'}
                >
                  <Trash2 size={13} aria-hidden="true" />
                  <span>Desactivar</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
