
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, LogOut, User, Map } from 'lucide-react';
import UserContent from '@/components/UserContent';
import { useNavigate } from 'react-router-dom';

interface ProfileProps {
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  } | null;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleSpotClick = (spotId: string, lat: number, lng: number) => {
    // Переходим на карту с фокусом на спот
    navigate(`/map?focus=spot&id=${spotId}&lat=${lat}&lng=${lng}`);
  };

  const handleRouteClick = (routeId: string) => {
    // Переходим на карту с фокусом на маршрут
    navigate(`/map?focus=route&id=${routeId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white px-6 py-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={user.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face'}
              alt="Profile"
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {user.first_name} {user.last_name}
              </h1>
              {user.username && (
                <p className="text-gray-600">@{user.username}</p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-full">
            <Settings size={16} />
          </Button>
        </div>
      </div>

      <div className="px-6 py-4">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="content" className="flex items-center space-x-2">
              <Map size={16} />
              <span>Мой контент</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <User size={16} />
              <span>Настройки</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <UserContent 
              onSpotClick={handleSpotClick}
              onRouteClick={handleRouteClick}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Button
              onClick={onLogout}
              variant="outline"
              className="w-full rounded-2xl text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut size={16} className="mr-2" />
              Выйти
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
