const express = require('express');
const cors = require('cors');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Valid priority values
const VALID_PRIORITIES = ['high', 'medium', 'low'];

// Helper function to validate priority
function isValidPriority(priority) {
  return VALID_PRIORITIES.includes(priority);
}

// Helper function to validate priority with error message
function validatePriority(priority) {
  if (priority !== undefined && priority !== null) {
    if (typeof priority !== 'string' || !isValidPriority(priority)) {
      return `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`;
    }
  }
  return null; // Valid
}

// Helper function to validate tags
function validateTags(tags) {
  if (tags !== undefined && tags !== null) {
    // Must be an array
    if (!Array.isArray(tags)) {
      return 'tags must be an array';
    }
    // All elements must be strings
    for (const tag of tags) {
      if (typeof tag !== 'string') {
        return 'All tags must be strings';
      }
      // After trimming, tag must not be empty
      if (tag.trim() === '') {
        return 'tags cannot be empty strings';
      }
    }
  }
  return null; // Valid
}

// Helper function to normalize tags (trim whitespace)
function normalizeTags(tags) {
  if (!tags || !Array.isArray(tags)) {
    return [];
  }
  return tags.map(tag => tag.trim());
}

// In-memory data store for TODOs
let todos = [];

// Counter for ID generation
let nextId = 1;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GET /api/todos - Get all todos
// INTENTIONAL ISSUE: This endpoint has a bug - it doesn't handle the case when todos is null
app.get('/api/todos', (req, res) => {
  let filteredTodos = todos;

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
app.post('/api/todos', (req, res) => {
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
  const newTodo = {
    id: nextId++,
    title: title,
    priority: priority || 'medium',
    tags: normalizeTags(tags),
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PUT /api/todos/:id - Update a todo
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, priority, tags } = req.body;

  const todo = todos.find((t) => t.id === id);

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
app.patch('/api/todos/:id/toggle', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  // Toggle completed status
  todo.completed = !todo.completed;

  res.json(todo);
});

// DELETE /api/todos/:id - Delete a todo
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex((t) => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  // Remove the todo
  const deletedTodo = todos.splice(todoIndex, 1)[0];
  res.json(deletedTodo);
});

// INTENTIONAL ISSUE: Missing error handling middleware

module.exports = app;
