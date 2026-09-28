'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';
import styles from './PageTitleCard.module.css';

export interface PageTitleCardProps {
  title: string;
  badge?: React.ReactNode;
  description?: string;
  actionSlot?: React.ReactNode;
  className?: string;
}

export const PageTitleCard: React.FC<PageTitleCardProps> = ({
  title,
  badge,
  description,
  actionSlot,
  className,
}) => {
  return (
    <div className={`${styles.card} ${className || ''}`.trim()}>
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <Heading as="h1" variant="h1" color="teal-dark" noMargin>
            {title}
          </Heading>
          {badge && (
            typeof badge === 'string' || typeof badge === 'number' ? (
              <span className={styles.badge}>{badge}</span>
            ) : (
              badge
            )
          )}
        </div>
        {description && <p className={styles.description}>{description}</p>}
      </div>

      {actionSlot && <div className={styles.actions}>{actionSlot}</div>}
    </div>
  );
};

export default PageTitleCard;
