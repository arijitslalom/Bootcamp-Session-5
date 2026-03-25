# Feature Implementation Plan

## Overview
This document provides a detailed implementation plan for new TODO app features, organized by category. Each feature follows the Test-Driven Development (TDD) workflow: Write tests → Implement → Validate → Refactor.

---

## Priority & Organization Features

### 1. Priority Levels ✅ COMPLETED

**Status:** ✅ Completed on March 25, 2026  
**Actual Effort:** 40 minutes  
**Goal:** Add high/medium/low priority levels to todos with color coding and ability to filter/sort by priority.

#### Backend Changes

**Step 1.1: Update Data Model**
- Add `priority` field to todo object (values: 'high', 'medium', 'low', default: 'medium')
- Update POST endpoint to accept optional priority in request body
- Update PUT endpoint to allow updating priority
- Validate priority values (only accept valid enum values)

**Step 1.2: Write Backend Tests**
- Test creating todo with priority (default should be 'medium')
- Test creating todo with explicit priority ('high', 'medium', 'low')
- Test rejecting invalid priority values
- Test updating todo priority via PUT
- Test that priority persists after toggle/update operations

**Step 1.3: Implement Backend**
```javascript
// In POST /api/todos
const newTodo = {
  id: nextId++,
  title: title,
  priority: req.body.priority || 'medium', // Add this
  completed: false,
  createdAt: new Date().toISOString(),
};

// In PUT /api/todos/:id
if (req.body.priority !== undefined) {
  // Validate priority
  if (!['high', 'medium', 'low'].includes(req.body.priority)) {
    return res.status(400).json({ error: 'Invalid priority' });
  }
  todo.priority = req.body.priority;
}
```

**Step 1.4: Add Query Parameters for Filtering**
- Add `?priority=high` query parameter support to GET /api/todos
- Write tests for filtering by priority
- Implement filtering logic

#### Frontend Changes

**Step 1.5: Update UI Components**
- Add priority selector dropdown to add todo form (Material-UI Select)
- Add priority badge to todo list items with color coding:
  - High: red/error color
  - Medium: orange/warning color
  - Low: blue/info color
- Add priority edit capability in edit mode
- Add priority filter buttons/dropdown above todo list

**Step 1.6: Update React Query Mutations**
- Modify `addTodoMutation` to include priority
- Modify `editTodoMutation` to handle priority updates
- Add state for priority filter

**Step 1.7: Write Frontend Tests**
- Test priority selector appears in form
- Test priority badge displays correct color
- Test filtering by priority
- Test editing priority

**Step 1.8: Add Sort by Priority**
- Add sort dropdown with options (Priority, Date, Alphabetical)
- Implement client-side sorting logic
- High → Medium → Low ordering for priority sort

**Dependencies:** None
**Estimated Effort:** 3-4 hours
**Actual Effort:** 40 minutes

#### Implementation Summary

**Completed Features:**
- ✅ Backend priority field with validation (high/medium/low, default: medium)
- ✅ Priority filtering via query parameter (?priority=<value>)
- ✅ Priority persistence through all CRUD operations
- ✅ Frontend priority selector in add form
- ✅ Color-coded priority badges (High=Red, Medium=Orange, Low=Blue)
- ✅ Priority filter button group (All, High, Medium, Low)
- ✅ Priority editing in edit mode
- ✅ Comprehensive test coverage (21 backend + 7 frontend tests)

**Test Results:**
- Backend: 36 tests passing
- Frontend: 13 tests passing
- Total: 49 tests passing

**Commits:**
- Backend: `feat: add backend priority levels implementation` (3c14257)
- Frontend: `feat: implement priority levels feature for todos (Phase 1, Point 1)` (8104b07)
- Branch: `feature/capstone_project`

**Notes:**
- Followed TDD methodology (Red-Green-Refactor)
- Created DRY helper functions (validatePriority)
- Case-insensitive filtering support
- Step 1.8 (Sort by Priority) deferred to future implementation

---

### 2. Categories/Tags ✅ COMPLETED

**Status:** ✅ Completed on March 25, 2026  
**Actual Effort:** ~1 hour  
**Goal:** Allow users to categorize todos with tags (work, personal, shopping, etc.) and filter by category.

#### Backend Changes

**Step 2.1: Update Data Model** ✅
- Add `tags` array field to todo object (default: empty array)
- Update POST to accept optional tags
- Update PUT to allow updating tags

**Step 2.2: Write Backend Tests** ✅
- Test creating todo with tags
- Test creating todo without tags (empty array)
- Test updating tags via PUT
- Test filtering todos by tag (query param: `?tag=work`)
- Test multiple tags per todo
- Test case-insensitive tag matching

