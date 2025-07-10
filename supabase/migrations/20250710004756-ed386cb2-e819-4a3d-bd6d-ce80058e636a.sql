
-- Создаем таблицу для профилей пользователей приложения
CREATE TABLE public.app_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  telegram_username TEXT,
  photo_url TEXT,
  auth_date BIGINT,
  hash TEXT,
  supabase_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Включаем RLS для таблицы
ALTER TABLE public.app_profiles ENABLE ROW LEVEL SECURITY;

-- Создаем политики для таблицы app_profiles
CREATE POLICY "Everyone can view profiles" ON public.app_profiles FOR SELECT USING (true);
CREATE POLICY "Users can create their own profile" ON public.app_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON public.app_profiles FOR UPDATE USING (true);

-- Обновляем существующие таблицы для использования app_profiles вместо auth.users
ALTER TABLE public.spots ADD COLUMN app_user_id UUID REFERENCES public.app_profiles(id);
ALTER TABLE public.routes ADD COLUMN app_user_id UUID REFERENCES public.app_profiles(id);
ALTER TABLE public.spot_comments ADD COLUMN app_user_id UUID REFERENCES public.app_profiles(id);
ALTER TABLE public.route_comments ADD COLUMN app_user_id UUID REFERENCES public.app_profiles(id);
ALTER TABLE public.spot_likes ADD COLUMN app_user_id UUID REFERENCES public.app_profiles(id);
ALTER TABLE public.route_likes ADD COLUMN app_user_id UUID REFERENCES public.app_profiles(id);
ALTER TABLE public.posts ADD COLUMN app_user_id UUID REFERENCES public.app_profiles(id);
ALTER TABLE public.post_comments ADD COLUMN app_user_id UUID REFERENCES public.app_profiles(id);
ALTER TABLE public.post_likes ADD COLUMN app_user_id UUID REFERENCES public.app_profiles(id);

-- Создаем функцию для получения или создания профиля пользователя
CREATE OR REPLACE FUNCTION public.get_or_create_app_profile(
  p_telegram_id TEXT,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_username TEXT DEFAULT NULL,
  p_telegram_username TEXT DEFAULT NULL,
  p_photo_url TEXT DEFAULT NULL,
  p_auth_date BIGINT DEFAULT NULL,
  p_hash TEXT DEFAULT NULL,
  p_supabase_user_id UUID DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_id UUID;
BEGIN
  -- Пытаемся найти существующий профиль
  SELECT id INTO profile_id
  FROM public.app_profiles
  WHERE telegram_id = p_telegram_id;
  
  -- Если профиль найден, обновляем его данные
  IF profile_id IS NOT NULL THEN
    UPDATE public.app_profiles
    SET 
      first_name = COALESCE(p_first_name, first_name),
      last_name = COALESCE(p_last_name, last_name),
      username = COALESCE(p_username, username),
      telegram_username = COALESCE(p_telegram_username, telegram_username),
      photo_url = COALESCE(p_photo_url, photo_url),
      auth_date = COALESCE(p_auth_date, auth_date),
      hash = COALESCE(p_hash, hash),
      supabase_user_id = COALESCE(p_supabase_user_id, supabase_user_id),
      updated_at = now()
    WHERE id = profile_id;
  ELSE
    -- Создаем новый профиль
    INSERT INTO public.app_profiles (
      telegram_id,
      first_name,
      last_name,
      username,
      telegram_username,
      photo_url,
      auth_date,
      hash,
      supabase_user_id
    ) VALUES (
      p_telegram_id,
      p_first_name,
      p_last_name,
      p_username,
      p_telegram_username,
      p_photo_url,
      p_auth_date,
      p_hash,
      p_supabase_user_id
    ) RETURNING id INTO profile_id;
  END IF;
  
  RETURN profile_id;
END;
$$;
