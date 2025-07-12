import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSpots } from '@/hooks/useSpots';
import { useRoutes } from '@/hooks/useRoutes';
import { Button } from '@/components/ui/button';
import { MapPin, Route, X, RefreshCw } from 'lucide-react';
import SpotDialog from './SpotDialog';
import RouteDialog from './RouteDialog';

// Фиксированный токен Mapbox для всех пользователей
const MAPBOX_TOKEN = 'pk.eyJ1IjoieXVuZ3JlemFjIiwiYSI6ImNtOW10ZzJ6bDBjNHUyanI3ejc5eXo1d2MifQ._tryk9cXjfReUGLGnNkm6Q';

interface MapboxMapProps {
  className?: string;
  activeMode?: 'view' | 'add-spot' | 'draw-route';
  onModeChange?: (mode: 'view' | 'add-spot' | 'draw-route') => void;
  focusData?: {
    type: 'spot' | 'route' | null;
    id: string | null;
    lat?: number;
    lng?: number;
  };
  onFocusComplete?: () => void;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ 
  className = '', 
  activeMode = 'view',
  onModeChange,
  focusData,
  onFocusComplete
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(37.6173);
  const [lat, setLat] = useState(55.7558);
  const [zoom, setZoom] = useState(9);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Dialog states
  const [isSpotDialogOpen, setIsSpotDialogOpen] = useState(false);
  const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);
  const [selectedSpotCoords, setSelectedSpotCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ lat: number; lng: number }[]>([]);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  
  const { data: spots, isLoading: spotsLoading, error: spotsError } = useSpots();
  const { data: routes, isLoading: routesLoading, error: routesError } = useRoutes();

  const initializeMap = () => {
    if (map.current || !mapContainer.current) return;

    console.log('Initializing Mapbox map...');
    
    setMapError(null);
    setIsMapLoaded(false);

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: zoom,
        attributionControl: false
      });

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setIsMapLoaded(true);
        setMapError(null);
      });

      map.current.on('move', () => {
        if (map.current) {
          setLng(parseFloat(map.current.getCenter().lng.toFixed(4)));
          setLat(parseFloat(map.current.getCenter().lat.toFixed(4)));
          setZoom(parseFloat(map.current.getZoom().toFixed(2)));
        }
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Ошибка загрузки карты. Проверьте подключение к интернету.');
        setIsMapLoaded(false);
      });

      // Add click handler for adding spots and route points
      map.current.on('click', (e) => {
        if (activeMode === 'draw-route' || isCreatingRoute) {
          const coords = { lat: e.lngLat.lat, lng: e.lngLat.lng };
          setRouteCoords(prev => [...prev, coords]);
          addRoutePoint(coords);
        } else if (activeMode === 'add-spot') {
          setSelectedSpotCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng });
          setIsSpotDialogOpen(true);
        }
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Не удалось инициализировать карту.');
      setIsMapLoaded(false);
    }
  };

  const retryMapLoad = () => {
    setIsRetrying(true);
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    setTimeout(() => {
      initializeMap();
      setIsRetrying(false);
    }, 1000);
  };

  useEffect(() => {
    initializeMap();
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update mode when activeMode prop changes
  useEffect(() => {
    if (activeMode === 'draw-route' && !isCreatingRoute) {
      setIsCreatingRoute(true);
      setRouteCoords([]);
    } else if (activeMode === 'view' && isCreatingRoute) {
      setIsCreatingRoute(false);
      setRouteCoords([]);
      // Remove temporary markers
      const markers = document.querySelectorAll('.route-point-marker');
      markers.forEach(marker => marker.remove());
    }
  }, [activeMode, isCreatingRoute]);

  // Handle focus on specific spot or route
  useEffect(() => {
    if (!map.current || !isMapLoaded || !focusData || !focusData.id) return;

    if (focusData.type === 'spot' && focusData.lat && focusData.lng) {
      map.current.flyTo({
        center: [focusData.lng, focusData.lat],
        zoom: 15,
        duration: 2000
      });
    }

    // Call onFocusComplete after animation
    const timeout = setTimeout(() => {
      if (onFocusComplete) {
        onFocusComplete();
      }
    }, 2500);

    return () => clearTimeout(timeout);
  }, [focusData, isMapLoaded, onFocusComplete]);

  // Add spots to map
  useEffect(() => {
    if (!map.current || !isMapLoaded || !spots || spots.length === 0) return;
    
    console.log('Adding spots to map:', spots.length);
    
    spots.forEach((spot) => {
      if (!spot.id || typeof spot.latitude !== 'number' || typeof spot.longitude !== 'number') {
        console.warn('Invalid spot data:', spot);
        return;
      }

      // Create marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'spot-marker';
      markerEl.innerHTML = `
        <div class="bg-blue-500 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-600 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div class="p-2">
            <h3 class="font-bold text-sm">${spot.name}</h3>
            <p class="text-xs text-gray-600 mt-1">${spot.description || 'Нет описания'}</p>
            <div class="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <span>❤️ ${spot.likes_count || 0}</span>
              <span>💬 ${spot.comments_count || 0}</span>
            </div>
          </div>
        `);

      // Add marker to map
      new mapboxgl.Marker(markerEl)
        .setLngLat([spot.longitude, spot.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [spots, isMapLoaded]);

  // Add routes to map
  useEffect(() => {
    if (!map.current || !isMapLoaded || !routes || routes.length === 0) return;
    
    console.log('Adding routes to map:', routes.length);
    
    routes.forEach((route, index) => {
      if (!route.route_points) return;
      
      let routePoints: { lat: number; lng: number }[] = [];
      try {
        if (typeof route.route_points === 'string') {
          routePoints = JSON.parse(route.route_points);
        } else if (Array.isArray(route.route_points)) {
          routePoints = route.route_points as { lat: number; lng: number }[];
        }
      } catch (error) {
        console.error('Error parsing route points:', error);
        return;
      }

      if (routePoints.length < 2) return;

      const sourceId = `route-${route.id}`;
      const layerId = `route-layer-${route.id}`;

      // Remove existing source and layer if they exist
      if (map.current!.getLayer(layerId)) {
        map.current!.removeLayer(layerId);
      }
      if (map.current!.getSource(sourceId)) {
        map.current!.removeSource(sourceId);
      }

      // Add route source
      map.current!.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routePoints.map(point => [point.lng, point.lat])
          }
        }
      });

      // Add route layer
      map.current!.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#10B981',
          'line-width': 4
        }
      });

      // Add click handler for route
      map.current!.on('click', layerId, () => {
        new mapboxgl.Popup()
          .setLngLat([routePoints[0].lng, routePoints[0].lat])
          .setHTML(`
            <div class="p-2">
              <h3 class="font-bold text-sm">${route.name}</h3>
              <p class="text-xs text-gray-600 mt-1">${route.description || 'Нет описания'}</p>
              <div class="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span>❤️ ${route.likes_count || 0}</span>
                <span>💬 ${route.comments_count || 0}</span>
              </div>
            </div>
          `)
          .addTo(map.current!);
      });

      // Change cursor on hover
      map.current!.on('mouseenter', layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current!.on('mouseleave', layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    });
  }, [routes, isMapLoaded]);

  const addRoutePoint = (coords: { lat: number; lng: number }) => {
    if (!map.current) return;

    const markerEl = document.createElement('div');
    markerEl.className = 'route-point-marker';
    markerEl.innerHTML = `
      <div class="bg-green-500 text-white p-1 rounded-full shadow-lg">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="8"/>
        </svg>
      </div>
    `;

    new mapboxgl.Marker(markerEl)
      .setLngLat([coords.lng, coords.lat])
      .addTo(map.current);
  };

  const startRouteCreation = () => {
    setIsCreatingRoute(true);
    setRouteCoords([]);
    if (onModeChange) {
      onModeChange('draw-route');
    }
  };

  const finishRouteCreation = () => {
    if (routeCoords.length >= 2) {
      setIsRouteDialogOpen(true);
    } else {
      alert('Маршрут должен содержать минимум 2 точки');
    }
  };

  const cancelRouteCreation = () => {
    setIsCreatingRoute(false);
    setRouteCoords([]);
    // Remove temporary markers
    const markers = document.querySelectorAll('.route-point-marker');
    markers.forEach(marker => marker.remove());
    if (onModeChange) {
      onModeChange('view');
    }
  };

  const clearRoute = () => {
    setRouteCoords([]);
    // Remove temporary markers
    const markers = document.querySelectorAll('.route-point-marker');
    markers.forEach(marker => marker.remove());
  };

  if (mapError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Ошибка загрузки карты</h3>
          <p className="text-gray-500 mb-4">{mapError}</p>
          <div className="space-y-2">
            <Button 
              onClick={retryMapLoad} 
              variant="outline"
              disabled={isRetrying}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Повторная попытка...' : 'Попробовать снова'}</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isMapLoaded) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Загрузка карты</h3>
          <p className="text-gray-500">Пожалуйста, подождите...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {!isCreatingRoute && activeMode !== 'draw-route' ? (
          <Button
            onClick={startRouteCreation}
            className="bg-green-500 hover:bg-green-600 text-white shadow-lg"
            size="sm"
          >
            <Route className="w-4 h-4 mr-2" />
            Создать маршрут
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              onClick={finishRouteCreation}
              className="bg-green-500 hover:bg-green-600 text-white shadow-lg"
              size="sm"
            >
              Завершить маршрут
            </Button>
            <Button
              onClick={cancelRouteCreation}
              variant="outline"
              className="shadow-lg"
              size="sm"
            >
              <X className="w-4 h-4 mr-2" />
              Отмена
            </Button>
          </div>
        )}
      </div>

      {/* Route creation info */}
      {(isCreatingRoute || activeMode === 'draw-route') && (
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">
            Нажмите на карту для добавления точек маршрута
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Точек добавлено: {routeCoords.length}
          </p>
        </div>
      )}

      {/* Spot Dialog */}
      <SpotDialog
        isOpen={isSpotDialogOpen}
        onClose={() => {
          setIsSpotDialogOpen(false);
          setSelectedSpotCoords(null);
        }}
        initialCoords={selectedSpotCoords}
      />

      {/* Route Dialog */}
      <RouteDialog
        isOpen={isRouteDialogOpen}
        onClose={() => {
          setIsRouteDialogOpen(false);
          setIsCreatingRoute(false);
          clearRoute();
          if (onModeChange) {
            onModeChange('view');
          }
        }}
        routePoints={routeCoords}
        onClearRoute={clearRoute}
      />
    </div>
  );
};

export default MapboxMap;
