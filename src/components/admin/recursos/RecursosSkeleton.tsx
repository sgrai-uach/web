interface RecursosSkeletonProps {
  filas?: number;
}

export default function RecursosSkeleton({ filas = 5 }: RecursosSkeletonProps) {
  const items = Array.from({ length: filas }, (_, i) => i);

  return (
    <>
      {items.map((idx) => (
        <tr
          key={idx}
          style={{
            borderBottom: '1px solid #ECEFF3',
            backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
          }}
        >
          {/* Nombre y tipo */}
          <td style={{ padding: '16px' }}>
            <div
              style={{
                width: '60%',
                height: '16px',
                backgroundColor: '#ECEFF3',
                marginBottom: '8px',
                animation: 'pulse 1.5s infinite',
              }}
            />
            <div
              style={{
                width: '40%',
                height: '12px',
                backgroundColor: '#ECEFF3',
                animation: 'pulse 1.5s infinite',
              }}
            />
          </td>

          {/* Tipo / Modalidad */}
          <td style={{ padding: '16px' }}>
            <div
              style={{
                width: '70%',
                height: '14px',
                backgroundColor: '#ECEFF3',
                animation: 'pulse 1.5s infinite',
              }}
            />
          </td>

          {/* Stock y Disponibilidad */}
          <td style={{ padding: '16px' }}>
            <div
              style={{
                width: '80%',
                height: '14px',
                backgroundColor: '#ECEFF3',
                marginBottom: '6px',
                animation: 'pulse 1.5s infinite',
              }}
            />
            <div
              style={{
                width: '50%',
                height: '12px',
                backgroundColor: '#ECEFF3',
                animation: 'pulse 1.5s infinite',
              }}
            />
          </td>

          {/* Delegación */}
          <td style={{ padding: '16px' }}>
            <div
              style={{
                width: '75%',
                height: '14px',
                backgroundColor: '#ECEFF3',
                animation: 'pulse 1.5s infinite',
              }}
            />
          </td>

          {/* Estado */}
          <td style={{ padding: '16px' }}>
            <div
              style={{
                width: '90px',
                height: '24px',
                backgroundColor: '#ECEFF3',
                animation: 'pulse 1.5s infinite',
              }}
            />
          </td>

          {/* Acción */}
          <td style={{ padding: '16px', textAlign: 'center' }}>
            <div
              style={{
                width: '80px',
                height: '30px',
                backgroundColor: '#ECEFF3',
                margin: '0 auto',
                animation: 'pulse 1.5s infinite',
              }}
            />
          </td>
        </tr>
      ))}

      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.6;
          }
        }
      `}</style>
    </>
  );
}
