import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import {
  Bot,
  Search,
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
  requiredPermissions?: string[];
  publico?: boolean;
}

export interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'ciudadano',
    title: 'Atención Ciudadana',
    items: [
      {
        id: 'reportar',
        label: 'Chatbot de Reportes',
        href: '/reportar',
        icon: Bot,
        publico: true,
      },
      {
        id: 'seguimiento',
        label: 'Seguimiento de Avisos',
        href: '/seguimiento',
        icon: Search,
        publico: true,
      },
    ],
  },
  {
    id: 'operaciones',
    title: 'Operaciones',
    items: [
      {
        id: 'callcenter',
        label: 'Bandeja de Avisos',
        href: '/callcenter',
        icon: PhoneCall,
        requiredPermissions: ['incidentes:avisos:leer'],
      },
      {
        id: 'callcenter-manual',
        label: 'Ingreso Manual',
        href: '/callcenter/manual',
        icon: FilePlus2,
        requiredPermissions: ['crear_incidente_manual'],
      },
      {
        id: 'mando',
        label: 'Centro de Mando',
        href: '/centro-incidentes',
        icon: MapPin,
        requiredPermissions: ['incidentes:kanban', 'misiones:asignar'],
      },
      {
        id: 'asistente-social',
        label: 'Fichas FIBE',
        href: '/asistente-social',
        icon: ClipboardList,
        disabled: true,
        badge: 'Próx.',
        requiredPermissions: ['asistencia_social:fibe:gestionar', 'fibe:gestionar'],
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
        requiredPermissions: ['dashboard:estadisticas:leer', 'reportes:senapred:exportar'],
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
        requiredPermissions: ['personal:gestionar', 'seguridad:roles:gestionar'],
      },
      {
        id: 'recursos',
        label: 'Inventario Logístico',
        href: '/admin/recursos',
        icon: Boxes,
        requiredPermissions: ['recursos:leer', 'recursos:crear'],
      },
      {
        id: 'roles-permisos',
        label: 'Roles y Permisos',
        href: '/admin/roles-permisos',
        icon: ShieldCheck,
        requiredPermissions: ['seguridad:roles:leer', 'seguridad:roles:gestionar'],
      },
    ],
  },
];
