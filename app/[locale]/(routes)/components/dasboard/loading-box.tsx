import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LightbulbIcon } from 'lucide-react';

const LoadingBox = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <p className="animate-pulse bg-gray-200 text-sm font-medium text-gray-200">
        Notions
      </p>
      <LightbulbIcon className="h-4 w-4 text-gray-400" />
    </CardHeader>
    <CardContent>
      <div className="animate-pulse bg-gray-200 text-2xl font-medium text-gray-200">
        Loading...
      </div>
    </CardContent>
  </Card>
);

export default LoadingBox;
