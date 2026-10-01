'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import HeaderUserWidget from './HeaderUserWidget';
import styles from './AppHeader.module.css';

export default function AppHeader() {
  const pathname = usePathname();

  const getSectionTitle = () => {
    if (pathname.startsWith('/admin/recursos/nuevo')) return 'Registro de Nuevo Recurso';
    if (pathname.startsWith('/admin/recursos')) return 'Inventario Logístico';
    if (pathname.startsWith('/admin/roles-permisos')) return 'Roles y Permisos';
    if (pathname.startsWith('/admin/empleados')) return 'Gestión de Personal';
    if (pathname.startsWith('/callcenter/manual')) return 'Ingreso Manual';
    if (pathname.startsWith('/callcenter')) return 'Bandeja de Avisos';
    if (pathname.startsWith('/centro-incidentes')) return 'Centro de Mando';
    if (pathname.startsWith('/dashboard')) return 'Dashboard y Reportes';
    return 'Plataforma Operativa SGRAI';
  };

  return (
    <header className={styles.headerWrapper} role="banner">
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.sectionInfo}>
            <span className={styles.sectionTitle}>{getSectionTitle()}</span>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.orgBadge}>
              <span>DGRD &bull; Municipalidad de Valdivia</span>
            </div>
            <HeaderUserWidget />
          </div>
        </div>
      </div>
    </header>
  );
}
