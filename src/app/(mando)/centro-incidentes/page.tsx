import type { Metadata } from 'next';
import { KanbanBoard } from '@/components/mando/KanbanBoard';

export const metadata: Metadata = {
  title: 'Centro de Incidentes — SGRAI Municipalidad de Valdivia',
  description:
    'Tablero táctico Kanban para la visualización, monitoreo en tiempo real y asignación de recursos a incidentes de emergencia en Valdivia.',
};

export default function CentroIncidentesPage() {
  return <KanbanBoard />;
}
