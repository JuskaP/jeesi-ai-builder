import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className='bg-card shadow-sm border-b'>
      <div className='max-w-7xl mx-auto px-4 py-4 flex items-center justify-between'>
        <Link to='/' className='text-xl font-bold text-foreground'>jeesi.ai</Link>
        <nav className='flex items-center gap-4'>
          <Link to='/dashboard' className='text-sm text-foreground hover:text-primary'>Omat Agentit</Link>
          <Link to='/community' className='text-sm text-foreground hover:text-primary'>Yhteisö</Link>
          <Link to='/workspaces' className='text-sm text-foreground hover:text-primary'>Workspaces</Link>
          <Link to='/billing' className='text-sm text-foreground hover:text-primary'>Hinnasto</Link>
          <Link to='/auth' className='px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90'>Kirjaudu tai luo tili</Link>
        </nav>
      </div>
    </header>
  );
}
