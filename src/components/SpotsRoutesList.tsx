
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Route, Heart, MessageCircle, Eye, Calendar } from 'lucide-react';
import { useSpots } from '@/hooks/useSpots';
import { useRoutes } from '@/hooks/useRoutes';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const SpotsRoutesList = () => {
  const [activeTab, setActiveTab] = useState<'spots' | 'routes'>('spots');
  const { data: spots, isLoading: spotsLoading } = useSpots();
  const { data: routes, isLoading: routesLoading } = useRoutes();

  if (spotsLoading || routesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'spots' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('spots')}
          className="flex-1"
          size="sm"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Споты ({spots?.length || 0})
        </Button>
        <Button
          variant={activeTab === 'routes' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('routes')}
          className="flex-1"
          size="sm"
        >
          <Route className="w-4 h-4 mr-2" />
          Маршруты ({routes?.length || 0})
        </Button>
      </div>

      {/* Spots List */}
      {activeTab === 'spots' && (
        <div className="space-y-3">
          {spots && spots.length > 0 ? (
            spots.map((spot) => (
              <Card key={spot.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{spot.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {spot.description || 'Нет описания'}
                    </p>
                    
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(spot.created_at), 'dd MMM yyyy', { locale: ru })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {spot.likes_count || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {spot.comments_count || 0}
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="ml-3">
                    <MapPin className="w-3 h-3 mr-1" />
                    Спот
                  </Badge>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Пока нет спотов</p>
              <p className="text-sm mt-1">Добавьте первый спот на карте</p>
            </div>
          )}
        </div>
      )}

      {/* Routes List */}
      {activeTab === 'routes' && (
        <div className="space-y-3">
          {routes && routes.length > 0 ? (
            routes.map((route) => (
              <Card key={route.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{route.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {route.description || 'Нет описания'}
                    </p>
                    
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(route.created_at), 'dd MMM yyyy', { locale: ru })}
                      </div>
                      {route.distance && (
                        <div className="flex items-center gap-1">
                          <Route className="w-3 h-3" />
                          {(route.distance / 1000).toFixed(1)} км
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {route.likes_count || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {route.comments_count || 0}
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="ml-3">
                    <Route className="w-3 h-3 mr-1" />
                    Маршрут
                  </Badge>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Route className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Пока нет маршрутов</p>
              <p className="text-sm mt-1">Создайте первый маршрут на карте</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpotsRoutesList;
