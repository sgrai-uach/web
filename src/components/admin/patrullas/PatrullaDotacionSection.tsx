'use client';

import React from 'react';
import { Users, UserCheck, Shield, AlertTriangle } from 'lucide-react';
import type { EmpleadoUsuario } from '@/types/empleados';
import { obtenerNombreDelegacion } from '@/lib/utils/delegacionUtils';
import InlineNotice from '@/components/ui/InlineNotice';
import styles from './PatrullaForm.module.css';

export interface PatrullaResumenAsignacion {
  id: string;
  codigo?: string;
  nombre: string;
}

export interface PatrullaDotacionSectionProps {
  personalElegible: EmpleadoUsuario[];
  personalSeleccionadoIds: string[];
  usuarioLiderId: string;
  mapaPatrullasPorPersonal?: Record<string, PatrullaResumenAsignacion[]>;
  patrullaActualId?: string;
  errorPersonal?: string;
  cargando?: boolean;
  onTogglePersonal: (personalId: string, usuarioId: string) => void;
  onChangeLider: (usuarioId: string) => void;
}

export const PatrullaDotacionSection: React.FC<PatrullaDotacionSectionProps> = ({
  personalElegible,
  personalSeleccionadoIds,
  usuarioLiderId,
  mapaPatrullasPorPersonal = {},
  patrullaActualId,
  errorPersonal,
  cargando = false,
  onTogglePersonal,
  onChangeLider,
}) => {
  // Filtrar funcionarios que han sido seleccionados
  const integrantesSeleccionados = personalElegible.filter(
    (p) => p.personal_id && personalSeleccionadoIds.includes(p.personal_id)
  );

  // Identificar integrantes seleccionados que ya forman parte de otras patrullas
  const seleccionadosConOtrasPatrullas = integrantesSeleccionados
    .map((p) => {
      const patrullas = (mapaPatrullasPorPersonal[p.personal_id!] || []).filter(
        (pat) => pat.id !== patrullaActualId
      );
      return { empleado: p, patrullas };
    })
    .filter((item) => item.patrullas.length > 0);

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
        Los funcionarios ya asignados a otra patrulla pueden ser incorporados para labores compartidas.
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

              // Patrullas previas en las que participa (excluyendo la actual)
              const otrasPatrullas = (mapaPatrullasPorPersonal[personalId] || []).filter(
                (pat) => pat.id !== patrullaActualId
              );

              // Solo se bloquea si el funcionario se encuentra inactivo, con licencia o descanso
              const isInoperativo =
                p.estado_operativo === 'descanso' ||
                p.estado_operativo === 'licencia' ||
                p.estado_operativo === 'inactivo' ||
                p.usuario_activo === false;

              const isSeleccionable = !isInoperativo;

              const estadoTexto =
                p.estado_operativo === 'descanso'
                  ? 'En descanso'
                  : p.estado_operativo === 'licencia'
                  ? 'Licencia'
                  : p.estado_operativo === 'inactivo'
                  ? 'Inactivo'
                  : otrasPatrullas.length > 0 || p.estado_operativo === 'en_patrulla'
                  ? 'En patrulla'
                  : p.estado_operativo === 'en_mision'
                  ? 'En misión'
                  : 'Disponible';

              const delegacionLimpia = obtenerNombreDelegacion(
                p.delegacion_nombre || p.delegacion_codigo,
                'Sin delegación'
              );

              return (
                <div
                  key={personalId}
                  role="checkbox"
                  aria-checked={isSelected}
                  aria-disabled={!isSeleccionable}
                  tabIndex={isSeleccionable ? 0 : -1}
                  className={`${styles.personalCard} ${isSelected ? styles.personalCardSelected : ''} ${
                    !isSeleccionable ? styles.personalCardDisabled : ''
                  }`}
                  onClick={() => {
                    if (isSeleccionable) {
                      onTogglePersonal(personalId, p.usuario_id);
                    }
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === ' ' || e.key === 'Enter') && isSeleccionable) {
                      e.preventDefault();
                      onTogglePersonal(personalId, p.usuario_id);
                    }
                  }}
                >
                  <div className={styles.personalInfo}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={!isSeleccionable}
                      readOnly
                      tabIndex={-1}
                      aria-hidden="true"
                      style={{ cursor: isSeleccionable ? 'pointer' : 'not-allowed' }}
                    />
                    <div className={styles.personalDetails}>
                      <span className={styles.personalName}>
                        {p.nombres} {p.apellidos} {p.rut ? `(${p.rut})` : ''}
                      </span>
                      <span className={styles.personalMeta}>
                        {p.cargo || 'Evaluador de Terreno'} &bull; Delegación: {delegacionLimpia} &bull; Estado:{' '}
                        <span
                          style={{
                            fontWeight: 600,
                            color: isSeleccionable
                              ? otrasPatrullas.length > 0 || p.estado_operativo === 'en_patrulla'
                                ? 'var(--color-warning, #E65100)'
                                : 'var(--color-success, #2E7D32)'
                              : 'var(--color-danger, #D32F2F)',
                          }}
                        >
                          {estadoTexto}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {otrasPatrullas.length > 0 && (
                      <span
                        className={`${styles.personalBadge} ${styles.badgeAdvertencia}`}
                        title={`Asignado a: ${otrasPatrullas.map((pat) => pat.nombre).join(', ')}`}
                      >
                        <AlertTriangle size={12} style={{ marginRight: '4px' }} />
                        En: {otrasPatrullas.map((pat) => pat.codigo || pat.nombre).join(', ')}
                      </span>
                    )}
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

        {/* Advertencia si hay funcionarios seleccionados que ya pertenecen a otras patrullas */}
        {seleccionadosConOtrasPatrullas.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <InlineNotice variant="warning" title="Personal asignado a múltiples patrullas">
              {seleccionadosConOtrasPatrullas.map((item, idx) => (
                <div key={item.empleado.personal_id || idx} style={{ marginTop: idx > 0 ? '4px' : '0' }}>
                  <strong>{item.empleado.nombres} {item.empleado.apellidos}</strong> ya se encuentra asignado a la(s) patrulla(s):{' '}
                  <strong>{item.patrullas.map((pat) => `${pat.nombre}${pat.codigo ? ` (${pat.codigo})` : ''}`).join(', ')}</strong>.
                </div>
              ))}
            </InlineNotice>
          </div>
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
