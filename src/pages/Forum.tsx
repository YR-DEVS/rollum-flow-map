
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreatePostButton } from '@/components/forum/CreatePostButton';
import { ForumStats } from '@/components/forum/ForumStats';
import { TopicSorting, SortOption } from '@/components/forum/TopicSorting';
import { TopicCard } from '@/components/forum/TopicCard';
import { useForum } from '@/hooks/useForum';
import { useAuth } from '@/hooks/useAuth';
import { Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Forum = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const { useForumCategories, useForumTopics, likeTopic } = useForum();
  
  const { data: categories, isLoading: categoriesLoading } = useForumCategories();
  const { data: topics, isLoading: topicsLoading } = useForumTopics(selectedCategory);

  const filteredAndSortedTopics = useMemo(() => {
    if (!topics) return [];

    // Фильтрация по поиску
    let filtered = topics.filter(topic =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Сортировка
    switch (sortBy) {
      case 'newest':
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'popular':
        return filtered.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
      case 'most_replies':
        return filtered.sort((a, b) => (b.replies_count || 0) - (a.replies_count || 0));
      case 'most_liked':
        return filtered.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
      default:
        return filtered;
    }
  }, [topics, searchQuery, sortBy]);

  const handleTopicClick = (topicId: string) => {
    navigate(`/forum/topic/${topicId}`);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Форум</h1>
          <p className="text-muted-foreground">Обсуждения, вопросы и советы</p>
        </div>
        <div className="flex gap-2">
          <CreatePostButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="space-y-4">
            <ForumStats />
            
            {/* Категории */}
            <div className="space-y-2">
              <h3 className="font-semibold">Категории</h3>
              <div className="space-y-1">
                <Button
                  variant={selectedCategory === '' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory('')}
                  className="w-full justify-start"
                >
                  Все категории
                </Button>
                {categories?.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="w-full justify-start"
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          {/* Поиск и сортировка */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по темам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <TopicSorting sortBy={sortBy} onSortChange={setSortBy} />
          </div>

          {/* Список тем */}
          <div className="space-y-4">
            {topicsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-32"></div>
                  </div>
                ))}
              </div>
            ) : filteredAndSortedTopics && filteredAndSortedTopics.length > 0 ? (
              filteredAndSortedTopics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  onClick={() => handleTopicClick(topic.id)}
                  onLike={likeTopic}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold mb-2">
                  {searchQuery ? 'Ничего не найдено' : 'Пока нет тем'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery 
                    ? 'Попробуйте изменить поисковый запрос' 
                    : 'Станьте первым, кто создаст тему в этой категории'
                  }
                </p>
                {user && !searchQuery && (
                  <CreatePostButton />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Create Button (Mobile) */}
      <CreatePostButton variant="floating" className="sm:hidden" />
    </div>
  );
};

export default Forum;
