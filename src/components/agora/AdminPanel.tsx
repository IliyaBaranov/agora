import { useState } from 'react';
import { useAgora } from '@/context/AgoraContext';
import { useLanguage } from '@/context/LanguageContext';
import { Marketplace, MarketplaceUser, User } from '@/types/agora';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCard } from './UserCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Star, Briefcase, Calendar, Mail, User as UserIcon, Coins, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AdminPanelProps {
  marketplace: Marketplace;
}

export function AdminPanel({ marketplace }: AdminPanelProps) {
  const { getProducersByStatus, approveProducer, rejectProducer, getUsersInMarketplace, addCredits, getUserById, setAdminRole, getUserRoleInMarketplace } = useAgora();
  const { t } = useLanguage();
  const [selectedUser, setSelectedUser] = useState<(MarketplaceUser & { user: User }) | null>(null);
  const [creditsAmount, setCreditsAmount] = useState('50');

  const pendingProducers = getProducersByStatus(marketplace.id, 'PENDING');
  const approvedProducers = getProducersByStatus(marketplace.id, 'APPROVED');
  const rejectedProducers = getProducersByStatus(marketplace.id, 'REJECTED');
  const allUsers = getUsersInMarketplace(marketplace.id);

  const realRole = getUserRoleInMarketplace(marketplace.id);
  console.log("REAL ROLE =", realRole);
    const canSee = (roles: string[]) => roles.includes(realRole);
  
  const roleColors = {
    ADMIN: 'bg-primary text-primary-foreground',
    PRODUCER: 'bg-status-online text-white',
    CUSTOMER: 'bg-muted text-muted-foreground',
  };

  const handleAddCredits = () => {
    if (selectedUser) {
      const amount = parseInt(creditsAmount);
      if (amount > 0) {
        addCredits(selectedUser.userId, amount);
        toast.success(`${amount} ${t('toast.creditsAdded')}`);
        setCreditsAmount('50');
        // Update selected user view
        const updatedUser = getUserById(selectedUser.userId);
        if (updatedUser) {
          setSelectedUser({ ...selectedUser, user: updatedUser });
        }
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('admin.producerManagement')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
          <TabsList className="w-full justify-start">
            {/* ADMIN — видит pending */}
            {canSee(["ADMIN"]) && (
              <TabsTrigger value="pending" className="gap-1">
                {t('admin.pending')}
                {pendingProducers.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {pendingProducers.length}
                  </Badge>
                )}
              </TabsTrigger>
            )}

            {/* ADMIN и PRODUCER — видят approved */}
            {canSee(["ADMIN", "PRODUCER"]) && (
              <TabsTrigger value="approved">
                {t('admin.approved')}
              </TabsTrigger>
            )}

            {/* ADMIN — видит rejected */}
            {canSee(["ADMIN"]) && (
              <TabsTrigger value="rejected">
                {t('admin.rejected')}
              </TabsTrigger>
            )}

            </TabsList>
            <TabsContent value="pending" className="mt-4 space-y-3">
              {pendingProducers.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('admin.noPending')}</p>
              ) : (
                pendingProducers.map((producer) => (
                  <UserCard
                    key={producer.userId}
                    marketplaceUser={producer}
                    showActions
                    onApprove={() => approveProducer(producer.userId, marketplace.id)}
                    onReject={() => rejectProducer(producer.userId, marketplace.id)}
                    onViewProfile={() => setSelectedUser(producer)}
                  />
                ))
              )}
            </TabsContent>
            <TabsContent value="approved" className="mt-4 space-y-3">
              {approvedProducers.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('admin.noApproved')}</p>
              ) : (
                approvedProducers.map((producer) => (
                  <UserCard
                    key={producer.userId}
                    marketplaceUser={producer}
                    onViewProfile={() => setSelectedUser(producer)}
                  />
                ))
              )}
            </TabsContent>
            <TabsContent value="rejected" className="mt-4 space-y-3">
              {rejectedProducers.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('admin.noRejected')}</p>
              ) : (
                rejectedProducers.map((producer) => (
                  <UserCard
                    key={producer.userId}
                    marketplaceUser={producer}
                    onViewProfile={() => setSelectedUser(producer)}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('admin.allUsers')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.name')}</TableHead>
                <TableHead>{t('admin.role')}</TableHead>
                <TableHead>{t('admin.balance')}</TableHead>
                <TableHead>{t('admin.stats')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map((mu) => (
                <TableRow
                  key={mu.userId}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedUser(mu)}
                >
                  <TableCell className="font-medium">{mu.user.name}</TableCell>
                  <TableCell>
                    <Badge className={roleColors[mu.role]} variant="secondary">
                      {mu.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Coins className="h-3.5 w-3.5 text-status-working" />
                      <span>{mu.user.credits}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {mu.role === 'PRODUCER' && `${mu.completedJobs || 0} ${t('admin.jobsCompleted')}`}
                    {mu.role === 'CUSTOMER' && `${mu.jobsCreated || 0} ${t('admin.jobsCreated')}`}
                    {mu.role === 'ADMIN' && 'Admin'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAdminRole(marketplace.id, mu.userId, "ADMIN");
                      }}
                    >
                      Назначить админом
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('admin.userProfile')}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <UserIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedUser.user.name}</h3>
                  <Badge className={roleColors[selectedUser.role]} variant="secondary">
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{selectedUser.user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{t('admin.joined')} {format(selectedUser.user.createdAt, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Coins className="h-4 w-4 text-status-working" />
                  <span>{t('admin.balance')}: {selectedUser.user.credits} {t('common.credits')}</span>
                </div>
                {selectedUser.role === 'PRODUCER' && (
                  <>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Star className="h-4 w-4 fill-status-working text-status-working" />
                      <span>{t('admin.rating')}: {selectedUser.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{selectedUser.completedJobs || 0} {t('admin.jobsCompleted')}</span>
                    </div>
                    {selectedUser.description && (
                      <p className="mt-2 rounded-md bg-muted p-3 text-foreground">
                        {selectedUser.description}
                      </p>
                    )}
                  </>
                )}
                {selectedUser.role === 'CUSTOMER' && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{selectedUser.jobsCreated || 0} {t('admin.jobsCreated')}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4">
                <Label className="text-sm font-medium">{t('admin.addCredits')}</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    type="number"
                    value={creditsAmount}
                    onChange={(e) => setCreditsAmount(e.target.value)}
                    className="w-24"
                    min="1"
                  />
                  <Button size="sm" onClick={handleAddCredits}>
                    <Plus className="mr-1 h-4 w-4" />
                    {t('admin.add')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
