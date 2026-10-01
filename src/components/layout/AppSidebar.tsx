'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NAV_GROUPS, type NavItem } from './navItems';
import styles from './AppSidebar.module.css';

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function AppSidebar({
  collapsed,
  onToggleCollapse,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { usuario, tieneAlgunPermiso } = useAuth();

  const visibleGroups = React.useMemo(() => {
    return NAV_GROUPS.map((group) => {
      const filteredItems = group.items.filter((item) => {
        // 1. Módulos públicos o sin permisos requeridos: visibles para todos
        if (item.publico || !item.requiredPermissions || item.requiredPermissions.length === 0) {
          return true;
        }
        // 2. Administrador total: acceso irrestricto
        if (usuario?.rolCodigo === 'ADMIN') {
          return true;
        }
        // 3. Comprobar si el usuario posee al menos uno de los permisos requeridos
        return tieneAlgunPermiso(item.requiredPermissions);
      });

      return {
        ...group,
        items: filteredItems,
      };
    }).filter((group) => group.items.length > 0);
  }, [usuario, tieneAlgunPermiso]);

  const allVisibleItems = React.useMemo(
    () => visibleGroups.flatMap((g) => g.items),
    [visibleGroups]
  );

  const activeItemId = React.useMemo(() => {
    const matching = allVisibleItems.filter(
      (item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))
    );
    if (matching.length === 0) return null;
    return matching.sort((a, b) => b.href.length - a.href.length)[0].id;
  }, [allVisibleItems, pathname]);

  const isItemActive = (item: NavItem) => item.id === activeItemId;

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}
      aria-label="Navegación principal de módulos"
    >
      <div className={styles.header}>
        {!collapsed && (
          <Link href="/" className={styles.logoArea} title="Ir al Portal Principal">
            <span className={styles.logoText}>SGRAI</span>
            <span className={styles.logoDivider}>|</span>
            <span className={styles.logoSubtitle}>DGRD Valdivia</span>
          </Link>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={styles.toggleBtn}
          title={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className={styles.nav}>
        {visibleGroups.map((group) => (
          <div key={group.id} className={styles.group}>
            {!collapsed && (
              <div className={styles.groupTitle}>{group.title}</div>
            )}
            <div>
              {group.items.map((item) => {
                const active = isItemActive(item);
                const IconComponent = item.icon;

                if (item.disabled) {
                  return (
                    <div
                      key={item.id}
                      className={`${styles.itemLink} ${styles.itemDisabled}`}
                      title={`${item.label} (Próximamente disponible)`}
                    >
                      <span className={styles.iconWrapper}>
                        <IconComponent size={18} />
                      </span>
                      {!collapsed && (
                        <>
                          <span className={styles.label}>{item.label}</span>
                          {item.badge && <span className={styles.badge}>{item.badge}</span>}
                        </>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`${styles.itemLink} ${active ? styles.itemActive : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className={styles.iconWrapper}>
                      <IconComponent size={18} />
                    </span>
                    {!collapsed && (
                      <>
                        <span className={styles.label}>{item.label}</span>
                        {item.badge && <span className={styles.badge}>{item.badge}</span>}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        <Link
          href="/"
          className={styles.portalLink}
          title="Portal Principal — Inicio"
        >
          <Home size={17} className={styles.portalIcon} />
          {!collapsed && <span>Portal Principal</span>}
        </Link>
      </div>
    </aside>
  );
}
