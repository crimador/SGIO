import {
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  StopwatchIcon,
} from '@radix-ui/react-icons';

export const statuses = [
  { value: 'PLANNED', label: 'Planifiée', icon: CircleIcon },
  { value: 'ACTIVE', label: 'Active', icon: StopwatchIcon },
  { value: 'COMPLETED', label: 'Terminée', icon: CheckCircledIcon },
  { value: 'CANCELLED', label: 'Annulée', icon: CrossCircledIcon },
];
