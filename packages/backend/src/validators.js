// Valid priority values
const VALID_PRIORITIES = ['high', 'medium', 'low'];

// Helper function to validate priority
function isValidPriority(priority) {
  return VALID_PRIORITIES.includes(priority);
}

// Helper function to validate priority with error message
function validatePriority(priority) {
  if (priority !== undefined && priority !== null) {
    if (typeof priority !== 'string' || !isValidPriority(priority)) {
      return `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`;
    }
  }
  return null; // Valid
}

// Helper function to validate tags
function validateTags(tags) {
  if (tags !== undefined && tags !== null) {
    // Must be an array
    if (!Array.isArray(tags)) {
      return 'tags must be an array';
    }
    // All elements must be strings
    for (const tag of tags) {
      if (typeof tag !== 'string') {
        return 'All tags must be strings';
      }
      // After trimming, tag must not be empty
      if (tag.trim() === '') {
        return 'tags cannot be empty strings';
      }
    }
  }
  return null; // Valid
}

// Helper function to normalize tags (trim whitespace)
function normalizeTags(tags) {
  if (!tags || !Array.isArray(tags)) {
    return [];
  }
  return tags.map(tag => tag.trim());
}

// Helper function to validate due date
function validateDueDate(dueDate) {
  if (dueDate === undefined || dueDate === null) {
    return null; // Valid (no date or clearing date)
  }
  if (typeof dueDate !== 'string') {
    return 'Invalid due date';
  }
  const date = new Date(dueDate);
  if (isNaN(date.getTime())) {
    return 'Invalid due date';
  }
  return null; // Valid
}

module.exports = {
  VALID_PRIORITIES,
  isValidPriority,
  validatePriority,
  validateTags,
  normalizeTags,
  validateDueDate,
};
