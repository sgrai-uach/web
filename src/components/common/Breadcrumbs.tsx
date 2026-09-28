'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Breadcrumbs.module.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Ruta de navegación" className={`${styles.nav} ${className || ''}`.trim()}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {index > 0 && (
              <span className={styles.separator} aria-hidden="true">
                &rsaquo;
              </span>
            )}
            {isLast ? (
              <span className={styles.current} aria-current="page">
                {item.label}
              </span>
            ) : item.href ? (
              <Link href={item.href} className={styles.link}>
                {item.label}
              </Link>
            ) : (
              <span className={styles.item}>{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
