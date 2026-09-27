'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
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

  const isItemActive = (item: NavItem) => {
    if (pathname === item.href) return true;
    if (item.href !== '/' && pathname.startsWith(item.href)) return true;
    return false;
  };

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
        {NAV_GROUPS.map((group) => (
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
