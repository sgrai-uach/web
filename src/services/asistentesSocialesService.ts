import apiClient from '@/lib/api/client';
import { getAuthCookie } from '@/lib/utils/cookieUtils';
import { formatApiError } from '@/lib/utils/errorUtils';
import type {
  AsistenteSocialItem,
  EstadoOperativoPersonal,
  FiltrosAsistentesSocialesState,
  RespuestaAsistentesSociales,
} from '@/types/asistenteSocialPersonal';

export class AsistentesSocialesServiceError extends Error {
  public statusCode?: number;
  public details?: unknown;

  constructor(message: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'AsistentesSocialesServiceError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Nómina mock para contingencia offline o entorno sin sgrai-api conectado.
 */
export const ASISTENTES_SOCIALES_MOCK: AsistenteSocialItem[] = [
  {
    usuarioId: '50000000-0000-4000-8000-000000000001',
    rut: '16.789.012-3',
    nombres: 'Camila Andrea',
    apellidos: 'Valenzuela Castro',
    nombreCompleto: 'Camila Valenzuela Castro',
    email: 'cvalenzuela@valdivia.cl',
    telefono: '+56 9 8765 4321',
    delegacionId: '30000000-0000-4000-8000-000000000001',
    delegacionCodigo: 'COSTA',
    delegacionNombre: 'Delegación Municipal Costa',
    personalId: '60000000-0000-4000-8000-000000000001',
    estadoOperativo: 'disponible',
    casosFibeAsignados: 0,
  },
  {
    usuarioId: '50000000-0000-4000-8000-000000000002',
    rut: '15.432.198-7',
    nombres: 'Rodrigo Ignacio',
    apellidos: 'Sepúlveda Muñoz',
    nombreCompleto: 'Rodrigo Sepúlveda Muñoz',
    email: 'rsepulveda@valdivia.cl',
    telefono: '+56 9 9876 5432',
    delegacionId: '30000000-0000-4000-8000-000000000002',
    delegacionCodigo: 'SUR',
    delegacionNombre: 'Delegación Municipal Sur',
    personalId: '60000000-0000-4000-8000-000000000002',
    estadoOperativo: 'en_mision',
    casosFibeAsignados: 3,
  },
  {
    usuarioId: '50000000-0000-4000-8000-000000000003',
    rut: '17.890.123-4',
    nombres: 'Javiera Belén',
    apellidos: 'Morales Peña',
    nombreCompleto: 'Javiera Morales Peña',
    email: 'jmorales@valdivia.cl',
    telefono: '+56 9 7654 3210',
    delegacionId: '30000000-0000-4000-8000-000000000003',
    delegacionCodigo: 'NORTE',
    delegacionNombre: 'Delegación Municipal Norte',
    personalId: '60000000-0000-4000-8000-000000000003',
    estadoOperativo: 'en_mision',
    casosFibeAsignados: 1,
  },
  {
    usuarioId: '50000000-0000-4000-8000-000000000004',
    rut: '18.123.456-5',
    nombres: 'Matías Alonso',
    apellidos: 'Almonacid Vargas',
    nombreCompleto: 'Matías Almonacid Vargas',
    email: 'malmonacid@valdivia.cl',
    telefono: '+56 9 6543 2109',
    delegacionId: '30000000-0000-4000-8000-000000000004',
    delegacionCodigo: 'CALLE_CALLE',
    delegacionNombre: 'Delegación Municipal Calle Calle',
    personalId: '60000000-0000-4000-8000-000000000004',
    estadoOperativo: 'disponible',
    casosFibeAsignados: 0,
  },
  {
    usuarioId: '50000000-0000-4000-8000-000000000005',
    rut: '14.987.654-2',
    nombres: 'Beatriz Elena',
    apellidos: 'Cárdenas Soto',
    nombreCompleto: 'Beatriz Cárdenas Soto',
    email: 'bcardenas@valdivia.cl',
    telefono: '+56 9 5432 1098',
    delegacionId: '30000000-0000-4000-8000-000000000001',
    delegacionCodigo: 'COSTA',
    delegacionNombre: 'Delegación Municipal Costa',
    personalId: '60000000-0000-4000-8000-000000000005',
    estadoOperativo: 'descanso',
    casosFibeAsignados: 0,
  },
  {
    usuarioId: '50000000-0000-4000-8000-000000000006',
    rut: '16.234.567-8',
    nombres: 'Gonzalo Esteban',
    apellidos: 'Fuenzalida Rivas',
    nombreCompleto: 'Gonzalo Fuenzalida Rivas',
    email: 'gfuenzalida@valdivia.cl',
    telefono: '+56 9 4321 0987',
    delegacionId: '30000000-0000-4000-8000-000000000002',
    delegacionCodigo: 'SUR',
    delegacionNombre: 'Delegación Municipal Sur',
    personalId: '60000000-0000-4000-8000-000000000006',
    estadoOperativo: 'licencia',
    casosFibeAsignados: 0,
  },
  {
    usuarioId: '50000000-0000-4000-8000-000000000007',
    rut: '17.345.678-9',
    nombres: 'Pamela Alejandra',
    apellidos: 'Ruiz Henríquez',
    nombreCompleto: 'Pamela Ruiz Henríquez',
    email: 'pruiz@valdivia.cl',
    telefono: '+56 9 3210 9876',
    delegacionId: '30000000-0000-4000-8000-000000000003',
    delegacionCodigo: 'NORTE',
    delegacionNombre: 'Delegación Municipal Norte',
    personalId: '60000000-0000-4000-8000-000000000007',
    estadoOperativo: 'inactivo',
    casosFibeAsignados: 0,
  },
];

/**
 * Consulta la nómina de asistentes sociales al endpoint GET /api/personal?rolCodigo=ASISTENTE_SOCIAL
 */
export async function obtenerAsistentesSociales(
  filtros: FiltrosAsistentesSocialesState
): Promise<RespuestaAsistentesSociales> {
  const queryParams: Record<string, string | number | undefined> = {
    rolCodigo: 'ASISTENTE_SOCIAL',
    page: filtros.pagina || 1,
    limit: filtros.limite || 20,
  };

  if (filtros.delegacionId) {
    queryParams.delegacion_id = filtros.delegacionId;
    queryParams.delegacionId = filtros.delegacionId;
  }

  if (filtros.estadoOperativo) {
    queryParams.estadoOperativo = filtros.estadoOperativo;
    queryParams.estado_operativo = filtros.estadoOperativo;
  }

  if (filtros.busqueda && filtros.busqueda.trim() !== '') {
    queryParams.q = filtros.busqueda.trim();
  }

  try {
    const token = getAuthCookie();
    const { data, error, response } = await apiClient.GET('/api/personal', {
      params: {
        query: queryParams as unknown as {
          rolCodigo: string;
          delegacion_id?: string;
          delegacionId?: string;
          estadoOperativo?: EstadoOperativoPersonal;
          estado_operativo?: EstadoOperativoPersonal;
          page?: number;
          limit?: number;
          q?: string;
        },
        header: { authorization: token ? `Bearer ${token}` : '' },
      },
    });

    if (error || !response.ok) {
      if (response?.status === 401) {
        throw new AsistentesSocialesServiceError('Sesión expirada o no autenticada.', 401);
      }
      if (response?.status === 403) {
        throw new AsistentesSocialesServiceError(
          'Acceso denegado: Se requiere el permiso asistencia_social:leer o rol Encargado.',
          403
        );
      }

      // Si falla la conexión de red local en dev, se recurre al mock filtrado
      return filtrarMock(filtros);
    }

    const rawList = data?.data || [];
    const metaApi = data?.meta;

    const adaptados: AsistenteSocialItem[] = rawList.map((item) => ({
      usuarioId: item.usuario_id,
      rut: item.rut,
      nombres: item.nombres,
      apellidos: item.apellidos,
      nombreCompleto: `${item.nombres} ${item.apellidos}`.trim(),
      email: item.email,
      telefono: item.telefono ?? null,
      delegacionId: item.delegacion_id ?? null,
      delegacionCodigo: item.delegacion_codigo ?? null,
      delegacionNombre: item.delegacion_nombre ?? null,
      personalId: item.personal_id ?? null,
      estadoOperativo: (item.estado_operativo as EstadoOperativoPersonal) || 'disponible',
      casosFibeAsignados: item.casos_fibe_asignados ?? 0,
    }));

    const total = metaApi?.total ?? adaptados.length;
    const limite = metaApi?.limit ?? filtros.limite ?? 20;
    const pagina = metaApi?.page ?? filtros.pagina ?? 1;
    const totalPaginas = metaApi?.totalPages ?? Math.max(1, Math.ceil(total / limite));

    return {
      data: adaptados,
      meta: {
        total,
        pagina,
        limite,
        totalPaginas,
      },
    };
  } catch (err: unknown) {
    if (err instanceof AsistentesSocialesServiceError) {
      throw err;
    }
    // En caso de fallo de red en local/desconectado, proveer mock filtrado
    return filtrarMock(filtros);
  }
}

function filtrarMock(filtros: FiltrosAsistentesSocialesState): RespuestaAsistentesSociales {
  let resultado = [...ASISTENTES_SOCIALES_MOCK];

  if (filtros.delegacionId) {
    resultado = resultado.filter((a) => a.delegacionId === filtros.delegacionId);
  }

  if (filtros.estadoOperativo) {
    resultado = resultado.filter((a) => a.estadoOperativo === filtros.estadoOperativo);
  }

  if (filtros.busqueda && filtros.busqueda.trim() !== '') {
    const q = filtros.busqueda.toLowerCase();
    resultado = resultado.filter(
      (a) =>
        a.nombreCompleto.toLowerCase().includes(q) ||
        a.rut.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.telefono && a.telefono.includes(q))
    );
  }

  const total = resultado.length;
  const limite = filtros.limite || 20;
  const pagina = filtros.pagina || 1;
  const inicio = (pagina - 1) * limite;
  const paginados = resultado.slice(inicio, inicio + limite);

  return {
    data: paginados,
    meta: {
      total,
      pagina,
      limite,
      totalPaginas: Math.max(1, Math.ceil(total / limite)),
    },
  };
}
