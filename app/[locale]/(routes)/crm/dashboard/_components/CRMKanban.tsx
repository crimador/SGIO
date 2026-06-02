'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ThumbsDown, ThumbsUp } from 'lucide-react';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import type {
  crm_Opportunities,
  crm_Opportunities_Sales_Stages,
} from '@prisma/client';

import { DotsHorizontalIcon, PlusCircledIcon } from '@radix-ui/react-icons';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import LoadingModal from '@/components/modals/loading-modal';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

import { NewOpportunityForm } from '../../opportunities/components/NewOpportunityForm';

interface CRMKanbanProps {
  salesStages: crm_Opportunities_Sales_Stages[];
  opportunities: crm_Opportunities[];
  crmData: any;
}

// ─── Draggable card ──────────────────────────────────────────────────────────

interface KanbanCardProps {
  opportunity: any;
  stage: any;
  maxProbability: number;
  onThumbsUp: (id: string) => void;
  onThumbsDown: (id: string) => void;
}

function KanbanCard({
  opportunity,
  stage,
  maxProbability,
  onThumbsUp,
  onThumbsDown,
}: KanbanCardProps) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: opportunity.id, data: { stageId: stage.id } });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="my-2 w-full cursor-grab active:cursor-grabbing"
    >
      <div className="p-2 text-sm">
        <div className="flex justify-between p-2">
          <span className="font-bold" style={{ color: '#1E1D3D' }}>{opportunity.name}</span>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <DotsHorizontalIcon className="h-4 w-4 text-slate-600" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem
                  onSelect={() =>
                    router.push(`/crm/opportunities/${opportunity.id}`)
                  }
                >
                  Voir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <CardContent className="text-xs text-gray-400">
        <div className="flex flex-col space-y-1">
          <div>{opportunity.description?.substring(0, 200)}</div>
          <div className="space-x-1">
            <span>Budget :</span>
            <span>{opportunity.budget}</span>
          </div>
          <div className="space-x-1">
            <span>Clôture prévue :</span>
            <span
              className={
                opportunity.close_date &&
                new Date(opportunity.close_date) < new Date()
                  ? 'text-red-500'
                  : ''
              }
            >
              {format(
                opportunity.close_date
                  ? new Date(opportunity.close_date)
                  : new Date(),
                'dd/MM/yyyy'
              )}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2 text-xs">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={
                opportunity.assigned_to_user?.avatar
                  ? opportunity.assigned_to_user.avatar
                  : `${process.env.NEXT_PUBLIC_APP_URL}/images/nouser.png`
              }
            />
          </Avatar>
          <span className="text-xs">{opportunity.assigned_to_user?.name ?? 'Non assigné'}</span>
        </div>
        <div className="flex space-x-2">
          {stage.probability !== maxProbability && (
            <ThumbsUp
              className="h-4 w-4 text-green-500"
              onClick={(e) => {
                e.stopPropagation();
                onThumbsUp(opportunity.id);
              }}
            />
          )}
          {stage.probability !== maxProbability && (
            <ThumbsDown
              className="h-4 w-4 text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onThumbsDown(opportunity.id);
              }}
            />
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// ─── Droppable column ─────────────────────────────────────────────────────────

interface KanbanColumnProps {
  stage: any;
  opportunities: any[];
  maxProbability: number;
  onAddClick: (stageId: string) => void;
  onThumbsUp: (id: string) => void;
  onThumbsDown: (id: string) => void;
  isOver: boolean;
}

