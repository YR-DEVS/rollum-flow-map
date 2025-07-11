
-- Создаем таблицу для категорий форума
CREATE TABLE public.forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT '💬',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу для тем форума
CREATE TABLE public.forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_user_id UUID REFERENCES public.app_profiles(id) ON DELETE CASCADE,
  spot_id UUID REFERENCES public.spots(id) ON DELETE SET NULL,
  route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
  media_urls TEXT[] DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу для ответов в темах
CREATE TABLE public.forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_user_id UUID REFERENCES public.app_profiles(id) ON DELETE CASCADE,
  reply_to_id UUID REFERENCES public.forum_replies(id) ON DELETE SET NULL,
  media_urls TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу для лайков тем
CREATE TABLE public.forum_topic_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_user_id UUID REFERENCES public.app_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(topic_id, user_id)
);

-- Создаем таблицу для лайков ответов
CREATE TABLE public.forum_reply_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_user_id UUID REFERENCES public.app_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(reply_id, user_id)
);

-- Включаем RLS для всех таблиц форума
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topic_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_reply_likes ENABLE ROW LEVEL SECURITY;

-- Политики для категорий форума
CREATE POLICY "Everyone can view forum categories" ON public.forum_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create categories" ON public.forum_categories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update categories" ON public.forum_categories FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Политики для тем форума
CREATE POLICY "Everyone can view forum topics" ON public.forum_topics FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create topics" ON public.forum_topics FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their topics" ON public.forum_topics FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete their topics" ON public.forum_topics FOR DELETE USING (auth.uid() = author_id);

-- Политики для ответов
CREATE POLICY "Everyone can view forum replies" ON public.forum_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON public.forum_replies FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their replies" ON public.forum_replies FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete their replies" ON public.forum_replies FOR DELETE USING (auth.uid() = author_id);

-- Политики для лайков тем
CREATE POLICY "Everyone can view topic likes" ON public.forum_topic_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like topics" ON public.forum_topic_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike topics" ON public.forum_topic_likes FOR DELETE USING (auth.uid() = user_id);

-- Политики для лайков ответов
CREATE POLICY "Everyone can view reply likes" ON public.forum_reply_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like replies" ON public.forum_reply_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike replies" ON public.forum_reply_likes FOR DELETE USING (auth.uid() = user_id);

-- Создаем базовые категории форума
INSERT INTO public.forum_categories (name, description, color, icon) VALUES
('Общие вопросы', 'Общие вопросы и обсуждения', '#3B82F6', '💬'),
('Техника и трюки', 'Обсуждение техники катания и трюков', '#10B981', '🛼'),
('Споты и маршруты', 'Обмен информацией о местах для катания', '#8B5CF6', '📍'),
('Снаряжение', 'Обсуждение роликов, защиты и аксессуаров', '#F59E0B', '🛡️');

-- Функции для обновления счетчиков
CREATE OR REPLACE FUNCTION public.update_forum_topic_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_topics SET likes_count = likes_count + 1 WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_topics SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.topic_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_forum_reply_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_replies SET likes_count = likes_count + 1 WHERE id = NEW.reply_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_replies SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.reply_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_forum_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_topics SET replies_count = replies_count + 1 WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_topics SET replies_count = GREATEST(0, replies_count - 1) WHERE id = OLD.topic_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Создаем триггеры
CREATE TRIGGER update_forum_topic_likes_count_trigger
  AFTER INSERT OR DELETE ON public.forum_topic_likes
  FOR EACH ROW EXECUTE PROCEDURE public.update_forum_topic_likes_count();

CREATE TRIGGER update_forum_reply_likes_count_trigger
  AFTER INSERT OR DELETE ON public.forum_reply_likes
  FOR EACH ROW EXECUTE PROCEDURE public.update_forum_reply_likes_count();

CREATE TRIGGER update_forum_replies_count_trigger
  AFTER INSERT OR DELETE ON public.forum_replies
  FOR EACH ROW EXECUTE PROCEDURE public.update_forum_replies_count();
