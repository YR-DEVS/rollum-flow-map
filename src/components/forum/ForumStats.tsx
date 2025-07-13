
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, TrendingUp, Clock } from 'lucide-react';
import { useForum } from '@/hooks/useForum';

export const ForumStats: React.FC = () => {
  const { useForumTopics } = useForum();
  const { data: topics, isLoading } = useForumTopics();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalTopics = topics?.length || 0;
  const totalReplies = topics?.reduce((sum, topic) => sum + (topic.replies_count || 0), 0) || 0;
  const totalLikes = topics?.reduce((sum, topic) => sum + (topic.likes_count || 0), 0) || 0;
  const recentTopics = topics?.filter(topic => {
    const created = new Date(topic.created_at);
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    return created > dayAgo;
  }).length || 0;

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">Статистика форума</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Тем</p>
              <p className="font-semibold">{totalTopics}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Ответов</p>
              <p className="font-semibold">{totalReplies}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Лайков</p>
              <p className="font-semibold">{totalLikes}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">За день</p>
              <p className="font-semibold">{recentTopics}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
