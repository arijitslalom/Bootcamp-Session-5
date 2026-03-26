import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  const [newTodoDescription, setNewTodoDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingPriority, setEditingPriority] = useState('medium');
  const [editingTags, setEditingTags] = useState([]);
  const [editingDueDate, setEditingDueDate] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [tagFilter, setTagFilter] = useState(null);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch todos using React Query (filtered)
  const { data: todos = [], isLoading, error } = useTodos(statusFilter, priorityFilter, tagFilter, sortField, sortOrder, debouncedSearch);
  
  // Fetch ALL todos (unfiltered) for deriving filter options
  const { data: allTodosData = [] } = useAllTodos();

  // Mutations
  const { addTodoMutation, toggleTodoMutation, deleteTodoMutation, editTodoMutation } = useTodoMutations({
    onAddSuccess: () => {
      setNewTodoTitle('');
      setNewTodoPriority('medium');
      setNewTodoTags([]);
      setNewTodoDueDate('');
      setNewTodoDescription('');
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
        description: newTodoDescription,
      });
    }
  };

  const handleToggleTodo = (id) => {
    toggleTodoMutation.mutate(id);
  };

  const handleDeleteTodo = (id) => {
    deleteTodoMutation.mutate(id);
  };

  // Calculate stats from ALL todos (unfiltered) - memoized for performance
  const incompleteTodos = useMemo(
    () => allTodosData.filter((todo) => !todo.completed).length,
    [allTodosData]
  );

  const handleStartEdit = (todo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
    setEditingPriority(todo.priority || 'medium');
    setEditingTags(todo.tags || []);
    setEditingDueDate(todo.dueDate || '');
    setEditingDescription(todo.description || '');
  };

  const handleSaveEdit = () => {
    if (editingTitle.trim()) {
      editTodoMutation.mutate({ 
        id: editingId, 
        title: editingTitle,
        priority: editingPriority,
        tags: editingTags,
        dueDate: editingDueDate || null,
        description: editingDescription,
      });
      setEditingId(null);
      setEditingTitle('');
      setEditingPriority('medium');
      setEditingTags([]);
      setEditingDueDate('');
      setEditingDescription('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
    setEditingPriority('medium');
    setEditingTags([]);
    setEditingDueDate('');
    setEditingDescription('');
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

        {/* Two-Column Layout */}
        <Grid container spacing={3}>
          {/* LEFT COLUMN: Stats + Input Section */}
          <Grid item xs={12} lg={5} component="section" aria-label="Add new task">
            <SummaryDashboard
              totalTasks={allTodosData.length}
              remainingTasks={incompleteTodos}
            />
            <AddTodoForm
              newTodoTitle={newTodoTitle}
              setNewTodoTitle={setNewTodoTitle}
              newTodoPriority={newTodoPriority}
              setNewTodoPriority={setNewTodoPriority}
              newTodoTags={newTodoTags}
              setNewTodoTags={setNewTodoTags}
              newTodoDueDate={newTodoDueDate}
              setNewTodoDueDate={setNewTodoDueDate}
              newTodoDescription={newTodoDescription}
              setNewTodoDescription={setNewTodoDescription}
              allTags={allTags}
              onSubmit={handleAddTodo}
              isLoading={addTodoMutation.isPending}
            />
          </Grid>
          
          {/* RIGHT COLUMN: Task List Section */}
          <Grid item xs={12} lg={7} component="section" aria-label="Task list">
            <TodoList
              todos={todos}
              isLoading={isLoading}
              error={error}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              tagFilter={tagFilter}
              allTags={allTags}
              onTagClick={handleTagClick}
              sortField={sortField}
              setSortField={setSortField}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              editingId={editingId}
              editingTitle={editingTitle}
              setEditingTitle={setEditingTitle}
              editingPriority={editingPriority}
              setEditingPriority={setEditingPriority}
              editingTags={editingTags}
              setEditingTags={setEditingTags}
              editingDueDate={editingDueDate}
              setEditingDueDate={setEditingDueDate}
              editingDescription={editingDescription}
              setEditingDescription={setEditingDescription}
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