**Step 2.3: Implement Backend** ✅
```javascript
// In todo model
const newTodo = {
  id: nextId++,
  title: title,
  priority: req.body.priority || 'medium',
  tags: normalizeTags(tags), // Added with validation
  completed: false,
  createdAt: new Date().toISOString(),
};

// In GET endpoint - filter by tag
app.get('/api/todos', (req, res) => {
  let filteredTodos = todos;
  
  if (req.query.tag) {
    const tagFilter = req.query.tag.toLowerCase();
    filteredTodos = filteredTodos.filter(t => 
      t.tags && t.tags.some(tag => tag.toLowerCase() === tagFilter)
    );
  }
  
  res.json(filteredTodos);
});
```

**Step 2.4: Add Tag Management Endpoint** ✅
- Handled via PUT endpoint with full tags array (simpler approach)
- Comprehensive validation added (array type, string elements, empty string prevention)

#### Frontend Changes

**Step 2.5: Create Tag Input Component** ✅
- Add tag input field (MUI Autocomplete with freeSolo for custom tags)
- Display tags as chips below title in todo list
- Allow removing tags by clicking X on chip
- Add tag in edit mode

**Step 2.6: Add Tag Filter UI** ✅
- Display all unique tags as filter chips
- Click tag to filter todos by that tag
- Works alongside priority filter
- Separate query for all todos ensures filters stay visible

**Step 2.7: Write Frontend Tests** ✅
- Test adding tags to new todo
- Test displaying tags as chips
- Test filtering by tag
- Test editing tags in edit mode
- Test tag filter UI display

**Step 2.8: Tag Suggestions** ✅
- Autocomplete shows previously used tags
- FreeSolo allows custom tag creation
- Tags persist in database (not localStorage)

**Dependencies:** Priority Levels (to avoid merge conflicts in data model) ✅
**Estimated Effort:** 4-5 hours  
**Actual Effort:** ~1 hour

#### Implementation Summary

**Completed Features:**
- ✅ Backend tags array field with comprehensive validation
- ✅ Tag validation (array type, string elements, empty string prevention)
- ✅ Whitespace trimming for tags
- ✅ Tag filtering via query parameter (?tag=work)
- ✅ Case-insensitive tag matching
- ✅ Combined priority + tag filtering support
- ✅ Frontend Autocomplete tag input with freeSolo
- ✅ Tag chips displayed on todo items
- ✅ Clickable tag chips for instant filtering
- ✅ Tag editing in edit mode
- ✅ Tag filter UI with all unique tags
- ✅ Comprehensive test coverage (21 backend + 7 frontend tests)

**Test Results:**
- Backend: 57 tests passing (36 original + 21 tags tests)
- Frontend: 20 tests passing (13 original + 7 tags tests)
- Total: 77 tests passing

**Fixes Applied:**
- ✅ Null safety fix for tag filtering (defensive coding for backward compatibility)
- ✅ Performance optimization with useMemo for allTags calculation
- ✅ Separate query for all todos to keep filter options visible

**Code Quality:**
- Helper functions: `validateTags()`, `normalizeTags()`
- DRY principle applied
- Follows existing priority feature patterns
- No linting or compilation errors

**Notes:**
- Followed strict TDD methodology (Red-Green-Refactor)
- Used MUI Autocomplete for excellent UX
- Multiple filter support (priority AND tag)
- Backward compatible with todos without tags field
- Step 2.8 implemented with Autocomplete suggestions (no localStorage needed)

---

### 3. Drag-and-Drop Reordering

**Goal:** Allow users to manually reorder todos by dragging to prioritize tasks.

#### Backend Changes

**Step 3.1: Add Order Field**
- Add `order` field to todo object (numeric, default: current timestamp or incremental)
- Update POST to set order (use Date.now() or nextId)
- Add PATCH /api/todos/reorder endpoint to update multiple todo orders

**Step 3.2: Write Backend Tests**
- Test todos are returned sorted by order field
- Test reorder endpoint accepts array of {id, order} objects
- Test reorder updates persist correctly
- Test invalid reorder requests are rejected

**Step 3.3: Implement Backend**
```javascript
// In GET endpoint - sort by order
app.get('/api/todos', (req, res) => {
  let result = [...todos];
  // Apply filters...
  
  // Sort by order field
  result.sort((a, b) => a.order - b.order);
  res.json(result);
});

// New reorder endpoint
app.patch('/api/todos/reorder', (req, res) => {
  const { updates } = req.body; // [{ id: 1, order: 100 }, ...]
  
  updates.forEach(update => {
    const todo = todos.find(t => t.id === update.id);
    if (todo) {
      todo.order = update.order;
    }
  });
  
  res.json({ success: true });
});
```

#### Frontend Changes

