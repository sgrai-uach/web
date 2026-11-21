'use client';

import React from 'react';
import { Home, Plus, Trash2, Users, RotateCcw, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import {
  NIVELES_COMPROMISO_VIVIENDA,
  type FamiliaAfectadaSocialDTO,
} from '@/types/asistenciaSocial';

export interface FamiliasAfectadasDesgloseSectionProps {
  familias: FamiliaAfectadaSocialDTO[];
  onChangeFamilias: (familias: FamiliaAfectadaSocialDTO[]) => void;
  disabled?: boolean;
  errorGeneral?: string;
  totalPersonasExterno?: number | null;
}

function parseNonNegInt(raw: string): number {
  if (raw === '') return 0;
  const parsed = Number(raw);
  if (Number.isNaN(parsed) || parsed < 0) return 0;
  return Math.trunc(parsed);
}

export default function FamiliasAfectadasDesgloseSection({
  familias,
  onChangeFamilias,
  disabled = false,
  errorGeneral,
  totalPersonasExterno,
}: FamiliasAfectadasDesgloseSectionProps) {
  const handleAgregarFamilia = () => {
    const nuevaFamilia: FamiliaAfectadaSocialDTO = {
      id: `fam-${Date.now()}-${familias.length + 1}`,
      referencia: '',
      nucleoFamiliarTotal: 1,
      cantidadNinos: 0,
      cantidadAdultosMayores: 0,
      personasDiscapacitadas: 0,
      personasElectrodependientes: 0,
      mascotasAfectadas: 0,
      nivelCompromisoVivienda: '',
    };
    onChangeFamilias([...familias, nuevaFamilia]);
  };

  const handleQuitarFamilia = (indice: number) => {
    onChangeFamilias(familias.filter((_, idx) => idx !== indice));
  };

  const handleActualizarCampo = (
    indice: number,
    campo: keyof FamiliaAfectadaSocialDTO,
    valor: string | number
  ) => {
    const actualizadas = familias.map((fam, idx) => {
      if (idx !== indice) return fam;
      const siguiente: FamiliaAfectadaSocialDTO = {
        ...fam,
        [campo]: valor,
      };

      const ninos = Number(siguiente.cantidadNinos) || 0;
      const adultosMayores = Number(siguiente.cantidadAdultosMayores) || 0;
      if (
        (campo === 'cantidadNinos' || campo === 'cantidadAdultosMayores') &&
        ninos + adultosMayores > (Number(siguiente.nucleoFamiliarTotal) || 0)
      ) {
        siguiente.nucleoFamiliarTotal = ninos + adultosMayores;
      }

      return siguiente;
    });
    onChangeFamilias(actualizadas);
  };

  const totales = familias.reduce(
    (acc, fam) => ({
      integrantes: acc.integrantes + (Number(fam.nucleoFamiliarTotal) || 0),
      ninos: acc.ninos + (Number(fam.cantidadNinos) || 0),
      adultosMayores: acc.adultosMayores + (Number(fam.cantidadAdultosMayores) || 0),
      discapacidad: acc.discapacidad + (Number(fam.personasDiscapacitadas) || 0),
      electrodependientes:
        acc.electrodependientes + (Number(fam.personasElectrodependientes) || 0),
      mascotas: acc.mascotas + (Number(fam.mascotasAfectadas) || 0),
    }),
    {
      integrantes: 0,
      ninos: 0,
      adultosMayores: 0,
      discapacidad: 0,
      electrodependientes: 0,
      mascotas: 0,
    }
  );

  return (
    <div
      style={{
        marginTop: 'var(--space-4, 16px)',
        border: '1px solid var(--border-color-neutral, #DFE3E8)',
        backgroundColor: 'var(--color-bg-light, #ECEFF3)',
        padding: 'var(--space-4, 16px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3, 12px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              fontSize: '13px',
              color: 'var(--color-primary-teal-dark, #14505A)',
            }}
          >
            <Home size={16} color="var(--color-primary-teal, #1B6F7D)" />
            <span>Desglose por Familia / Hogar (Opcional)</span>
          </div>
          <p
            style={{
              margin: '3px 0 0 0',
              fontSize: '12px',
              color: 'var(--color-text-muted, #5F676E)',
            }}
          >
            Opcional: registre el detalle por grupo familiar homologado con el informe de terreno (niños, adultos mayores, discapacidad, electrodependientes y mascotas). Si desconoce el detalle, use solo los aproximados superiores.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAgregarFamilia}
          disabled={disabled}
        >
          <Plus size={14} style={{ marginRight: '5px' }} />
          <span>Añadir Familia / Hogar</span>
        </Button>
      </div>

      {errorGeneral && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
            border: '1px solid var(--color-danger, #D32F2F)',
            color: 'var(--color-danger, #D32F2F)',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{errorGeneral}</span>
        </div>
      )}

      {familias.length === 0 ? (
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: '#FFFFFF',
            border: '1px dashed var(--border-color-neutral-dark, #CCD2D9)',
            fontSize: '12px',
            color: 'var(--color-text-muted, #5F676E)',
          }}
        >
          Modo aproximado activo: sin desglose por familia. Presione &quot;Añadir Familia / Hogar&quot; si conoce el detalle de integrantes por grupo vulnerable.
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {familias.map((fam, idx) => (
              <div
                key={fam.id || idx}
                data-testid={`familia-card-${idx}`}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-color-neutral, #DFE3E8)',
                  borderLeft: '3px solid var(--color-primary-teal, #1B6F7D)',
                  padding: 'var(--space-4, 16px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    flexWrap: 'wrap',
                    borderBottom: '1px solid var(--border-color-neutral, #DFE3E8)',
                    paddingBottom: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 700,
                      fontSize: '13px',
                      color: 'var(--color-charcoal-dark, #24272B)',
                    }}
                  >
                    <Users size={15} color="var(--color-primary-teal, #1B6F7D)" />
                    <span>
                      Familia #{idx + 1}
                      {fam.referencia?.trim() ? ` — ${fam.referencia.trim()}` : ''}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuitarFamilia(idx)}
                    disabled={disabled}
                    aria-label={`Quitar familia ${idx + 1}`}
                    style={{ color: 'var(--color-danger, #D32F2F)' }}
                  >
                    <Trash2 size={14} style={{ marginRight: '4px' }} />
                    <span>Quitar</span>
                  </Button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '12px',
                  }}
                >
                  <Input
                    id={`fam-ref-${idx}`}
                    label="Referencia del Hogar"
                    placeholder="Ej. Familia González / Casa interior"
                    value={fam.referencia || ''}
                    disabled={disabled}
                    onChange={(e) => handleActualizarCampo(idx, 'referencia', e.target.value)}
                  />

                  <Select
                    id={`fam-comp-${idx}`}
                    label="Compromiso Habitacional"
                    value={fam.nivelCompromisoVivienda || ''}
                    disabled={disabled}
                    onChange={(e) =>
                      handleActualizarCampo(idx, 'nivelCompromisoVivienda', e.target.value)
                    }
                    options={[
                      { value: '', label: 'Sin especificar' },
                      ...NIVELES_COMPROMISO_VIVIENDA.map((op) => ({
                        value: op.value,
                        label: op.label,
                      })),
                    ]}
                  />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
                    gap: '12px',
                  }}
                >
                  <Input
                    id={`fam-total-${idx}`}
                    type="number"
                    label="Total Integrantes *"
                    min={1}
                    value={fam.nucleoFamiliarTotal}
                    disabled={disabled}
                    onChange={(e) =>
                      handleActualizarCampo(
                        idx,
                        'nucleoFamiliarTotal',
                        Math.max(1, parseNonNegInt(e.target.value))
                      )
                    }
                  />

                  <Input
                    id={`fam-ninos-${idx}`}
                    type="number"
                    label="Niños / Adolescentes"
                    min={0}
                    value={fam.cantidadNinos ?? 0}
                    disabled={disabled}
                    onChange={(e) =>
                      handleActualizarCampo(idx, 'cantidadNinos', parseNonNegInt(e.target.value))
                    }
                  />

                  <Input
                    id={`fam-mayores-${idx}`}
                    type="number"
                    label="Adultos Mayores"
                    min={0}
                    value={fam.cantidadAdultosMayores ?? 0}
                    disabled={disabled}
                    onChange={(e) =>
                      handleActualizarCampo(
                        idx,
                        'cantidadAdultosMayores',
                        parseNonNegInt(e.target.value)
                      )
                    }
                  />

                  <Input
                    id={`fam-discap-${idx}`}
                    type="number"
                    label="Personas con Discapacidad"
                    min={0}
                    value={fam.personasDiscapacitadas ?? 0}
                    disabled={disabled}
                    onChange={(e) =>
                      handleActualizarCampo(
                        idx,
                        'personasDiscapacitadas',
                        parseNonNegInt(e.target.value)
                      )
                    }
                  />

                  <Input
                    id={`fam-electro-${idx}`}
                    type="number"
                    label="Electrodependientes"
                    min={0}
                    value={fam.personasElectrodependientes ?? 0}
                    disabled={disabled}
                    onChange={(e) =>
                      handleActualizarCampo(
                        idx,
                        'personasElectrodependientes',
                        parseNonNegInt(e.target.value)
                      )
                    }
                  />

                  <Input
                    id={`fam-mascotas-${idx}`}
                    type="number"
                    label="Mascotas Afectadas"
                    min={0}
                    value={fam.mascotasAfectadas ?? 0}
                    disabled={disabled}
                    onChange={(e) =>
                      handleActualizarCampo(
                        idx,
                        'mascotasAfectadas',
                        parseNonNegInt(e.target.value)
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            data-testid="resumen-desglose-familias"
            style={{
              backgroundColor: 'var(--color-info-bg, #E0F2F1)',
              border: '1px solid var(--color-primary-teal, #1B6F7D)',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              fontSize: '12px',
              color: 'var(--color-text-dark, #2B2B2B)',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
              <span>
                <strong>Hogares:</strong> {familias.length}
              </span>
              <span>
                <strong>Integrantes:</strong> {totales.integrantes}
              </span>
              <span>
                <strong>Niños:</strong> {totales.ninos}
              </span>
              <span>
                <strong>Adultos mayores:</strong> {totales.adultosMayores}
              </span>
              <span>
                <strong>Discapacidad:</strong> {totales.discapacidad}
              </span>
              <span>
                <strong>Electrodependientes:</strong> {totales.electrodependientes}
              </span>
              <span>
                <strong>Mascotas:</strong> {totales.mascotas}
              </span>
              {totalPersonasExterno !== null &&
                totalPersonasExterno !== undefined &&
                totalPersonasExterno !== totales.integrantes && (
                  <span style={{ color: 'var(--color-warning, #E65100)', fontWeight: 600 }}>
                    (Diferencia respecto al total reportado al cierre: {totalPersonasExterno})
                  </span>
                )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChangeFamilias([])}
              disabled={disabled}
            >
              <RotateCcw size={13} style={{ marginRight: '5px' }} />
              <span>Volver a modo aproximado</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
