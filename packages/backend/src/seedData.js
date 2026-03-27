// Pre-made tasks to populate the app on load
const seedTodos = [
  // High priority, overdue, active
  {
    title: 'Fix critical bug in production',
    priority: 'high',
    tags: ['bugfix', 'urgent'],
    dueDate: '2026-03-24', // Overdue by 3 days
    createdAt: '2026-03-22T14:30:00.000Z',
    completed: false,
    description: 'Production is down for all users. Urgent fix required. See error logs in Sentry.'
  },
  // High priority, due today, active
  {
    title: 'Prepare release notes',
    priority: 'high',
    tags: ['release', 'documentation'],
    dueDate: '2026-03-27',
    createdAt: '2026-03-25T09:00:00.000Z',
    completed: false,
    description: 'Summarize all major changes and bugfixes for v2.1.0. Include migration steps.'
  },
  // High priority, due soon, completed
  {
    title: 'Review project documentation',
    priority: 'high',
    tags: ['documentation', 'onboarding'],
    dueDate: '2026-03-28',
    createdAt: '2026-03-20T09:00:00.000Z',
    completed: true,
  },
  // Medium priority, due in 6 days, active
  {
    title: 'Write unit tests for API endpoints',
    priority: 'medium',
    tags: ['testing', 'backend'],
    dueDate: '2026-04-01',
    createdAt: '2026-03-18T10:15:00.000Z',
    completed: false,
    description: 'Focus on todos, users, and auth endpoints. Aim for 90%+ coverage.'
  },
  // Medium priority, due in 15 days, active
  {
    title: 'Design landing page mockup',
    priority: 'medium',
    tags: ['design', 'frontend'],
    dueDate: '2026-04-10',
    createdAt: '2026-03-19T11:45:00.000Z',
    completed: false,
  },
  // Medium priority, due today, active
  {
    title: 'Update team on sprint progress',
    priority: 'medium',
    tags: ['communication', 'meeting'],
    dueDate: '2026-03-27',
    createdAt: '2026-03-25T16:00:00.000Z',
    completed: false,
  },
  // Medium priority, no due date, completed
  {
    title: 'Refactor authentication logic',
    priority: 'medium',
    tags: ['backend', 'refactor'],
    dueDate: null,
    createdAt: '2026-03-12T08:00:00.000Z',
    completed: true,
  },
  // Low priority, no due date, active
  {
    title: 'Fix login page styling issues',
    priority: 'low',
    tags: ['bugfix', 'frontend'],
    dueDate: null,
    createdAt: '2026-03-21T13:20:00.000Z',
    completed: false,
    description: 'Align input fields and fix button color contrast for accessibility.'
  },
  // Low priority, no due date, completed
  {
    title: 'Update dependencies to latest versions',
    priority: 'low',
    tags: ['maintenance'],
    dueDate: null,
    createdAt: '2026-03-10T07:30:00.000Z',
    completed: true,
  },
  // Low priority, future due date, active
  {
    title: 'Research new UI framework options',
    priority: 'low',
    tags: ['research', 'frontend'],
    dueDate: '2026-05-01',
    createdAt: '2026-03-23T15:45:00.000Z',
    completed: false,
  },
  // High priority, multiple tags, overdue, completed
  {
    title: 'Emergency server patch',
    priority: 'high',
    tags: ['urgent', 'server', 'security'],
    dueDate: '2026-03-20',
    createdAt: '2026-03-19T10:00:00.000Z',
    completed: true,
  },
  // Medium priority, single tag, due soon, active
  {
    title: 'Organize team lunch',
    priority: 'medium',
    tags: ['social'],
    dueDate: '2026-03-29',
    createdAt: '2026-03-26T12:00:00.000Z',
    completed: false,
  },
  // Low priority, no tags, no due date, active
  {
    title: 'Read industry news',
    priority: 'low',
    tags: [],
    dueDate: null,
    createdAt: '2026-03-27T08:00:00.000Z',
    completed: false,
  },
  // Medium priority, tag case edge, due today, active
  {
    title: 'Check Tag Filter Case',
    priority: 'medium',
    tags: ['Work', 'personal'],
    dueDate: '2026-03-27',
    createdAt: '2026-03-26T09:00:00.000Z',
    completed: false,
  },
  // High priority, special char tag, due soon, active
  {
    title: 'Handle special chars in tags',
    priority: 'high',
    tags: ['dev@ops', 'QA/test'],
    dueDate: '2026-03-30',
    createdAt: '2026-03-25T10:00:00.000Z',
    completed: false,
  },
  // Low priority, overdue, completed
  {
    title: 'Archive old sprint boards',
    priority: 'low',
    tags: ['maintenance', 'archive'],
    dueDate: '2026-03-15',
    createdAt: '2026-03-10T10:00:00.000Z',
    completed: true,
  },
  // Medium priority, due in future, active
  {
    title: 'Plan Q2 roadmap',
    priority: 'medium',
    tags: ['planning', 'roadmap'],
    dueDate: '2026-04-15',
    createdAt: '2026-03-27T09:00:00.000Z',
    completed: false,
    description: 'Draft goals, key results, and major deliverables for Q2. Review with product team.'
  },
  // High priority, no tags, due today, active
  {
    title: 'Test no tags edge case',
    priority: 'high',
    tags: [],
    dueDate: '2026-03-27',
    createdAt: '2026-03-27T10:00:00.000Z',
    completed: false,
  },
  // Low priority, tag whitespace edge, no due date, active
  {
    title: 'Whitespace tag test',
    priority: 'low',
    tags: ['  whitespace  '],
    dueDate: null,
    createdAt: '2026-03-27T11:00:00.000Z',
    completed: false,
  },
  // Medium priority, completed, due today
  {
    title: 'Completed today task',
    priority: 'medium',
    tags: ['done'],
    dueDate: '2026-03-27',
    createdAt: '2026-03-27T07:00:00.000Z',
    completed: true,
  },
];

module.exports = seedTodos;
