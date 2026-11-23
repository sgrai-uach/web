'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';

interface DrawerSectionHeaderProps {
  icono: React.ReactNode;
  titulo: string;
  acciones?: React.ReactNode;
}

export const DrawerSectionHeader: React.FC<DrawerSectionHeaderProps> = ({
  icono,
  titulo,
  acciones,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        marginBottom: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: 'var(--color-primary-teal, #1B6F7D)',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          {icono}
        </span>
        <Heading as="h3" variant="h4" color="teal" noMargin>
          {titulo}
        </Heading>
      </div>
      {acciones && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{acciones}</div>}
    </div>
  );
};

export default DrawerSectionHeader;

