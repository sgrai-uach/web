export interface UsuarioSimulado {
  id: string;
  nombre: string;
  email: string;
  rut: string;
  rol: string;
  esAdmin: boolean;
  delegacion?: string;
}

/**
 * Catálogo unificado de perfiles institucionales para pruebas de sesión y RBAC en SGRAI.
 * Coincide exactamente con los identificadores sembrados en la base de datos municipal.
 */
export const USUARIOS_SIMULADOS_SISTEMA: UsuarioSimulado[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    nombre: 'Administrador General',
    email: 'admin@valdivia.cl',
    rut: '11.111.111-1',
    rol: 'Administrador',
    esAdmin: true,
    delegacion: 'Delegación Central',
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    nombre: 'Operador Call Center',
    email: 'callcenter@valdivia.cl',
    rut: '22.222.222-2',
    rol: 'Call Center',
    esAdmin: false,
    delegacion: 'Delegación Central',
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    nombre: 'Encargado de Operaciones',
    email: 'encargado@valdivia.cl',
    rut: '33.333.333-3',
    rol: 'Encargado',
    esAdmin: false,
    delegacion: 'Delegación Central',
  },
  {
    id: 'c1111111-1111-4111-8111-111111111111',
    nombre: 'Carlos Miranda (Mesa 1)',
    email: 'carlos.miranda@valdivia.cl',
    rut: '14.111.111-1',
    rol: 'Call Center',
    esAdmin: false,
    delegacion: 'Delegación Norte',
  },
  {
    id: 'c2222222-2222-4222-8222-222222222222',
    nombre: 'Patricia Valenzuela (Mesa 2)',
    email: 'patricia.valenzuela@valdivia.cl',
    rut: '15.222.222-2',
    rol: 'Call Center',
    esAdmin: false,
    delegacion: 'Delegación Sur',
  },
  {
    id: '00000000-0000-4000-8000-000000000010',
    nombre: 'Supervisor Estratégico',
    email: 'supervisor@valdivia.cl',
    rut: '44.444.444-4',
    rol: 'Supervisor Estratégico',
    esAdmin: false,
    delegacion: 'Delegación Central',
  },
  {
    id: '00000000-0000-4000-8000-000000000008',
    nombre: 'Observador (Sin Permisos)',
    email: 'observador@valdivia.cl',
    rut: '44.444.444-4',
    rol: 'Observador Sin Permisos',
    esAdmin: false,
    delegacion: 'Auditoría Externa',
  },
];
