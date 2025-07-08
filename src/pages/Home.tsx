
import React from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, Users, TrendingUp } from 'lucide-react';

const Home = () => {
  const stats = [
    { icon: Users, label: 'Участников', value: '1,234' },
    { icon: MapPin, label: 'Спотов', value: '89' },
    { icon: TrendingUp, label: 'Активность', value: '+12%' },
  ];

  const recentPosts = [
    {
      id: 1,
      title: 'Новый спот в Сокольниках',
      author: 'roller_pro',
      time: '2 часа назад',
      replies: 12,
    },
    {
      id: 2,
      title: 'Обсуждение техники торможения',
      author: 'skate_master',
      time: '4 часа назад',
      replies: 8,
    },
    {
      id: 3,
      title: 'Групповая покатушка в выходные',
      author: 'weekend_rider',
      time: '6 часов назад',
      replies: 15,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Добро пожаловать в Rollum</h1>
        <p className="text-gray-600">Сообщество роллеров России</p>
      </div>

      <div className="px-6 py-4">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map(({ icon: Icon, label, value }) => (
            <Card key={label} className="p-4 text-center bg-white rounded-2xl shadow-sm">
              <Icon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-lg font-semibold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </Card>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Последние обсуждения</h2>
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <Card key={post.id} className="p-4 bg-white rounded-2xl shadow-sm">
                <h3 className="font-medium text-gray-900 mb-2">{post.title}</h3>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>@{post.author}</span>
                  <div className="flex items-center space-x-4">
                    <span>{post.replies} ответов</span>
                    <span>{post.time}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
