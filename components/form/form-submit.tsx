'use client';

import { useFormStatus } from 'react-dom';
import { cn } from '@/lib/utils';

interface FormSubmitProps {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const FormSubmit = ({
  children,
  disabled,
  className,
}: FormSubmitProps) => {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending || disabled}
      type="submit"
      className={cn(
        'flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60',
        className,
      )}
      style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
    >
      {children}
    </button>
  );
};
