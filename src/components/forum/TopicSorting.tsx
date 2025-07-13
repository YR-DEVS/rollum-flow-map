
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, Flame, Clock, Heart, MessageCircle } from 'lucide-react';

export type SortOption = 'newest' | 'oldest' | 'popular' | 'most_replies' | 'most_liked';

interface TopicSortingProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const TopicSorting: React.FC<TopicSortingProps> = ({ sortBy, onSortChange }) => {
  const sortOptions = [
    { value: 'newest' as SortOption, label: 'Новые', icon: Clock },
    { value: 'popular' as SortOption, label: 'Популярные', icon: Flame },
    { value: 'most_replies' as SortOption, label: 'Больше ответов', icon: MessageCircle },
    { value: 'most_liked' as SortOption, label: 'Больше лайков', icon: Heart },
    { value: 'oldest' as SortOption, label: 'Старые', icon: ArrowUpDown },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:inline">Сортировка:</span>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[140px] sm:w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};
