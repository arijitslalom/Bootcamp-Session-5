import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  Checkbox,
  IconButton,
  Paper,
  CircularProgress,
  Chip,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ButtonGroup,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import './App.css';

// Use relative URL to work in all environments (localhost, Codespaces, production)
const API_URL = '/api/todos';

// React Query hook for fetching todos
const useTodos = (priorityFilter) => {
  return useQuery({
    queryKey: ['todos', priorityFilter],
    queryFn: async () => {
      const url = priorityFilter 
        ? `${API_URL}?priority=${priorityFilter}` 
        : API_URL;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      const data = await response.json();
      return data;
    },
  });
};

function App() {
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState('medium');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingPriority, setEditingPriority] = useState('medium');
  const [priorityFilter, setPriorityFilter] = useState(null);
  const queryClient = useQueryClient();

  // Fetch todos using React Query
  const { data: todos = [], isLoading, error } = useTodos(priorityFilter);

  // Mutation for adding a new todo
  const addTodoMutation = useMutation({
    mutationFn: async ({ title, priority }) => {
      // INTENTIONAL ISSUE: Missing validation for empty title
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, priority }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setNewTodoTitle('');
      setNewTodoPriority('medium');
    },
  });

  // Mutation for toggling todo completion
  const toggleTodoMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`${API_URL}/${id}/toggle`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  // Mutation for editing a todo
  const editTodoMutation = useMutation({
    mutationFn: async ({ id, title, priority }) => {
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (priority !== undefined) updateData.priority = priority;
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setEditingId(null);
      setEditingTitle('');
      setEditingPriority('medium');
    },
  });

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodoTitle.trim()) {
      addTodoMutation.mutate({ title: newTodoTitle, priority: newTodoPriority });
    }
  };

  const handleToggleTodo = (id) => {
    toggleTodoMutation.mutate(id);
  };

  const handleDeleteTodo = (id) => {
    deleteTodoMutation.mutate(id);
  };

  // Calculate stats from todos
  const incompleteTodos = todos.filter((todo) => !todo.completed).length;
  const completedTodos = todos.filter((todo) => todo.completed).length;

  const handleStartEdit = (todo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
    setEditingPriority(todo.priority || 'medium');
  };

  const handleSaveEdit = () => {
    if (editingTitle.trim()) {
      editTodoMutation.mutate({ 
        id: editingId, 
        title: editingTitle,
        priority: editingPriority 
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
    setEditingPriority('medium');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            TODO App
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Session 5: Agentic Development
          </Typography>
        </Paper>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Filter by Priority
              </Typography>
              <ButtonGroup variant="outlined" size="small">
                <Button 
                  onClick={() => setPriorityFilter(null)}
                  variant={priorityFilter === null ? 'contained' : 'outlined'}
                >
                  All
                </Button>
                <Button 
                  onClick={() => setPriorityFilter('high')}
                  variant={priorityFilter === 'high' ? 'contained' : 'outlined'}
                  color="error"
                >
                  High
                </Button>
                <Button 
                  onClick={() => setPriorityFilter('medium')}
                  variant={priorityFilter === 'medium' ? 'contained' : 'outlined'}
                  color="warning"
                >
                  Medium
                </Button>
                <Button 
                  onClick={() => setPriorityFilter('low')}
                  variant={priorityFilter === 'low' ? 'contained' : 'outlined'}
                  color="info"
                >
                  Low
                </Button>
              </ButtonGroup>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              component="form"
              onSubmit={handleAddTodo}
              sx={{ display: 'flex', gap: 2 }}
            >
              <TextField
                fullWidth
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                placeholder="What needs to be done?"
                variant="outlined"
                size="medium"
              />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  value={newTodoPriority}
                  label="Priority"
                  onChange={(e) => setNewTodoPriority(e.target.value)}
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ minWidth: 120 }}
              >
                Add
              </Button>
            </Box>
          </CardContent>
        </Card>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: 'error.main',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2">
              {error.message || 'Failed to load todos'}
            </Typography>
          </Box>
        )}

        {!isLoading && !error && todos.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              color: 'text.secondary',
            }}
          >
            <Typography variant="h6" gutterBottom>
              No todos yet
            </Typography>
            <Typography variant="body2">
              Get started by adding your first todo above
            </Typography>
          </Box>
        )}

        <Card>
          <List sx={{ p: 0 }}>
            {todos.map((todo, index) => (
              <ListItem
                key={todo.id}
                sx={{
                  borderBottom: index < todos.length - 1 ? 1 : 0,
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Checkbox
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id)}
                  sx={{ mr: 2 }}
                  disabled={editingId === todo.id}
                />
                
                {editingId === todo.id ? (
                  // Edit mode: show input field
                  <>
                    <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit();
                          }
                        }}
                        size="small"
                        autoFocus
                      />
                      <FormControl sx={{ minWidth: 120 }} size="small">
                        <InputLabel id="edit-priority-label">Priority</InputLabel>
                        <Select
                          labelId="edit-priority-label"
                          value={editingPriority}
                          label="Priority"
                          onChange={(e) => setEditingPriority(e.target.value)}
                        >
                          <MenuItem value="high">High</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="low">Low</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={handleSaveEdit}
                        aria-label="save"
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={handleCancelEdit}
                        aria-label="cancel"
                      >
                        <CloseIcon />
                      </IconButton>
                    </Stack>
                  </>
                ) : (
                  // Normal mode: show title and action buttons
                  <>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          color: todo.completed ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {todo.title}
                      </Typography>
                      <Chip 
                        label={todo.priority || 'medium'} 
                        color={getPriorityColor(todo.priority || 'medium')}
                        size="small"
                        sx={{ mt: 0.5, textTransform: 'capitalize' }}
                      />
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleStartEdit(todo)}
                        aria-label="edit todo"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteTodo(todo.id)}
                        aria-label="delete todo"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </>
                )}
              </ListItem>
            ))}
          </List>
        </Card>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Chip label={`${incompleteTodos} items left`} color="primary" />
          <Chip label={`${completedTodos} completed`} color="success" />
        </Box>
      </Container>
    </Box>
  );
}

export default App;
