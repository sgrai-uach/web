'use client';

import React from 'react';
import { RotateCw, UserCheck } from 'lucide-react';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import { useToast } from '@/components/ui/Toast';
import styles from './HeaderSessionWidget.module.css';

export default function HeaderSessionWidget() {
  const {
    usuarioActivo,
    cambiarUsuarioPorId,
    usuariosDisponibles,
    cargandoPermisos,
    refrescarPermisos,
    permisos,
  } = useSimulatedSession();
  const { showSuccess, showError } = useToast();

  const handleRefrescar = async () => {
    try {
      await refrescarPermisos();
      showSuccess(
        `Permisos sincronizados con éxito (${permisos.size} privilegios activos)`,
        usuarioActivo.rol
      );
    } catch {
      showError(
        'No se pudo sincronizar permisos con el servidor.',
        'Error de Sincronización'
      );
    }
  };

  return (
    <div
      className={styles.sessionWidget}
      role="region"
      aria-label="Sesión y simulación de usuario activo"
    >
      <span className={styles.userIcon} title="Usuario activo en plataforma">
        <UserCheck size={15} />
      </span>

      <span className={styles.selectorLabel}>Sesión:</span>

      <select
        id="global-session-select"
        value={usuarioActivo.id}
        onChange={(e) => cambiarUsuarioPorId(e.target.value)}
        className={styles.sessionSelect}
        aria-label="Seleccionar usuario para simular sesión en todo el sistema"
      >
        {usuariosDisponibles.map((usr) => (
          <option key={usr.id} value={usr.id}>
            {usr.nombre} ({usr.rol})
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleRefrescar}
        disabled={cargandoPermisos}
        className={`${styles.refreshButton} ${cargandoPermisos ? styles.spinning : ''}`}
        title="Sincronizar permisos del usuario desde el servidor"
        aria-label="Sincronizar permisos del usuario desde el servidor"
      >
        <RotateCw size={13} />
      </button>
    </div>
  );
}
