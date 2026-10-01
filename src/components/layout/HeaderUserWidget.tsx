'use client';

import React from 'react';
import Link from 'next/link';
import { LogOut, LogIn, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './HeaderUserWidget.module.css';

export default function HeaderUserWidget() {
  const { usuario, estaAutenticado, logout, cargando } = useAuth();

  if (cargando) {
    return (
      <div className={styles.userWidget} aria-busy="true">
        <span className={styles.userName} style={{ opacity: 0.7 }}>
          Cargando sesión...
        </span>
      </div>
    );
  }

  if (!estaAutenticado || !usuario) {
    return (
      <div className={styles.userWidget}>
        <Link
          href="/login"
          className={styles.loginLink}
          title="Iniciar sesión institucional en SGRAI"
        >
          <LogIn size={14} />
          <span>Iniciar Sesión</span>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={styles.userWidget}
      role="region"
      aria-label="Información de sesión del usuario autenticado"
    >
      <div className={styles.userInfo}>
        <div className={styles.userNameRow}>
          <span className={styles.userIcon} title="Usuario autenticado">
            <UserCheck size={14} />
          </span>
          <span className={styles.userName} title={usuario.nombre}>
            {usuario.nombre}
          </span>
        </div>
        <div className={styles.userRoleRow}>
          <span className={styles.userRoleBadge}>{usuario.rolNombre}</span>
          {usuario.delegacionId && (
            <span className={styles.userDelegation}>&bull; Delegación</span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        className={styles.logoutBtn}
        title="Cerrar sesión institucional"
        aria-label="Cerrar sesión institucional"
      >
        <LogOut size={13} />
        <span>Salir</span>
      </button>
    </div>
  );
}
