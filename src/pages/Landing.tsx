import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Landing() {
  return (
    <main className='min-h-screen bg-gradient-to-b from-muted/50 to-background'>
      <section className='max-w-6xl mx-auto px-6 py-20 text-center'>
        <h1 className='text-4xl font-extrabold text-foreground'>
          Luo räätälöity AI-agentti yrityksellesi — ilman koodausta
        </h1>
        <p className='mt-4 text-lg text-muted-foreground'>
          Jeesi.ai auttaa pienyrityksiä ja keskisuuria yrityksiä rakentamaan agentteja, 
          jotka luovat verkkosivuja, työkaluja ja maksuflows.
        </p>
        <div className='mt-8 flex justify-center gap-4'>
          <Button asChild size="lg">
            <Link to='/builder'>Aloita ilmaiseksi</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to='/docs'>Tutustu docseihin</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