**Step 3.4: Install and Configure DnD Library**
- Install `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- These are modern, accessible drag-and-drop libraries for React

**Step 3.5: Implement Drag-and-Drop UI**
- Wrap todo list with DndContext
- Make each ListItem draggable with SortableContext
- Add drag handle icon (DragIndicator from MUI icons)
- Show visual feedback during drag (opacity, elevation)

**Step 3.6: Handle Reorder Logic**
- Calculate new order values when item is dropped
- Create mutation for reorder API call
- Optimistically update UI, then sync with backend
- Handle reorder failures gracefully

**Step 3.7: Write Frontend Tests**
- Test drag handle appears on each todo
- Test reorder mutation is called with correct data
- Test optimistic UI update
- Test error handling if reorder fails

**Step 3.8: UX Enhancements**
- Disable drag when in edit mode
- Add subtle animation for reordering
- Show "drop zone" indicators
- Mobile touch support

**Dependencies:** Priority Levels, Categories/Tags (to avoid data model conflicts)
**Estimated Effort:** 5-6 hours

---

### 4. Due Dates

**Goal:** Add optional due dates to todos with visual indicators for overdue, due soon, and upcoming items.

#### Backend Changes

**Step 4.1: Update Data Model**
- Add `dueDate` field to todo object (ISO 8601 date string, nullable)
- Update POST to accept optional dueDate
- Update PUT to allow updating dueDate

**Step 4.2: Write Backend Tests**
- Test creating todo with dueDate
- Test creating todo without dueDate (null/undefined)
- Test updating dueDate via PUT
- Test clearing dueDate (set to null)
- Test invalid date formats are rejected
- Test filtering by date range (?dueBefore=2026-04-01, ?dueAfter=2026-03-01)

**Step 4.3: Implement Backend**
```javascript
// Validation helper
function isValidDate(dateString) {
  if (!dateString) return true; // null is valid
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// In POST /api/todos
const newTodo = {
  id: nextId++,
  title: title,
  priority: req.body.priority || 'medium',
  tags: req.body.tags || [],
  dueDate: req.body.dueDate || null, // Add this
  completed: false,
  order: Date.now(),
  createdAt: new Date().toISOString(),
};

// Validate date
if (newTodo.dueDate && !isValidDate(newTodo.dueDate)) {
  return res.status(400).json({ error: 'Invalid due date' });
}
```

**Step 4.4: Add Date Filtering**
- Implement query params for date range filtering
- Add virtual filter for "overdue" (dueDate < today && !completed)
- Add virtual filter for "due soon" (dueDate within next 3 days)

#### Frontend Changes

**Step 4.5: Add Date Picker Component**
- Add date picker to add/edit form (MUI DatePicker from @mui/x-date-pickers)
- Install `@mui/x-date-pickers` and `date-fns` (or dayjs)
- Allow clearing due date
- Default to no due date

**Step 4.6: Display Due Date in Todo List**
- Show due date below title with calendar icon
- Color coding:
  - Overdue: Red (past due and not completed)
  - Due today: Orange
  - Due soon (next 3 days): Yellow
  - Future: Gray
- Format: "Due Mar 28" or "Overdue by 2 days"

**Step 4.7: Add Due Date Filters**
- Filter buttons: All, Overdue, Due Today, Due This Week, No Due Date
- Quick filter chips above todo list
- Combine with existing priority/tag filters

**Step 4.8: Write Frontend Tests**
- Test date picker appears in form
- Test due date displays with correct color
- Test overdue indicator shows correctly
- Test date filtering
- Test editing/clearing due date

**Step 4.9: Sort by Due Date**
- Add "Due Date" option to sort dropdown
- Sort: Overdue first → Due soon → Future → No due date

**Step 4.10: Notifications (Optional Enhancement)**
- Add due date reminder badge in header
- Count of overdue items
- Count of items due today

**Dependencies:** Priority Levels, Categories/Tags, Drag-and-Drop (data model)
**Estimated Effort:** 5-6 hours

---

## Filtering & View Management

### 5. Filter Views (All/Active/Completed)

**Goal:** Classic TODO filter pattern to show all todos, only active (incomplete), or only completed todos.

#### Backend Changes

**Step 5.1: Add Completion Status Filter**
- Add query parameter support: `?status=all|active|completed`
- Default to "all" if not specified

**Step 5.2: Write Backend Tests**
- Test `?status=all` returns all todos
- Test `?status=active` returns only incomplete todos
- Test `?status=completed` returns only completed todos
- Test invalid status values are rejected or default to "all"

**Step 5.3: Implement Backend**
```javascript
app.get('/api/todos', (req, res) => {
  let result = [...todos];
  
  // Filter by completion status
  const status = req.query.status || 'all';
  if (status === 'active') {
    result = result.filter(t => !t.completed);
  } else if (status === 'completed') {
    result = result.filter(t => t.completed);
  }
  // 'all' returns everything
  
  // Apply other filters (priority, tags, dates)...
  // Sort by order...
  
  res.json(result);
});
```

#### Frontend Changes

**Step 5.4: Add Filter Button Group**
- Create ToggleButtonGroup with three options: All, Active, Completed
- Place below add todo form, above list
- Highlight active filter
- Material-UI ToggleButton component

**Step 5.5: Implement Filter State**
- Add useState for current filter ('all', 'active', 'completed')
- Modify useTodos hook to include status in query key
- Pass status as query param to API

**Step 5.6: Update Stats Display**
- Keep existing "X items left" (active count)
- Add "X completed" 
- Show filtered count: "Showing X of Y todos"

**Step 5.7: Write Frontend Tests**
- Test all three filter buttons render
- Test clicking filter updates query
- Test correct todos display for each filter
- Test filter persists across add/edit/delete operations

**Step 5.8: URL State (Optional)**
- Sync filter state with URL query params
- Allow bookmarking filtered views
- Use React Router or URLSearchParams

**Dependencies:** None (can be implemented independently)
**Estimated Effort:** 2-3 hours

---

### 6. Search/Filter Bar

**Goal:** Search bar to find todos by title, tags, or other text fields.

#### Backend Changes

**Step 6.1: Add Search Query Parameter**
- Add `?search=<term>` query parameter
- Search in: title, tags
- Case-insensitive partial matching

**Step 6.2: Write Backend Tests**
- Test search finds todos by title (partial match)
- Test search finds todos by tag
- Test search is case-insensitive
- Test search returns empty array when no matches
- Test search combines with other filters (status, priority)

**Step 6.3: Implement Backend**
```javascript
app.get('/api/todos', (req, res) => {
  let result = [...todos];
  
  // Search filter
  if (req.query.search) {
    const searchTerm = req.query.search.toLowerCase();
    result = result.filter(todo => {
      const titleMatch = todo.title.toLowerCase().includes(searchTerm);
      const tagMatch = todo.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm)
      );
      return titleMatch || tagMatch;
    });
  }
  
  // Apply other filters...
  res.json(result);
});
```

#### Frontend Changes

**Step 6.4: Add Search Input**
- Add TextField with search icon above filters
- Debounce input (300ms) to avoid excessive API calls
- Clear button to reset search
- Placeholder: "Search todos..."

**Step 6.5: Implement Search State**
- Add useState for search term
- Use debounced value in query
- Show search term in URL (optional)
- Display "Searching..." indicator when debouncing

**Step 6.6: Search Results UI**
- Highlight matching text in results (optional)
- Show "No results for '<term>'" when empty
- Show count: "Found X todos matching '<term>'"
- Clear search when clicking result count

**Step 6.7: Write Frontend Tests**
- Test search input renders
- Test typing triggers search (debounced)
- Test clear button clears search
- Test search combines with filters
- Test empty state for no results

**Step 6.8: Advanced Search (Optional)**
- Search syntax: "tag:work", "priority:high", "overdue"
- Parse search terms into structured query
- Autocomplete suggestions

**Dependencies:** Categories/Tags (for tag search), Filter Views
**Estimated Effort:** 3-4 hours

---

### 7. Sort Options

**Goal:** Multiple sort options - by date created, priority, alphabetically, due date, or custom order.

#### Backend Changes

**Step 7.1: Add Sort Query Parameter**
- Add `?sort=<field>&order=<asc|desc>` query parameters
- Supported fields: createdAt, title, priority, dueDate, order (custom)
- Default: order ascending (custom drag-drop order)

**Step 7.2: Write Backend Tests**
- Test sort by createdAt (newest/oldest first)
- Test sort by title (A-Z, Z-A)
- Test sort by priority (high→low, low→high)
- Test sort by dueDate (soonest first, latest first)
- Test sort by custom order
- Test invalid sort field defaults to order
- Test combining sort with filters

**Step 7.3: Implement Backend**
```javascript
app.get('/api/todos', (req, res) => {
  let result = [...todos];
  
  // Apply filters...
  
  // Sort
  const sortField = req.query.sort || 'order';
  const sortOrder = req.query.order || 'asc';
  const multiplier = sortOrder === 'desc' ? -1 : 1;
  
  result.sort((a, b) => {
    if (sortField === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[a.priority] - priorityOrder[b.priority]) * multiplier;
    }
    if (sortField === 'title') {
      return a.title.localeCompare(b.title) * multiplier;
    }
    if (sortField === 'dueDate') {
      // Handle null dates (put at end)
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return (new Date(a.dueDate) - new Date(b.dueDate)) * multiplier;
    }
    if (sortField === 'createdAt') {
      return (new Date(a.createdAt) - new Date(b.createdAt)) * multiplier;
    }
    // Default: custom order
    return (a.order - b.order) * multiplier;
  });
  
  res.json(result);
});
```

#### Frontend Changes

**Step 7.4: Add Sort Dropdown**
- Add Select/Menu component for sort options
- Options: Custom Order, Priority, Due Date, Date Added, Alphabetical
- Add order toggle button (ascending/descending icon)
- Place near filter buttons

**Step 7.5: Implement Sort State**
- Add useState for sortField and sortOrder
- Pass to API via query params
- Update query key to trigger refetch
- Persist sort preference in localStorage (optional)

**Step 7.6: Visual Indicators**
- Show current sort in dropdown label
- Arrow icon for sort direction (↑↓)
- Disable "Custom Order" if using other sort (conflicts with drag-drop)

**Step 7.7: Write Frontend Tests**
- Test sort dropdown renders all options
- Test changing sort triggers API call
- Test sort order toggle works
- Test todos display in correct order
- Test persistence to localStorage (if implemented)

**Step 7.8: Sort + Drag-Drop Integration**
- Disable drag-drop when not using "Custom Order" sort
- Show message: "Drag-drop only available in Custom Order mode"
- Auto-switch to Custom Order when dragging

**Dependencies:** Priority Levels, Due Dates, Drag-and-Drop
**Estimated Effort:** 3-4 hours

---

### 8. Bulk Actions

**Goal:** Select multiple todos to complete, delete, change priority, or modify in bulk.

#### Backend Changes

**Step 8.1: Add Bulk Action Endpoints**
- PATCH /api/todos/bulk/complete - Mark multiple todos as completed
- PATCH /api/todos/bulk/uncomplete - Mark multiple as incomplete
- DELETE /api/todos/bulk - Delete multiple todos
- PATCH /api/todos/bulk/priority - Update priority for multiple todos
- PATCH /api/todos/bulk/tags - Add/remove tags for multiple todos

**Step 8.2: Write Backend Tests**
- Test bulk complete with array of IDs
- Test bulk delete with array of IDs
- Test bulk priority update
- Test bulk operations validate IDs exist
- Test empty array handling
- Test partial success scenarios (some IDs invalid)

**Step 8.3: Implement Backend**
```javascript
// Bulk complete
app.patch('/api/todos/bulk/complete', (req, res) => {
  const { ids } = req.body; // Array of todo IDs
  
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: 'IDs must be an array' });
  }
  
  const updated = [];
  ids.forEach(id => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.completed = true;
      updated.push(todo);
    }
  });
  
  res.json({ updated, count: updated.length });
});

