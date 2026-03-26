import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import TodoFilters from './TodoFilters';
import TodoItem from './TodoItem';

function TodoList({
  todos,
  isLoading,
  error,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  tagFilter,
  allTags,
  onTagClick,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  editingId,
  editingTitle,
  setEditingTitle,
  editingPriority,
  setEditingPriority,
  editingTags,
  setEditingTags,
  editingDueDate,
  setEditingDueDate,
  onToggle,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
}) {
  return (
    <Card elevation={3} sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        {/* Section Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Tasks
          </Typography>
        </Box>
        
        {/* Filter Section */}
        <TodoFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          tagFilter={tagFilter}
          allTags={allTags}
          onTagClick={onTagClick}
          sortField={sortField}
          setSortField={setSortField}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        {/* Task List Container - fixed height to prevent layout shift */}
        <Box sx={{ height: '60vh', overflowY: 'auto' }}>
          {/* Loading State */}
          {isLoading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading tasks...
              </Typography>
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load tasks. Please try again.
            </Alert>
          )}

          {/* Empty State */}
          {!isLoading && !error && todos.length === 0 && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              px: 2
            }}>
              <CheckCircleOutlineIcon 
                sx={{ 
                  fontSize: 80, 
                  color: 'action.disabled', 
                  mb: 2,
                  opacity: 0.5
                }} 
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {statusFilter === 'active' && 'No active tasks'}
                {statusFilter === 'completed' && 'No completed tasks'}
                {statusFilter === 'all' && 'No tasks yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {statusFilter === 'all' 
                  ? 'Add your first task to get started'
                  : 'Try changing your filter'
                }
              </Typography>
              {statusFilter !== 'all' && (
                <Button
                  variant="outlined"
                  onClick={() => setStatusFilter('all')}
                  startIcon={<ViewListIcon />}
                >
                  View All Tasks
                </Button>
              )}
            </Box>
          )}

          {/* Task List */}
          {!isLoading && !error && todos.length > 0 && (
            <List sx={{ p: 0 }}>
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  editingId={editingId}
                  editingTitle={editingTitle}
                  setEditingTitle={setEditingTitle}
                  editingPriority={editingPriority}
                  setEditingPriority={setEditingPriority}
                  editingTags={editingTags}
                  setEditingTags={setEditingTags}
                  editingDueDate={editingDueDate}
                  setEditingDueDate={setEditingDueDate}
                  allTags={allTags}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onStartEdit={onStartEdit}
                  onSaveEdit={onSaveEdit}
                  onCancelEdit={onCancelEdit}
                  onTagClick={onTagClick}
                />
              ))}
            </List>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default TodoList;
