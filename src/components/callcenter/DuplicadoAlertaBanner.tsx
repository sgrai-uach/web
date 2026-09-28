import React from 'react';
import { Loader2 } from 'lucide-react';
import InlineNotice from '@/components/ui/InlineNotice';
import type { DuplicadoItem } from '@/types/incidente-manual';

interface DuplicadoAlertaBannerProps {
  coincidencias: DuplicadoItem[];
  consultando?: boolean;
}

export default function DuplicadoAlertaBanner({
  coincidencias,
  consultando = false,
}: DuplicadoAlertaBannerProps) {
  if (consultando) {
    return (
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <InlineNotice
          variant="info"
          icon={<Loader2 size={18} className="animate-spin" aria-hidden="true" />}
        >
          <span>Verificando posibles reportes duplicados cercanos...</span>
        </InlineNotice>
      </div>
    );
  }

  if (!coincidencias || coincidencias.length === 0) {
    return null;
  }

  const distanciaMinima = Math.min(
    ...coincidencias.map((c) => c.distanciaMetros ?? 0)
  );

  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <InlineNotice
        variant="warning"
        title="Atención: Posible incidente duplicado detectado"
      >
        <p style={{ margin: '0 0 6px 0', lineHeight: 1.4 }}>
          Se identificaron <strong>{coincidencias.length}</strong> reporte(s) o incidente(s) del mismo tipo a aproximadamente{' '}
          <strong>{Math.round(distanciaMinima)} metros</strong> en las últimas 24 horas.
        </p>
        <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', opacity: 0.9 }}>
          Puedes continuar completando el formulario. Si confirmas el reporte, el sistema te consultará si deseas omitirlo para no saturar al Encargado.
        </p>
      </InlineNotice>
    </div>
  );
}
