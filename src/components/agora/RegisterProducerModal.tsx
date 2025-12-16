import { useState } from 'react';
import { useAgora } from '@/context/AgoraContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface RegisterProducerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marketplaceId: string;
}

export function RegisterProducerModal({ open, onOpenChange, marketplaceId }: RegisterProducerModalProps) {
  const { registerAsProducer } = useAgora();
  const { t } = useLanguage();
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerAsProducer(marketplaceId, description);
    onOpenChange(false);
    setDescription('');
    toast.success(t('toast.producerRegistered'));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('registerProducer.title')}</DialogTitle>
          <DialogDescription>
            {t('registerProducer.subtitle')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">{t('registerProducer.about')}</Label>
            <Textarea
              id="description"
              placeholder={t('registerProducer.aboutPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            {t('registerProducer.submit')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
