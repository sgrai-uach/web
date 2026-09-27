import { Metadata } from 'next';
import Heading from '@/components/ui/Heading';
import IncidenteManualForm from '@/components/callcenter/IncidenteManualForm';

export const metadata: Metadata = {
  title: 'Recepción de Reportes — Call Center | SGRAI Valdivia',
  description:
    'Formulario de atención para operadores del Call Center de la Dirección de Gestión de Riesgos de Desastres de Valdivia.',
};

export default function ManualIncidentPage() {
  return (
    <div>
      {/* Encabezado y migas de pan institucionales alineados con el rectángulo del formulario */}
      <div
        style={{
          maxWidth: '840px',
          margin: '0 auto 24px auto',
          textAlign: 'left',
        }}
      >
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
          <span>Call Center</span> &gt; <strong style={{ color: '#14505A' }}>Recepción de Reportes</strong>
        </div>
        <Heading
          as="h1"
          variant="h2"
          color="teal-dark"
          style={{ margin: '0 0 8px 0' }}
        >
          Recepción de Reportes de Emergencia
        </Heading>
        <p style={{ margin: 0, fontSize: '14px', color: '#3B3F45', lineHeight: 1.5 }}>
          Completa los datos del reporte recibido para enviar el aviso directamente al Encargado municipal y coordinar la atención oportuna en terreno.
        </p>
      </div>

      {/* Formulario Reactivo */}
      <IncidenteManualForm />
    </div>
  );
}
