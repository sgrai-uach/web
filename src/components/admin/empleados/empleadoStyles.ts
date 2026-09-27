import React from 'react';

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  border: '1px solid var(--border-color-neutral, #DFE3E8)',
  fontSize: '0.875rem',
  color: 'var(--color-text-dark, #2B2B2B)',
  backgroundColor: 'var(--color-white, #FFFFFF)',
  borderRadius: 0,
  outline: 'none',
};

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 700,
  color: 'var(--color-charcoal, #3B3F45)',
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
  marginBottom: '0.35rem',
};

export const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.45rem 0.6rem',
  fontSize: '0.8125rem',
  border: '1px solid var(--border-color-neutral, #DFE3E8)',
  borderRadius: 0,
  backgroundColor: 'var(--color-white, #FFFFFF)',
  color: 'var(--color-text-dark, #2B2B2B)',
};
