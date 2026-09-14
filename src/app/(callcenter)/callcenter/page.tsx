import { Metadata } from 'next';
import Link from 'next/link';

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
            fontSize: '32px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          📞
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#14505A', marginBottom: '8px' }}>
          Centro Call Center — SGRAI
        </h1>

        <p style={{ fontSize: '15px', color: '#555', maxWidth: '560px', margin: '0 auto 28px auto', lineHeight: 1.5 }}>
          Plataforma de recepción y verificación de incidentes comunales para la Dirección de Gestión de Riesgos de Desastres de la Municipalidad de Valdivia.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link
            href="/callcenter/manual"
            style={{
              backgroundColor: '#4FAE9B',
              color: '#FFFFFF',
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: 800,
              textDecoration: 'none',
              borderRadius: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>➕</span>
            <span>Nuevo Reporte Manual</span>
          </Link>

          <Link
            href="/"
            style={{
              backgroundColor: '#3B3F45',
              color: '#FFFFFF',
              padding: '14px 24px',
              fontSize: '15px',
              fontWeight: 700,
              textDecoration: 'none',
              borderRadius: 0,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Portal Informante
          </Link>
        </div>
      </div>
    </div>
  );
}
