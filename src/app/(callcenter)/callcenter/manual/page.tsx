import { Metadata } from 'next';
import IncidenteManualForm from '@/components/callcenter/IncidenteManualForm';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import PageTitleCard from '@/components/common/PageTitleCard';

export const metadata: Metadata = {
  title: 'Recepción de Reportes — Call Center | SGRAI Valdivia',
  description:
    'Formulario de atención para operadores del Call Center de la Dirección de Gestión de Riesgos de Desastres de Valdivia.',
};

export default function ManualIncidentPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)', width: '100%' }}>
      {/* Breadcrumbs Institucionales */}
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Operaciones' },
          { label: 'Ingreso Manual' },
        ]}
      />

      {/* Tarjeta de Título Institucional */}
      <PageTitleCard
        title="Ingreso Manual"
        description="Recepción, georreferenciación e ingreso asistido de llamados al Call Center 1451 o avisos de funcionarios en terreno."
      />

      {/* Formulario Reactivo */}
      <IncidenteManualForm />
    </div>
  );
}
