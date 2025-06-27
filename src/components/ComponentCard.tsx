
import React, { useState } from 'react';
import { Heart, Bookmark, Eye, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Component = Tables<'components'> & {
  profiles: Tables<'profiles'> | null;
  is_liked?: boolean;
  is_saved?: boolean;
};

interface ComponentCardProps {
  component: Component;
  onLike?: () => void;
  onSave?: () => void;
  onExpand?: () => void;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ 
  component, 
  onLike, 
  onSave, 
  onExpand 
}) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(component.is_liked || false);
  const [isSaved, setIsSaved] = useState(component.is_saved || false);
  const [likesCount, setLikesCount] = useState(component.likes_count || 0);
  const [savesCount, setSavesCount] = useState(component.saves_count || 0);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like components');
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('component_id', component.id);
        
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await supabase
          .from('likes')
          .insert({ user_id: user.id, component_id: component.id });
        
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
      onLike?.();
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save components');
      return;
    }

    try {
      if (isSaved) {
        await supabase
          .from('saved_components')
          .delete()
          .eq('user_id', user.id)
          .eq('component_id', component.id);
        
        setIsSaved(false);
        setSavesCount(prev => prev - 1);
      } else {
        await supabase
          .from('saved_components')
          .insert({ user_id: user.id, component_id: component.id });
        
        setIsSaved(true);
        setSavesCount(prev => prev + 1);
      }
      onSave?.();
    } catch (error) {
      toast.error('Failed to update save');
    }
  };

  return (
    <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={component.profiles?.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-white">
                {component.profiles?.full_name || 'Anonymous'}
              </p>
              <p className="text-xs text-gray-300">
                {new Date(component.created_at!).toLocaleDateString()}
              </p>
            </div>
          </div>
          {onExpand && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExpand}
              className="text-white hover:bg-white/10"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">{component.title}</h3>
          {component.description && (
            <p className="text-sm text-gray-300 mb-3">{component.description}</p>
          )}
          <div className="flex flex-wrap gap-1">
            {component.tags?.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-white/10 text-white border-white/20">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg overflow-hidden">
          <SyntaxHighlighter
            language="jsx"
            style={tomorrow}
            customStyle={{
              margin: 0,
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              maxHeight: '200px',
            }}
          >
            {component.code}
          </SyntaxHighlighter>
        </div>
        
        {component.preview_image_url && (
          <div className="rounded-lg overflow-hidden">
            <img 
              src={component.preview_image_url} 
              alt="Component preview"
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`text-white hover:bg-white/10 ${isLiked ? 'text-red-400' : ''}`}
            >
              <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {likesCount}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={`text-white hover:bg-white/10 ${isSaved ? 'text-yellow-400' : ''}`}
            >
              <Bookmark className={`h-4 w-4 mr-1 ${isSaved ? 'fill-current' : ''}`} />
              {savesCount}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComponentCard;
