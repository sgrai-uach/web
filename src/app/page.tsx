import { Metadata } from 'next';
import { ChatContainer } from '@/components/chat/ChatContainer';

export const metadata: Metadata = {
  title: 'Reporte de Incidentes — Portal Informante | Municipalidad de Valdivia',
  description:
    'Reporte de incidentes y emergencias comunales de la Dirección de Gestión de Riesgos de Desastres de la Municipalidad de Valdivia.',
};

export default function HomePage() {
  return <ChatContainer />;
}
