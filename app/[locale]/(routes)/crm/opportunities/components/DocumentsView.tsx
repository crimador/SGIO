'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { File, PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DocumentsViewProps {
  data: {
    id: string;
    document_name: string;
    map: Function;
  };
}

const DocumentsView = ({ data }: DocumentsViewProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  const onAddNew = () => {
    alert('Actions - not yet implemented');
  };

  if (!data) return <div>Aucun document trouvé</div>;

  return (
    <Card className="overflow-hidden">
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
      <CardHeader className="pb-4 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold" style={{ color: '#1E1D3D' }}>Documents</p>
            <p className="mt-0.5 text-xs text-gray-400">
              {(data as any)?.length ?? 0} document{((data as any)?.length ?? 0) > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onAddNew}
            className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
          >
            <PlusIcon className="h-4 w-4" /> Ajouter
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!(data as any)?.length ? (
          <p className="py-6 text-center text-sm text-gray-400">Aucun document associé.</p>
        ) : (
          <div>
            {(data as any).map((document: { id: string; document_name: string }) => (
              <div key={document.id} className="-mx-2 flex items-center space-x-4 rounded-md p-2 transition-all hover:bg-[#FF7E00]/[0.05]">
                <File className="mt-px h-5 w-5 shrink-0" style={{ color: '#FF7E00' }} />
                <div className="flex w-full justify-between">
                  <div className="flex items-center justify-start space-x-5">
                    <p className="text-sm font-medium" style={{ color: '#1E1D3D' }}>{document.document_name}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-8 w-8 items-center justify-center rounded-md p-0 hover:bg-[#FF7E00]/[0.08]">
                        <DotsHorizontalIcon className="h-4 w-4" />
                        <span className="sr-only">Ouvrir le menu</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem>Voir</DropdownMenuItem>
                      <DropdownMenuItem>Délier</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentsView;
