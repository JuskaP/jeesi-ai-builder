import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const templates = [
  {
    id: '1',
    name: 'Asiakaspalvelu Botti',
    description: 'Vastaa asiakkaiden kysymyksiin 24/7 ja ohjaa tarvittaessa oikealle henkilölle.',
    category: 'Asiakaspalvelu',
    author: 'Jeesi Team',
    likes: 42
  },
  {
    id: '2',
    name: 'Myyntiagentti',
    description: 'Automatisoi myyntikeskustelut ja varaa tapaamisia potentiaalisille asiakkaille.',
    category: 'Myynti',
    author: 'Jeesi Team',
    likes: 38
  },
  {
    id: '3',
    name: 'Ajanvaraaja',
    description: 'Hallinnoi kalenteria ja varaa tapaamisia automaattisesti.',
    category: 'Tuottavuus',
    author: 'Jeesi Team',
    likes: 31
  },
  {
    id: '4',
    name: 'Sisällön Luoja',
    description: 'Luo blogipostauksia, sosiaalisen median sisältöä ja markkinointimateriaaleja.',
    category: 'Markkinointi',
    author: 'Jeesi Team',
    likes: 27
  },
  {
    id: '5',
    name: 'Tietoanalysoija',
    description: 'Analysoi dataa ja luo raportteja liiketoiminnan päätöksenteon tueksi.',
    category: 'Analytiikka',
    author: 'Jeesi Team',
    likes: 19
  },
  {
    id: '6',
    name: 'HR Assistentti',
    description: 'Auttaa rekrytoinnissa, perehdytyksessä ja henkilöstöhallinnossa.',
    category: 'HR',
    author: 'Jeesi Team',
    likes: 15
  }
];

const categories = ['Kaikki', 'Asiakaspalvelu', 'Myynti', 'Markkinointi', 'Tuottavuus', 'Analytiikka', 'HR'];

export default function Community() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Kaikki');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
                         template.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Kaikki' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: typeof templates[0]) => {
    setSelectedTemplate(template);
  };

  const handleCustomize = () => {
    if (selectedTemplate) {
      toast({
        title: 'Agentti ladattu!',
        description: `${selectedTemplate.name} on ladattu. Aloita muokkaaminen assistentin kanssa.`,
      });
      navigate('/', { state: { template: selectedTemplate } });
    }
  };

  return (
    <div className='p-8 max-w-7xl mx-auto'>
      <div className='mb-8'>
        <h2 className='text-3xl font-bold text-foreground mb-2'>Yhteisö</h2>
        <p className='text-muted-foreground'>
          Löydä ja jaa valmiita agenttimalleja yhteisön kanssa
        </p>
      </div>

      <div className='mb-8 space-y-4'>
        <Input
          placeholder='Etsi agenttimalleja...'
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
                      Tekijä: {template.author}
                    </span>
                    <Button size='sm' variant='ghost' className='group-hover:bg-primary group-hover:text-primary-foreground'>
                      Käytä
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
                  <span className='text-sm text-muted-foreground'>Kategoria:</span>
                  <Badge variant='secondary'>{template.category}</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Tekijä:</span>
                  <span className='text-sm font-medium'>{template.author}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Tykkäykset:</span>
                  <span className='text-sm font-medium'>{template.likes}</span>
                </div>
              </div>
              <div className='flex gap-3'>
                <Button variant='outline' className='flex-1' onClick={() => setSelectedTemplate(null)}>
                  Peruuta
                </Button>
                <Button className='flex-1' onClick={handleCustomize}>
                  Muokkaa omaksesi
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-muted-foreground text-lg'>Ei tuloksia haulle "{search}"</p>
        </div>
      )}
    </div>
  );
}
