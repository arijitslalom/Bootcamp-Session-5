export const getPriorityColor = (priority) => {
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

export const getDueDateStatus = (dueDate, completed) => {
  if (!dueDate || completed) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  // Parse date string in local timezone to avoid UTC conversion issues
  // Handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm:ss.sssZ" formats
  const dateOnly = dueDate.split('T')[0];
  const [year, month, day] = dateOnly.split('-').map(Number);
  const due = new Date(year, month - 1, day);
  
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays <= 3) return 'soon';
  return 'future';
};

export const formatDueDate = (dueDate) => {
  if (!dueDate) return '';
  
  // Parse date string in local timezone to avoid UTC conversion issues
  // Handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm:ss.sssZ" formats
  const dateOnly = dueDate.split('T')[0];
  const [year, month, day] = dateOnly.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getDueDateColor = (status) => {
  switch (status) {
    case 'overdue':
      return 'error';
    case 'today':
      return 'warning';
    case 'soon':
      return 'warning';
    case 'future':
      return 'default';
    default:
      return 'default';
  }
};
