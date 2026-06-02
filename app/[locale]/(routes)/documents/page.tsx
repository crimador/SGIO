import { getDocuments } from '@/actions/documents/get-documents';
import Container from '../components/ui/Container';
import { DocumentsDataTable } from './components/data-table';
import { columns } from './components/columns';
import ModalDropzone from './components/modal-dropzone';
import type { Documents } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDictionary } from '@/dictionaries';

const DocumentsPage = async ({ params }: { params: { locale: string } }) => {
  const session = await getServerSession(authOptions);
  const dict = await getDictionary(params.locale as 'en' | 'cz' | 'de' | 'uk' | 'ko' | 'fr');
  
  const documents: Documents[] = await getDocuments();

  if (!documents) {
    return <div>Une erreur est survenue</div>;
  }

  return (
    <Container
      title={dict.ModuleMenu.documents}
      description={'Tout ce quil faut savoir sur les documents de lentreprise'}
    >
      <div className="flex space-x-5 py-5">
        <ModalDropzone buttonLabel="Téléverser un PDF" fileType="pdfUploader" />
        <ModalDropzone buttonLabel="Téléverser des images" fileType="imageUploader" />
        <ModalDropzone
          buttonLabel="Téléverser d'autres fichiers"
          fileType="docUploader"
        />
      </div>

      <DocumentsDataTable data={documents} columns={columns} />
    </Container>
  );
};

export default DocumentsPage;
