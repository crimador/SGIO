import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

const auth = async (_req: Request) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return false;
  return { id: userId };
};

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB' } })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const doc = await prismadb.documents.create({
        data: {
          document_name: file.name,
          description: 'new document',
          document_file_url: file.url,
          key: file.key,
          size: file.size,
          document_file_mimeType: `image/${file.name.split('.').pop()}`,
          createdBy: metadata.userId,
          assigned_user: metadata.userId,
          localFile: file.url,
          employeeID: metadata.userId,
        },
      });
      return { documentId: doc.id };
    }),

  profilePhotoUploader: f({ image: { maxFileSize: '4MB' } })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async () => {}),

  pdfUploader: f({ pdf: { maxFileSize: '64MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const doc = await prismadb.documents.create({
        data: {
          document_name: file.name,
          description: 'new document',
          document_file_url: file.url,
          key: file.key,
          size: file.size,
          document_file_mimeType: 'application/pdf',
          createdBy: metadata.userId,
          assigned_user: metadata.userId,
          localFile: file.url,
          employeeID: metadata.userId,
        },
      });
      return { documentId: doc.id };
    }),

  docUploader: f({ blob: { maxFileSize: '64MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const doc = await prismadb.documents.create({
        data: {
          document_name: file.name,
          description: 'new document',
          document_file_url: file.url,
          key: file.key,
          size: file.size,
          document_file_mimeType: 'application/docs',
          createdBy: metadata.userId,
          assigned_user: metadata.userId,
          localFile: file.url,
          employeeID: metadata.userId,
        },
      });
      return { documentId: doc.id };
    }),

  cabinetLogoUploader: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async () => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
