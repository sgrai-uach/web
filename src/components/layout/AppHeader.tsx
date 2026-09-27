'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import styles from './AppHeader.module.css';

export default function AppHeader() {
  const pathname = usePathname();

  const getSectionTitle = () => {
    if (pathname.startsWith('/admin/recursos/nuevo')) return 'Registro de Nuevo Recurso';
    if (pathname.startsWith('/admin/recursos')) return 'Inventario Logístico Municipal';
    if (pathname.startsWith('/admin/roles-permisos')) return 'Seguridad y Privilegios RBAC';
    if (pathname.startsWith('/callcenter')) return 'Centro Call Center — Recepción de Avisos';
    if (pathname.startsWith('/mando')) return 'Centro de Mando Operativo';
    if (pathname.startsWith('/dashboard')) return 'Dashboard Estratégico y Estadísticas';
    return 'Plataforma Operativa SGRAI';
  };

  return (
    <header className={styles.headerWrapper} role="banner">
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.sectionInfo}>
            <span className={styles.sectionTitle}>{getSectionTitle()}</span>
          </div>

          <div className={styles.orgBadge}>
            <span>DGRD &bull; Municipalidad de Valdivia</span>
          </div>
        </div>
      </div>
    </header>
  );
}
