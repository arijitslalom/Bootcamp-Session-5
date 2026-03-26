const express = require('express');
const { validatePriority, validateTags, normalizeTags } = require('../validators');
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

  res.json(filteredTodos);
});

// POST /api/todos - Create a new todo
router.post('/', (req, res) => {
  const { title, priority, tags } = req.body;

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

  // Create new todo
  const newTodo = addTodo({
    title: title,
    priority: priority || 'medium',
    tags: normalizeTags(tags),
    completed: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json(newTodo);
});

// PUT /api/todos/:id - Update a todo
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, priority, tags } = req.body;

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
