'use client';

import React from 'react';
import { Users, UserCheck, Shield } from 'lucide-react';
import type { EmpleadoUsuario } from '@/types/empleados';
import styles from './PatrullaForm.module.css';

interface PatrullaDotacionSectionProps {
  personalElegible: EmpleadoUsuario[];
  personalSeleccionadoIds: string[];
  usuarioLiderId: string;
  errorPersonal?: string;
  cargando?: boolean;
  onTogglePersonal: (personalId: string, usuarioId: string) => void;
  onChangeLider: (usuarioId: string) => void;
}

export const PatrullaDotacionSection: React.FC<PatrullaDotacionSectionProps> = ({
  personalElegible,
  personalSeleccionadoIds,
  usuarioLiderId,
  errorPersonal,
  cargando = false,
  onTogglePersonal,
  onChangeLider,
}) => {
  // Filtrar funcionarios que han sido seleccionados
  const integrantesSeleccionados = personalElegible.filter(
    (p) => p.personal_id && personalSeleccionadoIds.includes(p.personal_id)
  );

  return (
    <section className={styles.section} aria-labelledby="seccion-dotacion">
      <div className={styles.sectionHeader}>
        <Users size={20} color="var(--color-primary-teal, #1B6F7D)" aria-hidden="true" />
        <h2 id="seccion-dotacion" className={styles.sectionTitle}>
          Dotación y Personal Asignado
        </h2>
      </div>
      <p className={styles.sectionDescription}>
        Seleccione los funcionarios que integrarán la patrulla verificadora. Solo se habilitan
        usuarios activos con ficha operativa habilitados para funciones de <strong>Patrulla Verificadora</strong>.
      </p>

      {/* Lista interactiva de funcionarios */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Selección de Integrantes
          <span className={styles.requiredMark} aria-hidden="true">
            *
          </span>
          <span style={{ fontWeight: 400, color: 'var(--color-text-muted, #5F676E)' }}>
            ({personalSeleccionadoIds.length} seleccionados)
          </span>
        </label>

        {cargando ? (
          <div style={{ padding: '16px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Cargando personal disponible...
          </div>
        ) : personalElegible.length === 0 ? (
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--color-bg-light, #ECEFF3)',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              fontSize: '13px',
              color: 'var(--color-charcoal, #3B3F45)',
            }}
          >
            No se encontraron funcionarios activos con rol de <strong>Patrulla Verificadora</strong>{' '}
            en el sistema. Para crear una patrulla, primero debe registrar o asignar dicha función en el
            módulo de Gestión de Personal.
          </div>
        ) : (
          <div className={styles.personalList} role="group" aria-label="Lista de funcionarios elegibles">
            {personalElegible.map((p) => {
              const personalId = p.personal_id!;
              const isSelected = personalSeleccionadoIds.includes(personalId);
              const isLider = usuarioLiderId === p.usuario_id;
              const isDisponible = !p.estado_operativo || p.estado_operativo === 'disponible';
              const estadoTexto =
                p.estado_operativo === 'en_patrulla'
                  ? 'En patrulla'
                  : p.estado_operativo === 'en_mision'
                  ? 'En misión'
                  : p.estado_operativo === 'descanso'
                  ? 'En descanso'
                  : p.estado_operativo === 'licencia'
                  ? 'Licencia'
                  : p.estado_operativo === 'inactivo'
                  ? 'Inactivo'
                  : 'Disponible';

              return (
                <div
                  key={personalId}
                  role="checkbox"
                  aria-checked={isSelected}
                  aria-disabled={!isDisponible}
                  tabIndex={isDisponible ? 0 : -1}
                  className={`${styles.personalCard} ${isSelected ? styles.personalCardSelected : ''} ${
                    !isDisponible ? styles.personalCardDisabled : ''
                  }`}
                  onClick={() => {
                    if (isDisponible) {
                      onTogglePersonal(personalId, p.usuario_id);
                    }
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === ' ' || e.key === 'Enter') && isDisponible) {
                      e.preventDefault();
                      onTogglePersonal(personalId, p.usuario_id);
                    }
                  }}
                >
                  <div className={styles.personalInfo}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={!isDisponible}
                      readOnly
                      tabIndex={-1}
                      aria-hidden="true"
                      style={{ cursor: isDisponible ? 'pointer' : 'not-allowed' }}
                    />
                    <div className={styles.personalDetails}>
                      <span className={styles.personalName}>
                        {p.nombres} {p.apellidos} {p.rut ? `(${p.rut})` : ''}
                      </span>
                      <span className={styles.personalMeta}>
                        {p.cargo || 'Evaluador de Terreno'} &bull; Delegación:{' '}
                        {p.delegacion_nombre || 'Sin delegación'} &bull; Estado:{' '}
                        <span
                          style={{
                            fontWeight: 600,
                            color: isDisponible
                              ? 'var(--color-success, #2E7D32)'
                              : 'var(--color-warning, #E65100)',
                          }}
                        >
                          {estadoTexto}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {isSelected && isLider && (
                      <span className={`${styles.personalBadge} ${styles.badgeLider}`}>
                        <Shield size={12} style={{ marginRight: '4px' }} /> Líder
                      </span>
                    )}
                    {isSelected && !isLider && (
                      <span className={`${styles.personalBadge} ${styles.badgeOperativo}`}>
                        <UserCheck size={12} style={{ marginRight: '4px' }} /> Integrante
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {errorPersonal && (
          <span className={styles.errorText} role="alert">
            {errorPersonal}
          </span>
        )}
      </div>

      {/* Selector de Líder de Patrulla */}
      {integrantesSeleccionados.length > 0 && (
        <div className={styles.fieldGrid} style={{ marginTop: '12px' }}>
          <div className={styles.fieldGroup}>
            <label htmlFor="patrulla-lider" className={styles.fieldLabel}>
              Funcionario Líder Responsable
            </label>
            <select
              id="patrulla-lider"
              value={usuarioLiderId}
              onChange={(e) => onChangeLider(e.target.value)}
              className={styles.selectField}
              aria-describedby="help-patrulla-lider"
            >
              {integrantesSeleccionados.map((m) => (
                <option key={m.usuario_id} value={m.usuario_id}>
                  {m.nombres} {m.apellidos} {m.rut ? `(${m.rut})` : ''}
                </option>
              ))}
            </select>
            <span id="help-patrulla-lider" className={styles.helperText}>
              Funcionario a cargo de la comunicación táctica con el Centro de Mando. Por defecto se
              asigna al primer integrante seleccionado.
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

export default PatrullaDotacionSection;
