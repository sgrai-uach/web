'use client';

import React from 'react';
import type { AvisoItem, TipoIncidenteOpcion } from '@/types/avisos';
import { useAvisoDetalleModal } from '@/hooks/useAvisoDetalleModal';
import AvisoDetalleHeader from './modal/AvisoDetalleHeader';
import AvisoDetalleInformante from './modal/AvisoDetalleInformante';
import AvisoDetalleUbicacion from './modal/AvisoDetalleUbicacion';
import AvisoDetalleEvidencia from './modal/AvisoDetalleEvidencia';
import AvisoDetalleVerificacionForm from './modal/AvisoDetalleVerificacionForm';
import AvisoDetalleDescarteForm from './modal/AvisoDetalleDescarteForm';

import { CATALOGO_TIPOS_INCIDENTE_DEFAULT } from '@/types/avisos';

export type { TipoIncidenteOpcion };
export const CATALOGO_TIPOS_INCIDENTE: TipoIncidenteOpcion[] = CATALOGO_TIPOS_INCIDENTE_DEFAULT;

interface AvisoDetalleModalProps {
  aviso: AvisoItem | null;
  operadorId: string;
  onClose: () => void;
  onAccionCompletada: () => void;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(20, 40, 45, 0.65)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 9000, padding: '1rem',
};

const containerStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-white, #FFFFFF)', width: '100%', maxWidth: '920px',
  maxHeight: '90vh', display: 'flex', flexDirection: 'column',
  boxShadow: 'var(--shadow-md)', border: '1px solid #DFE3E8', position: 'relative',
};

const bodyStyle: React.CSSProperties = {
  padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex',
  flexDirection: 'column', gap: '1.25rem',
};

function AvisoDetalleModalContent({
  aviso,
  operadorId,
  onClose,
  onAccionCompletada,
}: AvisoDetalleModalContentProps) {
  const { showSuccess, showError, showWarning } = useToast();

  const [detalle, setDetalle] = useState<AvisoDetalleResponse | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(true);

  // Tipos disponibles: los de catálogo oficial + si el aviso trae un tipo preliminar válido
  const tiposDisponibles = useMemo(() => {
    const lista = [...CATALOGO_TIPOS_INCIDENTE];
    const tipoNombre = aviso.tipoPreliminarNombre || aviso.tipoAfectacion;
    if (
      tipoNombre &&
      !lista.some((t) => t.nombre.toLowerCase() === tipoNombre.toLowerCase())
    ) {
      lista.unshift({
        id: CATALOGO_TIPOS_INCIDENTE[0].id,
        nombre: tipoNombre,
      });
    }
    return lista;
  }, [aviso.tipoPreliminarNombre, aviso.tipoAfectacion]);

  // Formulario de Verificación inicializado reactivamente con UUID válido
  const [tipoIncidenteId, setTipoIncidenteId] = useState(() => {
    const tipoNombre = aviso.tipoPreliminarNombre || aviso.tipoAfectacion;
    if (tipoNombre) {
      const match = CATALOGO_TIPOS_INCIDENTE.find((t) =>
        t.nombre.toLowerCase().includes(tipoNombre.toLowerCase())
      );
      if (match) return match.id;
    }
    return CATALOGO_TIPOS_INCIDENTE[0].id;
  });
  const [descripcionAjustada, setDescripcionAjustada] = useState(aviso.descripcion || '');
  const [requiereAsistenciaSocial, setRequiereAsistenciaSocial] = useState(false);
  const [procesandoVerificacion, setProcesandoVerificacion] = useState(false);

  // Formulario de Descarte
  const [modoDescarte, setModoDescarte] = useState(false);
  const [motivoDescarte, setMotivoDescarte] = useState('');
  const [procesandoDescarte, setProcesandoDescarte] = useState(false);

  // Visor de foto ampliada
  const [fotoAmpliadaUrl, setFotoAmpliadaUrl] = useState<string | null>(null);

  // Carga de detalle asíncrona
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
      .catch((err) => {
        if (isMounted) {
          showError(
            err instanceof Error ? err.message : 'Error al cargar el detalle del aviso',
            'Fallo de comunicación'
          );
          setCargandoDetalle(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [aviso.id, showError]);

  // Manejador de la acción: "Verificar y Enviar"
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
        aviso!.id,
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
          err instanceof Error ? err.message : 'No se pudo verificar el aviso',
          'Error de verificación'
        );
      }
    } finally {
      setProcesandoVerificacion(false);
    }
  }

  // Manejador de la acción: "Descartar"
  async function handleDescartar() {
    const motivoTrim = motivoDescarte.trim();
    if (motivoTrim.length < 5) {
      showWarning('El motivo de descarte debe contener al menos 5 caracteres justificativos');
      return;
    }

    setProcesandoDescarte(true);
    try {
      await descartarAviso(
        aviso!.id,
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
          err instanceof Error ? err.message : 'Error al intentar descartar el aviso',
          'Fallo de operación'
        );
      }
    } finally {
      setProcesandoDescarte(false);
    }
  }

  const datosInf = detalle?.datosInformante || {};
  const adjuntos = detalle?.adjuntos || [];
}: {
  aviso: AvisoItem;
  operadorId: string;
  onClose: () => void;
  onAccionCompletada: () => void;
}) {
  const m = useAvisoDetalleModal({ aviso, operadorId, onClose, onAccionCompletada });
  const datosInf = m.detalle?.datosInformante || {};
  const adjuntos = m.detalle?.adjuntos || [];

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-titulo" style={overlayStyle}>
      <div style={containerStyle}>
        <AvisoDetalleHeader aviso={aviso} onClose={onClose} />
        <div style={bodyStyle}>
          {m.cargandoDetalle && !m.detalle && (
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-light, #ECEFF3)', fontSize: '0.875rem', color: '#555', textAlign: 'center' }}>
              Cargando evidencia adjunta e información del informante...
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
            <AvisoDetalleInformante datosInf={datosInf} aviso={aviso} />
            <AvisoDetalleUbicacion aviso={aviso} datosInf={datosInf} />
          </div>

          <AvisoDetalleEvidencia adjuntos={adjuntos} />

          {!m.modoDescarte ? (
            <AvisoDetalleVerificacionForm
              tipoIncidenteId={m.tipoIncidenteId}
              onTipoIncidenteChange={m.setTipoIncidenteId}
              cargandoTipos={m.cargandoTipos}
              tiposDisponibles={m.tiposDisponibles}
              descripcionAjustada={m.descripcionAjustada}
              onDescripcionChange={m.setDescripcionAjustada}
              requiereAsistenciaSocial={m.requiereAsistenciaSocial}
              onRequiereAsistenciaSocialChange={m.setRequiereAsistenciaSocial}
              procesandoVerificacion={m.procesandoVerificacion}
              onVerificar={m.handleVerificar}
              onActivarDescarte={() => m.setModoDescarte(true)}
            />
          ) : (
            <AvisoDetalleDescarteForm
              motivoDescarte={m.motivoDescarte}
              onMotivoChange={m.setMotivoDescarte}
              procesandoDescarte={m.procesandoDescarte}
              onDescartar={m.handleDescartar}
              onCancelarDescarte={() => m.setModoDescarte(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function AvisoDetalleModal(props: AvisoDetalleModalProps) {
  if (!props.aviso) return null;
  return <AvisoDetalleModalContent key={props.aviso.id} {...props} aviso={props.aviso} />;
}
