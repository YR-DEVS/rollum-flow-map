
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSpots } from '@/hooks/useSpots';
import { useRoutes } from '@/hooks/useRoutes';
import SpotDialog from './SpotDialog';
import RouteDialog from './RouteDialog';
import { RoutePoint } from '@/hooks/useRoutes';

interface MapboxMapProps {
  activeMode: 'view' | 'add-spot' | 'draw-route';
  onModeChange: (mode: 'view' | 'add-spot' | 'draw-route') => void;
  focusData?: {
    type: 'spot' | 'route' | null;
    id: string | null;
    lat?: number;
    lng?: number;
  };
  onFocusComplete?: () => void;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ 
  activeMode, 
  onModeChange, 
  focusData,
  onFocusComplete 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [spotDialogOpen, setSpotDialogOpen] = useState(false);
  const [routeDialogOpen, setRouteDialogOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const { data: spots } = useSpots();
  const { data: routes } = useRoutes();

  // Инициализация карты с таймаутом
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        mapboxgl.accessToken = 'pk.eyJ1IjoieXVuZ3JlemFjIiwiYSI6ImNtOW10ZzJ6bDBjNHUyanI3ejc5eXo1d2MifQ._tryk9cXjfReUGLGnNkm6Q';
        
        // Добавляем таймаут для инициализации
        const timeoutId = setTimeout(() => {
          if (!isMapLoaded) {
            setMapError('Время ожидания загрузки карты истекло');
            setIsLoading(false);
          }
        }, 10000); // 10 секунд таймаут

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [37.6176, 55.7558], // Москва
          zoom: 12,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
          console.log('Map loaded successfully');
          clearTimeout(timeoutId);
          setIsMapLoaded(true);
          setIsLoading(false);
          setMapError(null);
        });

        map.current.on('error', (e) => {
          console.error('Map error:', e);
          clearTimeout(timeoutId);
          setMapError('Ошибка загрузки карты. Проверьте подключение к интернету.');
          setIsLoading(false);
        });

      } catch (error) {
        console.error('Failed to initialize map:', error);
        setMapError('Не удалось инициализировать карту');
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Фокус на споте или маршруте
  useEffect(() => {
    if (!map.current || !isMapLoaded || !focusData?.type || !focusData?.id) return;

    try {
      if (focusData.type === 'spot' && focusData.lat && focusData.lng) {
        map.current.flyTo({
          center: [focusData.lng, focusData.lat],
          zoom: 16,
          duration: 2000
        });

        setTimeout(() => {
          const marker = markersRef.current.find(m => {
            const lngLat = m.getLngLat();
            return Math.abs(lngLat.lat - focusData.lat!) < 0.0001 && 
                   Math.abs(lngLat.lng - focusData.lng!) < 0.0001;
          });
          if (marker && marker.getPopup()) {
            marker.togglePopup();
          }
          onFocusComplete?.();
        }, 2500);
      } else if (focusData.type === 'route') {
        const route = routes?.find(r => r.id === focusData.id);
        if (route && route.route_points) {
          let routePointsData: RoutePoint[] = [];
          
          try {
            if (typeof route.route_points === 'string') {
              routePointsData = JSON.parse(route.route_points);
            } else if (Array.isArray(route.route_points)) {
              routePointsData = (route.route_points as any[]).map(point => ({
                lat: Number(point.lat),
                lng: Number(point.lng)
              }));
            }
          } catch (error) {
            console.error('Error parsing route points:', error);
            onFocusComplete?.();
            return;
          }

          if (routePointsData.length > 0) {
            const lats = routePointsData.map(p => p.lat);
            const lngs = routePointsData.map(p => p.lng);
            const bounds = new mapboxgl.LngLatBounds(
              [Math.min(...lngs), Math.min(...lats)],
              [Math.max(...lngs), Math.max(...lats)]
            );

            map.current.fitBounds(bounds, {
              padding: 50,
              duration: 2000
            });

            onFocusComplete?.();
          }
        }
      }
    } catch (error) {
      console.error('Error focusing on map element:', error);
      onFocusComplete?.();
    }
  }, [focusData, routes, onFocusComplete, isMapLoaded]);

  // Отображение спотов
  useEffect(() => {
    if (!map.current || !isMapLoaded || !spots) return;

    // Очищаем старые маркеры
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    try {
      spots.forEach(spot => {
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 10px;">
              <h3 style="margin: 0 0 5px 0; font-weight: bold;">${spot.name}</h3>
              ${spot.description ? `<p style="margin: 0 0 5px 0; color: #666;">${spot.description}</p>` : ''}
              <small style="color: #999;">❤️ ${spot.likes_count || 0} 💬 ${spot.comments_count || 0}</small>
            </div>
          `);

        const marker = new mapboxgl.Marker({ color: '#ef4444' })
          .setLngLat([Number(spot.longitude), Number(spot.latitude)])
          .setPopup(popup)
          .addTo(map.current!);

        markersRef.current.push(marker);
      });
    } catch (error) {
      console.error('Error adding spot markers:', error);
    }
  }, [spots, isMapLoaded]);

  // Отображение маршрутов
  useEffect(() => {
    if (!map.current || !isMapLoaded || !routes) return;

    try {
      routes.forEach(route => {
        if (route.route_points) {
          let routePointsData: RoutePoint[] = [];
          
          try {
            if (typeof route.route_points === 'string') {
              routePointsData = JSON.parse(route.route_points);
            } else if (Array.isArray(route.route_points)) {
              routePointsData = (route.route_points as any[]).map(point => ({
                lat: Number(point.lat),
                lng: Number(point.lng)
              }));
            }
          } catch (error) {
            console.error('Error parsing route points:', error);
            return;
          }

          if (routePointsData.length > 1) {
            const coordinates = routePointsData.map(point => [point.lng, point.lat]);
            const sourceId = `route-${route.id}`;
            
            if (map.current!.getSource(sourceId)) {
              map.current!.removeLayer(`route-layer-${route.id}`);
              map.current!.removeSource(sourceId);
            }

            map.current!.addSource(sourceId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: coordinates
                }
              }
            });

            map.current!.addLayer({
              id: `route-layer-${route.id}`,
              type: 'line',
              source: sourceId,
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#3b82f6',
                'line-width': 4
              }
            });

            map.current!.on('click', `route-layer-${route.id}`, (e) => {
              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`
                  <div style="padding: 10px;">
                    <h3 style="margin: 0 0 5px 0; font-weight: bold;">${route.name}</h3>
                    ${route.description ? `<p style="margin: 0 0 5px 0; color: #666;">${route.description}</p>` : ''}
                    <small style="color: #999;">❤️ ${route.likes_count || 0} 💬 ${route.comments_count || 0}</small>
                  </div>
                `)
                .addTo(map.current!);
            });

            map.current!.on('mouseenter', `route-layer-${route.id}`, () => {
              map.current!.getCanvas().style.cursor = 'pointer';
            });

            map.current!.on('mouseleave', `route-layer-${route.id}`, () => {
              map.current!.getCanvas().style.cursor = '';
            });
          }
        }
      });
    } catch (error) {
      console.error('Error adding route layers:', error);
    }
  }, [routes, isMapLoaded]);

  // Обработчик кликов по карте
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      try {
        if (activeMode === 'add-spot') {
          setSelectedCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng });
          setSpotDialogOpen(true);
          onModeChange('view');
        } else if (activeMode === 'draw-route') {
          const newPoint = { lat: e.lngLat.lat, lng: e.lngLat.lng };
          setRoutePoints(prev => [...prev, newPoint]);

          const marker = new mapboxgl.Marker({ color: '#3b82f6' })
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(map.current!);

          markersRef.current.push(marker);
        }
      } catch (error) {
        console.error('Error handling map click:', error);
      }
    };

    map.current.on('click', handleMapClick);

    return () => {
      map.current?.off('click', handleMapClick);
    };
  }, [activeMode, onModeChange, isMapLoaded]);

  // Рисование временного маршрута
  useEffect(() => {
    if (!map.current || !isMapLoaded || routePoints.length < 2) return;

    try {
      const coordinates = routePoints.map(point => [point.lng, point.lat]);
      const sourceId = 'temp-route';

      if (map.current.getSource(sourceId)) {
        map.current.removeLayer('temp-route-layer');
        map.current.removeSource(sourceId);
      }

      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        }
      });

      map.current.addLayer({
        id: 'temp-route-layer',
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#10b981',
          'line-width': 3,
          'line-dasharray': [2, 2]
        }
      });
    } catch (error) {
      console.error('Error drawing temporary route:', error);
    }
  }, [routePoints, isMapLoaded]);

  const clearRoute = () => {
    try {
      setRoutePoints([]);
      
      if (map.current?.getSource('temp-route')) {
        map.current.removeLayer('temp-route-layer');
        map.current.removeSource('temp-route');
      }

      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    } catch (error) {
      console.error('Error clearing route:', error);
    }
  };

  const saveRoute = () => {
    if (routePoints.length >= 2) {
      setRouteDialogOpen(true);
      onModeChange('view');
    }
  };

  // Показываем ошибку, если карта не загрузилась
  if (mapError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <Card className="p-6 text-center max-w-sm">
          <div className="text-red-500 mb-2 text-2xl">⚠️</div>
          <h3 className="font-medium text-gray-900 mb-2">Ошибка загрузки карты</h3>
          <p className="text-sm text-gray-600 mb-4">{mapError}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            size="sm"
          >
            Перезагрузить
          </Button>
        </Card>
      </div>
    );
  }

  // Показываем загрузку с индикатором прогресса
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <Card className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 mb-2">Загрузка карты...</p>
          <p className="text-xs text-gray-400">Это может занять несколько секунд</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {activeMode === 'add-spot' && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-blue-800 text-sm font-medium">
              Нажмите на карту, чтобы добавить новый спот
            </p>
          </Card>
        </div>
      )}

      {activeMode === 'draw-route' && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-800 text-sm font-medium">
                  Кликайте по карте, чтобы нарисовать маршрут
                </p>
                <p className="text-green-600 text-xs mt-1">
                  Точек: {routePoints.length}
                </p>
              </div>
              <div className="flex space-x-2">
                {routePoints.length >= 2 && (
                  <Button size="sm" onClick={saveRoute}>
                    Сохранить
                  </Button>
                )}
                {routePoints.length > 0 && (
                  <Button size="sm" variant="outline" onClick={clearRoute}>
                    Очистить
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      <SpotDialog
        isOpen={spotDialogOpen}
        onClose={() => setSpotDialogOpen(false)}
        latitude={selectedCoords?.lat || 0}
        longitude={selectedCoords?.lng || 0}
      />

      <RouteDialog
        isOpen={routeDialogOpen}
        onClose={() => setRouteDialogOpen(false)}
        routePoints={routePoints}
        onClearRoute={clearRoute}
      />
    </div>
  );

  function saveRoute() {
    if (routePoints.length >= 2) {
      setRouteDialogOpen(true);
      onModeChange('view');
    }
  }

  function clearRoute() {
    try {
      setRoutePoints([]);
      
      if (map.current?.getSource('temp-route')) {
        map.current.removeLayer('temp-route-layer');
        map.current.removeSource('temp-route');
      }

      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    } catch (error) {
      console.error('Error clearing route:', error);
    }
  }
};

export default MapboxMap;
