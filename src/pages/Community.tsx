import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Heart } from 'lucide-react';

interface CommunityAgent {
  id: string;
  name: string;
  description: string | null;
  purpose: string;
  community_category: string | null;
  community_likes: number;
  shared_at: string | null;
  user_id: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

export default function Community() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<CommunityAgent | null>(null);
  const [templates, setTemplates] = useState<CommunityAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [likingAgent, setLikingAgent] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch community-shared agents from database
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('agents')
          .select(`
            id, name, description, purpose, 
            community_category, community_likes, shared_at, user_id
          `)
          .eq('is_shared_to_community', true)
          .order('community_likes', { ascending: false });

        if (error) throw error;

        if (data) {
          setTemplates(data as CommunityAgent[]);
          
          // Extract unique categories
          const uniqueCategories = ['All', ...new Set(
            data
              .map(t => t.community_category)
              .filter(Boolean)
          )];
          setCategories(uniqueCategories as string[]);
        }
      } catch (error) {
        console.error('Error fetching community templates:', error);
        toast({
          title: t('common.error'),
          description: t('community.error'),
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [t, toast]);

  // Fetch user's likes
  useEffect(() => {
    const fetchUserLikes = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('agent_likes')
          .select('agent_id')
          .eq('user_id', user.id);

        if (!error && data) {
          setUserLikes(new Set(data.map(l => l.agent_id)));
        }
      } catch (error) {
        console.error('Error fetching user likes:', error);
      }
    };

    fetchUserLikes();
  }, [user]);

  const handleLike = async (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like templates",
        variant: "destructive"
      });
      return;
    }

    setLikingAgent(agentId);
    const isLiked = userLikes.has(agentId);

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('agent_likes')
          .delete()
          .eq('agent_id', agentId)
          .eq('user_id', user.id);

        // Update local state
        const newLikes = new Set(userLikes);
        newLikes.delete(agentId);
        setUserLikes(newLikes);

        // Update template likes count
        setTemplates(prev => prev.map(t => 
          t.id === agentId ? { ...t, community_likes: Math.max(0, (t.community_likes || 0) - 1) } : t
        ));

        // Update in database
        await supabase
          .from('agents')
          .update({ community_likes: templates.find(t => t.id === agentId)!.community_likes - 1 })
          .eq('id', agentId);
      } else {
        // Like
        await supabase
          .from('agent_likes')
          .insert({ agent_id: agentId, user_id: user.id });

        // Update local state
        const newLikes = new Set(userLikes);
        newLikes.add(agentId);
        setUserLikes(newLikes);

        // Update template likes count
        setTemplates(prev => prev.map(t => 
          t.id === agentId ? { ...t, community_likes: (t.community_likes || 0) + 1 } : t
        ));

        // Update in database
        await supabase
          .from('agents')
          .update({ community_likes: (templates.find(t => t.id === agentId)?.community_likes || 0) + 1 })
          .eq('id', agentId);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: t('common.error'),
        description: "Failed to update like",
        variant: "destructive"
      });
    } finally {
      setLikingAgent(null);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
                         template.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.community_category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: CommunityAgent) => {
    setSelectedTemplate(template);
  };

  const handleCustomize = () => {
    if (selectedTemplate) {
      toast({
        title: t('community.templateLoaded'),
        description: t('community.startCustomizing', { name: selectedTemplate.name }),
      });
      navigate('/', { state: { template: selectedTemplate } });
    }
  };

  if (loading) {
    return (
      <div className='p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
          <p className='text-muted-foreground'>{t('community.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-8 max-w-7xl mx-auto'>
      <div className='mb-8'>
        <h2 className='text-3xl font-bold text-foreground mb-2'>{t('community.title')}</h2>
        <p className='text-muted-foreground'>
          {t('community.description')}
        </p>
      </div>

      <div className='mb-8 space-y-4'>
        <Input
          placeholder={t('community.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='max-w-md'
        />
        
        <div className='flex flex-wrap gap-2'>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size='sm'
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-muted-foreground text-lg'>
            {search ? t('community.noResults', { search }) : 'No community templates yet. Be the first to share your agent!'}
          </p>
        </div>
      ) : (
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredTemplates.map(template => (
            <Dialog key={template.id}>
              <DialogTrigger asChild>
                <Card 
                  className='group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:-translate-y-1'
                  onClick={() => handleUseTemplate(template)}
                >
                  <CardHeader>
                    <div className='flex items-start justify-between mb-2'>
                      <Badge variant='secondary' className='text-xs'>
                        {template.community_category || 'General'}
                      </Badge>
                      <button
                        onClick={(e) => handleLike(template.id, e)}
                        disabled={likingAgent === template.id}
                        className={`flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors ${
                          userLikes.has(template.id) ? 'text-red-500' : ''
                        }`}
                      >
                        <Heart 
                          className='w-4 h-4' 
                          fill={userLikes.has(template.id) ? 'currentColor' : 'none'} 
                        />
                        <span className='text-sm'>{template.community_likes || 0}</span>
                      </button>
                    </div>
                    <CardTitle className='text-xl'>{template.name}</CardTitle>
                    <CardDescription>{template.description || template.purpose}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-muted-foreground'>
                        {t('community.author')}: jeesi.ai Community
                      </span>
                      <Button size='sm' variant='ghost' className='group-hover:bg-primary group-hover:text-primary-foreground'>
                        {t('community.use')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className='max-w-md'>
                <DialogHeader>
                  <DialogTitle>{template.name}</DialogTitle>
                  <DialogDescription>{template.description || template.purpose}</DialogDescription>
                </DialogHeader>
                <div className='space-y-4 py-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>{t('community.category')}:</span>
                    <Badge variant='secondary'>{template.community_category || 'General'}</Badge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>{t('community.likes')}:</span>
                    <span className='text-sm font-medium'>{template.community_likes || 0}</span>
                  </div>
                </div>
                <div className='flex gap-3'>
                  <Button variant='outline' className='flex-1' onClick={() => setSelectedTemplate(null)}>
                    {t('common.cancel')}
                  </Button>
                  <Button className='flex-1' onClick={handleCustomize}>
                    {t('community.customize')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}