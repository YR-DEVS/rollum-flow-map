
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ForumCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface ForumTopic {
  id: string;
  title: string;
  content: string;
  category_id?: string;
  author_id?: string;
  app_user_id?: string;
  spot_id?: string;
  route_id?: string;
  media_urls: string[];
  views_count: number;
  replies_count: number;
  likes_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  forum_categories?: ForumCategory;
  app_profiles?: {
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  };
  spots?: {
    name: string;
    latitude: number;
    longitude: number;
  };
  routes?: {
    name: string;
    description?: string;
  };
}

export interface ForumReply {
  id: string;
  content: string;
  topic_id?: string;
  author_id?: string;
  app_user_id?: string;
  reply_to_id?: string;
  media_urls: string[];
  likes_count: number;
  created_at: string;
  updated_at: string;
  app_profiles?: {
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  };
}

export interface CreateTopicData {
  title: string;
  content: string;
  category_id?: string;
  spot_id?: string;
  route_id?: string;
  media_urls?: string[];
}

export interface CreateReplyData {
  content: string;
  topic_id: string;
  reply_to_id?: string;
  media_urls?: string[];
}

export const useForum = () => {
  const { user, appProfile } = useAuth();
  const queryClient = useQueryClient();

  // Получение категорий форума
  const useForumCategories = () => {
    return useQuery({
      queryKey: ['forum-categories'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('forum_categories')
          .select('*')
          .order('name');

        if (error) throw error;
        return data as ForumCategory[];
      },
    });
  };

  // Получение тем форума
  const useForumTopics = (categoryId?: string) => {
    return useQuery({
      queryKey: ['forum-topics', categoryId],
      queryFn: async () => {
        let query = supabase
          .from('forum_topics')
          .select(`
            *,
            forum_categories(*),
            app_profiles(username, first_name, last_name, photo_url),
            spots(name, latitude, longitude),
            routes(name, description)
          `)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as ForumTopic[];
      },
    });
  };

  // Получение конкретной темы
  const useForumTopic = (topicId: string) => {
    return useQuery({
      queryKey: ['forum-topic', topicId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('forum_topics')
          .select(`
            *,
            forum_categories(*),
            app_profiles(username, first_name, last_name, photo_url),
            spots(name, latitude, longitude),
            routes(name, description)
          `)
          .eq('id', topicId)
          .single();

        if (error) throw error;

        // Увеличиваем счетчик просмотров
        await supabase
          .from('forum_topics')
          .update({ views_count: data.views_count + 1 })
          .eq('id', topicId);

        return data as ForumTopic;
      },
    });
  };

  // Получение ответов в теме
  const useForumReplies = (topicId: string) => {
    return useQuery({
      queryKey: ['forum-replies', topicId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('forum_replies')
          .select(`
            *,
            app_profiles(username, first_name, last_name, photo_url)
          `)
          .eq('topic_id', topicId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        return data as ForumReply[];
      },
    });
  };

  // Создание темы
  const createTopicMutation = useMutation({
    mutationFn: async (topicData: CreateTopicData) => {
      if (!user || !appProfile) {
        throw new Error('Необходимо войти в систему');
      }

      const { data, error } = await supabase
        .from('forum_topics')
        .insert({
          ...topicData,
          author_id: user.id,
          app_user_id: appProfile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      toast.success('Тема создана успешно!');
    },
    onError: (error) => {
      console.error('Error creating topic:', error);
      toast.error('Ошибка при создании темы');
    },
  });

  // Создание ответа
  const createReplyMutation = useMutation({
    mutationFn: async (replyData: CreateReplyData) => {
      if (!user || !appProfile) {
        throw new Error('Необходимо войти в систему');
      }

      const { data, error } = await supabase
        .from('forum_replies')
        .insert({
          ...replyData,
          author_id: user.id,
          app_user_id: appProfile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forum-replies', variables.topic_id] });
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      toast.success('Ответ добавлен!');
    },
    onError: (error) => {
      console.error('Error creating reply:', error);
      toast.error('Ошибка при создании ответа');
    },
  });

  // Лайк темы
  const likeTopicMutation = useMutation({
    mutationFn: async (topicId: string) => {
      if (!user || !appProfile) {
        throw new Error('Необходимо войти в систему');
      }

      // Проверяем, есть ли уже лайк
      const { data: existingLike } = await supabase
        .from('forum_topic_likes')
        .select('id')
        .eq('topic_id', topicId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Убираем лайк
        const { error } = await supabase
          .from('forum_topic_likes')
          .delete()
          .eq('id', existingLike.id);

        if (error) throw error;
        return 'unliked';
      } else {
        // Добавляем лайк
        const { error } = await supabase
          .from('forum_topic_likes')
          .insert({
            topic_id: topicId,
            user_id: user.id,
            app_user_id: appProfile.id,
          });

        if (error) throw error;
        return 'liked';
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      queryClient.invalidateQueries({ queryKey: ['forum-topic'] });
    },
    onError: (error) => {
      console.error('Error liking topic:', error);
      toast.error('Ошибка при добавлении лайка');
    },
  });

  // Лайк ответа
  const likeReplyMutation = useMutation({
    mutationFn: async (replyId: string) => {
      if (!user || !appProfile) {
        throw new Error('Необходимо войти в систему');
      }

      // Проверяем, есть ли уже лайк
      const { data: existingLike } = await supabase
        .from('forum_reply_likes')
        .select('id')
        .eq('reply_id', replyId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Убираем лайк
        const { error } = await supabase
          .from('forum_reply_likes')
          .delete()
          .eq('id', existingLike.id);

        if (error) throw error;
        return 'unliked';
      } else {
        // Добавляем лайк
        const { error } = await supabase
          .from('forum_reply_likes')
          .insert({
            reply_id: replyId,
            user_id: user.id,
            app_user_id: appProfile.id,
          });

        if (error) throw error;
        return 'liked';
      }
    },
    onSuccess: (_, replyId) => {
      queryClient.invalidateQueries({ queryKey: ['forum-replies'] });
    },
    onError: (error) => {
      console.error('Error liking reply:', error);
      toast.error('Ошибка при добавлении лайка');
    },
  });

  return {
    useForumCategories,
    useForumTopics,
    useForumTopic,
    useForumReplies,
    createTopic: createTopicMutation.mutate,
    createReply: createReplyMutation.mutate,
    likeTopic: likeTopicMutation.mutate,
    likeReply: likeReplyMutation.mutate,
    isCreatingTopic: createTopicMutation.isPending,
    isCreatingReply: createReplyMutation.isPending,
  };
};
