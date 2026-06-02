import { Lock } from 'lucide-react';

interface HeadingProps {
  title: string;
  description: string;
  visibility?: string;
}

const Heading = ({ title, description, visibility }: HeadingProps) => (
  <div>
    <h2
      className="flex items-center gap-2 text-2xl font-bold tracking-tight"
      style={{ color: '#1E1D3D' }}
    >
      {title}
      {visibility === 'private' && <Lock className="h-5 w-5 text-gray-400" />}
    </h2>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
    <div
      className="mt-4 h-[3px] w-8 rounded-full"
      style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }}
    />
  </div>
);

export default Heading;
