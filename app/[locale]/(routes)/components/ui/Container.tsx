import Heading from '@/components/ui/heading';
import type React from 'react';

interface ContainerProps {
  title: string;
  description: string;
  visibility?: string;
  children: React.ReactNode;
}

const Container = ({ title, description, visibility, children }: ContainerProps) => (
  <div className="h-full flex-1 overflow-hidden p-8 pt-6">
    <Heading title={title} description={description} visibility={visibility} />
    <div className="mt-6 h-full space-y-5 overflow-auto pb-32 text-sm">
      {children}
    </div>
  </div>
);

export default Container;
