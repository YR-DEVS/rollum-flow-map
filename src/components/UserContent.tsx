
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MapPin, Route, Heart, MessageCircle, Calendar } from 'lucide-react';
import { useSpots } from '@/hooks/useSpots';
import { useRoutes } from '@/hooks/useRoutes';
import { useAuth } from '@/hooks/useAuth';

interface UserContentProps {
  onSpotClick?: (spotId: string, lat: number, lng: number) => void;
  onRouteClick?: (routeId: string) => void;
}

const UserContent: React.FC<UserContentProps> = ({ onSpotClick, onRouteClick }) => {
  const { appProfileId } = useAuth();
  const { data: allSpots } = useSpots();
  const { data: allRoutes } = useRoutes();

  // Фильтруем споты и маршруты текущего пользователя
  const userSpots = allSpots?.filter(spot => spot.app_user_id === appProfileId) || [];
  const userRoutes = allRoutes?.filter(route => route.app_user_id === appProfileId) || [];

  const handleSpotClick = (spot: any) => {
    if (onSpotClick) {
      onSpotClick(spot.id, Number(spot.latitude), Number(spot.longitude));
    }
  };

  const handleRouteClick = (route: any) => {
    if (onRouteClick) {
      onRouteClick(route.id);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="spots" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="spots" className="flex items-center space-x-2">
            <MapPin size={16} />
            <span>Мои споты ({userSpots.length})</span>
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex items-center space-x-2">
            <Route size={16} />
            <span>Мои маршруты ({userRoutes.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spots" className="space-y-4">
          {userSpots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">У вас пока нет созданных спотов</p>
              <p className="text-sm">Создайте первый спот на карте</p>
            </div>
          ) : (
            userSpots.map((spot) => (
              <Card 
                key={spot.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSpotClick(spot)}
              >
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
            ))
          )}
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          {userRoutes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Route className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">У вас пока нет созданных маршрутов</p>
              <p className="text-sm">Создайте первый маршрут на карте</p>
            </div>
          ) : (
            userRoutes.map((route) => (
              <Card 
                key={route.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleRouteClick(route)}
              >
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
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserContent;
