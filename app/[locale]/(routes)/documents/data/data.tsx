import {
  FileTextIcon,
  FileIcon,
} from '@radix-ui/react-icons';

export const labels = [
  {
    value: 'bug',
    label: 'Bug',
  },
  {
    value: 'feature',
    label: 'Fonctionnalité',
  },
  {
    value: 'documentation',
    label: 'Documentation',
  },
];

export const documentTypes = [
  { value: 'INVOICE', label: 'Facture', icon: FileTextIcon },
  { value: 'RECEIPT', label: 'Reçu', icon: FileTextIcon },
  { value: 'CONTRACT', label: 'Contrat', icon: FileTextIcon },
  { value: 'OFFER', label: 'Offre', icon: FileTextIcon },
  { value: 'ID', label: "Carte d'identité", icon: FileIcon },
  { value: 'PASSPORT', label: 'Passeport', icon: FileIcon },
  { value: 'VISA', label: 'Visa', icon: FileIcon },
  { value: 'INSURANCE', label: 'Assurance', icon: FileTextIcon },
  { value: 'HEALTH', label: 'Santé', icon: FileTextIcon },
  { value: 'CERTIFICATE', label: 'Certificat', icon: FileTextIcon },
  { value: 'OTHER', label: 'Autre', icon: FileIcon },
];
