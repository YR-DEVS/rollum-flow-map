
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ForumTopic } from '@/hooks/useForum';
import { Heart, MessageSquare, Eye, MapPin, Route, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface TopicCardProps {
  topic: ForumTopic;
  onClick: () => void;
  onLike: (topicId: string) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, onClick, onLike }) => {
  const getAuthorDisplayName = () => {
    if (topic.app_profiles?.username) return topic.app_profiles.username;
    if (topic.app_profiles?.first_name && topic.app_profiles?.last_name) {
      return `${topic.app_profiles.first_name} ${topic.app_profiles.last_name}`;
    }
    if (topic.app_profiles?.first_name) return topic.app_profiles.first_name;
    return 'Аноним';
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(topic.id);
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            {topic.is_pinned && (
              <Pin className="w-4 h-4 text-primary flex-shrink-0" />
            )}
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={topic.app_profiles?.photo_url || ''} />
              <AvatarFallback>
                {getAuthorDisplayName().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg line-clamp-2">{topic.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{getAuthorDisplayName()}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: ru })}</span>
              </div>
            </div>
          </div>
          {topic.forum_categories && (
            <Badge 
              variant="secondary" 
              className="flex-shrink-0"
              style={{ backgroundColor: `${topic.forum_categories.color}20`, color: topic.forum_categories.color }}
            >
              <span className="mr-1">{topic.forum_categories.icon}</span>
              {topic.forum_categories.name}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-muted-foreground line-clamp-3 mb-4">
          {topic.content}
        </p>

        {/* Медиафайлы */}
        {topic.media_urls && topic.media_urls.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {topic.media_urls.slice(0, 4).map((url, index) => (
              <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img 
                  src={url} 
                  alt="Media" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ))}
            {topic.media_urls.length > 4 && (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                +{topic.media_urls.length - 4} еще
              </div>
            )}
          </div>
        )}

        {/* Привязанные спот или маршрут */}
        {topic.spots && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 rounded-lg">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">
              Спот: {topic.spots.name}
            </span>
          </div>
        )}

        {topic.routes && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-green-50 rounded-lg">
            <Route className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-700">
              Маршрут: {topic.routes.name}
            </span>
          </div>
        )}

        {/* Статистика */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{topic.views_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{topic.replies_count}</span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLike}
            className="flex items-center gap-1"
          >
            <Heart className="w-4 h-4" />
            <span>{topic.likes_count}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
