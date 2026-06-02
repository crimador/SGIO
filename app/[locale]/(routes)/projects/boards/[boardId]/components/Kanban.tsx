'use client';

import axios, { AxiosError } from 'axios';
import moment from 'moment';
import type { DropResult } from 'react-beautiful-dnd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useRouter } from 'next/navigation';
import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { Check, EyeIcon, Pencil, PlusCircle, PlusIcon } from 'lucide-react';

import {
  DotsHorizontalIcon,
  ExclamationTriangleIcon,
  TrashIcon,
} from '@radix-ui/react-icons';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import AlertModal from '@/components/modals/alert-modal';
import LoadingComponent from '@/components/LoadingComponent';
import { DialogHeader } from '@/components/ui/dialog-document-view';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import NewSectionForm from '../forms/NewSection';
import UpdateTaskDialog from '../../../dialogs/UpdateTask';
import { getTaskDone } from '../../../actions/get-task-done';

let timer: any;
const timeout = 1000;

interface Task {
  id: string;
  section: string;
}

const Kanban = (props: any) => {
  const boardId = props.boardId;
  const boards = props.boards;
  const users = props.users;

  const [data, setData]: any = useState([]);

  const [sectionId, setSectionId] = useState(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [open, setOpen] = useState(false);
  const [openSectionAlert, setOpenSectionAlert] = useState(false);
  const [sectionOpenDialog, setSectionOpenDialog] = useState(false);
  const [updateOpenSheet, setUpdateOpenSheet] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSection, setIsLoadingSection] = useState(false);

  const router = useRouter();

  const { toast } = useToast();

  useEffect(() => {
    setData(props.data);
    setIsLoading(false);
  }, [props.data]);

  const onDragEnd = async ({ source, destination }: DropResult) => {
    if (!destination) return;
    console.log(source, 'source - onDragEnd');
    console.log(destination, 'destination - onDragEnd');
    const sourceColIndex = data.findIndex(
      (e: any) => e.id === source.droppableId
    );
    const destinationColIndex = data.findIndex(
      (e: any) => e.id === destination.droppableId
    );

    const sourceCol = data[sourceColIndex];
    if (!sourceCol) return null;
    const destinationCol = data[destinationColIndex];

    const sourceSectionId = sourceCol.id;
    const destinationSectionId = destinationCol.id;

    const sourceTasks = [...sourceCol.tasks];
    const destinationTasks = [...destinationCol.tasks];

    if (source.droppableId !== destination.droppableId) {
      const [removed] = sourceTasks.splice(source.index, 1);
      destinationTasks.splice(destination.index, 0, removed);
      data[sourceColIndex].tasks = sourceTasks;
      data[destinationColIndex].tasks = destinationTasks;
    } else {
      const [removed] = destinationTasks.splice(source.index, 1);
      destinationTasks.splice(destination.index, 0, removed);
      data[destinationColIndex].tasks = destinationTasks;
    }

    try {
      setData(data);
      await axios.put(`/api/projects/tasks/update-kanban-position`, {
        resourceList: sourceTasks,
        destinationList: destinationTasks,
        resourceSectionId: sourceSectionId,
        destinationSectionId: destinationSectionId,
      });
      toast({ title: 'Tâche déplacée', description: 'La nouvelle position a été sauvegardée.' });
    } catch (err) {
      alert(err);
    }
  };

  const onDeleteSection = async () => {
    setIsLoadingSection(true);
    try {
      await axios.delete(`/api/projects/sections/delete-section/${sectionId}`);
      const newData = [...data].filter((e) => e.id !== sectionId);
      setData(newData);
      toast({ title: 'Section supprimée', description: 'La section a été supprimée avec succès.' });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Une erreur est survenue lors de la suppression.' });
      }
    } finally {
      setIsLoadingSection(false);
      setSectionId(null);
      setOpenSectionAlert(false);
      router.refresh();
    }
  };

  //Done
  const updateSectionTitle = async (
    e: ChangeEvent<HTMLInputElement>,
    sectionId: string
  ) => {
    clearTimeout(timer);
    const newTitle = e.target.value;
    const newData = [...data];
    const index = newData.findIndex((e) => e.id === sectionId);
    newData[index].title = newTitle;
    setData(newData);
    timer = setTimeout(async () => {
      try {
        //updateSection(sectionId, { title: newTitle });
        await axios.put(`/api/projects/sections/update-title/${sectionId}`, {
          newTitle,
        });
        toast({ title: 'Section renommée', description: 'Le titre a été sauvegardé.' });
      } catch (err) {
        alert(err);
      }
    }, timeout);
  };

  //Done
  const createTask = async (sectionId: string) => {
    //console.log(sectionId, "sectionId - createTask");
    //const task = await addTask(boardId, sectionId);
    try {
      const task = await axios.post(
        `/api/projects/tasks/create-task/${boardId}`,
        {
          section: sectionId,
        }
      );
      //console.log(task, "task - createTask");
      const newData = [...data];
      //console.log(newData, "newData - createTask");
      const index = newData.findIndex((e) => e.id === sectionId);
      newData[index].tasks.unshift(task);
      setData(newData);
      toast({ title: 'Tâche créée', description: 'La nouvelle tâche a été sauvegardée.' });
    } catch (error) {
      console.log(error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Une erreur est survenue lors de la création.' });
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  const onDone = async (id: string) => {
    setIsLoading(true);
    try {
      await getTaskDone(id);
      toast({ title: 'Tâche terminée.' });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de marquer la tâche comme terminée.' });
      }
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  const onDelete = async () => {
    setOpen(false);
    setIsLoading(true);
    if (!selectedTask || !selectedTask.id || !selectedTask.section) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Tâche invalide. Veuillez sélectionner une tâche valide.' });
      setIsLoading(false);
      return;
    }
    try {
      await axios.delete(`/api/projects/tasks/`, {
        data: {
          id: selectedTask.id,
          section: selectedTask.section,
        },
      });
      toast({ title: 'Tâche supprimée.' });
    } catch (error) {
      console.log(error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Une erreur est survenue lors de la suppression.' });
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  if (isLoading) return <LoadingComponent />;

  //console.log(sectionId, "sectionId - Kanban");
  //console.log(updateOpenSheet, "updateOpenSheet - Kanban");

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isLoading}
      />
      <AlertModal
        isOpen={openSectionAlert}
        onClose={() => setOpenSectionAlert(false)}
        onConfirm={onDeleteSection}
        loading={isLoadingSection}
      />
      <div className="flex flex-col space-y-2 overflow-scroll">
        {/* Dialogs */}
        <Dialog
          open={sectionOpenDialog}
          onOpenChange={() => setSectionOpenDialog(false)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="p-2">Nouvelle section</DialogTitle>
              <DialogDescription className="p-2">
                Remplissez le formulaire ci-dessous pour ajouter une section à ce projet.
              </DialogDescription>
            </DialogHeader>
            <NewSectionForm
              boardId={boardId}
              onClose={() => setSectionOpenDialog(false)}
            />
          </DialogContent>
        </Dialog>
        {/* Dialogs end */}
        {
          //Sheets
        }
        <Sheet
          open={updateOpenSheet}
          onOpenChange={() => setUpdateOpenSheet(false)}
        >
          <SheetContent>
            <UpdateTaskDialog
              users={users}
              boards={boards}
              boardId={boardId}
              initialData={selectedTask}
              onDone={() => setUpdateOpenSheet(false)}
            />
            <div className="flex w-full justify-end pt-2">
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-red-50"
                  style={{ color: '#dc2626' }}
                >
                  Fermer
                </button>
              </SheetTrigger>
            </div>
          </SheetContent>
        </Sheet>
        {
          //Sheets end
        }

        <div className="p-2 text-xs">
          <p>{data?.length} section(s)</p>
        </div>
        <div className="flex">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-row items-start">
              {data?.map((section: any) => (
                <div
                  className="flex h-full w-80 flex-col items-center justify-center"
                  key={section.id}
                >
                  <Droppable key={section.id} droppableId={section.id}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex h-full w-full flex-col px-2"
                      >
                        <div className="flex flex-col items-center justify-center py-2">
                          <div className="flex w-full flex-row items-center justify-between border">
                            <input
                              type="text"
                              className="m-2 rounded-md px-1 py-1 pl-2"
                              placeholder={section?.title}
                              onChange={(e) =>
                                updateSectionTitle(e, section.id)
                              }
                            />
                            <div className="flex items-center justify-end pr-2">
                              <span className="m-2 rounded-full border px-2">
                                {section?.tasks?.length}
                              </span>

                              <TrashIcon
                                className="h-4 w-4"
                                onClick={() => {
                                  setSectionId(section.id);
                                  setOpenSectionAlert(true);
                                }}
                              />
                            </div>
                          </div>
                          <div className="w-full">
                            <div className="flex w-full flex-row items-center justify-center space-x-5 py-2">
                              <button
                                className="flex w-80 flex-row items-center justify-center border"
                                onClick={() => createTask(section.id)}
                              >
                                <PlusIcon className="h-6 w-6" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="">
                          {section.tasks?.map((task: any, index: any) => (
                            <Draggable
                              key={task.id}
                              draggableId={task.id}
                              index={index}
                            >
                              {(provided: any, snapshot: any) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  cursor={
                                    snapshot.isDragging ? 'grabbing' : 'grab'
                                  }
                                  className="mb-2 flex flex-col items-start justify-center overflow-hidden rounded-md border p-3 text-xs shadow-md"
                                  type="button"
                                >
                                  <div className="mx-auto flex w-full flex-row justify-between py-1">
                                    {/*  <pre>{JSON.stringify(task, null, 2)}</pre> */}
                                    <h2 className="grow text-sm font-bold">
                                      {task.title === ''
                                        ? 'Untitled'
                                        : task.title}
                                    </h2>
                                    <div className="ml-1">
                                      {task?.dueDateAt &&
                                        task.taskStatus != 'COMPLETE' &&
                                        task.dueDateAt < Date.now() && (
                                          <HoverCard>
                                            <HoverCardTrigger>
                                              <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                                            </HoverCardTrigger>
                                            <HoverCardContent>
                                              Attention ! Cette tâche est en retard.
                                            </HoverCardContent>
                                          </HoverCard>
                                        )}
                                      {task.taskStatus === 'COMPLETE' && (
                                        <HoverCard>
                                          <HoverCardTrigger>
                                            <Check className="h-4 w-4 text-green-500" />
                                          </HoverCardTrigger>
                                          <HoverCardContent>
                                            Tâche terminée !
                                          </HoverCardContent>
                                        </HoverCard>
                                      )}
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger
                                        asChild
                                        className="ml-1 w-[25px]"
                                      >
                                        <DotsHorizontalIcon className="h-4 w-4 pl-2 text-slate-600" />
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent className="w-[200px]">
                                        <DropdownMenuItem
                                          className="gap-2"
                                          onClick={() =>
                                            router.push(
                                              `/projects/tasks/viewtask/${task.id}`
                                            )
                                          }
                                        >
                                          <EyeIcon className="h-4 w-4 opacity-50" />
                                          Voir
                                        </DropdownMenuItem>
                                        {task.taskStatus !== 'COMPLETE' && (
                                          <DropdownMenuItem
                                            className="gap-2"
                                            onClick={() => {
                                              setUpdateOpenSheet(true);
                                              setSelectedTask(task);
                                            }}
                                          >
                                            <Pencil className="h-4 w-4 opacity-50" />
                                            Modifier
                                          </DropdownMenuItem>
                                        )}
                                        {task.taskStatus !== 'COMPLETE' && (
                                          <DropdownMenuItem
                                            className="gap-2"
                                            onClick={() => { onDone(task.id); }}
                                          >
                                            <Check className="h-4 w-4 opacity-50" />
                                            Marquer terminée
                                          </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                          className="gap-2"
                                          onClick={() => {
                                            setSelectedTask(task);
                                            setOpen(true);
                                          }}
                                        >
                                          <TrashIcon className="h-4 w-4 opacity-50" />
                                          Supprimer
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <div className="py-1">
                                    Échéance :{' '}
                                    {moment(task.dueDateAt).format('DD/MM/YYYY')}
                                  </div>
                                  <div className="my-2">
                                    <p
                                      className={
                                        task.priority === 'normal'
                                          ? `text-yellow-500`
                                          : task.priority === 'high'
                                            ? `text-red-500`
                                            : task.priority === 'low'
                                              ? `text-green-500`
                                              : `text-slate-600`
                                      }
                                    >
                                      Priorité : {task.priority}
                                    </p>
                                  </div>
                                  <HoverCard>
                                    <HoverCardTrigger className="mb-2 line-clamp-2">
                                      {task.content}
                                    </HoverCardTrigger>
                                    <HoverCardContent>
                                      {task.content}
                                    </HoverCardContent>
                                  </HoverCard>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
            <div className="flex h-16 items-center justify-center pl-3">
              <PlusCircle
                className="h-8 w-8 cursor-pointer text-slate-600"
                onClick={() => {
                  setSectionOpenDialog(true);
                }}
              />
            </div>
          </DragDropContext>
        </div>
      </div>
    </>
  );
};

export default Kanban;
