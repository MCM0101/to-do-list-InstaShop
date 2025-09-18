import { DailyTodos, Todo } from '@/types/todo';

const generateTodosForProcess = (processId: string): Todo[] => {
  // Generate some sample todos for testing
  if (processId === 'onboarding') {
    return [
      {
        id: '1',
        title: 'Review partner application',
        description: 'Check all required documents and information',
        completed: false,
        priority: 'high'
      },
      {
        id: '2',
        title: 'Schedule onboarding call',
        description: 'Set up initial meeting with new partner',
        completed: false,
        priority: 'medium'
      }
    ];
  } else if (processId === 'accounts') {
    return [
      {
        id: '3',
        title: 'Follow up with client',
        description: 'Check on project status and next steps',
        completed: false,
        priority: 'low'
      }
    ];
  }
  return [];
};

export const getTodaysTodos = (): DailyTodos[] => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  return [
    {
      processId: 'onboarding',
      date: today,
      todos: generateTodosForProcess('onboarding')
    },
    {
      processId: 'accounts', 
      date: today,
      todos: generateTodosForProcess('accounts')
    },
    // Add yesterday's data for testing copy functionality
    {
      processId: 'onboarding',
      date: yesterdayStr,
      todos: [
        {
          id: 'yesterday-1',
          title: 'Complete partner verification',
          description: 'Verify all partner documents and credentials',
          completed: true,
          priority: 'high'
        },
        {
          id: 'yesterday-2',
          title: 'Send welcome email',
          description: 'Send onboarding welcome email to new partner',
          completed: false,
          priority: 'medium'
        }
      ]
    },
    {
      processId: 'accounts',
      date: yesterdayStr,
      todos: [
        {
          id: 'yesterday-3',
          title: 'Update client dashboard',
          description: 'Add new features to client portal',
          completed: false,
          priority: 'low'
        }
      ]
    }
  ];
};
