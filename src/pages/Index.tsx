import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgora } from '@/context/AgoraContext';
import { useLanguage } from '@/context/LanguageContext';
import { Navbar } from '@/components/agora/Navbar';
import { AuthModal } from '@/components/agora/AuthModal';
import { Button } from '@/components/ui/button';
import { ArrowRight, Store, Users, Zap } from 'lucide-react';

const Index = () => {
  const { currentUser } = useAgora();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const openLogin = () => {
    setAuthMode('login');
    setAuthOpen(true);
  };

  const openRegister = () => {
    setAuthMode('register');
    setAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLoginClick={openLogin} onRegisterClick={openRegister} />

      <main className="container py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span>{t('landing.tagline')}</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {t('landing.title1')}
            <span className="text-primary">{t('landing.title2')}</span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
            {t('landing.description')}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" onClick={openRegister} className="gap-2">
              {t('landing.getStarted')}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={openLogin}>
              {t('nav.login')}
            </Button>
          </div>
        </div>

        <div className="mt-24 grid gap-8 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold">{t('landing.yourMarketplace')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('landing.yourMarketplaceDesc')}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold">{t('landing.manageUsers')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('landing.manageUsersDesc')}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold">{t('landing.connectGrow')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('landing.connectGrowDesc')}
            </p>
          </div>
        </div>
      </main>

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
};

export default Index;
