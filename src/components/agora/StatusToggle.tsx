import { ProducerStatus } from '@/types/agora';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, Loader } from 'lucide-react';

interface StatusToggleProps {
  status: ProducerStatus;
  onChange: (status: ProducerStatus) => void;
}

export function StatusToggle({ status, onChange }: StatusToggleProps) {
  const { t } = useLanguage();

  const statuses: { value: ProducerStatus; labelKey: string; icon: React.ElementType }[] = [
    { value: 'OFFLINE', labelKey: 'status.offline', icon: WifiOff },
    { value: 'ONLINE', labelKey: 'status.online', icon: Wifi },
    { value: 'WORKING', labelKey: 'status.working', icon: Loader },
  ];

  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-background p-1">
      {statuses.map((s) => {
        const Icon = s.icon;
        const isActive = status === s.value;
        return (
          <button
            key={s.value}
            onClick={() => onChange(s.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              isActive && s.value === 'OFFLINE' && 'bg-status-offline text-white',
              isActive && s.value === 'ONLINE' && 'bg-status-online text-white',
              isActive && s.value === 'WORKING' && 'bg-status-working text-white',
              !isActive && 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{t(s.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
