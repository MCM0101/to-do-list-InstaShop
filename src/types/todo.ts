export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'none';
  estimatedTime?: string;
  fixed?: boolean; // Indicates if this is a fixed task (no date)
  order?: number; // For maintaining the order of tasks
}

export interface DraggableTodo extends Todo {
  index: number;
  type: 'TASK';
}

export interface DailyTodos {
  processId: string;
  date: string;
  todos: Todo[];
}

export interface WorkProcess {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string[];
}
