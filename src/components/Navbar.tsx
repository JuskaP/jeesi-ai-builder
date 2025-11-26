import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user } = useAuth();
  
  return (
    <header className='bg-card/50 backdrop-blur-md shadow-sm border-b border-border/50 sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 py-4 flex items-center justify-between'>
        <Link to='/' className='text-xl font-bold text-foreground hover:text-primary transition-colors'>jeesi.ai</Link>
        <nav className='flex items-center gap-4'>
          <Link to='/dashboard' className='text-sm text-foreground hover:text-primary transition-colors duration-300'>Omat Agentit</Link>
          <Link to='/community' className='text-sm text-foreground hover:text-primary transition-colors duration-300'>Yhteisö</Link>
          <Link to='/workspaces' className='text-sm text-foreground hover:text-primary transition-colors duration-300'>Työtilat</Link>
          <Link to='/billing' className='text-sm text-foreground hover:text-primary transition-colors duration-300'>Hinnasto</Link>
          {user && <Link to='/profile' className='text-sm text-foreground hover:text-primary transition-colors duration-300'>Profiili</Link>}
          <Link to={user ? '/profile' : '/auth'} className='px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5'>
            {user ? 'Profiili' : 'Kirjaudu tai luo tili'}
          </Link>
        </nav>
      </div>
    </header>
  );
}
