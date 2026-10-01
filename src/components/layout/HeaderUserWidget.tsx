'use client';

import React from 'react';
import { LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
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
      <Button
        href="/login"
        variant="primary"
        size="sm"
        icon={<LogIn size={14} />}
        className={styles.loginBtn}
        title="Iniciar sesión en SGRAI"
      >
        Iniciar Sesión
      </Button>
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

      <Button
        type="button"
        onClick={logout}
        variant="ghost"
        size="sm"
        icon={<LogOut size={13} />}
        className={styles.logoutBtn}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
      >
        Salir
      </Button>
    </div>
  );
}
