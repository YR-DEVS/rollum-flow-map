
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, MessageCircle, Heart } from 'lucide-react';

const Forum = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 1, name: 'Общие вопросы', posts: 156, color: 'bg-blue-100 text-blue-800' },
    { id: 2, name: 'Техника и трюки', posts: 89, color: 'bg-green-100 text-green-800' },
    { id: 3, name: 'Споты и маршруты', posts: 234, color: 'bg-purple-100 text-purple-800' },
    { id: 4, name: 'Снаряжение', posts: 67, color: 'bg-orange-100 text-orange-800' },
  ];

  const topics = [
    {
      id: 1,
      title: 'Как научиться ездить спиной вперед?',
      author: 'newbie_roller',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face',
      category: 'Техника и трюки',
      replies: 23,
      likes: 12,
      time: '2 часа назад',
    },
    {
      id: 2,
      title: 'Лучшие споты для начинающих в Москве',
      author: 'moscow_guide',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b1e3c9cd?w=40&h=40&fit=crop&crop=face',
      category: 'Споты и маршруты',
      replies: 45,
      likes: 28,
      time: '4 часа назад',
    },
    {
      id: 3,
      title: 'Обзор новых роликов от Rollerblade',
      author: 'gear_expert',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      category: 'Снаряжение',
      replies: 18,
      likes: 15,
      time: '6 часов назад',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Форум</h1>
          <Button className="rounded-full bg-blue-500 hover:bg-blue-600">
            <Plus size={20} />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Поиск по форуму..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full border-gray-200"
          />
        </div>
      </div>

      <div className="px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Категории</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {categories.map((category) => (
            <Card key={category.id} className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-medium text-gray-900 mb-1">{category.name}</h3>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                {category.posts} постов
              </span>
            </Card>
          ))}
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Последние темы</h2>
        <div className="space-y-4">
          {topics.map((topic) => (
            <Card key={topic.id} className="p-4 bg-white rounded-2xl shadow-sm">
              <div className="flex items-start space-x-3">
                <img
                  src={topic.avatar}
                  alt={topic.author}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{topic.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                    <span>@{topic.author}</span>
                    <span>•</span>
                    <span>{topic.category}</span>
                    <span>•</span>
                    <span>{topic.time}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MessageCircle size={16} />
                      <span>{topic.replies}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart size={16} />
                      <span>{topic.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Forum;
