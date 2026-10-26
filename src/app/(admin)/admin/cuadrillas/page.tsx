import type { Metadata } from 'next';
import CuadrillasAdminClient from '@/components/admin/cuadrillas/CuadrillasAdminClient';

export const metadata: Metadata = {
  title: 'Cuadrillas Operativas — Administración | SGRAI',
  description: 'Gestión y administración de cuadrillas operativas y dotación municipal de Valdivia.',
};

export default function CuadrillasIndexPage() {
  return <CuadrillasAdminClient />;
}
