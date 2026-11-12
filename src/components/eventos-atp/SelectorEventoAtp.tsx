'use client';

import { useState, useEffect, useMemo } from 'react';
import Select from '@/components/ui/Select';
import { listarEventosAtp } from '@/services/eventosAtpService';
import type { EventoAtpResumen } from '@/types/eventoAtp';

export interface SelectorEventoAtpProps {
  id?: string;
  label?: string;
  value?: string | null;
  onChange: (eventoAtpId: string | null) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  placeholder?: string;
  permitirVacio?: boolean;
}

/**
 * Selector reutilizable de Eventos ATP ACTIVOS (H60).
 *
 * Solo lista eventos en estado ACTIVO, ya que el backend rechaza cualquier
 * vinculación a un evento finalizado o cancelado.
 */
export const SelectorEventoAtp: React.FC<SelectorEventoAtpProps> = ({
  id = 'selector-evento-atp',
  label = 'Evento ATP',
  value,
  onChange,
  disabled = false,
  error,
  helperText,
  placeholder = 'Sin Evento ATP vinculado',
  permitirVacio = true,
}) => {
  const [eventos, setEventos] = useState<EventoAtpResumen[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    let activo = true;

    queueMicrotask(() => {
      if (!activo) return;
      setCargando(true);
      listarEventosAtp({ estado: 'ACTIVO', limit: 100 })
        .then((res) => {
          if (!activo) return;
          setEventos(res.exito ? res.eventos : []);
        })
        .finally(() => {
          if (activo) setCargando(false);
        });
    });

    return () => {
      activo = false;
    };
  }, []);

  const opciones = useMemo(() => {
    const lista = eventos.map((evento) => ({
      value: evento.id,
      label: `${evento.codigo} · ${evento.nombre}`,
    }));

    if (permitirVacio) {
      return [{ value: '', label: cargando ? 'Cargando Eventos ATP...' : placeholder }, ...lista];
    }

    return lista;
  }, [eventos, cargando, permitirVacio, placeholder]);

  return (
    <Select
      id={id}
      label={label}
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value || null)}
      disabled={disabled || cargando}
      error={error}
      helperText={
        helperText ??
        'Solo se muestran Eventos ATP en estado ACTIVO.'
      }
      options={opciones}
    />
  );
};

export default SelectorEventoAtp;
