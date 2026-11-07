import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAddIssueWebLink } from '../../services/webLinks.service';

export default function IssueWebLinkDialog({
  issueId,
  onClose,
}: {
  issueId: number;
  onClose: () => void;
}) {
  const t = useTranslations('issue.webLinkDialog');
  const tCommon = useTranslations('common');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const add = useAddIssueWebLink(issueId);

  // Checked here as well as on the server, so a typo is caught before the request.
  const valid = /^https?:\/\/\S+$/i.test(url.trim());

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!valid) return;
    await add.mutateAsync({ url: url.trim(), title: title.trim() || null });
    toast.success(t('added'));
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">{t('url')}</span>
            <Input
              autoFocus
              dir="ltr"
              type="url"
              placeholder="https://"
              maxLength={2048}
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">{t('linkTitle')}</span>
            <Input
              dir="auto"
              placeholder={t('linkTitlePlaceholder')}
              maxLength={200}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={!valid || add.isPending}>
              {tCommon('add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
