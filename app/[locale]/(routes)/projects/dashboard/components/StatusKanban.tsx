'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
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
import { Calendar, User, GripVertical, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

export type KanbanTask = {
  id: string;
  title: string;
  priority: string;
  taskStatus: string;
  dueDateAt: string | null;
  assignedTo: string | null;
  boardTitle: string;
};

const COLUMNS: { id: string; label: string; color: string; headerColor: string }[] = [
  { id: 'PENDING',  label: 'En attente', color: 'bg-yellow-50 border-yellow-200', headerColor: 'bg-yellow-100 text-yellow-800' },
  { id: 'ACTIVE',   label: 'En cours',   color: 'bg-blue-50 border-blue-200',     headerColor: 'bg-blue-100 text-blue-800' },
  { id: 'COMPLETE', label: 'Terminé',    color: 'bg-green-50 border-green-200',   headerColor: 'bg-green-100 text-green-800' },
];

const PRIORITY_COLORS: Record<string, string> = {
  low:      'bg-green-100 text-green-700',
  normal:   'bg-yellow-100 text-yellow-700',
  medium:   'bg-orange-100 text-orange-700',
  high:     'bg-red-100 text-red-700',
  critical: 'bg-purple-100 text-purple-700',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Faible', normal: 'Normale', medium: 'Moyenne',
  high: 'Haute', critical: 'Critique',
};

function fmtDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const isOverdue = d < new Date() ;
  const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  return { label, isOverdue };
}

// ─── Task Card ───────────────────────────────────────────────────────────────

function TaskCard({ task, isDragging = false }: { task: KanbanTask; isDragging?: boolean }) {
  const date = fmtDate(task.dueDateAt);

  return (
    <div
      className={`rounded-lg border bg-white p-3 shadow-sm space-y-2 ${
        isDragging ? 'opacity-50 rotate-2 shadow-lg' : 'hover:shadow-md transition-shadow'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-tight line-clamp-2">{task.title || 'Sans titre'}</p>
        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground cursor-grab mt-0.5" />
      </div>

      <p className="text-xs text-muted-foreground truncate">{task.boardTitle}</p>

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority] ?? 'bg-gray-100 text-gray-600'}`}>
          {PRIORITY_LABELS[task.priority] ?? task.priority}
        </span>
        <Link
          href={`/projects/tasks/viewtask/${task.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
        </Link>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {task.assignedTo && (
          <span className="flex items-center gap-1 truncate max-w-[50%]">
            <User className="h-3 w-3 shrink-0" />
            {task.assignedTo}
          </span>
        )}
        {date && (
          <span className={`flex items-center gap-1 shrink-0 ${date.isOverdue && task.taskStatus !== 'COMPLETE' ? 'text-red-500 font-medium' : ''}`}>
            <Calendar className="h-3 w-3" />
            {date.label}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Draggable Task ───────────────────────────────────────────────────────────

function DraggableTask({ task }: { task: KanbanTask }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 999 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskCard task={task} isDragging={isDragging} />
    </div>
  );
}

// ─── Droppable Column ─────────────────────────────────────────────────────────

function DroppableColumn({
  column,
  tasks,
}: {
  column: typeof COLUMNS[number];
  tasks: KanbanTask[];
}) {
  const { isOver, setNodeRef } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col min-w-[280px] flex-1">
      <div className={`rounded-t-lg px-3 py-2 flex items-center justify-between ${column.headerColor}`}>
        <span className="font-semibold text-sm">{column.label}</span>
        <span className="text-xs font-bold bg-white/60 rounded-full px-2 py-0.5">{tasks.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[400px] rounded-b-lg border-2 p-2 space-y-2 transition-colors ${column.color} ${
          isOver ? 'border-dashed border-primary/50 bg-primary/5' : ''
        }`}
      >
        {tasks.map((task) => (
          <DraggableTask key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
            <p className="text-xs text-muted-foreground">Déposez ici</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function StatusKanban({ initialTasks }: { initialTasks: KanbanTask[] }) {
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const getColumnTasks = useCallback(
    (colId: string) => tasks.filter((t) => t.taskStatus === colId),
    [tasks]
  );

  const onDragStart = ({ active }: DragStartEvent) => {
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;
    const task = tasks.find((t) => t.id === taskId);

    if (!task || task.taskStatus === newStatus) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, taskStatus: newStatus } : t))
    );

    try {
      await axios.patch('/api/projects/tasks/update-status', { taskId, taskStatus: newStatus });
      router.refresh();
    } catch {
      // Rollback
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, taskStatus: task.taskStatus } : t))
      );
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour le statut.' });
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <DroppableColumn key={col.id} column={col} tasks={getColumnTasks(col.id)} />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-2 shadow-2xl w-[280px]">
            <TaskCard task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
