import { useState } from 'react';
import { useAgora } from '@/context/AgoraContext';
import { useLanguage } from '@/context/LanguageContext';

import { Marketplace, Job } from '@/types/agora';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { StatusToggle } from './StatusToggle';
import { JobCard } from './JobCard';
import { MapPlaceholder } from '@/components/agora/MapPlaceholder';

import { Star, Briefcase, User, Coins, MapPin, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ProducerDashboardProps {
  marketplace: Marketplace;
}

export function ProducerDashboard({ marketplace }: ProducerDashboardProps) {
  const {
    currentUser,
    getAvailableJobs,
    getCurrentProducerStatus,
    updateProducerStatus,
    takeJob,
    completeJob,
    marketplaceUsers,
    jobs,
    getProducerEarnings,
  } = useAgora();

  const { t } = useLanguage();

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const status = getCurrentProducerStatus(marketplace.id) || "OFFLINE";
  const availableJobs = getAvailableJobs(marketplace.id);
  const earnings = getProducerEarnings(marketplace.id);

  const currentProducer = marketplaceUsers.find(
    (mu) => mu.userId === currentUser?.id && mu.marketplaceId === marketplace.id
  );

  const activeJob = jobs.find(
    (j) =>
      j.marketplaceId === marketplace.id &&
      j.producerId === currentUser?.id &&
      j.status === "TAKEN"
  );

  const handleTakeJob = (jobId: string) => {
    takeJob(jobId);
    toast.success(t('toast.jobTaken'));
  };

  const handleCompleteJob = (jobId: string) => {
    completeJob(jobId);
    toast.success(t('toast.jobCompleted'));
  };

  const statusColors = {
    OFFLINE: 'bg-status-offline',
    ONLINE: 'bg-status-online',
    WORKING: 'bg-status-working',
  };

  return (
    <div className="space-y-6 animate-fade-in">
  
      {/* ------------------ STATUS ------------------ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("producer.yourStatus")}</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusToggle
            status={status}
            onChange={(newStatus) => {
              updateProducerStatus(marketplace.id, newStatus);
              toast.success(`${t("toast.statusUpdated")} ${newStatus}`);
            }}
          />
        </CardContent>
      </Card>
  
      {/* ---------- THREE COLUMNS ---------- */}
      <div className="grid gap-6 xl:grid-cols-3">
  
        {/* LEFT COLUMN — JOBS */}
        <div className="space-y-6">
  
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {activeJob ? t("producer.activeJob") : t("producer.nearbyJobs")}
              </CardTitle>
            </CardHeader>
  
            <CardContent className="space-y-3">
              {activeJob ? (
                <JobCard
                  job={activeJob}
                  showCompleteButton
                  onCompleteJob={() => handleCompleteJob(activeJob.id)}
                  onViewDetails={() => setSelectedJob(activeJob)}
                />
              ) : (
                <>
                  {availableJobs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("producer.noJobs")}
                    </p>
                  ) : (
                    availableJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        showTakeButton={status === "ONLINE"}
                        onTakeJob={() => handleTakeJob(job.id)}
                        onViewDetails={() => setSelectedJob(job)}
                      />
                    ))
                  )}
                </>
              )}
            </CardContent>
          </Card>
  
        </div>
  
        {/* MIDDLE COLUMN — PROFILE */}
        <div className="space-y-6">
  
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("producer.yourProfile")}</CardTitle>
            </CardHeader>
  
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
  
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{currentUser?.name}</h4>
                    <Badge className={`${statusColors[status]} text-white`}>
                      {status}
                    </Badge>
                  </div>
  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-status-working text-status-working" />
                      <span>{currentProducer?.rating?.toFixed(1) || "0.0"}</span>
                    </div>
  
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>
                        {currentProducer?.completedJobs || 0} {t("producer.completed")}
                      </span>
                    </div>
                  </div>
  
                  {currentProducer?.description && (
                    <p className="text-sm text-muted-foreground">{currentProducer.description}</p>
                  )}
                </div>
              </div>
  
              {/* Earnings box */}
              <div className="mt-4 rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t("producer.earnings")}</span>
  
                  <div className="flex items-center gap-1.5">
                    <Coins className="h-5 w-5 text-status-working" />
                    <span className="text-lg font-bold">{earnings}</span>
                    <span className="text-sm text-muted-foreground">{t("common.credits")}</span>
                  </div>
                </div>
              </div>
  
            </CardContent>
          </Card>
  
        </div>
  
        {/* RIGHT COLUMN — LARGE MAP */}
        <div className="space-y-6">
  
          {activeJob && activeJob.lat && activeJob.lng ? (
            <div className="rounded-lg overflow-hidden border border-border"> 
            </div>
          ) : (
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                {t("producer.noJobSelected")}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
  
      {/* ---------- JOB DETAILS MODAL ---------- */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("producer.jobDetails")}</DialogTitle>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedJob.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedJob.description}
                </p>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  📍 <span>{selectedJob.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  🕒 <span>{selectedJob.preferredTime}</span>
                </div>
              </div>

              <div className="text-sm">
                <strong>
                  lat: {selectedJob.lat}, lng: {selectedJob.lng}
                </strong>
              </div>

              {selectedJob.lat && selectedJob.lng && (
              <div className="h-64 rounded-lg overflow-hidden border">
                <MapPlaceholder
                  city={marketplace.city}
                  lat={selectedJob.lat}
                  lng={selectedJob.lng}
                />
              </div>
            )}

              {selectedJob.status === "TAKEN" && (
                <Button onClick={() => {
                  handleCompleteJob(selectedJob.id);
                  setSelectedJob(null);
                }}>
                  ✔ {t("producer.completeJob")}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );  
}
