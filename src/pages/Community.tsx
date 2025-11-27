import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const templates = [
  {
    id: '1',
    name: 'Customer Service Bot',
    description: 'Answers customer questions 24/7 and routes to the right person when needed.',
    category: 'Customer Service',
    author: 'jeesi.ai Team',
    likes: 42
  },
  {
    id: '2',
    name: 'Sales Agent',
    description: 'Automates sales conversations and books meetings with potential customers.',
    category: 'Sales',
    author: 'jeesi.ai Team',
    likes: 38
  },
  {
    id: '3',
    name: 'Appointment Scheduler',
    description: 'Manages calendar and automatically books appointments.',
    category: 'Productivity',
    author: 'jeesi.ai Team',
    likes: 31
  },
  {
    id: '4',
    name: 'Content Creator',
    description: 'Creates blog posts, social media content and marketing materials.',
    category: 'Marketing',
    author: 'jeesi.ai Team',
    likes: 27
  },
  {
    id: '5',
    name: 'Data Analyzer',
    description: 'Analyzes data and creates reports to support business decisions.',
    category: 'Analytics',
    author: 'jeesi.ai Team',
    likes: 19
  },
  {
    id: '6',
    name: 'HR Assistant',
    description: 'Helps with recruitment, onboarding and HR management.',
    category: 'HR',
    author: 'jeesi.ai Team',
    likes: 15
  }
];

const categories = ['All', 'Customer Service', 'Sales', 'Marketing', 'Productivity', 'Analytics', 'HR'];

export default function Community() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
                         template.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: typeof templates[0]) => {
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
                      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                        <path d='M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z' />
                      </svg>
                      <span className='text-sm'>{template.likes}</span>
                    </div>
                  </div>
                  <CardTitle className='text-xl'>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
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
                <DialogDescription>{template.description}</DialogDescription>
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
