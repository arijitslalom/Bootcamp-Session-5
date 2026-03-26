const seedTodos = require('./seedData');

// In-memory data store for TODOs
let todos = [];

// Counter for ID generation
let nextId = 1;

// Load seed data on startup
function loadSeedData() {
  seedTodos.forEach((todo) => {
    addTodo({ ...todo, createdAt: new Date().toISOString() });
  });
}

function getTodos() {
  return todos;
}

function addTodo(todo) {
  todo.id = nextId++;
  todos.push(todo);
  return todo;
}

function findTodoById(id) {
  return todos.find((t) => t.id === id);
}

function findTodoIndexById(id) {
  return todos.findIndex((t) => t.id === id);
}

function removeTodoByIndex(index) {
  return todos.splice(index, 1)[0];
}

// Reset store (for testing)
function resetStore() {
  todos = [];
  nextId = 1;
}

module.exports = {
  getTodos,
  addTodo,
  findTodoById,
  findTodoIndexById,
  removeTodoByIndex,
  resetStore,
  loadSeedData,
};
