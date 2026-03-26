import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

function AddTodoForm({
  newTodoTitle,
  setNewTodoTitle,
  newTodoPriority,
  setNewTodoPriority,
  newTodoTags,
  setNewTodoTags,
  allTags,
  onSubmit,
  isLoading,
}) {
  return (
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
          onSubmit={onSubmit}
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
            aria-label="Task title"
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
            startIcon={isLoading ? null : <AddIcon />}
            disabled={!newTodoTitle.trim() || isLoading}
            sx={{ 
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '1rem'
            }}
          >
            {isLoading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Adding...
              </>
            ) : (
              'Add Task'
            )}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default AddTodoForm;
