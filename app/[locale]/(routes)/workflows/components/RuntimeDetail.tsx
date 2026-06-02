'use client';

import { getRuntimeDetail } from '@/actions/workflows/get-runtime-detail';
import { Heading4, Heading5, RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { Box } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import type { FC } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Label } from '@/components/ui/label';

interface Props {}

const RuntimeDetailPage: FC<Props> = () => {
  const params = useParams<{ id: string }>();

  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: [params?.id],
    queryFn: async () => {
      if (params?.id) {
        return getRuntimeDetail(params.id);
      }
      return null;
    },
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Box className="p-3">
      {isLoading && <Label>Loading...</Label>}
      {!isLoading && data && (
        <div className="w-full items-start justify-start gap-y-1">
          <Heading4>Workflow Definition</Heading4>
          <Link className="w-full" href={`/workflows/${data.definitions.id}`}>
            <Card className="w-full border-slate-200 hover:bg-slate-100">
              <CardHeader>
                <p className="text-base font-bold" style={{ color: '#1E1D3D' }}>
                  {<Heading4>{data.definitions.name}</Heading4>}
                </p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${
                    data.definitions.definitionStatus === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  <Label>
                    {data.definitions?.definitionStatus?.toUpperCase()}
                  </Label>
                </span>
              </CardHeader>
              <CardContent>
                <div className="gap-y-0.5">
                  <p className="text-sm text-gray-400">
                    {data?.definitions?.description}
                  </p>
                  <div className="grid-flow grid auto-cols-auto grid-flow-row auto-rows-auto items-center justify-between gap-x-0.5 gap-y-0.5">
                    <Label>
                      Last Updated:{' '}
                      {format(
                        new Date(data?.definitions?.updatedAt as any),
                        'dd MMM yyyy, hh:mm aa'
                      )}
                    </Label>
                    <Label>
                      Created:{' '}
                      {format(
                        new Date(data?.definitions?.createdAt as any),
                        'dd MMM yyyy, hh:mm aa'
                      )}
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <div className="grid-flow grid w-full auto-cols-auto grid-flow-row auto-rows-auto items-center justify-between gap-x-0.5 gap-y-1">
            <Heading5>Runtime</Heading5>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-gray-50"
                    style={{ color: '#1E1D3D' }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="w-full gap-y-0.5">
            <Card className="w-full border-[1px] border-slate-200">
              <CardHeader>
                <p className="text-sm font-bold" style={{ color: '#1E1D3D' }}>
                  {<Label>{data.id}</Label>}
                </p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${
                    data.workflowStatus === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {data.workflowStatus.toUpperCase()}
                </span>
              </CardHeader>
              <CardContent>
                <div className="gap-y-0.5">
                  <Label>
                    Last Updated:{' '}
                    {format(
                      new Date(data?.updatedAt as any),
                      'dd MMM yyyy, hh:mm aa'
                    )}
                  </Label>
                  <Label>
                    Created:{' '}
                    {format(
                      new Date(data?.createdAt as any),
                      'dd MMM yyyy, hh:mm aa'
                    )}
                  </Label>
                </div>
              </CardContent>
            </Card>
            <Heading5>Tasks</Heading5>
            <div className="flex w-full flex-row items-start justify-start gap-x-0.5 gap-y-0.5 border-[1px] border-slate-200 p-2">
              {data.tasks.map((task) => (
                <Card className="border-[1px] border-slate-100" key={task.id}>
                  <CardHeader>
                    <p className="text-sm font-bold" style={{ color: '#1E1D3D' }}>{task.name}</p>
                    <span className="inline-flex items-center rounded-full bg-[#FF7E00]/10 px-2 py-0.5 text-xs font-medium text-[#FF7E00]">
                      {task.type.toUpperCase()}
                    </span>
                  </CardHeader>
                  <CardContent>
                    <div className="items-start justify-start gap-y-2">
                      <div className="flex flex-row items-center justify-start gap-x-0.5">
                        <Label>Status</Label>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            task?.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {task.status.toUpperCase()}
                        </span>
                      </div>
                      {data?.workflowResults?.[task.name] && (
                        <TooltipProvider>
                          <Tooltip>
                            <button
                              type="button"
                              className="flex h-8 items-center rounded-md border px-3 text-sm font-medium transition-colors hover:bg-gray-50"
                              style={{ color: '#1E1D3D' }}
                              onClick={() => {
                                navigator.clipboard
                                  .writeText(
                                    JSON.stringify(
                                      data?.workflowResults?.[task.name],
                                      undefined,
                                      4
                                    )
                                  )
                                  .then(() => {
                                    toast({
                                      title: 'Success',
                                      description:
                                        'Results copied to Clipboard',
                                    });
                                  })
                                  .catch();
                              }}
                            >
                              Copy Result
                            </button>
                            <TooltipContent>
                              {JSON.stringify(
                                data?.workflowResults,
                                undefined,
                                4
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Heading5>Logs</Heading5>
            <div className="max-h-[500px] w-full items-start justify-start overflow-x-auto overflow-y-auto border-[1px] border-slate-200">
              {data.logs.map(({ log, timestamp, severity, taskName }) => (
                <div
                  className="flex w-full flex-row items-center justify-start gap-x-0.5 border-[1px] border-slate-200 px-2 py-2"
                  key={timestamp as any}
                >
                  <span className="inline-flex items-center rounded-sm bg-gray-100 px-1.5 py-0.5 text-xs font-medium">
                    {severity}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipContent>
                        {format(
                          new Date(timestamp as any),
                          'dd MMM yyyy, hh:mm aa'
                        )}
                        <span className="inline-flex items-center rounded-sm bg-gray-100 px-1.5 py-0.5 text-xs font-medium">
                          {timestamp as any}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Label className="font-semibold">{taskName}</Label>
                  <Label className="w-full flex-1 text-slate-800">{log}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Box>
  );
};

export default RuntimeDetailPage;
