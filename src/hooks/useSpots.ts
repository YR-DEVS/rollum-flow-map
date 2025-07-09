
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Spot {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  media_urls?: string[];
  user_id?: string;
  created_at: string;
  updated_at?: string;
  likes_count?: number;
  comments_count?: number;
}

export const useSpots = () => {
  return useQuery({
    queryKey: ['spots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spots')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateSpot = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (spot: {
      name: string;
      description?: string;
      latitude: number;
      longitude: number;
      media_urls?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const spotData = {
        ...spot,
        user_id: user.id,
        media_urls: spot.media_urls || []
      };

      const { data, error } = await supabase
        .from('spots')
        .insert([spotData])
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
