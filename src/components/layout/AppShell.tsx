'use client';

import React from 'react';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import { useSidebarState } from '@/hooks/useSidebarState';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { collapsed, toggleCollapse } = useSidebarState();

  return (
    <div className={styles.shellContainer}>
      <AppSidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
      />

      <div className={styles.contentWrapper}>
        <AppHeader />
        <main className={styles.mainContent}>
          {children}
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
