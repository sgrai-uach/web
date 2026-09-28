import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker as LeafletMarker, LeafletMouseEvent, DivIcon as LeafletDivIcon } from 'leaflet';
import { createValdiviaPinIcon } from '@/components/maps/valdiviaPinIcon';

interface UseLocationPickerMapParams {
  latitud?: number | null;
  longitud?: number | null;
  onChange: (coords: { latitud: number; longitud: number } | null) => void;
  onUserSelectLocation?: (coords: { latitud: number; longitud: number }) => void;
  readOnly?: boolean;
}

function bindMarkerDrag(marker: LeafletMarker, notify: (coords: { latitud: number; longitud: number }) => void) {
  marker.on('dragend', () => {
    const pos = marker.getLatLng();
    notify({ latitud: parseFloat(pos.lat.toFixed(6)), longitud: parseFloat(pos.lng.toFixed(6)) });
  });
}

export function useLocationPickerMap({
  latitud,
  longitud,
  onChange,
  onUserSelectLocation,
  readOnly = false,
}: UseLocationPickerMapParams) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const leafletModuleRef = useRef<typeof import('leaflet') | null>(null);
  const pinIconRef = useRef<LeafletDivIcon | null>(null);
  const callbacksRef = useRef({ onChange, onUserSelectLocation });

  useEffect(() => {
    callbacksRef.current = { onChange, onUserSelectLocation };
  }, [onChange, onUserSelectLocation]);

  const notifyChange = (coords: { latitud: number; longitud: number }) => {
    callbacksRef.current.onChange(coords);
    callbacksRef.current.onUserSelectLocation?.(coords);
  };

  const initialCoordsRef = useRef({ latitud, longitud });

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;
      leafletModuleRef.current = L;
      const pinIcon = createValdiviaPinIcon(L);
      pinIconRef.current = pinIcon;

      const numLat = typeof initialCoordsRef.current.latitud === 'number' ? initialCoordsRef.current.latitud : null;
      const numLng = typeof initialCoordsRef.current.longitud === 'number' ? initialCoordsRef.current.longitud : null;
      const hasCoords = numLat !== null && numLng !== null && Number.isFinite(numLat) && Number.isFinite(numLng);

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [hasCoords ? numLat : -39.81422, hasCoords ? numLng : -73.24589],
          zoom: 14,
          scrollWheelZoom: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap &bull; Municipalidad de Valdivia',
          maxZoom: 19,
        }).addTo(map);

        if (hasCoords) {
          const marker = L.marker([numLat, numLng], { icon: pinIcon, draggable: !readOnly }).addTo(map);
          if (!readOnly) bindMarkerDrag(marker, notifyChange);
          markerRef.current = marker;
        }

        if (!readOnly) {
          map.on('click', (e: LeafletMouseEvent) => {
            const coords = { latitud: parseFloat(e.latlng.lat.toFixed(6)), longitud: parseFloat(e.latlng.lng.toFixed(6)) };
            if (!markerRef.current) {
              const marker = L.marker([coords.latitud, coords.longitud], { icon: pinIcon, draggable: true }).addTo(map);
              bindMarkerDrag(marker, notifyChange);
              markerRef.current = marker;
            } else {
              markerRef.current.setLatLng([coords.latitud, coords.longitud]);
            }
            notifyChange(coords);
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

  useEffect(() => {
    const numLat = typeof latitud === 'number' && Number.isFinite(latitud) ? latitud : null;
    const numLng = typeof longitud === 'number' && Number.isFinite(longitud) ? longitud : null;
    const hasValidCoords = numLat !== null && numLng !== null;

    if (!mapInstanceRef.current) return;

    if (hasValidCoords) {
      if (markerRef.current) {
        const currentPos = markerRef.current.getLatLng();
        if (Math.abs(currentPos.lat - numLat) > 0.00001 || Math.abs(currentPos.lng - numLng) > 0.00001) {
          markerRef.current.setLatLng([numLat, numLng]);
          mapInstanceRef.current.panTo([numLat, numLng], { animate: true });
        }
      } else if (leafletModuleRef.current && pinIconRef.current) {
        const marker = leafletModuleRef.current.marker([numLat, numLng], {
          icon: pinIconRef.current,
          draggable: !readOnly,
        }).addTo(mapInstanceRef.current);
        if (!readOnly) bindMarkerDrag(marker, notifyChange);
        markerRef.current = marker;
        mapInstanceRef.current.panTo([numLat, numLng], { animate: true });
      }
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [latitud, longitud, readOnly]);

  return {
    mapContainerRef,
    hasCoords: typeof latitud === 'number' && typeof longitud === 'number',
    handleLimpiarPunto: () => {
      markerRef.current?.remove();
      markerRef.current = null;
      callbacksRef.current.onChange(null);
    },
    handleCentrarValdivia: () => {
      mapInstanceRef.current?.setView([-39.81422, -73.24589], 14, { animate: true });
    },
  };
}
