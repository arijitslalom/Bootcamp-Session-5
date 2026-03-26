// Pre-made tasks to populate the app on load
const seedTodos = [
  {
    title: 'Review project documentation',
    priority: 'high',
    tags: ['documentation', 'onboarding'],
    dueDate: '2026-03-28', // Due in 2 days (soon)
    createdAt: '2026-03-20T09:00:00.000Z',
    completed: false,
  },
  {
    title: 'Fix critical bug in production',
    priority: 'high',
    tags: ['bugfix', 'urgent'],
    dueDate: '2026-03-24', // Overdue by 2 days
    createdAt: '2026-03-22T14:30:00.000Z',
    completed: false,
  },
  {
    title: 'Set up development environment',
    priority: 'high',
    tags: ['setup', 'devops'],
    dueDate: null,
    createdAt: '2026-03-15T08:00:00.000Z',
    completed: true,
  },
  {
    title: 'Write unit tests for API endpoints',
    priority: 'medium',
    tags: ['testing', 'backend'],
    dueDate: '2026-04-01', // Due in 6 days
    createdAt: '2026-03-18T10:15:00.000Z',
    completed: false,
  },
  {
    title: 'Design landing page mockup',
    priority: 'medium',
    tags: ['design', 'frontend'],
    dueDate: '2026-04-10', // Due in 15 days
    createdAt: '2026-03-19T11:45:00.000Z',
    completed: false,
  },
  {
    title: 'Update team on sprint progress',
    priority: 'medium',
    tags: ['communication', 'meeting'],
    dueDate: '2026-03-26', // Due today
    createdAt: '2026-03-25T16:00:00.000Z',
    completed: false,
  },
  {
    title: 'Fix login page styling issues',
    priority: 'low',
    tags: ['bugfix', 'frontend'],
    dueDate: null,
    createdAt: '2026-03-21T13:20:00.000Z',
    completed: false,
  },
  {
    title: 'Update dependencies to latest versions',
    priority: 'low',
    tags: ['maintenance'],
    dueDate: null,
    createdAt: '2026-03-10T07:30:00.000Z',
    completed: true,
  },
  {
    title: 'Research new UI framework options',
    priority: 'low',
    tags: ['research', 'frontend'],
    dueDate: '2026-05-01', // Due in distant future
    createdAt: '2026-03-23T15:45:00.000Z',
    completed: false,
  },
];

module.exports = seedTodos;
