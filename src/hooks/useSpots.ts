
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Spot {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  media_urls: string[];
  user_id?: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
}

export const useSpots = () => {
  return useQuery({
    queryKey: ['spots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_spots')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Spot[];
    },
  });
};

export const useCreateSpot = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (spot: Omit<Spot, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('app_spots')
        .insert([{ ...spot, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spots'] });
    },
  });
};