function KanbanColumn({
  stage,
  opportunities,
  maxProbability,
  onAddClick,
  onThumbsUp,
  onThumbsDown,
  isOver,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: stage.id });

  return (
    <Card
      ref={setNodeRef}
      className={`mx-1 w-full min-w-[300px] overflow-hidden pb-10 transition-colors ${isOver ? 'bg-gray-100/60 ring-2 ring-[#FF7E00]' : ''}`}
    >
      <div className="flex justify-between gap-2 p-3">
        <span className="text-sm font-bold" style={{ color: '#1E1D3D' }}>{stage.name}</span>
        <PlusCircledIcon
          className="h-5 w-5 cursor-pointer"
          onClick={() => onAddClick(stage.id)}
        />
      </div>
      <CardContent className="h-full w-full overflow-y-auto">
        {opportunities.map((opportunity) => (
          <KanbanCard
            key={opportunity.id}
            opportunity={opportunity}
            stage={stage}
            maxProbability={maxProbability}
            onThumbsUp={onThumbsUp}
            onThumbsDown={onThumbsDown}
          />
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Main Kanban board ────────────────────────────────────────────────────────

const CRMKanban = ({
  salesStages,
  opportunities: data,
  crmData,
}: CRMKanbanProps) => {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [opportunities, setOpportunities] = useState(data);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const [selectedStage, setSelectedStage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { users, accounts, contacts, saleTypes, saleStages, campaigns } =
    crmData;

  useEffect(() => {
    setOpportunities(data);
    setIsLoading(false);
  }, [data]);

  const maxProbability = Math.max(
    ...salesStages.map((s) => s.probability || 0)
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeOpportunity = activeId
    ? opportunities.find((o: any) => o.id === activeId)
    : null;

  const activeStage = activeOpportunity
    ? salesStages.find((s) => s.id === (activeOpportunity as any).sales_stage)
    : null;

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const onDragOver = (event: any) => {
    setOverId(event.over ? String(event.over.id) : null);
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    setOverId(null);

    const { active, over } = event;
    if (!over) return;

    const opportunityId = String(active.id);
    const destinationStageId = String(over.id);

    const opportunity = opportunities.find((o: any) => o.id === opportunityId);
    if (!opportunity || (opportunity as any).sales_stage === destinationStageId)
      return;

    // Optimistic update
    setOpportunities((prev) =>
      prev.map((o: any) =>
        o.id === opportunityId
          ? { ...o, sales_stage: destinationStageId }
          : o
      )
    );

    setIsLoading(true);
    try {
      const response = await axios.put(
        `/api/crm/opportunity/${opportunityId}`,
        {
          source: (opportunity as any).sales_stage,
          destination: destinationStageId,
        }
      );
      setOpportunities(response.data.data);
      toast({
        title: 'Succès',
        description: 'Étape commerciale mise à jour.',
      });
    } catch (error) {
      console.log(error);
      // Rollback on error
      setOpportunities(data);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue.',
        variant: 'destructive',
      });
    } finally {
      router.refresh();
      setIsLoading(false);
    }
  };

  const onThumbsUp = (_id: string) => {
    alert('Thumbs up - pas encore implémenté');
  };

  const onThumbsDown = (_id: string) => {
    alert('Thumbs down - pas encore implémenté');
  };

  return (
    <>
      <LoadingModal
        title="Déplacement en cours..."
        description="Veuillez patienter pendant le déplacement de l'opportunité."
        isOpen={isLoading}
      />

      <Dialog open={isDialogOpen} onOpenChange={() => setIsDialogOpen(false)}>
        <DialogContent className="min-w-[1000px] overflow-auto py-10">
          <NewOpportunityForm
            users={users}
            accounts={accounts}
            contacts={contacts}
            salesType={saleTypes}
            saleStages={saleStages}
            campaigns={campaigns}
            selectedStage={selectedStage}
            onDialogClose={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex h-full w-full overflow-x-auto">
          {salesStages.map((stage: any) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              opportunities={opportunities.filter(
                (o: any) => o.sales_stage === stage.id
              )}
              maxProbability={maxProbability}
              onAddClick={(stageId) => {
                setSelectedStage(stageId);
                setIsDialogOpen(true);
              }}
              onThumbsUp={onThumbsUp}
              onThumbsDown={onThumbsDown}
              isOver={overId === stage.id}
            />
          ))}
        </div>

        <DragOverlay>
          {activeOpportunity && activeStage ? (
            <Card className="w-[280px] rotate-2 shadow-2xl">
              <p className="p-3 text-sm font-bold" style={{ color: '#1E1D3D' }}>
                {(activeOpportunity as any).name}
              </p>
              <CardContent className="text-xs text-gray-400">
                <div className="space-x-1">
                  <span>Budget :</span>
                  <span>{(activeOpportunity as any).budget}</span>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
};

export default CRMKanban;
