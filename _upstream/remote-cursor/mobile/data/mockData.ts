export interface Project {
  id: string;
  name: string;
  currentTask: string;
  agent: string;
  progress: number;
  status: 'running' | 'idle' | 'error';
}

export interface Log {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce App',
    currentTask: 'Implementing checkout flow',
    agent: 'maker-agent',
    progress: 65,
    status: 'running',
  },
  {
    id: '2',
    name: 'API Server',
    currentTask: 'Waiting for review',
    agent: 'pr-agent',
    progress: 100,
    status: 'idle',
  },
  {
    id: '3',
    name: 'Mobile Dashboard',
    currentTask: 'Building UI components',
    agent: 'maker-agent',
    progress: 45,
    status: 'running',
  },
];

export const mockLogs: Log[] = [
  { id: '1', timestamp: '10:32:15', level: 'info', message: 'Task started: checkout flow' },
  { id: '2', timestamp: '10:32:18', level: 'info', message: 'Creating PaymentForm component' },
  { id: '3', timestamp: '10:32:45', level: 'warn', message: 'API rate limit approaching' },
  { id: '4', timestamp: '10:33:02', level: 'info', message: 'Running tests for checkout module' },
  { id: '5', timestamp: '10:33:15', level: 'info', message: 'All tests passed' },
  { id: '6', timestamp: '10:33:30', level: 'error', message: 'Failed to connect to database' },
  { id: '7', timestamp: '10:33:35', level: 'info', message: 'Retrying connection...' },
  { id: '8', timestamp: '10:33:40', level: 'info', message: 'Database connection established' },
  { id: '9', timestamp: '10:34:00', level: 'info', message: 'Commit created: feat(checkout) add payment form' },
  { id: '10', timestamp: '10:34:15', level: 'info', message: 'PR #42 created successfully' },
];
