
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreateTopicDialog } from './CreateTopicDialog';
import { useAuth } from '@/hooks/useAuth';
import { Plus, PenTool } from 'lucide-react';

interface CreatePostButtonProps {
  variant?: 'default' | 'floating';
  className?: string;
}

export const CreatePostButton: React.FC<CreatePostButtonProps> = ({ 
  variant = 'default',
  className = '' 
}) => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (variant === 'floating') {
    return (
      <CreateTopicDialog>
        <Button
          className={`fixed bottom-20 right-4 z-50 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all ${className}`}
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </CreateTopicDialog>
    );
  }

  return (
    <CreateTopicDialog>
      <Button className={`flex items-center gap-2 ${className}`}>
        <PenTool className="w-4 h-4" />
        Создать тему
      </Button>
    </CreateTopicDialog>
  );
};
