import React, { useState, useMemo, useContext } from 'react';
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
  Autocomplete,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ThemeContext } from './ThemeContext';
import './App.css';

// Use relative URL to work in all environments (localhost, Codespaces, production)
const API_URL = '/api/todos';

// React Query hook for fetching todos
const useTodos = (statusFilter, priorityFilter, tagFilter) => {
  return useQuery({
    queryKey: ['todos', statusFilter, priorityFilter, tagFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (tagFilter) params.append('tag', tagFilter);
      
      const url = params.toString() ? `${API_URL}?${params}` : API_URL;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      const data = await response.json();
      return data;
    },
  });
};

// React Query hook for fetching ALL todos (unfiltered) - used for tag/priority filter UI
const useAllTodos = () => {
  return useQuery({
    queryKey: ['todos', 'all'],
    queryFn: async () => {
      const response = await fetch(API_URL);
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
  const [newTodoTags, setNewTodoTags] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingPriority, setEditingPriority] = useState('medium');
  const [editingTags, setEditingTags] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [tagFilter, setTagFilter] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();

  // Get theme context
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  // Fetch todos using React Query (filtered)
  const { data: todos = [], isLoading, error } = useTodos(statusFilter, priorityFilter, tagFilter);
  
  // Fetch ALL todos (unfiltered) for deriving filter options
  const { data: allTodosData = [] } = useAllTodos();

  // Mutation for adding a new todo
  const addTodoMutation = useMutation({
    mutationFn: async ({ title, priority, tags }) => {
      // INTENTIONAL ISSUE: Missing validation for empty title
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, priority, tags }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setNewTodoTitle('');
      setNewTodoPriority('medium');
      setNewTodoTags([]);
      
      // Show success notification
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
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
    mutationFn: async ({ id, title, priority, tags }) => {
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (priority !== undefined) updateData.priority = priority;
      if (tags !== undefined) updateData.tags = tags;
      
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
      setEditingTags([]);
    },
  });

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodoTitle.trim()) {
      addTodoMutation.mutate({ 
        title: newTodoTitle, 
        priority: newTodoPriority,
        tags: newTodoTags 
      });
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
    setEditingTags(todo.tags || []);
  };

  const handleSaveEdit = () => {
    if (editingTitle.trim()) {
      editTodoMutation.mutate({ 
        id: editingId, 
        title: editingTitle,
        priority: editingPriority,
        tags: editingTags
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
    setEditingPriority('medium');
    setEditingTags([]);
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

  // Get all unique tags from ALL todos (unfiltered) - memoized for performance
  // This ensures tag filter options don't disappear when filtering
  const allTags = useMemo(
    () => [...new Set(allTodosData.flatMap(todo => todo.tags || []))],
    [allTodosData]
  );

  const handleTagClick = (tag) => {
    setTagFilter(tag === tagFilter ? null : tag);
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
            position: 'relative',
          }}
        >
          <IconButton
            onClick={toggleTheme}
            aria-label="Toggle theme"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
            }}
          >
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            To Do App
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Keep track of your tasks
          </Typography>
        </Paper>

        {/* Summary Dashboard */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Total Tasks Card */}
          <Grid item xs={12} sm={6}>
            <Card sx={{ 
              bgcolor: 'primary.main', 
              color: 'primary.contrastText',
              borderRadius: 2
            }}>
              <CardContent>
                <Typography variant="overline" sx={{ opacity: 0.9, display: 'block' }}>
                  TOTAL TASKS
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 700, mt: 1 }}>
                  {allTodosData.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Remaining Tasks Card */}
          <Grid item xs={12} sm={6}>
            <Card sx={{ 
              bgcolor: 'secondary.main', 
              color: 'secondary.contrastText',
              borderRadius: 2
            }}>
              <CardContent>
                <Typography variant="overline" sx={{ opacity: 0.9, display: 'block' }}>
                  REMAINING TASKS
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 700, mt: 1 }}>
                  {incompleteTodos}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Two-Column Layout: CAPTURE (left) and FOCUS (right) */}
        <Grid container spacing={3}>
          {/* LEFT COLUMN: CAPTURE - Input Section */}
          <Grid item xs={12} lg={5}>
            <Card elevation={3} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                {/* Section Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <AddIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    CAPTURE
                  </Typography>
                </Box>
                
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                  Add New Task
                </Typography>
                
                {/* Add Todo Form */}
                <Box
                  component="form"
                  onSubmit={handleAddTodo}
                  sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}
                >
                  {/* Large Task Input Field */}
                  <TextField
                    fullWidth
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    variant="outlined"
                    size="large"
                    autoFocus
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        fontSize: '1.1rem',
                        borderRadius: 2
                      }
                    }}
                  />
                  
                  {/* Priority Selector */}
                  <FormControl fullWidth size="small">
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={newTodoPriority}
                      onChange={(e) => setNewTodoPriority(e.target.value)}
                      label="Priority"
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {/* Tags Input */}
                  <Autocomplete
                    multiple
                    freeSolo
                    options={allTags}
                    value={newTodoTags}
                    onChange={(event, newValue) => setNewTodoTags(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tags"
                        placeholder="Add tags"
                        size="small"
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip 
                          label={option} 
                          size="small" 
                          {...getTagProps({ index })} 
                          key={index}
                        />
                      ))
                    }
                  />
                  
                  {/* Add Task Button - Full Width, Primary */}
                  <Button 
                    type="submit" 
                    variant="contained" 
                    fullWidth 
                    size="large"
                    startIcon={addTodoMutation.isLoading ? null : <AddIcon />}
                    disabled={!newTodoTitle.trim() || addTodoMutation.isLoading}
                    sx={{ 
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                  >
                    {addTodoMutation.isLoading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Adding...
                      </>
                    ) : (
                      'Add Task'
                    )}
                  </Button>
                </Box>

                {/* Filters */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Show
                  </Typography>
                  <ToggleButtonGroup
                    value={statusFilter}
                    exclusive
                    onChange={(e, newValue) => {
                      if (newValue !== null) {
                        setStatusFilter(newValue);
                      }
                    }}
                    size="small"
                    aria-label="status filter"
                  >
                    <ToggleButton value="all" aria-pressed={statusFilter === 'all'}>
                      All
                    </ToggleButton>
                    <ToggleButton value="active" aria-pressed={statusFilter === 'active'}>
                      Active
                    </ToggleButton>
                    <ToggleButton value="completed" aria-pressed={statusFilter === 'completed'}>
                      Completed
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

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

                {allTags.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Filter by Tag
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {allTags.map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          onClick={() => handleTagClick(tag)}
                          color={tagFilter === tag ? 'primary' : 'default'}
                          variant={tagFilter === tag ? 'filled' : 'outlined'}
                          sx={{ mb: 1, cursor: 'pointer' }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* RIGHT COLUMN: FOCUS - Task List Section */}
          <Grid item xs={12} lg={7}>
            <Card elevation={3} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                {/* Section Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    FOCUS
                  </Typography>
                </Box>
                
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  Tasks
                </Typography>

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
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
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
                      <Autocomplete
                        multiple
                        freeSolo
                        options={allTags}
                        value={editingTags}
                        onChange={(event, newValue) => setEditingTags(newValue)}
                        size="small"
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={option}
                              {...getTagProps({ index })}
                              key={index}
                              size="small"
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Tags"
                            placeholder="Edit tags..."
                            size="small"
                          />
                        )}
                      />
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
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                        <Chip 
                          label={todo.priority || 'medium'} 
                          color={getPriorityColor(todo.priority || 'medium')}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                        {(todo.tags || []).map((tag, idx) => (
                          <Chip
                            key={idx}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ cursor: 'pointer' }}
                            onClick={() => handleTagClick(tag)}
                          />
                        ))}
                      </Stack>
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
              </CardContent>
            </Card>
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
