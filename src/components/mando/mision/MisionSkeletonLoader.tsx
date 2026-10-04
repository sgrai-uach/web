'use client';

import React from 'react';
import styles from '@/styles/mision-detalle.module.css';

export const MisionSkeletonLoader: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} data-testid="mision-skeleton-loader">
      {/* Top Banner Skeleton */}
      <div className={styles.skeletonBox} style={{ height: '50px', width: '100%' }} />

      {/* Main Grid Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        <div className={styles.skeletonBox} style={{ height: '140px' }} />
        <div className={styles.skeletonBox} style={{ height: '140px' }} />
      </div>

      {/* Timeline Skeleton */}
      <div className={styles.skeletonBox} style={{ height: '100px', width: '100%' }} />

      {/* Reports Skeleton */}
      <div className={styles.skeletonBox} style={{ height: '180px', width: '100%' }} />
    </div>
  );
};
