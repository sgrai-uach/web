import type { EstadoRecurso } from '@/types/recurso';

const ESTADOS_CONFIG: Record<
  EstadoRecurso,
  { label: string; bg: string; border: string; text: string }
> = {
  DISPONIBLE: {
    label: 'Disponible',
    bg: '#E8F5E9',
    border: '#A5D6A7',
    text: '#2E7D32',
  },
  ASIGNADO: {
    label: 'En Terreno / Asignado',
    bg: '#E3F2FD',
    border: '#90CAF9',
    text: '#1565C0',
  },
  EN_MANTENCION: {
    label: 'En Mantención',
    bg: '#FFF3E0',
    border: '#FFCC80',
    text: '#E65100',
  },
  BAJO_STOCK: {
    label: 'Bajo Stock (Alerta)',
    bg: '#FFFDE7',
    border: '#FFF59D',
    text: '#F57F17',
  },
  NO_DISPONIBLE: {
    label: 'No Disponible',
    bg: '#FFEBEE',
    border: '#EF9A9A',
    text: '#C62828',
  },
};

interface BadgeEstadoProps {
  estado: EstadoRecurso;
  className?: string;
}

export default function BadgeEstado({ estado, className }: BadgeEstadoProps) {
  const config = ESTADOS_CONFIG[estado] || ESTADOS_CONFIG.NO_DISPONIBLE;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        fontSize: '12px',
        fontWeight: 700,
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.text,
        borderRadius: 0,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.text,
          marginRight: '6px',
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  );
}
