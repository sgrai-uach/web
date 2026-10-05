/**
 * Tipos para catálogos de referencia (roles, delegaciones, etc.)
 */

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
