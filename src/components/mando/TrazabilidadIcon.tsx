import React from 'react';
import { WifiOff, Send, CheckCheck, Eye, Clock } from 'lucide-react';
import type { EstadoTrazabilidadNotificacion } from '@/services/incidentesService';

interface TrazabilidadIconProps {
  estado?: EstadoTrazabilidadNotificacion;
  size?: number;
}

/**
 * Iconografía vectorial estándar Lucide para el estado de trazabilidad de notificaciones.
 */
export const TrazabilidadIcon: React.FC<TrazabilidadIconProps> = ({
  estado,
  size = 13,
}) => {
  switch (estado) {
    case 'PENDIENTE_ENVIO':
      return <WifiOff size={size} aria-hidden="true" style={{ flexShrink: 0 }} />;
    case 'ENVIADA':
      return <Send size={size} aria-hidden="true" style={{ flexShrink: 0 }} />;
    case 'RECIBIDA':
      return <CheckCheck size={size} aria-hidden="true" style={{ flexShrink: 0 }} />;
    case 'LEIDA':
      return <Eye size={size} aria-hidden="true" style={{ flexShrink: 0 }} />;
    default:
      return <Clock size={size} aria-hidden="true" style={{ flexShrink: 0 }} />;
  }
};