// Bulk delete
app.delete('/api/todos/bulk', (req, res) => {
  const { ids } = req.body;
  
  const deleted = [];
  ids.forEach(id => {
    const index = todos.findIndex(t => t.id === id);
    if (index !== -1) {
      deleted.push(todos.splice(index, 1)[0]);
    }
  });
  
  res.json({ deleted, count: deleted.length });
});

// Similar for other bulk operations...
```

#### Frontend Changes

**Step 8.4: Add Selection State**
- Add useState for selected todo IDs (Set or Array)
- Add "Select All" checkbox in header
- Add checkbox for each todo item
- Show selection count: "3 selected"

**Step 8.5: Create Bulk Action Bar**
- Fixed/floating action bar when items selected
- Buttons: Complete, Delete, Change Priority, Add Tag
- Cancel/Clear selection button
- Confirmation dialog for destructive actions (delete)

**Step 8.6: Implement Bulk Mutations**
- Create React Query mutations for each bulk action
- Invalidate queries on success
- Show success toast: "3 todos completed"
- Clear selection after successful action

**Step 8.7: Write Frontend Tests**
- Test selecting individual todos
- Test select all functionality
- Test bulk complete action
- Test bulk delete with confirmation
- Test clearing selection
- Test action bar appears/disappears

**Step 8.8: UX Refinements**
- Keyboard shortcuts: Cmd+A for select all, Delete key for bulk delete
- Visual feedback for selected items (highlight/background color)
- Disable incompatible actions (can't complete already completed items)
- Show action previews before confirming

**Dependencies:** All previous features (to enable bulk operations on all fields)
**Estimated Effort:** 5-6 hours

---

## Enhanced User Experience

### 9. Subtasks/Checklists

**Goal:** Allow todos to have nested subtasks with individual completion tracking and parent progress indicators.

#### Backend Changes

**Step 9.1: Design Subtask Data Model**
- Add `subtasks` array to todo object
- Each subtask: `{ id: number, title: string, completed: boolean }`
- Calculate parent completion based on subtask progress (optional)

**Step 9.2: Add Subtask Endpoints**
- POST /api/todos/:id/subtasks - Add subtask to todo
- PUT /api/todos/:id/subtasks/:subtaskId - Update subtask
- PATCH /api/todos/:id/subtasks/:subtaskId/toggle - Toggle subtask
- DELETE /api/todos/:id/subtasks/:subtaskId - Delete subtask

**Step 9.3: Write Backend Tests**
- Test adding subtask to todo
- Test updating subtask title
- Test toggling subtask completion
- Test deleting subtask
- Test subtask validation (title required)
- Test subtask ID uniqueness within parent
- Test progress calculation (X of Y completed)

**Step 9.4: Implement Backend**
```javascript
// Add to todo model
const newTodo = {
  // ...existing fields
  subtasks: [], // Add this
};

