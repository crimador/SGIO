import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CircleIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from '@radix-ui/react-icons';

export const labels = [
  { value: 'bug',           label: 'Bug' },
  { value: 'feature',       label: 'Fonctionnalité' },
  { value: 'documentation', label: 'Documentation' },
];

export const statuses = [
  { value: 'ACTIVE',   label: 'Actif',    icon: QuestionMarkCircledIcon },
  { value: 'PENDING',  label: 'En attente', icon: CircleIcon },
  { value: 'COMPLETE', label: 'Terminé',  icon: StopwatchIcon },
];

export const priorities = [
  { label: 'Faible',   value: 'low',      icon: ArrowDownIcon },
  { label: 'Normale',  value: 'normal',   icon: ArrowRightIcon },
  { label: 'Moyenne',  value: 'medium',   icon: ArrowRightIcon },
  { label: 'Haute',    value: 'high',     icon: ArrowUpIcon },
  { label: 'Critique', value: 'critical', icon: ArrowUpIcon },
];
