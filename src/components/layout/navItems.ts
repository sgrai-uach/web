import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import {
  LayoutDashboard,
  PhoneCall,
  FilePlus2,
  MapPin,
  ClipboardList,
  BarChart3,
  Boxes,
  ShieldCheck,
  Users,
  AlertTriangle,
  HardHat,
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
    id: 'operaciones',
    title: 'Operaciones',
    items: [
      {
        id: 'gestion-inicio',
        label: 'Inicio Gestión',
        href: '/gestion',
        icon: LayoutDashboard,
      },
      {
        id: 'callcenter',
        label: 'Bandeja de Avisos',
        href: '/gestion/callcenter',
        icon: PhoneCall,
        requiredPermissions: ['incidentes:avisos:leer'],
      },
      {
        id: 'callcenter-manual',
        label: 'Ingreso Manual',
        href: '/gestion/callcenter/manual',
        icon: FilePlus2,
        requiredPermissions: ['crear_incidente_manual'],
      },
      {
        id: 'mando',
        label: 'Centro de Mando',
        href: '/gestion/centro-incidentes',
        icon: MapPin,
        requiredPermissions: ['incidentes:kanban', 'misiones:asignar'],
      },
      {
        id: 'asistente-social',
        label: 'Asistencia Social',
        href: '/gestion/asistente-social',
        icon: ClipboardList,
        requiredPermissions: [
          'asistencia_social:leer',
          'asistencia_social:crear',
          'asistencia_social:fibe:gestionar',
          'fibe:gestionar',
        ],
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
        href: '/gestion/dashboard',
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
        href: '/gestion/admin/empleados',
        icon: Users,
        requiredPermissions: [
          'personal:gestionar',
          'personal:crear',
          'personal:leer',
          'seguridad:roles:gestionar',
        ],
      },
      {
        id: 'recursos',
        label: 'Inventario Logístico',
        href: '/gestion/admin/recursos',
        icon: Boxes,
        requiredPermissions: ['recursos:leer', 'recursos:crear'],
      },
      {
        id: 'cuadrillas',
        label: 'Cuadrillas',
        href: '/gestion/admin/cuadrillas/nuevo',
        icon: HardHat,
        requiredPermissions: ['recursos:crear', 'recursos:leer'],
      },
      {
        id: 'puntos-criticos',
        label: 'Puntos Críticos',
        href: '/gestion/admin/puntos-criticos',
        icon: AlertTriangle,
        requiredPermissions: ['puntos_criticos:leer', 'puntos_criticos:crear', 'seguridad:roles:gestionar'],
      },
      {
        id: 'roles-permisos',
        label: 'Roles y Permisos',
        href: '/gestion/admin/roles-permisos',
        icon: ShieldCheck,
        requiredPermissions: ['seguridad:roles:leer', 'seguridad:roles:gestionar'],
      },
    ],
  },
];
