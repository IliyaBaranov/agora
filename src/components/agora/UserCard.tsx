import { MarketplaceUser, User } from '@/types/agora';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Briefcase, User as UserIcon, Coins } from 'lucide-react';

interface UserCardProps {
  marketplaceUser: MarketplaceUser & { user: User };
  onViewProfile?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

const roleColors = {
  ADMIN: 'bg-primary text-primary-foreground',
  PRODUCER: 'bg-status-online text-white',
  CUSTOMER: 'bg-muted text-muted-foreground',
};

const statusColors = {
  OFFLINE: 'bg-status-offline',
  ONLINE: 'bg-status-online',
  WORKING: 'bg-status-working',
};

export function UserCard({ marketplaceUser, onViewProfile, onApprove, onReject, showActions }: UserCardProps) {
  const { user, role, status, rating, completedJobs, description } = marketplaceUser;
  const { t } = useLanguage();

  return (
    <Card className="transition-shadow hover:shadow-card-hover">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{user.name}</h4>
              <Badge className={roleColors[role]} variant="secondary">
                {t(`role.${role.toLowerCase()}`)}
              </Badge>
              {status && (
                <span className={`h-2 w-2 rounded-full ${statusColors[status]}`} title={t(`status.${status.toLowerCase()}`)} />
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {rating !== undefined && rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-status-working text-status-working" />
                  <span>{rating.toFixed(1)}</span>
                </div>
              )}
              {completedJobs !== undefined && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  <span>{completedJobs} {t('common.jobs')}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Coins className="h-3 w-3 text-status-working" />
                <span>{user.credits}</span>
              </div>
            </div>
          </div>
        </div>
        {(showActions || onViewProfile) && (
          <div className="mt-3 flex gap-2">
            {showActions && onApprove && (
              <Button size="sm" onClick={onApprove}>
                {t('common.approve')}
              </Button>
            )}
            {showActions && onReject && (
              <Button size="sm" variant="outline" onClick={onReject}>
                {t('common.reject')}
              </Button>
            )}
            {onViewProfile && (
              <Button size="sm" variant="ghost" onClick={onViewProfile}>
                {t('common.viewProfile')}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
