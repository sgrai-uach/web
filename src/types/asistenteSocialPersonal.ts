export type EstadoOperativoPersonal =
  | 'disponible'
  | 'en_mision'
  | 'descanso'
  | 'licencia'
  | 'inactivo';

export interface AsistenteSocialItem {
  usuarioId: string;
  rut: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  email: string;
  telefono: string | null;
  delegacionId: string | null;
  delegacionCodigo: string | null;
  delegacionNombre: string | null;
  personalId: string | null;
  estadoOperativo: EstadoOperativoPersonal;
  casosFibeAsignados: number;
}

export interface FiltrosAsistentesSocialesState {
  pagina: number;
  limite: number;
  busqueda?: string;
  delegacionId?: string;
  estadoOperativo?: EstadoOperativoPersonal;
}

export interface MetaAsistentesSociales {
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface RespuestaAsistentesSociales {
  data: AsistenteSocialItem[];
  meta: MetaAsistentesSociales;
}
