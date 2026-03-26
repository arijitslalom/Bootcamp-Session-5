// Pre-made tasks to populate the app on load
const seedTodos = [
  {
    title: 'Review project documentation',
    priority: 'high',
    tags: ['documentation', 'onboarding'],
    completed: false,
  },
  {
    title: 'Set up development environment',
    priority: 'high',
    tags: ['setup', 'devops'],
    completed: true,
  },
  {
    title: 'Write unit tests for API endpoints',
    priority: 'medium',
    tags: ['testing', 'backend'],
    completed: false,
  },
  {
    title: 'Design landing page mockup',
    priority: 'medium',
    tags: ['design', 'frontend'],
    completed: false,
  },
  {
    title: 'Fix login page styling issues',
    priority: 'low',
    tags: ['bugfix', 'frontend'],
    completed: false,
  },
  {
    title: 'Update dependencies to latest versions',
    priority: 'low',
    tags: ['maintenance'],
    completed: true,
  },
];

module.exports = seedTodos;
