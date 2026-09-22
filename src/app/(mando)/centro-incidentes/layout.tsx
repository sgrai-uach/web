import React from 'react';
import { MunicipalHeader } from '@/components/layout/MunicipalHeader';

export default function CentroIncidentesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MunicipalHeader />
      {children}
    </>
  );
}
