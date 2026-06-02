import {
  CircleIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
  CheckCircledIcon,
} from '@radix-ui/react-icons';

export const statuses = [
  {
    value: 'ACTIVE',
    label: 'Actif',
    icon: QuestionMarkCircledIcon,
  },
  {
    value: 'INACTIVE',
    label: 'Inactif',
    icon: CircleIcon,
  },
  {
    value: 'PENDING',
    label: 'En attente',
    icon: StopwatchIcon,
  },
  {
    value: 'CLOSED',
    label: 'Clôturé',
    icon: CheckCircledIcon,
  },
];
