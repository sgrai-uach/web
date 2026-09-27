import { Metadata } from 'next';
import { PhoneCall, Plus, Home } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Centro Call Center — SGRAI Valdivia',
  description: 'Panel de atención y recepción del Centro Call Center de emergencias comunales de Valdivia.',
};

export default function CallCenterIndexPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '40px 20px' }}>
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #DFE3E8',
          padding: '40px 32px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#14505A',
            color: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <PhoneCall size={32} aria-hidden="true" />
        </div>

        <Heading as="h1" variant="h2" color="teal-dark" style={{ marginBottom: '8px' }}>
          Centro Call Center — SGRAI
        </Heading>

        <p style={{ fontSize: '15px', color: '#555', maxWidth: '560px', margin: '0 auto 28px auto', lineHeight: 1.5 }}>
          Plataforma de recepción y verificación de incidentes comunales para la Dirección de Gestión de Riesgos de Desastres de la Municipalidad de Valdivia.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Button
            href="/callcenter/manual"
            variant="primary"
            size="lg"
            icon={<Plus size={18} />}
          >
            Nuevo Reporte Manual
          </Button>

          <Button
            href="/"
            variant="secondary"
            size="lg"
            icon={<Home size={18} />}
          >
            Portal Informante
          </Button>
        </div>
      </div>
    </div>
  );
}
