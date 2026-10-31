import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Nueva Patrulla Verificadora — Administración | SGRAI',
  description:
    'Formulario de registro y alta de patrullas verificadoras para evaluación y triage en terreno de la Municipalidad de Valdivia.',
};

export default function NuevoPatrullaPage() {
  redirect('/gestion/admin/patrullas?nuevo=1');
}
