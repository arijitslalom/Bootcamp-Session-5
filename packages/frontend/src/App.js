import React, { useState, useMemo, useCallback } from 'react';
import {
  Container,
  Box,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import { useTodos, useAllTodos } from './hooks/useTodos';
import { useTodoMutations } from './hooks/useTodoMutations';
import Header from './components/Header';
import SummaryDashboard from './components/SummaryDashboard';
import AddTodoForm from './components/AddTodoForm';
import TodoList from './components/TodoList';
import './App.css';

function App() {
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState('medium');
  const [newTodoTags, setNewTodoTags] = useState([]);
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingPriority, setEditingPriority] = useState('medium');
  const [editingTags, setEditingTags] = useState([]);
  const [editingDueDate, setEditingDueDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [tagFilter, setTagFilter] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch todos using React Query (filtered)
  const { data: todos = [], isLoading, error } = useTodos(statusFilter, priorityFilter, tagFilter);
  
  // Fetch ALL todos (unfiltered) for deriving filter options
  const { data: allTodosData = [] } = useAllTodos();

  // Mutations
  const { addTodoMutation, toggleTodoMutation, deleteTodoMutation, editTodoMutation } = useTodoMutations({
    onAddSuccess: () => {
      setNewTodoTitle('');
      setNewTodoPriority('medium');
      setNewTodoTags([]);
      setNewTodoDueDate('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    },
  });

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodoTitle.trim()) {
      addTodoMutation.mutate({ 
        title: newTodoTitle, 
        priority: newTodoPriority,
        tags: newTodoTags,
        dueDate: newTodoDueDate || null,
      });
    }
  };

  const handleToggleTodo = (id) => {
    toggleTodoMutation.mutate(id);
  };

  const handleDeleteTodo = (id) => {
    deleteTodoMutation.mutate(id);
  };

  // Calculate stats from todos - memoized for performance
  const incompleteTodos = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos]
  );

  const handleStartEdit = (todo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
    setEditingPriority(todo.priority || 'medium');
    setEditingTags(todo.tags || []);
    setEditingDueDate(todo.dueDate || '');
  };

  const handleSaveEdit = () => {
    if (editingTitle.trim()) {
      editTodoMutation.mutate({ 
        id: editingId, 
        title: editingTitle,
        priority: editingPriority,
        tags: editingTags,
        dueDate: editingDueDate || null,
      });
      setEditingId(null);
      setEditingTitle('');
      setEditingPriority('medium');
      setEditingTags([]);
      setEditingDueDate('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
    setEditingPriority('medium');
    setEditingTags([]);
    setEditingDueDate('');
  };

  // Get all unique tags from ALL todos (unfiltered) - memoized for performance
  const allTags = useMemo(
    () => [...new Set(allTodosData.flatMap(todo => todo.tags || []))],
    [allTodosData]
  );

  const handleTagClick = useCallback((tag) => {
    setTagFilter(prevFilter => tag === prevFilter ? null : tag);
  }, []);

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        pt: 4,
        pb: 6,
      }}
    >
      <Container maxWidth="lg">
        <Header />

        <SummaryDashboard
          totalTasks={allTodosData.length}
          remainingTasks={incompleteTodos}
        />

        {/* Two-Column Layout: CAPTURE (left) and FOCUS (right) */}
        <Grid container spacing={3}>
          {/* LEFT COLUMN: CAPTURE - Input Section */}
          <Grid item xs={12} lg={5} component="section" aria-label="Add new task">
            <AddTodoForm
              newTodoTitle={newTodoTitle}
              setNewTodoTitle={setNewTodoTitle}
              newTodoPriority={newTodoPriority}
              setNewTodoPriority={setNewTodoPriority}
              newTodoTags={newTodoTags}
              setNewTodoTags={setNewTodoTags}
              newTodoDueDate={newTodoDueDate}
              setNewTodoDueDate={setNewTodoDueDate}
              allTags={allTags}
              onSubmit={handleAddTodo}
              isLoading={addTodoMutation.isPending}
            />
          </Grid>
          
          {/* RIGHT COLUMN: FOCUS - Task List Section */}
          <Grid item xs={12} lg={7} component="section" aria-label="Task list">
            <TodoList
              todos={todos}
              isLoading={isLoading}
              error={error}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              tagFilter={tagFilter}
              allTags={allTags}
              onTagClick={handleTagClick}
              editingId={editingId}
              editingTitle={editingTitle}
              setEditingTitle={setEditingTitle}
              editingPriority={editingPriority}
              setEditingPriority={setEditingPriority}
              editingTags={editingTags}
              setEditingTags={setEditingTags}
              editingDueDate={editingDueDate}
              setEditingDueDate={setEditingDueDate}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
            />
          </Grid>
        </Grid>
        
        {/* Success Snackbar */}
        <Snackbar 
          open={showSuccess} 
          autoHideDuration={2000}
          onClose={() => setShowSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled" onClose={() => setShowSuccess(false)}>
            Task added successfully!
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default App;
