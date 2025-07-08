
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Settings, MapPin, MessageCircle, Heart, LogOut } from 'lucide-react';

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
  const stats = [
    { label: 'Постов', value: '23' },
    { label: 'Лайков', value: '156' },
    { label: 'Спотов', value: '8' },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'post',
      title: 'Добавил новый пост в "Техника и трюки"',
      time: '2 часа назад',
    },
    {
      id: 2,
      type: 'spot',
      title: 'Добавил спот "Парк Горького"',
      time: '1 день назад',
    },
    {
      id: 3,
      type: 'like',
      title: 'Понравился пост "Лучшие ролики 2024"',
      time: '2 дня назад',
    },
  ];

  if (!user) {
    return null;
  }

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

        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-xl font-semibold text-gray-900">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Последняя активность</h2>
        <div className="space-y-3 mb-6">
          {recentActivity.map((activity) => (
            <Card key={activity.id} className="p-4 bg-white rounded-2xl shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  {activity.type === 'post' && <MessageCircle size={16} className="text-blue-600" />}
                  {activity.type === 'spot' && <MapPin size={16} className="text-blue-600" />}
                  {activity.type === 'like' && <Heart size={16} className="text-blue-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 mb-1">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full rounded-2xl text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut size={16} className="mr-2" />
          Выйти
        </Button>
      </div>
    </div>
  );
};

export default Profile;
