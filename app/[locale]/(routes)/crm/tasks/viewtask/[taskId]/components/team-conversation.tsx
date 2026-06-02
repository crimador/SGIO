'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface TeamConversationsProps {
  data: Array<{
    id: string;
    v: number;
    comment: string;
    createdAt: string;
    task: string;
    user: string;
    assigned_user: {
      name: string;
      avatar: string;
    };
  }>;
  taskId: string;
}

const FormSchema = z.object({
  comment: z.string().min(3).max(160),
});

export function TeamConversations({
  data: comments,
  taskId,
}: TeamConversationsProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      setIsLoading(true);
      await axios.post(`/api/crm/tasks/addCommentToTask/${taskId}`, data);
      toast({
        title: 'Commentaire ajouté.',
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Une erreur est survenue lors de l&apos;envoi du commentaire.',
        });
      }
    } finally {
      form.reset({
        comment: '',
      });
      router.refresh();
      setIsLoading(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full items-end space-x-5 py-2 pb-5"
        >
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder="Votre commentaire..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <button
            className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
            disabled={isLoading}
            type="submit"
          >
            Envoyer
          </button>
        </form>
      </Form>
      <Card className="w-full overflow-hidden">
        <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
        <CardHeader>
          <p className="text-base font-bold" style={{ color: '#1E1D3D' }}>Discussion d&apos;équipe</p>
          <p className="mt-0.5 text-xs text-gray-400">Échangez avec votre équipe.</p>
        </CardHeader>
        <CardContent className="grid gap-6">
          {comments?.map((comment: any) => (
            <>
              <div key={comment.id} className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage
                    src={comment.assigned_user?.avatar || '/images/nouser.png'}
                  />
                  <AvatarFallback>{comment.assigned_user?.name}</AvatarFallback>
                </Avatar>
                <div>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {comment.assigned_user?.name}
                    </p>
                    <p className="py-2 text-xs text-gray-400">
                      {comment.comment}
                    </p>
                  </div>
                  <div className="text-xs opacity-50">
                    {moment(comment.createdAt).format('YYYY-MM-DD-HH:mm')}
                  </div>
                </div>
              </div>
            </>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
