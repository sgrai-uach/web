import { Metadata } from 'next';
import IncidenteManualForm from '@/components/callcenter/IncidenteManualForm';

export const metadata: Metadata = {
  title: 'Ingreso Manual de Reportes — Call Center | SGRAI Valdivia',
  description:
    'Formulario de recepción manual de incidentes por llamada telefónica o aviso de funcionario en terreno para la Dirección de Gestión de Riesgos de Desastres de Valdivia.',
};

export default function ManualIncidentPage() {
  return (
    <div>
      {/* Encabezado y migas de pan institucionales */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
          <span>Call Center</span> &gt; <strong style={{ color: '#14505A' }}>Ingreso Manual de Incidentes</strong>
        </div>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#14505A',
            letterSpacing: '-0.3px',
            margin: '0 0 6px 0',
          }}
        >
          Recepción Manual de Reportes (Llamada / Terreno)
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#3B3F45', lineHeight: 1.5 }}>
          Completa el formulario para ingresar un reporte verificado implícitamente. Al guardarlo, se generará
          inmediatamente un incidente indexado en estado <strong>SIN_ATENDER</strong> para la visualización del Encargado.
        </p>
      </div>

      {/* Formulario Reactivo */}
      <IncidenteManualForm />
    </div>
  );
}
