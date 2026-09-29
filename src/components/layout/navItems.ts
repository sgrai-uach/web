import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import {
  PhoneCall,
  FilePlus2,
  MapPin,
  ClipboardList,
  BarChart3,
  Boxes,
  ShieldCheck,
  Users,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<LucideProps>;
  badge?: string;
  disabled?: boolean;
}

export interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'operaciones',
    title: 'Operaciones',
    items: [
      {
        id: 'callcenter',
        label: 'Bandeja de Avisos',
        href: '/callcenter',
        icon: PhoneCall,
      },
      {
        id: 'callcenter-manual',
        label: 'Ingreso Manual',
        href: '/callcenter/manual',
        icon: FilePlus2,
      },
      {
        id: 'mando',
        label: 'Centro de Mando',
        href: '/centro-incidentes',
        icon: MapPin,
      },
      {
        id: 'asistente-social',
        label: 'Fichas FIBE',
        href: '/asistente-social',
        icon: ClipboardList,
        disabled: true,
        badge: 'Próx.',
      },
    ],
  },
  {
    id: 'estrategico',
    title: 'Estratégico',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard y Reportes',
        href: '/dashboard',
        icon: BarChart3,
        disabled: true,
        badge: 'Próx.',
      },
    ],
  },
  {
    id: 'administracion',
    title: 'Administración',
    items: [
      {
        id: 'empleados',
        label: 'Gestión de Personal',
        href: '/admin/empleados',
        icon: Users,
      },
      {
        id: 'recursos',
        label: 'Inventario Logístico',
        href: '/admin/recursos',
        icon: Boxes,
      },
      {
        id: 'roles-permisos',
        label: 'Roles y Permisos',
        href: '/admin/roles-permisos',
        icon: ShieldCheck,
      },
    ],
  },
];