// POST /api/todos/:id/subtasks
app.post('/api/todos/:id/subtasks', (req, res) => {
  const todoId = parseInt(req.params.id);
  const { title } = req.body;
  const todo = todos.find(t => t.id === todoId);
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Subtask title required' });
  }
  
  // Generate subtask ID (unique within todo)
  const subtaskId = todo.subtasks.length > 0 
    ? Math.max(...todo.subtasks.map(s => s.id)) + 1 
    : 1;
  
  const newSubtask = {
    id: subtaskId,
    title: title.trim(),
    completed: false,
  };
  
  todo.subtasks.push(newSubtask);
  res.status(201).json(todo);
});

// Similar for other subtask endpoints...
```

**Step 9.5: Add Progress Calculation**
- Add helper function to calculate subtask progress
- Return progress in GET /api/todos response
- `subtaskProgress: { completed: 2, total: 5 }`

#### Frontend Changes

**Step 9.6: Create Subtask UI Component**
- Expandable section below todo title
- Collapse/expand icon (ChevronDown/ChevronRight)
- List of subtasks with checkboxes
- "Add subtask" button when expanded
- Indent subtasks visually

**Step 9.7: Add Subtask Input**
- Inline input field for new subtask
- Enter to save, Escape to cancel
- Similar to main todo input
- Delete button for each subtask

**Step 9.8: Display Progress Indicator**
- Progress bar showing completion (2/5 completed)
- Percentage circle (40% complete)
- Update when subtasks toggle
- Color coding: red (0%), yellow (1-99%), green (100%)

**Step 9.9: Implement Subtask Mutations**
- addSubtaskMutation
- updateSubtaskMutation
- toggleSubtaskMutation
- deleteSubtaskMutation
- All invalidate parent query

**Step 9.10: Parent-Child Completion Logic**
- Option 1: Auto-complete parent when all subtasks done
- Option 2: Parent completion independent of subtasks
- Make configurable with toggle setting
- Visual indicator when parent completion differs from subtasks

**Step 9.11: Write Frontend Tests**
- Test expanding/collapsing subtasks
- Test adding subtasks
- Test toggling subtasks
- Test progress bar updates
- Test deleting subtasks
- Test parent completion logic

**Step 9.12 UX Enhancements**
- Drag-drop reorder subtasks
- Convert subtask to top-level todo
- Copy all subtasks from another todo
- Subtask templates ("Daily routine" has default subtasks)

**Dependencies:** All organization features (subtasks should support priority, tags, due dates)
**Estimated Effort:** 7-8 hours

---

### 10. Notes/Description Field

**Goal:** Add expandable description/notes field to todos for additional context and details.

#### Backend Changes

**Step 10.1: Add Description Field**
- Add `description` field to todo object (string, default: empty)
- Update POST to accept optional description
- Update PUT to allow updating description
- No length limit (or set reasonable limit like 5000 chars)

**Step 10.2: Write Backend Tests**
- Test creating todo with description
- Test creating todo without description (empty string)
- Test updating description via PUT
- Test clearing description
- Test long descriptions (edge case)
- Test description persists after other operations

**Step 10.3: Implement Backend**
```javascript
const newTodo = {
  // ...existing fields
  description: req.body.description || '', // Add this
};

