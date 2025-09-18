import { WorkProcess } from '@/types/todo';

export const WORK_PROCESSES: WorkProcess[] = [
  {
    id: 'daily-todos',
    title: 'Daily To Do\'s',
    description: 'Manage your daily tasks and priorities',
    icon: 'ListChecks',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#7C3AED']
  },
  {
    id: 'onboarding',
    title: 'Onboarding Partners',
    description: 'Welcome new partners and set them up for success',
    icon: 'UserPlus',
    color: '#3B82F6',
    gradient: ['#3B82F6', '#1D4ED8']
  },
  {
    id: 'accounts',
    title: 'Managing Accounts',
    description: 'Maintain and grow existing client relationships',
    icon: 'Users',
    color: '#10B981',
    gradient: ['#10B981', '#059669']
  }
];

