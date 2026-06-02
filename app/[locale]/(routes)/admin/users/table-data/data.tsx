import { StopIcon, PauseIcon, PlayIcon } from '@radix-ui/react-icons';

export const statuses = [
  {
    value: 'ACTIVE',
    label: 'Actif',
    icon: PlayIcon,
  },
  {
    value: 'INACTIVE',
    label: 'Inactif',
    icon: StopIcon,
  },
  {
    value: 'PENDING',
    label: 'En attente',
    icon: PauseIcon,
  },
];

export const isAdmin = [
  {
    value: 'true',
    label: 'Oui',
    icon: PlayIcon,
  },
  {
    value: 'false',
    label: 'Non',
    icon: StopIcon,
  },
];
