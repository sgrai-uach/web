import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import {
  descartarAviso,
  obtenerDetalleAviso,
  obtenerTiposIncidentes,
  verificarAviso,
  ApiError,
} from '@/services/avisosService';
import { getErrorMessage } from '@/lib/utils/errorUtils';
import type { AvisoDetalleResponse, AvisoItem, TipoIncidenteOpcion } from '@/types/avisos';

interface UseAvisoDetalleModalParams {
  aviso: AvisoItem;
  operadorId: string;
  onClose: () => void;
  onAccionCompletada: () => void;
}

export function useAvisoDetalleModal({
  aviso,
  operadorId,
  onClose,
  onAccionCompletada,
}: UseAvisoDetalleModalParams) {
  const { showSuccess, showError, showWarning } = useToast();

  const [detalle, setDetalle] = useState<AvisoDetalleResponse | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(true);

  const [tiposCatalogo, setTiposCatalogo] = useState<TipoIncidenteOpcion[]>([]);
  const [cargandoTipos, setCargandoTipos] = useState(true);
  const [tipoIncidenteId, setTipoIncidenteId] = useState(aviso.tipoPreliminarId || '');

  useEffect(() => {
    let activo = true;
    obtenerTiposIncidentes()
      .then((tipos) => {
        if (!activo) return;
        const opciones: TipoIncidenteOpcion[] = tipos.map((t) => ({
          id: t.id,
          nombre: t.nombre,
        }));
        setTiposCatalogo(opciones);

        setTipoIncidenteId((idActual) => {
          if (idActual) return idActual;
          if (aviso.tipoPreliminarId) return aviso.tipoPreliminarId;
          if (aviso.tipoPreliminarNombre) {
            const match = opciones.find((t) =>
              t.nombre.toLowerCase().includes(aviso.tipoPreliminarNombre!.toLowerCase())
            );
            if (match) return match.id;
          }
          return opciones[0]?.id || '';
        });
      })
      .catch((err) => {
        console.error('Error al cargar tipos de incidentes desde la API:', err);
      })
      .finally(() => {
        if (activo) setCargandoTipos(false);
      });

    return () => {
      activo = false;
    };
  }, [aviso.tipoPreliminarId, aviso.tipoPreliminarNombre]);

  const tiposDisponibles = useMemo(() => {
    const lista = [...tiposCatalogo];
    if (aviso.tipoPreliminarId && !lista.some((t) => t.id === aviso.tipoPreliminarId)) {
      lista.unshift({
        id: aviso.tipoPreliminarId,
        nombre: aviso.tipoPreliminarNombre || 'Tipo preliminar del aviso',
      });
    }
    return lista;
  }, [tiposCatalogo, aviso.tipoPreliminarId, aviso.tipoPreliminarNombre]);

  const [descripcionAjustada, setDescripcionAjustada] = useState(aviso.descripcion || '');
  const [requiereAsistenciaSocial, setRequiereAsistenciaSocial] = useState(false);
  const [procesandoVerificacion, setProcesandoVerificacion] = useState(false);

  const [modoDescarte, setModoDescarte] = useState(false);
  const [motivoDescarte, setMotivoDescarte] = useState('');
  const [procesandoDescarte, setProcesandoDescarte] = useState(false);

  const [fotoAmpliadaUrl, setFotoAmpliadaUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    obtenerDetalleAviso(aviso.id)
      .then((data) => {
        if (isMounted) {
          setDetalle(data);
          if (data.descripcion) {
            setDescripcionAjustada(data.descripcion);
          }
          setCargandoDetalle(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          showError(
            getErrorMessage(err),
            'Fallo de comunicación'
          );
          setCargandoDetalle(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [aviso.id, showError]);

  async function handleVerificar() {
    const UUID_REGEX =
      /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;

    if (!tipoIncidenteId || !UUID_REGEX.test(tipoIncidenteId)) {
      showWarning('Debe seleccionar una tipología oficial de incidente válida');
      return;
    }

    setProcesandoVerificacion(true);
    try {
      const res = await verificarAviso(
        aviso.id,
        {
          tipoIncidenteId,
          descripcion: descripcionAjustada.trim() || undefined,
          requiereAsistenciaSocial,
        },
        operadorId
      );

      showSuccess(
        `Aviso promovido exitosamente. Folio asignado: ${res.folio || 'N/A'}. Notificado al Encargado.`,
        'Incidente Formal Creado'
      );
      onAccionCompletada();
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.isConflict) {
        showWarning(
          'Este aviso acaba de ser atendido o resuelto por otro operador.',
          'Conflicto de concurrencia (409)'
        );
        onAccionCompletada();
        onClose();
      } else {
        showError(
          getErrorMessage(err),
          'Error de verificación'
        );
      }
    } finally {
      setProcesandoVerificacion(false);
    }
  }

  async function handleDescartar() {
    const motivoTrim = motivoDescarte.trim();
    if (motivoTrim.length < 5) {
      showWarning('El motivo de descarte debe contener al menos 5 caracteres justificativos');
      return;
    }

    setProcesandoDescarte(true);
    try {
      await descartarAviso(
        aviso.id,
        {
          motivoDescarte: motivoTrim,
        },
        operadorId
      );

      showSuccess('El aviso ha sido descartado correctamente.', 'Aviso Descartado');
      onAccionCompletada();
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.isConflict) {
        showWarning(
          'El aviso ya fue procesado o descartado por otro operador.',
          'Aviso ya procesado (409)'
        );
        onAccionCompletada();
        onClose();
      } else {
        showError(
          getErrorMessage(err),
          'Fallo de operación'
        );
      }
    } finally {
      setProcesandoDescarte(false);
    }
  }

  return {
    detalle,
    cargandoDetalle,
    tiposDisponibles,
    cargandoTipos,
    tipoIncidenteId,
    setTipoIncidenteId,
    descripcionAjustada,
    setDescripcionAjustada,
    requiereAsistenciaSocial,
    setRequiereAsistenciaSocial,
    procesandoVerificacion,
    modoDescarte,
    setModoDescarte,
    motivoDescarte,
    setMotivoDescarte,
    procesandoDescarte,
    fotoAmpliadaUrl,
    setFotoAmpliadaUrl,
    handleVerificar,
    handleDescartar,
  };
}
