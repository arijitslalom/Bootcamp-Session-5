const express = require('express');
const { validatePriority, validateTags, normalizeTags, validateDueDate } = require('../validators');
const { getTodos, addTodo, findTodoById, findTodoIndexById, removeTodoByIndex } = require('../todoStore');

const router = express.Router();

// GET /api/todos - Get all todos
// INTENTIONAL ISSUE: This endpoint has a bug - it doesn't handle the case when todos is null
router.get('/', (req, res) => {
  let filteredTodos = getTodos();

  // Filter by completion status if query param provided
  const status = req.query.status || 'all';
  if (status === 'active') {
    filteredTodos = filteredTodos.filter(t => !t.completed);
  } else if (status === 'completed') {
    filteredTodos = filteredTodos.filter(t => t.completed);
  }
  // 'all' or any invalid value returns everything

  // Filter by priority if query param provided
  if (req.query.priority) {
    const priorityFilter = req.query.priority.toLowerCase();
    filteredTodos = filteredTodos.filter(t => 
      t.priority === priorityFilter
    );
  }

  // Filter by tag if query param provided
  if (req.query.tag) {
    const tagFilter = req.query.tag.toLowerCase();
    filteredTodos = filteredTodos.filter(t => 
      t.tags && t.tags.some(tag => tag.toLowerCase() === tagFilter)
    );
  }

  // Search by title or tags if query param provided
  if (req.query.search) {
    const searchTerm = req.query.search.toLowerCase();
    filteredTodos = filteredTodos.filter(todo => {
      const titleMatch = todo.title.toLowerCase().includes(searchTerm);
      const tagMatch = todo.tags && todo.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm)
      );
      return titleMatch || tagMatch;
    });
  }

  // Filter by dueBefore if query param provided
  if (req.query.dueBefore) {
    const beforeDate = new Date(req.query.dueBefore);
    filteredTodos = filteredTodos.filter(t => 
      t.dueDate && new Date(t.dueDate) < beforeDate
    );
  }

  // Filter by dueAfter if query param provided
  if (req.query.dueAfter) {
    const afterDate = new Date(req.query.dueAfter);
    filteredTodos = filteredTodos.filter(t => 
      t.dueDate && new Date(t.dueDate) > afterDate
    );
  }

  // Sort results
  const validSortFields = ['createdAt', 'title', 'priority', 'dueDate'];
  const sortField = validSortFields.includes(req.query.sort) ? req.query.sort : 'createdAt';
  const sortOrder = req.query.order === 'desc' ? -1 : 1;
  const priorityOrder = { high: 3, medium: 2, low: 1 };

  filteredTodos.sort((a, b) => {
    if (sortField === 'title') {
      return a.title.localeCompare(b.title) * sortOrder;
    }
    if (sortField === 'priority') {
      return ((priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0)) * sortOrder;
    }
    if (sortField === 'dueDate') {
      // Null due dates go to the end regardless of sort order
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return (new Date(a.dueDate) - new Date(b.dueDate)) * sortOrder;
    }
    // Default: createdAt
    return (new Date(a.createdAt) - new Date(b.createdAt)) * sortOrder;
  });

  res.json(filteredTodos);
});

// POST /api/todos - Create a new todo
router.post('/', (req, res) => {
  const { title, priority, tags, dueDate } = req.body;

  // Validate title is provided and not empty
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  // Validate priority if provided
  const priorityError = validatePriority(priority);
  if (priorityError) {
    return res.status(400).json({ error: priorityError });
  }

  // Validate tags if provided
  const tagsError = validateTags(tags);
  if (tagsError) {
    return res.status(400).json({ error: tagsError });
  }

  // Validate dueDate if provided
  const dueDateError = validateDueDate(dueDate);
  if (dueDateError) {
    return res.status(400).json({ error: dueDateError });
  }

  // Create new todo
  const newTodo = addTodo({
    title: title,
    priority: priority || 'medium',
    tags: normalizeTags(tags),
    dueDate: dueDate || null,
    completed: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json(newTodo);
});

// PUT /api/todos/:id - Update a todo
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, priority, tags, dueDate } = req.body;

  const todo = findTodoById(id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  // Update title if provided
  if (title !== undefined) {
    todo.title = title;
  }

  // Update priority if provided
  if (priority !== undefined) {
    const priorityError = validatePriority(priority);
    if (priorityError) {
      return res.status(400).json({ error: priorityError });
    }
    todo.priority = priority;
  }

  // Update tags if provided
  if (tags !== undefined) {
    const tagsError = validateTags(tags);
    if (tagsError) {
      return res.status(400).json({ error: tagsError });
    }
    todo.tags = normalizeTags(tags);
  }

  // Update dueDate if provided
  if (dueDate !== undefined) {
    if (dueDate === null) {
      todo.dueDate = null;
    } else {
      const dueDateError = validateDueDate(dueDate);
      if (dueDateError) {
        return res.status(400).json({ error: dueDateError });
      }
      todo.dueDate = dueDate;
    }
  }

  res.json(todo);
});

// PATCH /api/todos/:id/toggle - Toggle todo completion status
router.patch('/:id/toggle', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = findTodoById(id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  // Toggle completed status
  todo.completed = !todo.completed;

  res.json(todo);
});

// DELETE /api/todos/:id - Delete a todo
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = findTodoIndexById(id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  // Remove the todo
  const deletedTodo = removeTodoByIndex(todoIndex);
  res.json(deletedTodo);
});

module.exports = router;
