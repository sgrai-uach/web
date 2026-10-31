'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { obtenerNombreDelegacion } from '@/lib/utils/delegacionUtils';
import styles from './HeaderUserWidget.module.css';

const emptySubscribe = () => () => {};

export default function HeaderUserWidget() {
  const pathname = usePathname();
  const { usuario, estaAutenticado, logout, cargando } = useAuth();
  const isClient = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (pathname === '/login' || pathname?.startsWith('/login')) {
    return null;
  }

  if (!isClient || cargando) {
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
          {(usuario.delegacionNombre || usuario.delegacionId) && (
            <span className={styles.userDelegation}>
              &bull; {usuario.delegacionNombre || obtenerNombreDelegacion(usuario.delegacionId)}
            </span>
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
