'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

export interface ActionLink {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary';
}

interface HomeModuleCardProps {
  roleBadge: string;
  title: string;
  description: string;
  badgeAccent?: string;
  actions: ActionLink[];
}

export default function HomeModuleCard({
  roleBadge,
  title,
  description,
  badgeAccent = 'var(--color-primary-teal, #1B6F7D)',
  actions,
}: HomeModuleCardProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)',
        borderTop: `4px solid ${badgeAccent}`,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
      }}
    >
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: badgeAccent, textTransform: 'uppercase', marginBottom: '8px' }}>
          {roleBadge}
        </div>
        <Heading as="h3" variant="h3" color="charcoal-dark" style={{ marginBottom: '6px' }}>
          {title}
        </Heading>
        <p style={{ fontSize: '13px', color: 'var(--color-charcoal, #3B3F45)', margin: 0 }}>
          {description}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {actions.map((act) => {
          const isPrimary = act.variant === 'primary';
          return (
            <Button
              key={act.href}
              href={act.href}
              variant={isPrimary ? 'primary' : 'secondary'}
              size="md"
              fullWidth
            >
              {act.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