// In PUT endpoint
if (req.body.description !== undefined) {
  todo.description = req.body.description;
}
```

#### Frontend Changes

**Step 10.4: Add Description in Add/Edit Forms**
- Multi-line TextField (multiline prop)
- Rows: 3-4 initial, expandable
- Placeholder: "Add notes or details..."
- Character counter (optional, if limit set)

**Step 10.5: Display Description in List**
- Collapsed by default (show first 100 chars)
- "Show more" / "Show less" toggle
- Expand icon or click to expand
- Rendered with proper line breaks

**Step 10.6: Description Modal/Drawer (Alternative)**
- Click notes icon to open side drawer
- Full-screen editor for longer descriptions
- Rich text editing (optional - see Step 10.9)
- Save/Cancel buttons

**Step 10.7: Visual Indicator**
- Notes icon (Comment, Description, or Notes icon)
- Show icon only when description exists
- Badge with "..." or first few words

**Step 10.8: Write Frontend Tests**
- Test description field appears in forms
- Test saving description with new todo
- Test editing description
- Test expand/collapse description
- Test clearing description

**Step 10.9: Rich Text Editor (Optional Enhancement)**
- Install rich text library (Quill, TipTap, or Slate)
- Support formatting: bold, italic, lists
- Markdown support (write in markdown, render as HTML)
- Link support

**Step 10.10: Search in Descriptions**
- Update search functionality to include description
- Highlight matching text in description
- Show snippet of matching description in results

**Dependencies:** None (can be implemented independently)
**Estimated Effort:** 3-4 hours (basic), 6-8 hours (with rich text)

---

### 11. Undo/Redo Functionality

**Goal:** Allow users to undo recently deleted todos or changes, with optional redo capability.

#### Backend Changes

**Step 11.1: Add Action History Endpoint (Optional)**
- Store action history on backend (optional, can be client-only)
- POST /api/todos/restore/:id - Restore deleted todo
- Soft delete pattern: add `deleted` flag instead of removing

**Step 11.2: Implement Soft Delete (Recommended)**
```javascript
// Instead of splicing from array:
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  // Soft delete
  todo.deleted = true;
  todo.deletedAt = new Date().toISOString();
  
  res.json(todo);
});

// Filter deleted from GET endpoint
app.get('/api/todos', (req, res) => {
  let result = todos.filter(t => !t.deleted);
  // Apply other filters...
});

