import { Globe, X } from 'lucide-react';
import type { IssueWebLink } from '@/lib/api/endpoints/issues';
import { Button } from '@/components/ui/button';

// One web link in the Links panel, opening the page in a new tab. It spans the
// panel grid, so it sits under the issue relations.
export default function IssueWebLinkRow({
  link,
  removeLabel,
  onRemove,
}: {
  link: IssueWebLink;
  removeLabel: string;
  onRemove?: () => void;
}) {
  return (
    <div className="group col-span-full flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50">
      <Globe className="size-4 shrink-0 text-muted-foreground" />
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-0 flex-1 items-baseline gap-2"
      >
        {link.title && (
          <span dir="auto" className="truncate text-sm">
            {link.title}
          </span>
        )}
        <span
          dir="ltr"
          className={link.title ? 'truncate text-xs text-muted-foreground' : 'truncate text-sm'}
        >
          {link.url}
        </span>
      </a>
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="size-6 opacity-0 group-hover:opacity-100 hover:text-destructive"
          aria-label={removeLabel}
          onClick={onRemove}
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
