import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { getDefinitionDetail } from '@/actions/workflows/get-definition-detail';
import { format } from 'date-fns';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Box } from '@radix-ui/themes';

import StartNowDialog from './components/StartNowDialog';

const WorkflowDetailPage = async ({
  params: { definitionId },
}: {
  params: { definitionId: string };
}) => {
  const detailData = await getDefinitionDetail(definitionId);

  return (
    <Box className="p-3">
      {detailData && (
        <div className="w-full items-start justify-start gap-y-0.5">
          <h4>Workflow Definition</h4>
          <Card className="w-full">
            <CardHeader>
              <p className="text-xl font-bold" style={{ color: '#1E1D3D' }}>{detailData?.name}</p>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${
                  detailData?.definitionStatus === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {detailData?.definitionStatus?.toUpperCase()}
              </span>
            </CardHeader>
            <CardContent>
              <div className="gap-y-0.5">
                <p className="text-sm text-gray-400">{detailData?.description}</p>
                <div className="grid-flow grid auto-cols-auto grid-flow-row auto-rows-auto items-center justify-between gap-x-0.5 gap-y-0.5">
                  <Label>
                    Last Updated:{' '}
                    {format(
                      new Date(detailData?.updatedAt as any),
                      'dd MMM yyyy, hh:mm aa'
                    )}
                  </Label>
                  <Label>
                    Created:{' '}
                    {format(
                      new Date(detailData?.createdAt as any),
                      'dd MMM yyyy, hh:mm aa'
                    )}
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="gap-y-0.5">
              <Link
                key={detailData.id}
                href={`/workflows/edit/${detailData.id}`}
                prefetch={false}
                className="flex h-9 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-gray-50"
                style={{ color: '#1E1D3D' }}
              >
                Edit
                <Pencil className="h-[15px] w-[15px]" />
              </Link>
              <StartNowDialog workflowDefinitionId={detailData.id} />
            </CardFooter>
          </Card>
          <h4>Workflow Runtimes</h4>
          {detailData.runtimes.map((runtime) => (
            <Link
              style={{ width: '100%' }}
              key={runtime.id}
              href={`/api/workflow/runtime-detail?id=${runtime.id}`}
            >
              <Card className="w-full">
                <CardHeader>
                  <p className="text-sm font-bold" style={{ color: '#1E1D3D' }}><Label>{runtime.id}</Label></p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${
                      runtime.workflowStatus === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {runtime.workflowStatus.toUpperCase()}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="grid-flow grid auto-cols-auto grid-flow-row auto-rows-auto items-center justify-between gap-x-0.5 gap-y-0.5">
                    <Label>
                      Last Updated:{' '}
                      {format(
                        new Date(runtime.updatedAt as any),
                        'dd MMM yyyy, hh:mm aa'
                      )}
                    </Label>
                    <Label>
                      Created:{' '}
                      {format(
                        new Date(runtime.createdAt as any),
                        'dd MMM yyyy, hh:mm aa'
                      )}
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {detailData.runtimes?.length < 1 ? (
            <Label className="flex flex-row justify-center">
              No runtimes found!
            </Label>
          ) : null}
        </div>
      )}
    </Box>
  );
};

export default WorkflowDetailPage;
