
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CreateTopicDialog } from '@/components/forum/CreateTopicDialog';
import { TopicCard } from '@/components/forum/TopicCard';
import { useForum } from '@/hooks/useForum';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Forum = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const { useForumCategories, useForumTopics, likeTopic } = useForum();
  
  const { data: categories, isLoading: categoriesLoading } = useForumCategories();
  const { data: topics, isLoading: topicsLoading } = useForumTopics(selectedCategory);

  const filteredTopics = topics?.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTopicClick = (topicId: string) => {
    navigate(`/forum/topic/${topicId}`);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Форум</h1>
        {user && (
          <CreateTopicDialog>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Создать тему
            </Button>
          </CreateTopicDialog>
        )}
      </div>

      {/* Поиск */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по темам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Категории */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === '' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory('')}
          >
            Все категории
          </Button>
          {categories?.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Список тем */}
      <div className="space-y-4">
        {topicsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Загрузка тем...</p>
          </div>
        ) : filteredTopics && filteredTopics.length > 0 ? (
          filteredTopics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onClick={() => handleTopicClick(topic.id)}
              onLike={likeTopic}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'По вашему запросу ничего не найдено' : 'Пока нет тем в этой категории'}
            </p>
            {user && !searchQuery && (
              <CreateTopicDialog>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Создать первую тему
                </Button>
              </CreateTopicDialog>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Forum;
