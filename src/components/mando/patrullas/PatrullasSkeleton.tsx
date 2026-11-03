'use client';

import React from 'react';
import styles from './PanelPatrullas.module.css';

interface PatrullasSkeletonProps {
  cantidad?: number;
}

export const PatrullasSkeleton: React.FC<PatrullasSkeletonProps> = ({ cantidad = 4 }) => {
  return (
    <div className={styles.skeletonContainer} data-testid="patrullas-skeleton">
      {Array.from({ length: cantidad }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className={styles.skeletonBox} style={{ height: '20px', width: '60%' }} />
            <div className={styles.skeletonBox} style={{ height: '22px', width: '25%' }} />
          </div>
          <div className={styles.skeletonBox} style={{ height: '16px', width: '45%' }} />
          <div className={styles.skeletonBox} style={{ height: '16px', width: '80%' }} />
          <div className={styles.skeletonBox} style={{ height: '56px', width: '100%', marginTop: '8px' }} />
        </div>
      ))}
    </div>
  );
};
