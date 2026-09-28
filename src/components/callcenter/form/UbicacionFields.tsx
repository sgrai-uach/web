'use client';

import React from 'react';
import { MapPin, Info } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { DuplicadoItem } from '@/types/incidente-manual';
import LocationPickerMap from '@/components/maps/LocationPickerMap';
import DuplicadoAlertaBanner from '../DuplicadoAlertaBanner';

interface UbicacionFieldsProps {
  direccion: string;
  setDireccion: (dir: string) => void;
  coordenadas: { latitud: number; longitud: number } | null;
  setCoordenadas: (coords: { latitud: number; longitud: number } | null) => void;
  onUserSelectLocation: (coords: { latitud: number; longitud: number }) => void;
  onSincronizarMapaConDireccion: () => void;
  geocodificandoMapa: boolean;
  duplicadosPreventivos: DuplicadoItem[];
  verificandoDuplicados: boolean;
  errorDireccion?: string;
}

export default function UbicacionFields({
  direccion,
  setDireccion,
  coordenadas,
  setCoordenadas,
  onUserSelectLocation,
  onSincronizarMapaConDireccion,
  geocodificandoMapa,
  duplicadosPreventivos,
  verificandoDuplicados,
  errorDireccion,
}: UbicacionFieldsProps) {
  return (
    <div>
      <label
        htmlFor="direccion"
        style={{ display: 'block', fontWeight: 700, fontSize: '14px', color: '#14505A', marginBottom: '6px' }}
      >
        4. Dirección o Referencia en Valdivia *
      </label>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input
          id="direccion"
          type="text"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          onBlur={onSincronizarMapaConDireccion}
          placeholder="Ej: Av. Alemania 550, Picarte 2000, Isla Teja..."
          style={{
            flex: 1,
            padding: '10px 12px',
            border: errorDireccion ? '2px solid #D32F2F' : '1px solid #3B3F45',
            fontSize: '14px',
            borderRadius: 0,
          }}
        />
        <Button
          type="button"
          variant="primary"
          onClick={onSincronizarMapaConDireccion}
          disabled={geocodificandoMapa || direccion.trim().length < 4}
          title="Ubicar la dirección escrita en el mapa interactivo"
          style={{ whiteSpace: 'nowrap' }}
        >
          <MapPin size={16} aria-hidden="true" />
          <span>{geocodificandoMapa ? 'Buscando...' : 'Ubicar en mapa'}</span>
        </Button>
      </div>

      {errorDireccion && (
        <span style={{ color: '#D32F2F', fontSize: '12px', marginBottom: '8px', display: 'block' }}>
          {errorDireccion}
        </span>
      )}

      <p style={{ fontSize: '12px', color: '#555555', margin: '4px 0 8px 0', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Info size={14} color="#1B6F7D" aria-hidden="true" />
        <em>Puedes escribir la dirección o hacer clic directamente en el mapa para marcar el lugar. Ambos se mantendrán sincronizados.</em>
      </p>

      {/* Banner preventivo si la pre-consulta detectó duplicados */}
      <DuplicadoAlertaBanner
        coincidencias={duplicadosPreventivos}
        consultando={verificandoDuplicados}
      />

      {/* Mini-mapa interactivo para afinar ubicación */}
      <div style={{ marginTop: '8px' }}>
        <LocationPickerMap
          latitud={coordenadas?.latitud}
          longitud={coordenadas?.longitud}
          onChange={setCoordenadas}
          onUserSelectLocation={onUserSelectLocation}
          height="190px"
        />
      </div>
    </div>
  );
}
