import { useState } from 'react';
import { useAgora } from '@/context/AgoraContext';
import { useLanguage } from '@/context/LanguageContext';
import { Marketplace, Job } from '@/types/agora';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { JobCard } from './JobCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Plus,
  MapPin,
  Clock,
  Calendar,
  User,
  Coins,
  Check,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { MapPlaceholder } from '@/components/agora/MapPlaceholder';

interface CustomerDashboardProps {
  marketplace: Marketplace;
}

export function CustomerDashboard({ marketplace }: CustomerDashboardProps) {
  const {
    currentUser,
    createJob,
    getCustomerJobs,
    getProducersByStatus,
    payForJob,
  } = useAgora();
  const { t } = useLanguage();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    preferredTime: '',
    price: '50',
    lat: '',
    lng: '',
  });

  const customerJobs = getCustomerJobs(marketplace.id);
  const availableProducers = getProducersByStatus(marketplace.id, 'APPROVED');

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lat || !formData.lng) {
      toast.error('Пожалуйста, выберите точку на карте');
      return;
    }

    createJob(
      marketplace.id,
      formData.title,
      formData.description,
      formData.address,
      formData.preferredTime,
      parseInt(formData.price) || 50,
      parseFloat(formData.lat),
      parseFloat(formData.lng)
    );

    setFormData({
      title: '',
      description: '',
      address: '',
      preferredTime: '',
      price: '50',
      lat: '',
      lng: '',
    });
    setShowCreateForm(false);
    toast.success(t('toast.jobCreated'));
  };

  /** ---------- ПЛАТЕЖ ---------- */
  const handlePayForJob = async (job: Job) => {
    if (!currentUser) return;

    if (currentUser.credits < job.price) {
      toast.error(t('customer.insufficientCredits'));
      return;
    }

    const ok = await payForJob(job.id);

    if (ok) {
      toast.success(t('toast.paymentSuccess'));
      setSelectedJob(null);
    } else {
      toast.error(t('customer.paymentFailed'));
    }
  };

  const statusColors = {
    OFFLINE: 'bg-status-offline',
    ONLINE: 'bg-status-online',
    WORKING: 'bg-status-working',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ----------- CREATE JOB CARD (кнопка) ----------- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t('customer.createJob')}</CardTitle>
          <Button size="sm" onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-1 h-4 w-4" />
            {t('customer.newJob')}
          </Button>
        </CardHeader>
      </Card>

      {/* ----------- JOB LIST ----------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('customer.yourJobs')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {customerJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('customer.noJobs')}
            </p>
          ) : (
            customerJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={() => setSelectedJob(job)}
                showPayButton={!job.isPaid && job.status !== 'OPEN'}
                onPay={() => handlePayForJob(job)}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* ----------- PRODUCERS ----------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t('customer.availableProducers')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableProducers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('customer.noProducers')}
            </p>
          ) : (
            <div className="space-y-2">
              {availableProducers
                .filter((p) => p.role === 'PRODUCER')
                .map((producer) => (
                  <div
                    key={producer.userId}
                    className="flex items-center gap-3 rounded-md border border-border p-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {producer.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {producer.description}
                      </p>
                    </div>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        statusColors[producer.status || 'OFFLINE']
                      }`}
                    />
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ----------- CREATE JOB MODAL (с картой) ----------- */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('customer.createJob')}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateJob} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('customer.title')}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('customer.description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address">{t('customer.address')}</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredTime">
                  {t('customer.preferredTime')}
                </Label>
                <Input
                  id="preferredTime"
                  value={formData.preferredTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferredTime: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                {t('customer.price')} ({t('common.credits')})
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                min="1"
              />
            </div>

            {/* КАРТА ДЛЯ ВЫБОРА КООРДИНАТ */}
            <div className="space-y-2">
              <Label>{t('map.title')}</Label>
              <MapPlaceholder
                city={marketplace.city}
                lat={
                  formData.lat ? parseFloat(formData.lat) : undefined
                }
                lng={
                  formData.lng ? parseFloat(formData.lng) : undefined
                }
                onLocationChange={(lat, lng) =>
                  setFormData({
                    ...formData,
                    lat: String(lat),
                    lng: String(lng),
                  })
                }
              />
            </div>

            <DialogFooter>
              <Button type="submit">{t('customer.postJob')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ----------- JOB DETAILS MODAL ----------- */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('customer.jobDetails')}</DialogTitle>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{selectedJob.title}</h3>

                  {selectedJob.isPaid ? (
                    <Badge className="bg-status-online text-white">
                      <Check className="mr-1 h-3 w-3" />
                      {t('customer.paid')}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Coins className="h-3 w-3" />
                      {selectedJob.price} {t('common.credits')}
                    </Badge>
                  )}
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedJob.description}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedJob.address}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{selectedJob.preferredTime}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(selectedJob.createdAt, 'MMM d, yyyy')}</span>
                </div>
              </div>

              {!selectedJob.isPaid && selectedJob.status !== 'OPEN' && (
                <DialogFooter>
                  {currentUser && currentUser.credits < selectedJob.price ? (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {t('customer.insufficientCredits')}
                    </div>
                  ) : (
                    <Button onClick={() => handlePayForJob(selectedJob)}>
                      <Coins className="mr-2 h-4 w-4" />
                      {t('customer.pay')} {selectedJob.price}{' '}
                      {t('common.credits')}
                    </Button>
                  )}
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
