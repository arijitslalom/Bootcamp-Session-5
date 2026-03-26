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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';

function TodoFilters({
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
}) {
  return (
    <Box sx={{ mb: 3 }}>
      {/* Status Filter + Sort Controls - Single Row */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
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
          sx={{ 
            '& .MuiToggleButton-root': { width: '125px' },
          }}
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

        <Box sx={{ flexGrow: 1, minWidth: '50px' }} />

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel id="sort-by-label">Sort by</InputLabel>
          <Select
            labelId="sort-by-label"
            label="Sort by"
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
          >
            <MenuItem value="createdAt">Date Added</MenuItem>
            <MenuItem value="title">Title</MenuItem>
            <MenuItem value="priority">Priority</MenuItem>
            <MenuItem value="dueDate">Due Date</MenuItem>
          </Select>
        </FormControl>
        <Tooltip title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}>
          <IconButton
            aria-label="sort order"
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            size="small"
          >
            {sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
          </IconButton>
        </Tooltip>
      </Stack>
      
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
