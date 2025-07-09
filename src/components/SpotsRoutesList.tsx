
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Route, Heart, MessageCircle, Calendar } from 'lucide-react';
import { useSpots } from '@/hooks/useSpots';
import { useRoutes } from '@/hooks/useRoutes';

const SpotsRoutesList: React.FC = () => {
  const { data: spots, isLoading: spotsLoading } = useSpots();
  const { data: routes, isLoading: routesLoading } = useRoutes();

  if (spotsLoading || routesLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Споты */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Споты ({spots?.length || 0})
        </h2>
        <div className="space-y-3">
          {spots?.map((spot) => (
            <Card key={spot.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{spot.name}</h3>
                    {spot.description && (
                      <p className="text-sm text-gray-600 mt-1">{spot.description}</p>
                    )}
                    <div className="flex items-center text-xs text-gray-500 mt-2 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(spot.created_at).toLocaleDateString('ru-RU')}
                      </div>
                      <div className="flex items-center">
                        <Heart className="mr-1 h-3 w-3" />
                        {spot.likes_count || 0}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="mr-1 h-3 w-3" />
                        {spot.comments_count || 0}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    <MapPin className="mr-1 h-3 w-3" />
                    Спот
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!spots || spots.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">Спотов пока нет</p>
              <p className="text-sm">Добавьте первый спот на карте</p>
            </div>
          )}
        </div>
      </div>

      {/* Маршруты */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Route className="mr-2 h-5 w-5" />
          Маршруты ({routes?.length || 0})
        </h2>
        <div className="space-y-3">
          {routes?.map((route) => (
            <Card key={route.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{route.name}</h3>
                    {route.description && (
                      <p className="text-sm text-gray-600 mt-1">{route.description}</p>
                    )}
                    <div className="flex items-center text-xs text-gray-500 mt-2 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(route.created_at).toLocaleDateString('ru-RU')}
                      </div>
                      {route.distance && (
                        <div>
                          <strong>Расстояние:</strong> {route.distance} км
                        </div>
                      )}
                      <div className="flex items-center">
                        <Heart className="mr-1 h-3 w-3" />
                        {route.likes_count || 0}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="mr-1 h-3 w-3" />
                        {route.comments_count || 0}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    <Route className="mr-1 h-3 w-3" />
                    Маршрут
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!routes || routes.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Route className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">Маршрутов пока нет</p>
              <p className="text-sm">Создайте первый маршрут на карте</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpotsRoutesList;
