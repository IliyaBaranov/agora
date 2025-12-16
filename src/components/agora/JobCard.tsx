import { Job } from '@/types/agora';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Calendar, Coins, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
  onTakeJob?: () => void;
  onViewDetails?: () => void;
  onPay?: () => void;
  showTakeButton?: boolean;
  showPayButton?: boolean;
  showCompleteButton?: boolean;
  onCompleteJob?: () => void;
}

const statusColors = {
  OPEN: 'bg-status-online text-white',
  TAKEN: 'bg-status-working text-white',
  COMPLETED: 'bg-muted text-muted-foreground',
};

export function JobCard({ job, onTakeJob, onViewDetails, onPay, showTakeButton, showPayButton }: JobCardProps) {
  const { t } = useLanguage();
  
  return (
    <Card className="transition-shadow hover:shadow-card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium leading-tight">{job.title}</h4>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Coins className="h-3 w-3" />
              {job.price}
            </Badge>
            <Badge className={statusColors[job.status]} variant="secondary">
              {job.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{job.address}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{job.preferredTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDistanceToNow(job.createdAt, { addSuffix: true })}</span>
          </div>
          {job.isPaid && (
            <div className="flex items-center gap-1 text-status-online">
              <Check className="h-3 w-3" />
              <span>{t('customer.paid')}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="gap-2 pt-0">
        {showTakeButton && job.status === 'OPEN' && (
          <Button size="sm" onClick={onTakeJob}>
            {t('producer.takeJob')}
          </Button>
        )}
        {showPayButton && !job.isPaid && (
          <Button size="sm" variant="default" onClick={onPay}>
            <Coins className="mr-1 h-3 w-3" />
            {t('customer.pay')}
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={onViewDetails}>
          {t('common.viewDetails')}
        </Button>
      </CardFooter>
    </Card>
  );
}
