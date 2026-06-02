import formatDistanceToNow from 'date-fns/formatDistanceToNow';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Mail } from '@/app/[locale]/(routes)/emails/data';
import { useMail } from '@/app/[locale]/(routes)/emails/use-mail';

interface MailListProps {
  items: Mail[];
}

export function MailList({ items }: MailListProps) {
  const [mail, setMail] = useMail();

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <button
            key={item.id}
            className={cn(
              'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
              mail.selected === item.id && 'bg-gray-100'
            )}
            onClick={() =>
              setMail({
                ...mail,
                selected: item.id,
              })
            }
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{item.name}</div>
                  {!item.read && (
                    <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <div
                  className={cn(
                    'ml-auto text-xs',
                    mail.selected === item.id
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  )}
                >
                  {formatDistanceToNow(new Date(item.date), {
                    addSuffix: true,
                  })}
                </div>
              </div>
              <div className="text-xs font-medium">{item.subject}</div>
            </div>
            <div className="line-clamp-2 text-xs text-gray-400">
              {item.text.substring(0, 300)}
            </div>
            {item.labels.length ? (
              <div className="flex items-center gap-2">
                {item.labels.map((label) => (
                  <span key={label} className={getBadgeClassFromLabel(label)}>
                    {label}
                  </span>
                ))}
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}

function getBadgeClassFromLabel(label: string): string {
  if (['work'].includes(label.toLowerCase())) {
    return 'inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-medium text-white';
  }
  if (['personal'].includes(label.toLowerCase())) {
    return 'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium';
  }
  return 'inline-flex items-center rounded-sm bg-gray-100 px-1 text-xs font-normal';
}
