'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { columns } from '@/app/[locale]/(routes)/documents/components/columns';
import { DocumentsDataTable } from '@/app/[locale]/(routes)/documents/components/data-table';

const DocumentsView = ({ data }: { data: any }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  return (
    <Card className="overflow-hidden">
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
      <CardHeader className="pb-4 pt-5">
        <button
          className="text-base font-bold hover:underline"
          style={{ color: '#1E1D3D' }}
          onClick={() => router.push('/documents')}
        >
          Documents
        </button>
        <p className="mt-0.5 text-xs text-gray-400">
          {data?.length ?? 0} document{(data?.length ?? 0) > 1 ? 's' : ''}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {!data || data.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">Aucun document associé.</p>
        ) : (
          <DocumentsDataTable data={data} columns={columns} />
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentsView;
