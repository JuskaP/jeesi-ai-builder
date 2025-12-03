import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shield } from 'lucide-react';

export default function Navbar() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin');

        setIsAdmin(data && data.length > 0);
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      }
    };

    checkAdminRole();
  }, [user]);
  
  return (
    <header className='bg-card/50 backdrop-blur-md shadow-sm border-b border-border/50 sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 py-4 flex items-center justify-between'>
        <Link to='/' className='text-xl font-bold text-foreground hover:text-primary transition-colors'>{t('brand.name')}</Link>
        <nav className='flex items-center gap-4'>
          <Link to='/dashboard' className='text-sm text-foreground hover:text-primary transition-colors duration-300'>{t('nav.myAgents')}</Link>
          <Link to='/community' className='text-sm text-foreground hover:text-primary transition-colors duration-300'>{t('nav.community')}</Link>
          <Link to='/workspaces' className='text-sm text-foreground hover:text-primary transition-colors duration-300'>{t('nav.workspaces')}</Link>
          <Link to='/billing' className='text-sm text-foreground hover:text-primary transition-colors duration-300'>{t('nav.pricing')}</Link>
          {user && <Link to='/profile' className='text-sm text-foreground hover:text-primary transition-colors duration-300'>{t('nav.profile')}</Link>}
          {isAdmin && (
            <Link to='/admin' className='text-sm text-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1'>
              <Shield className='h-3 w-3' />
              Admin
            </Link>
          )}
          {!user && (
            <Link to='/auth' className='px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5'>
              {t('nav.signIn')}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
