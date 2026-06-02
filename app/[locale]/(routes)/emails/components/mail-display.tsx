import addDays from 'date-fns/addDays';
import addHours from 'date-fns/addHours';
import format from 'date-fns/format';
import nextSaturday from 'date-fns/nextSaturday';
import {
  Archive,
  ArchiveX,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
} from 'lucide-react';

import {
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Mail } from '@/app/[locale]/(routes)/emails/data';

interface MailDisplayProps {
  mail: Mail | null;
}

export function MailDisplay({ mail }: MailDisplayProps) {
  const today = new Date();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                disabled={!mail}
                className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
              >
                <Archive className="h-4 w-4" />
                <span className="sr-only">Archive</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                disabled={!mail}
                className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
              >
                <ArchiveX className="h-4 w-4" />
                <span className="sr-only">Move to junk</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Move to junk</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                disabled={!mail}
                className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Move to trash</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Move to trash</TooltipContent>
          </Tooltip>
          <div className="mx-1 h-6 w-px bg-gray-200" />
          <Tooltip>
            <Popover>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <button
                    disabled={!mail}
                    className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Clock className="h-4 w-4" />
                    <span className="sr-only">Snooze</span>
                  </button>
                </TooltipTrigger>
              </PopoverTrigger>
              <PopoverContent className="flex w-[535px] p-0">
                <div className="flex flex-col gap-2 border-r px-2 py-4">
                  <div className="px-4 text-sm font-medium">Snooze until</div>
                  <div className="grid min-w-[250px] gap-1">
                    <button className="flex w-full items-center justify-start rounded-md px-2 py-1.5 text-sm font-normal transition-colors hover:bg-gray-100" style={{ color: '#1E1D3D' }}>
                      Later today{' '}
                      <span className="ml-auto text-gray-400">
                        {format(addHours(today, 4), 'E, h:m b')}
                      </span>
                    </button>
                    <button className="flex w-full items-center justify-start rounded-md px-2 py-1.5 text-sm font-normal transition-colors hover:bg-gray-100" style={{ color: '#1E1D3D' }}>
                      Tomorrow
                      <span className="ml-auto text-gray-400">
                        {format(addDays(today, 1), 'E, h:m b')}
                      </span>
                    </button>
                    <button className="flex w-full items-center justify-start rounded-md px-2 py-1.5 text-sm font-normal transition-colors hover:bg-gray-100" style={{ color: '#1E1D3D' }}>
                      This weekend
                      <span className="ml-auto text-gray-400">
                        {format(nextSaturday(today), 'E, h:m b')}
                      </span>
                    </button>
                    <button className="flex w-full items-center justify-start rounded-md px-2 py-1.5 text-sm font-normal transition-colors hover:bg-gray-100" style={{ color: '#1E1D3D' }}>
                      Next week
                      <span className="ml-auto text-gray-400">
                        {format(addDays(today, 7), 'E, h:m b')}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  <Calendar />
                </div>
              </PopoverContent>
            </Popover>
            <TooltipContent>Snooze</TooltipContent>
          </Tooltip>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                disabled={!mail}
                className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
              >
                <Reply className="h-4 w-4" />
                <span className="sr-only">Reply</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Reply</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                disabled={!mail}
                className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
              >
                <ReplyAll className="h-4 w-4" />
                <span className="sr-only">Reply all</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Reply all</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                disabled={!mail}
                className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
              >
                <Forward className="h-4 w-4" />
                <span className="sr-only">Forward</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Forward</TooltipContent>
          </Tooltip>
        </div>
        <div className="mx-2 h-6 w-px bg-gray-200" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              disabled={!mail}
              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem>Star thread</DropdownMenuItem>
            <DropdownMenuItem>Add label</DropdownMenuItem>
            <DropdownMenuItem>Mute thread</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="h-px bg-gray-100" />
      {mail ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage alt={mail.name} />
                <AvatarFallback>
                  {mail.name
                    .split(' ')
                    .map((chunk) => chunk[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">{mail.name}</div>
                <div className="line-clamp-1 text-xs">{mail.subject}</div>
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">Reply-To:</span> {mail.email}
                </div>
              </div>
            </div>
            {mail.date && (
              <div className="ml-auto text-xs text-gray-400">
                {format(new Date(mail.date), 'PPpp')}
              </div>
            )}
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
            {mail.text}
          </div>
          <div className="mt-auto h-px bg-gray-100" />
          <div className="p-4">
            <form>
              <div className="grid gap-4">
                <Textarea
                  className="p-4"
                  placeholder={`Reply ${mail.name}...`}
                />
                <div className="flex items-center">
                  <Label
                    htmlFor="mute"
                    className="flex items-center gap-2 text-xs font-normal"
                  >
                    <Switch id="mute" aria-label="Mute thread" /> Mute this
                    thread
                  </Label>
                  <button
                    type="submit"
                    className="ml-auto flex h-8 items-center rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-400">
          No message selected
        </div>
      )}
    </div>
  );
}
