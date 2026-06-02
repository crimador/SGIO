import { QuestionMarkCircledIcon, StopwatchIcon, CheckCircledIcon } from '@radix-ui/react-icons';

export const statuses = [
  {
    value: 'NEW',
    label: 'Nouveau',
    icon: QuestionMarkCircledIcon,
  },
  {
    value: 'IN_PROGRESS',
    label: 'En cours',
    icon: StopwatchIcon,
  },
  {
    value: 'COMPLETED',
    label: 'Complété',
    icon: CheckCircledIcon,
  },
];
