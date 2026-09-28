'use client';

import React from 'react';
import styles from '@/styles/seguimiento.module.css';

export const SeguimientoSkeleton: React.FC = () => {
  return (
    <div
      className={styles.resultCard}
      role="status"
      aria-label="Cargando información del reporte..."
    >
      <div className={styles.cardHeader}>
        <div style={{ width: '40%' }}>
          <div className={styles.skeletonBox} style={{ height: '16px', width: '60%', marginBottom: '8px' }} />
          <div className={styles.skeletonBox} style={{ height: '32px', width: '90%' }} />
        </div>
        <div className={styles.skeletonBox} style={{ height: '36px', width: '120px' }} />
      </div>

      <div className={styles.skeletonBox} style={{ height: '70px', width: '100%', marginBottom: '1.5rem' }} />

      <div className={styles.detailsGrid}>
        <div className={styles.skeletonBox} style={{ height: '48px' }} />
        <div className={styles.skeletonBox} style={{ height: '48px' }} />
        <div className={styles.skeletonBox} style={{ height: '48px' }} />
        <div className={styles.skeletonBox} style={{ height: '48px' }} />
      </div>
    </div>
  );
};
