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
import { Loader2, Heart } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string | null;
  purpose: string;
  category?: string;
  author?: string;
  likes?: number;
}

export default function Community() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<Agent | null>(null);
  const [templates, setTemplates] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['All']);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch published agents from database
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('agents')
          .select('id, name, description, purpose')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          // Transform data and extract categories
          const transformedData = data.map(agent => ({
            ...agent,
            category: agent.purpose || 'General',
            author: 'jeesi.ai Community',
            likes: Math.floor(Math.random() * 50) + 10 // Placeholder likes
          }));
          
          setTemplates(transformedData);
          
          // Extract unique categories
          const uniqueCategories = ['All', ...new Set(transformedData.map(t => t.category).filter(Boolean))];
          setCategories(uniqueCategories as string[]);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
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

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
                         template.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: Agent) => {
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
                      {template.category}
                    </Badge>
                    <div className='flex items-center gap-1 text-muted-foreground'>
                      <Heart className='w-4 h-4' fill='currentColor' />
                      <span className='text-sm'>{template.likes}</span>
                    </div>
                  </div>
                  <CardTitle className='text-xl'>{template.name}</CardTitle>
                  <CardDescription>{template.description || template.purpose}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      {t('community.author')}: {template.author}
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
                  <Badge variant='secondary'>{template.category}</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>{t('community.author')}:</span>
                  <span className='text-sm font-medium'>{template.author}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>{t('community.likes')}:</span>
                  <span className='text-sm font-medium'>{template.likes}</span>
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

      {filteredTemplates.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-muted-foreground text-lg'>{t('community.noResults', { search })}</p>
        </div>
      )}
    </div>
  );
}
