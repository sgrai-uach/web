'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker as LeafletMarker, LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerMapProps {
  latitud: number;
  longitud: number;
  onChange: (coords: { latitud: number; longitud: number }) => void;
  readOnly?: boolean;
}

export default function LocationPickerMap({
  latitud,
  longitud,
  onChange,
  readOnly = false,
}: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const initialCoordsRef = useRef({ latitud, longitud });

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    // Carga dinámica de Leaflet para prevenir problemas con SSR
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Icono SVG institucional de la Municipalidad de Valdivia (Teal)
      const pinIcon = L.divIcon({
        className: 'custom-valdivia-pin',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background-color: #1B6F7D;
            border: 2px solid #FFFFFF;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
              <circle cx="12" cy="10" r="2.5"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const initialLat = Number.isFinite(initialCoordsRef.current.latitud)
        ? initialCoordsRef.current.latitud
        : -39.8142;
      const initialLng = Number.isFinite(initialCoordsRef.current.longitud)
        ? initialCoordsRef.current.longitud
        : -73.2459;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [initialLat, initialLng],
          zoom: 14,
          scrollWheelZoom: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const marker = L.marker([initialLat, initialLng], {
          icon: pinIcon,
          draggable: !readOnly,
        }).addTo(map);

        if (!readOnly) {
          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            onChangeRef.current({
              latitud: parseFloat(pos.lat.toFixed(6)),
              longitud: parseFloat(pos.lng.toFixed(6)),
            });
          });

          map.on('click', (e: LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            const newLat = parseFloat(lat.toFixed(6));
            const newLng = parseFloat(lng.toFixed(6));
            marker.setLatLng([newLat, newLng]);
            onChangeRef.current({ latitud: newLat, longitud: newLng });
          });
        }

        mapInstanceRef.current = map;
        markerRef.current = marker;
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [readOnly]);

  // Actualizar posición del marcador cuando cambien las props desde el exterior (ej. botón centrar o inputs)
  useEffect(() => {
    if (
      mapInstanceRef.current &&
      markerRef.current &&
      Number.isFinite(latitud) &&
      Number.isFinite(longitud)
    ) {
      const currentPos = markerRef.current.getLatLng();
      if (
        Math.abs(currentPos.lat - latitud) > 0.00001 ||
        Math.abs(currentPos.lng - longitud) > 0.00001
      ) {
        markerRef.current.setLatLng([latitud, longitud]);
        mapInstanceRef.current.panTo([latitud, longitud], { animate: true });
      }
    }
  }, [latitud, longitud]);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '260px',
          border: '1px solid #3B3F45',
          backgroundColor: '#ECEFF3',
          zIndex: 1,
        }}
        aria-label="Mapa de selección de ubicación del recurso en Valdivia"
      />
      <div style={{ fontSize: '12px', color: '#3B3F45', display: 'flex', justifyContent: 'space-between' }}>
        <span>Haz clic en el mapa o arrastra el marcador para fijar la ubicación del recurso.</span>
        <span>Coordenadas actuales: <strong>{latitud.toFixed(4)}, {longitud.toFixed(4)}</strong></span>
      </div>
    </div>
  );
}
