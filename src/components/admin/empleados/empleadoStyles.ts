import React from 'react';

export const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '38px',
  padding: '8px 12px',
  border: '1px solid var(--border-color-dark, #3B3F45)',
  fontSize: '14px',
  color: 'var(--color-text-dark, #2B2B2B)',
  backgroundColor: 'var(--color-white, #FFFFFF)',
  borderRadius: 0,
  boxSizing: 'border-box',
};

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 700,
  color: 'var(--color-primary-teal-dark, #14505A)',
  marginBottom: '4px',
};

export const selectStyle: React.CSSProperties = {
  width: '100%',
  height: '38px',
  padding: '8px 12px',
  fontSize: '14px',
  border: '1px solid var(--border-color-dark, #3B3F45)',
  borderRadius: 0,
  backgroundColor: 'var(--color-white, #FFFFFF)',
  color: 'var(--color-text-dark, #2B2B2B)',
  boxSizing: 'border-box',
  cursor: 'pointer',
};
