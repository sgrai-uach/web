'use client';

import { useEffect, useRef } from 'react';
import type {
  Map as LeafletMap,
  Marker as LeafletMarker,
  LeafletMouseEvent,
  DivIcon as LeafletDivIcon,
} from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerMapProps {
  latitud: number | string;
  longitud: number | string;
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
  const leafletModuleRef = useRef<typeof import('leaflet') | null>(null);
  const pinIconRef = useRef<LeafletDivIcon | null>(null);
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

      leafletModuleRef.current = L;

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

      pinIconRef.current = pinIcon;

      const numLat = parseFloat(String(initialCoordsRef.current.latitud));
      const numLng = parseFloat(String(initialCoordsRef.current.longitud));
      const hasInitialCoords =
        initialCoordsRef.current.latitud !== '' &&
        initialCoordsRef.current.longitud !== '' &&
        Number.isFinite(numLat) &&
        Number.isFinite(numLng);

      const centerLat = hasInitialCoords ? numLat : -39.8142;
      const centerLng = hasInitialCoords ? numLng : -73.2459;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 14,
          scrollWheelZoom: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        if (hasInitialCoords) {
          const marker = L.marker([numLat, numLng], {
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
          }

          markerRef.current = marker;
        }

        if (!readOnly) {
          map.on('click', (e: LeafletMouseEvent) => {
            const newLat = parseFloat(e.latlng.lat.toFixed(6));
            const newLng = parseFloat(e.latlng.lng.toFixed(6));

            if (!markerRef.current) {
              const marker = L.marker([newLat, newLng], {
                icon: pinIcon,
                draggable: true,
              }).addTo(map);

              marker.on('dragend', () => {
                const pos = marker.getLatLng();
                onChangeRef.current({
                  latitud: parseFloat(pos.lat.toFixed(6)),
                  longitud: parseFloat(pos.lng.toFixed(6)),
                });
              });

              markerRef.current = marker;
            } else {
              markerRef.current.setLatLng([newLat, newLng]);
            }

            onChangeRef.current({ latitud: newLat, longitud: newLng });
          });
        }

        mapInstanceRef.current = map;
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
    const numLat = typeof latitud === 'number' ? latitud : parseFloat(String(latitud));
    const numLng = typeof longitud === 'number' ? longitud : parseFloat(String(longitud));
    const hasValidCoords =
      latitud !== '' &&
      longitud !== '' &&
      Number.isFinite(numLat) &&
      Number.isFinite(numLng);

    if (mapInstanceRef.current) {
      if (hasValidCoords) {
        if (markerRef.current) {
          const currentPos = markerRef.current.getLatLng();
          if (
            Math.abs(currentPos.lat - numLat) > 0.00001 ||
            Math.abs(currentPos.lng - numLng) > 0.00001
          ) {
            markerRef.current.setLatLng([numLat, numLng]);
            mapInstanceRef.current.panTo([numLat, numLng], { animate: true });
          }
        } else if (leafletModuleRef.current && pinIconRef.current) {
          const L = leafletModuleRef.current;
          const marker = L.marker([numLat, numLng], {
            icon: pinIconRef.current,
            draggable: !readOnly,
          }).addTo(mapInstanceRef.current);

          if (!readOnly) {
            marker.on('dragend', () => {
              const pos = marker.getLatLng();
              onChangeRef.current({
                latitud: parseFloat(pos.lat.toFixed(6)),
                longitud: parseFloat(pos.lng.toFixed(6)),
              });
            });
          }

          markerRef.current = marker;
          mapInstanceRef.current.panTo([numLat, numLng], { animate: true });
        }
      } else if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }
  }, [latitud, longitud, readOnly]);

  const numLat = typeof latitud === 'number' ? latitud : parseFloat(String(latitud));
  const numLng = typeof longitud === 'number' ? longitud : parseFloat(String(longitud));
  const hasValidCoords =
    latitud !== '' &&
    longitud !== '' &&
    Number.isFinite(numLat) &&
    Number.isFinite(numLng);

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
      <div
        style={{
          fontSize: '12px',
          color: '#3B3F45',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span>
          {hasValidCoords
            ? 'Haz clic en el mapa o arrastra el marcador para fijar la ubicación del recurso.'
            : 'Haz clic en el mapa o presiona "Centrar en Valdivia" para fijar la ubicación.'}
        </span>
        <span>
          Coordenadas:{' '}
          {hasValidCoords ? (
            <strong>
              {numLat.toFixed(6)}, {numLng.toFixed(6)}
            </strong>
          ) : (
            <strong style={{ color: '#C81E1E' }}>Sin seleccionar</strong>
          )}
        </span>
      </div>
    </div>
  );
}
