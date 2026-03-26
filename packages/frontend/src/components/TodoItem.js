import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  IconButton,
  Chip,
  Stack,
  ListItem,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  Collapse,
  Button,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Event as EventIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import { getPriorityColor, getDueDateStatus, formatDueDate, getDueDateColor } from '../utils/helpers';

function TodoItem({
  todo,
  editingId,
  editingTitle,
  setEditingTitle,
  editingPriority,
  setEditingPriority,
  editingTags,
  setEditingTags,
  editingDueDate,
  setEditingDueDate,
  editingDescription,
  setEditingDescription,
  allTags,
  onToggle,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onTagClick,
}) {
  const dueDateStatus = getDueDateStatus(todo.dueDate, todo.completed);
  const [showDescription, setShowDescription] = useState(false);
  return (
    <ListItem
      sx={{
        borderRadius: 2,
        mb: 1.5,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        p: 2,
        transition: 'all 0.2s',
        '&:hover': { 
          bgcolor: 'action.hover',
          boxShadow: 1,
          transform: 'translateY(-2px)'
        },
      }}
    >
      {editingId === todo.id ? (
        // Edit mode
        <>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, mr: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSaveEdit();
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    onCancelEdit();
                  }
                }}
                size="small"
                autoFocus
                aria-label="Edit task title"
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
            <TextField
              type="date"
              label="Due Date"
              value={editingDueDate}
              onChange={(e) => setEditingDueDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ maxWidth: 200 }}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              value={editingDescription}
              onChange={(e) => setEditingDescription(e.target.value)}
              placeholder="Add notes or details..."
              size="small"
            />
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              color="success"
              onClick={onSaveEdit}
              aria-label="Save changes"
            >
              <CheckIcon />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={onCancelEdit}
              aria-label="Cancel editing"
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </>
      ) : (
        // Normal mode
        <>
          <Checkbox 
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            sx={{ mr: 2 }}
            color="success"
            inputProps={{ 
              'aria-label': `Mark task "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`
            }}
          />
          
          <Box sx={{ flexGrow: 1, minWidth: 0, mr: 2 }}>
            <Typography 
              variant="body1"
              sx={{ 
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? 'text.disabled' : 'text.primary',
                fontWeight: 500,
                wordBreak: 'break-word'
              }}
            >
              {todo.title}
            </Typography>
            
            <Stack 
              direction="row" 
              spacing={1} 
              sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}
            >
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <EventIcon sx={{ fontSize: 14, mr: 0.5 }} />
                {new Date(todo.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </Typography>
              
              {todo.priority && (
                <Chip 
                  label={todo.priority.toUpperCase()} 
                  size="small"
                  color={getPriorityColor(todo.priority)}
                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                />
              )}
              
              {todo.dueDate && (
                <Chip
                  label={dueDateStatus === 'overdue' ? `Overdue · ${formatDueDate(todo.dueDate)}` : `Due ${formatDueDate(todo.dueDate)}`}
                  size="small"
                  color={getDueDateColor(dueDateStatus)}
                  variant={dueDateStatus === 'overdue' ? 'filled' : 'outlined'}
                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                />
              )}
              
              {(todo.tags || []).map((tag, idx) => (
                <Chip
                  key={idx}
                  label={tag}
                  size="small"
                  variant="outlined"
                  onClick={() => onTagClick(tag)}
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                />
              ))}
            </Stack>
            
            {todo.description && (
              <>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<NotesIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setShowDescription(prev => !prev)}
                  aria-label={showDescription ? 'Hide notes' : 'Show notes'}
                  sx={{ 
                    mt: 0.5,
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'primary.main',
                    p: 0,
                    minWidth: 0,
                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                  }}
                >
                  {showDescription ? 'Hide notes' : 'Show notes'}
                </Button>
                <Collapse in={showDescription}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {todo.description}
                  </Typography>
                </Collapse>
              </>
            )}
          </Box>
          
          <Stack direction="row" spacing={0.5} sx={{ alignSelf: 'flex-start', flexShrink: 0 }}>
            <IconButton 
              size="small" 
              onClick={() => onStartEdit(todo)}
              aria-label={`Edit task: ${todo.title}`}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              color="error"
              onClick={() => onDelete(todo.id)}
              aria-label={`Delete task: ${todo.title}`}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </>
      )}
    </ListItem>
  );
}

export default TodoItem;
