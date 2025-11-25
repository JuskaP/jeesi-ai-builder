import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className='bg-card shadow-sm border-b'>
      <div className='max-w-7xl mx-auto px-4 py-4 flex items-center justify-between'>
        <Link to='/' className='text-xl font-bold text-foreground'>jeesi.ai</Link>
        <nav className='flex items-center gap-4'>
          <Link to='/dashboard' className='text-sm text-foreground hover:text-primary'>Dashboard</Link>
          <Link to='/builder' className='text-sm text-foreground hover:text-primary'>Agent Builder</Link>
          <Link to='/workspaces' className='text-sm text-foreground hover:text-primary'>Workspaces</Link>
          <Link to='/billing' className='text-sm text-foreground hover:text-primary'>Billing</Link>
          <Link to='/login' className='px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90'>Sign in</Link>
        </nav>
      </div>
    </header>
  );
}
