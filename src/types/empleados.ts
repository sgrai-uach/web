export interface EmpleadoUsuario {
  usuario_id: string;
  rut: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  usuario_activo: boolean;
  fecha_ingreso: string | null;
  fecha_salida: string | null;
  rol_id: string;
  rol_codigo: string;
  rol_nombre: string;
  delegacion_id: string | null;
  delegacion_codigo: string | null;
  delegacion_nombre: string | null;
  es_personal: boolean;
  personal_id: string | null;
  especialidad: string | null;
  cargo: string | null;
  estado_operativo:
    | 'disponible'
    | 'en_mision'
    | 'en_patrulla'
    | 'descanso'
    | 'licencia'
    | 'inactivo'
    | null;
  disponible_terreno: boolean | null;
  observaciones: string | null;
}

export interface CatalogoItem {
  id: string;
  codigo: string;
  nombre: string;
}

export interface CatalogosResponse {
  roles: CatalogoItem[];
  delegaciones: CatalogoItem[];
  especialidades: string[];
  cargos: string[];
}
