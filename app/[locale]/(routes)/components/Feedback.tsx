'use client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import FeedbackForm from './FeedbackForm';
import { ChatBubbleIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

const Feedback = () => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="hidden sm:flex">
        <button
          onClick={() => setOpen(false)}
          className="hidden h-9 items-center gap-1.5 rounded-md bg-gray-100 px-4 text-sm font-medium transition-colors hover:bg-gray-200 sm:flex"
          style={{ color: '#1E1D3D' }}
        >
          <ChatBubbleIcon className="mr-2 h-4 w-4" />
          Feedback
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <FeedbackForm setOpen={setOpen} />
      </PopoverContent>
    </Popover>
  );
};

export default Feedback;