// Restore endpoint
app.patch('/api/todos/:id/restore', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  todo.deleted = false;
  delete todo.deletedAt;
  
  res.json(todo);
});
```

**Step 11.3: Write Backend Tests**
- Test soft delete sets deleted flag
- Test deleted todos not returned in GET
- Test restore endpoint un-deletes todo
- Test restoring already active todo (no-op or error)

#### Frontend Changes (Client-Side Undo)

**Step 11.4: Implement Action History Stack**
- Create undo stack (array of actions)
- Store action type and data needed to reverse
- Limit stack size (last 10-20 actions)
- Use React Context or global state

**Step 11.5: Track Undoable Actions**
```javascript
const actionHistory = [];

const recordAction = (action) => {
  actionHistory.push({
    type: action.type, // 'delete', 'complete', 'edit', etc.
    data: action.data, // Original data to restore
    timestamp: Date.now(),
  });
  
  // Limit history size
  if (actionHistory.length > 20) {
    actionHistory.shift();
  }
};

// On delete:
const handleDeleteTodo = (todo) => {
  recordAction({ type: 'delete', data: todo });
  deleteTodoMutation.mutate(todo.id);
};
```

**Step 11.6: Create Undo UI**
- Snackbar/Toast notification after action: "Todo deleted" with UNDO button
- Auto-dismiss after 5-10 seconds
- Click UNDO to reverse action
- Material-UI Snackbar component

**Step 11.7: Implement Undo Logic**
```javascript
const undo = () => {
  if (actionHistory.length === 0) return;
  
  const action = actionHistory.pop();
  
  switch (action.type) {
    case 'delete':
      // Call restore API or re-create todo
      restoreTodoMutation.mutate(action.data);
      break;
    case 'complete':
      // Toggle back to incomplete
      toggleTodoMutation.mutate(action.data.id);
      break;
    case 'edit':
      // Restore previous title/data
      editTodoMutation.mutate({ id: action.data.id, ...action.data.previous });
      break;
  }
};
```

**Step 11.8: Keyboard Shortcut**
- Cmd+Z (Mac) / Ctrl+Z (Windows) for undo
- Cmd+Shift+Z for redo (optional)
- Only when no input field focused

**Step 11.9: Redo Functionality (Optional)**
- Maintain separate redo stack
- Move action to redo stack when undoing
- Clear redo stack on new action

**Step 11.10: Write Frontend Tests**
- Test action history records actions
- Test undo button appears after delete
- Test clicking undo restores todo
- Test undo timeout/auto-dismiss
- Test keyboard shortcut
- Test undo stack limits

**Step 11.11: Advanced Undo**
- Show undo history list (last 10 actions)
- Click to undo to specific point
- Group related actions (bulk delete = one undo)

**Dependencies:** None (but works better with soft delete backend)
**Estimated Effort:** 4-5 hours (basic), 6-7 hours (with redo and history UI)

---

### 12. Dark/Light Theme Toggle ✅ COMPLETED

**Status:** ✅ Completed on March 25, 2026  
**Actual Effort:** 23 minutes  
**Goal:** User preference for dark or light theme with system preference detection and persistence.

#### Frontend Changes Only (No Backend Required)

**Step 12.1: Setup Theme Provider**
- Material-UI already supports theming
- Create light and dark theme objects
- Use ThemeProvider with dynamic theme

**Step 12.2: Create Theme Configuration**
```javascript
// theme.js
import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#667eea' },
    secondary: { main: '#764ba2' },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7c3aed' },
    secondary: { main: '#a855f7' },
    background: {
      default: '#1a1a1a',
      paper: '#2d2d2d',
    },
  },
});
```

**Step 12.3: Implement Theme Toggle**
```javascript
function App() {
  // Detect system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Load from localStorage or use system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : prefersDark;
  });
  
  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Applies background colors */}
      {/* App content */}
    </ThemeProvider>
  );
}
```

**Step 12.4: Add Theme Toggle UI**
- Icon button in header (sun/moon icon)
- Smooth transition animation
- Tooltip "Toggle theme" or "Dark mode"
- Settings menu option (alternative placement)

**Step 12.5: Implement Smooth Transitions**
```css
/* Add to index.css */
* {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

**Step 12.6: Update Custom Styles**
- Review App.css for hardcoded colors
- Replace with theme-aware colors
- Use theme.palette values
- Test both themes for readability

**Step 12.7: Handle Images/Icons**
- Swap logo/images for dark theme (if needed)
- Adjust icon colors for contrast
- Ensure all text has sufficient contrast

**Step 12.8: Write Frontend Tests**
- Test theme toggle button renders
- Test clicking toggle switches theme
- Test theme persists to localStorage
- Test system preference detection
- Test theme applies to all components

**Step 12.9: Advanced Theme Features**
- Multiple theme options (blue, purple, green)
- Accent color customization
- Font size adjustment
- High contrast mode for accessibility

**Step 12.10: System Preference Sync**
```javascript
// Listen for system theme changes
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (e) => {
    // Only auto-update if user hasn't set preference
    if (!localStorage.getItem('theme')) {
      setIsDarkMode(e.matches);
    }
  };
  
  mediaQuery.addEventListener('change', handleChange);
  return () => mediaQuery.removeEventListener('change', handleChange);
}, []);
```

**Dependencies:** None  
**Estimated Effort:** 2-3 hours (basic), 4-5 hours (with customization)  
**Actual Effort:** 23 minutes

#### Implementation Summary

**Completed Features:**
- ✅ Light and dark theme configurations with Material-UI
- ✅ Theme toggle button with sun/moon icons in header
- ✅ Theme state management via React Context (ThemeContext.js)
- ✅ localStorage persistence for user preference
- ✅ System preference detection (prefers-color-scheme)
- ✅ Smooth 0.3s transitions between themes
- ✅ Accessible toggle button with proper aria-labels
- ✅ Comprehensive test coverage (5 new tests)

**Test Results:**
- Frontend: 25 tests passing (20 existing + 5 new theme tests)
- Total: 25/25 tests passing (100%)

**Code Quality:**
- Zero compilation errors
- Zero lint errors
- TDD methodology followed (Red-Green-Refactor)
- Performance optimized with useMemo

**Files Created/Modified:**
- Created: `ThemeContext.js` - React Context for theme state
- Modified: `theme.js` - Added darkTheme configuration
- Modified: `index.js` - Theme state management & persistence
- Modified: `App.js` - Theme toggle button UI
- Modified: `App.css` - Smooth transition styles
- Modified: `App.test.js` - 5 comprehensive tests

**Commits:**
- Branch: `feature/capstone_project`
- Feature: `feat: implement dark/light theme toggle (Phase 1, Point 3)`

**Notes:**
- Implementation was significantly faster than estimated (23 min vs 2-3 hours)
- No backend changes required (frontend-only feature)
- Created separate ThemeContext.js to avoid circular dependencies
- All existing tests still pass (no regressions)
- Manual browser testing recommended for visual verification

---

## Implementation Sequence Recommendation

Based on dependencies and complexity, here's the recommended implementation order:

### Phase 1: Foundation (Week 1)
1. Priority Levels (3-4h) ✅ COMPLETED - Actual: 40 minutes
2. Filter Views - All/Active/Completed (2-3h)
3. Dark/Light Theme Toggle (2-3h) ✅ COMPLETED - Actual: 23 minutes

**Total: ~7-10 hours** | **Completed: 2/3 features (63 minutes actual)**

### Phase 2: Organization (Week 2)
4. Categories/Tags (4-5h)
5. Due Dates (5-6h)
6. Sort Options (3-4h)
7. Search/Filter Bar (3-4h)

**Total: ~15-19 hours**

### Phase 3: Advanced UX (Week 3)
8. Notes/Description Field (3-4h)
9. Undo/Redo (4-5h)
10. Drag-and-Drop Reordering (5-6h)

**Total: ~12-15 hours**

### Phase 4: Power Features (Week 4)
11. Subtasks/Checklists (7-8h)
12. Bulk Actions (5-6h)

**Total: ~12-14 hours**

### Phase 5: Polish & Performance (Week 5)
13. Testing & Bug Fixes (8-10h)
14. Performance Optimization (4-6h)
15. Documentation (2-3h)

**Total: ~14-19 hours**

---

## Testing Strategy for All Features

### Test-Driven Development Workflow

For each feature:

1. **Write Backend Tests First**
   - API endpoint tests with Supertest
   - Cover happy path, edge cases, errors
   - Test validation and error messages

2. **Implement Backend to Pass Tests**
   - Red → Green → Refactor cycle
   - Run tests frequently (`npm test`)

3. **Write Frontend Tests**
   - Component rendering tests
   - User interaction tests (click, type, etc.)
   - React Query integration tests
   - Accessibility tests

4. **Implement Frontend to Pass Tests**
   - Build components incrementally
   - Test each piece in isolation
   - Integration test full flow

5. **Manual Testing**
   - Test in browser with different scenarios
   - Test responsive design (mobile, tablet, desktop)
   - Cross-browser testing
   - Accessibility testing (screen reader, keyboard only)

6. **Validation**
   - Run all tests: `npm test`
   - Run lint: `npm run lint`
   - Check for console errors
   - Test on deployed environment

---

## Summary

This plan provides a comprehensive roadmap for implementing:
- **4 Priority & Organization Features**: Priority levels, tags, drag-drop, due dates
- **4 Filtering & View Management Features**: Status filters, search, sort, bulk actions
- **4 Enhanced User Experience Features**: Subtasks, notes, undo, dark mode

Each feature includes:
- Detailed backend and frontend steps
- Test-driven development approach
- Estimated effort and dependencies
- Code examples and implementation guidance

The total implementation time across all features is approximately **60-77 hours**, making this a 5-6 week project if working 10-15 hours per week.

**Note:** This plan uses in-memory storage. Data will reset on server restart. For production use with data persistence, you would need to add database integration and user authentication separately.

Start with Phase 1 (foundation) and progress sequentially for best results!
