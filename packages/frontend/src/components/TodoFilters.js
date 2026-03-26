import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  ButtonGroup,
  ToggleButtonGroup,
  ToggleButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

function TodoFilters({
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  tagFilter,
  allTags,
  onTagClick,
}) {
  return (
    <Box sx={{ mb: 3 }}>
      {/* Status Filter - Prominent */}
      <ToggleButtonGroup 
        value={statusFilter}
        exclusive
        onChange={(e, newValue) => {
          if (newValue !== null) {
            setStatusFilter(newValue);
          }
        }}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
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
      
      {/* Collapsible Advanced Filters */}
      <Accordion sx={{ borderRadius: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              More Filters
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            {/* Priority Filter */}
            <Box>
              <Typography variant="caption" gutterBottom display="block">
                Filter by Priority
              </Typography>
              <ButtonGroup variant="outlined" size="small" fullWidth>
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
            
            {/* Tag Filter */}
            {allTags.length > 0 && (
              <Box>
                <Typography variant="caption" gutterBottom display="block">
                  Filter by Tag
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {allTags.map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      onClick={() => onTagClick(tag)}
                      color={tagFilter === tag ? 'primary' : 'default'}
                      variant={tagFilter === tag ? 'filled' : 'outlined'}
                      size="small"
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default TodoFilters;
