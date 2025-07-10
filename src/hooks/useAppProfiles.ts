
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AppProfile {
  id: string;
  telegram_id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  telegram_username?: string;
  photo_url?: string;
  auth_date?: number;
  hash?: string;
  supabase_user_id?: string;
  created_at: string;
  updated_at: string;
}

export const useCreateOrUpdateAppProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData: {
      telegram_id: string;
      first_name?: string;
      last_name?: string;
      username?: string;
      telegram_username?: string;
      photo_url?: string;
      auth_date?: number;
      hash?: string;
      supabase_user_id?: string;
    }) => {
      const { data, error } = await supabase.rpc('get_or_create_app_profile', {
        p_telegram_id: profileData.telegram_id,
        p_first_name: profileData.first_name,
        p_last_name: profileData.last_name,
        p_username: profileData.username,
        p_telegram_username: profileData.telegram_username,
        p_photo_url: profileData.photo_url,
        p_auth_date: profileData.auth_date,
        p_hash: profileData.hash,
        p_supabase_user_id: profileData.supabase_user_id,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app_profiles'] });
    },
  });
};

export const useAppProfile = (telegram_id: string) => {
  return useQuery({
    queryKey: ['app_profile', telegram_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_profiles')
        .select('*')
        .eq('telegram_id', telegram_id)
        .single();
      
      if (error) throw error;
      return data as AppProfile;
    },
    enabled: !!telegram_id,
  });
};
