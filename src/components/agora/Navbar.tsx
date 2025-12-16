import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAgora } from '@/context/AgoraContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, LogOut, LayoutDashboard, Coins, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface NavbarProps {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export function Navbar({ onLoginClick, onRegisterClick }: NavbarProps) {
  const { currentUser, logout, topUpCredits } = useAgora();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('50');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTopUp = () => {
    const amount = parseInt(topUpAmount);
    if (amount > 0) {
      topUpCredits(amount);
      toast.success(t('toast.topUpSuccess'));
      setTopUpOpen(false);
      setTopUpAmount('50');
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">A</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">Agora</span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            
            {currentUser ? (
              <>
                <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
                  <Coins className="h-4 w-4 text-status-working" />
                  <span className="text-sm font-medium">{currentUser.credits}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-6 w-6 p-0"
                    onClick={() => setTopUpOpen(true)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="hidden sm:inline">{currentUser.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t('nav.dashboard')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTopUpOpen(true)}>
                      <Coins className="mr-2 h-4 w-4" />
                      {t('nav.topUp')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('nav.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={onLoginClick}>
                  {t('nav.login')}
                </Button>
                <Button size="sm" onClick={onRegisterClick}>
                  {t('nav.register')}
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('nav.topUp')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t('nav.credits')}</Label>
              <Input
                id="amount"
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                min="1"
              />
            </div>
            <div className="flex gap-2">
              {[25, 50, 100, 250].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setTopUpAmount(amount.toString())}
                >
                  {amount}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleTopUp}>{t('nav.topUp')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
