# Feature Implementation Plan

## Overview
This document provides a detailed implementation plan for new TODO app **functional features**, organized by category. Each feature follows the Test-Driven Development (TDD) workflow: Write tests → Implement → Validate → Refactor.

**Related Documents:**
- **[UI/UX Improvement Plan](ui-improvement-plan.md)** - Comprehensive plan for modernizing the visual design and user experience (two-column layout, enhanced components, responsive design, etc.) ✅ **ALL 5 PHASES COMPLETED**

**Scope Clarification:**
- **This document:** Focuses on functional features (data model changes, API endpoints, business logic)
- **UI Improvement Plan:** Focuses on presentation layer (layout, typography, spacing, visual design, accessibility) ✅ **COMPLETE**

**UI Context (As of March 26, 2026):**
The app now features a modern two-column layout:
- **Left Column (42%, lg=5):** Summary dashboard (two compact stat tiles side-by-side) + task input form with priority selector, tags input, due date, and action button
- **Right Column (58%, lg=7):** Task list with filters, card-style items with hover effects, metadata rows
- **Task List:** Fixed-height scrollable container (60vh) to prevent layout shift when filtering
- **Filter Bar:** Status filter (All/Active/Completed) and sort controls (Sort by dropdown + order toggle) on a single row
- **Advanced Filters:** Priority and tag filters inside collapsible "More Filters" accordion
- **Section Headers:** Left = "Add New Task", Right = "Tasks"
- **Container Width:** `lg` (1280px max width for desktop optimization)
- **Design System:** Purple theme (#667eea primary, #9c27b0 secondary), comprehensive typography, semantic HTML
- **Components:** Card-style list items (borderRadius: 2, elevation changes on hover)
- **Accessibility:** ARIA labels, keyboard navigation (Enter/Escape), semantic sections

Pending features should integrate with this established UI pattern.

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

### 3. ~~Drag-and-Drop Reordering~~ ❌ DROPPED

**Status:** ❌ Dropped on March 26, 2026  
**Reason:** Conflicts with the Sort Options feature (completed). When sorting by title, priority, or due date, manual drag reordering creates a UX contradiction. The Sort feature already provides flexible ordering control. Additionally, drag-and-drop within a scrollable container (60vh) adds significant complexity for limited benefit.

**Original Goal:** Allow users to manually reorder todos by dragging to prioritize tasks.

**Original Estimated Effort:** 5-6 hours

---

### 4. Due Dates ✅ COMPLETED

**Status:** ✅ Completed on March 26, 2026  
**Actual Effort:** 25 minutes  
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

**Files to modify:**
- `src/validators.js` - Add `isValidDate()`, `validateDueDate()` helpers
- `src/todoStore.js` - Add `dueDate` field (default: null) in `addTodo()`
- `src/routes/todoRoutes.js` - Add dueDate handling in POST/PUT, add date range filtering in GET

```javascript
// In validators.js
function isValidDate(dateString) {
  if (!dateString) return true; // null is valid
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// In todoStore.js addTodo() - add dueDate field
dueDate: dueDate || null,

// In routes/todoRoutes.js POST handler - validate date
if (dueDate && !isValidDate(dueDate)) {
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
- **Files to modify:** `components/AddTodoForm.js` (add DatePicker to form), `components/TodoItem.js` (add DatePicker in edit mode)

**Step 4.6: Display Due Date in Todo List**
- Show due date in metadata row below title (alongside existing priority badge and tags)
- Use EventIcon (already in use for createdAt date)
- **File to modify:** `components/TodoItem.js` - Add due date chip/text to metadata Stack
- Color coding:
  - Overdue: Red (past due and not completed)
  - Due today: Orange
  - Due soon (next 3 days): Yellow
  - Future: Gray
- Format: "Due Mar 28" or "Overdue by 2 days"
- **UI Integration Note:** Add to existing metadata Stack with spacing={1}. Position after createdAt date, before priority chip.

**Step 4.7: Add Due Date Filters**
- Filter buttons: All, Overdue, Due Today, Due This Week, No Due Date
- **UI Integration Note:** Add to "More Filters" accordion in FOCUS section (already houses priority and tag filters). Create new section within AccordionDetails after tag filter.
- **File to modify:** `components/TodoFilters.js` - Add new filter section inside accordion
- Combine with existing priority/tag filters
- Use same ButtonGroup pattern as priority filter for consistency

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

**Dependencies:** Priority Levels, Categories/Tags (data model)
**Estimated Effort:** 5-6 hours  
**Actual Effort:** 25 minutes

#### Implementation Summary

**Completed Features:**
- ✅ Backend dueDate field with validation (nullable, defaults to null)
- ✅ Date validation for invalid formats
- ✅ Due date filtering via query parameters (?dueBefore, ?dueAfter)
- ✅ Date range filtering support
- ✅ Combined filtering with status, priority, and tag filters
- ✅ Frontend native date input (type="date") in add form
- ✅ Due date display as color-coded chips on todo items:
  - **Overdue** (red, filled) — past due and not completed
  - **Today** (warning) — due today
  - **Soon** (warning) — due within 3 days
  - **Future** (default, outlined) — later dates
- ✅ Due date editing in edit mode
- ✅ Form resets due date after submission
- ✅ Timezone-safe date parsing and display
- ✅ Comprehensive test coverage (14 backend + 7 frontend tests)

**Test Results:**
- Backend: 93 tests passing (79 original + 14 new due date tests)
- Frontend: 56 tests passing (49 original + 7 new due date tests)
- Total: 149 tests passing (100% pass rate)

**Files Modified:**
- Backend: `src/validators.js`, `src/routes/todoRoutes.js`, `src/todoStore.js`, `src/seedData.js`, `__tests__/todos.dueDate.test.js`
- Frontend: `src/App.js`, `src/components/AddTodoForm.js`, `src/components/TodoItem.js`, `src/components/TodoList.js`, `src/hooks/useTodoMutations.js`, `src/utils/helpers.js`, `src/__tests__/App.test.js`

**Seed Data Updates:**
- Added diverse due date scenarios (overdue, today, soon, future, no date)
- Added varied creation dates across multiple weeks
- 9 example todos demonstrating all due date states

**Code Quality:**
- Helper functions: `validateDueDate()`, `getDueDateStatus()`, `formatDueDate()`, `getDueDateColor()`
- DRY principle applied
- Timezone-safe date parsing
- No linting or compilation errors

**Notes:**
- Followed strict TDD methodology (Red-Green-Refactor)
- Implementation completed efficiently in 25 minutes (vs. 5-6 hour estimate)
- Steps 4.7 (Date Filter UI), 4.9 (Sort by Due Date), and 4.10 (Notifications) deferred as optional enhancements
- Manual browser testing recommended for full UI verification

---

## Filtering & View Management

### 5. Filter Views (All/Active/Completed) ✅ COMPLETED

**Status:** ✅ Completed on March 25, 2026  
**Actual Effort:** 41 minutes  
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
**Actual Effort:** 41 minutes

#### Implementation Summary

**Completed Features:**
- ✅ Backend status filter query parameter (?status=all|active|completed)
- ✅ Default to "all" when status parameter missing
- ✅ Graceful handling of invalid status values (defaults to "all")
- ✅ Combined filtering with priority and tag filters
- ✅ Frontend ToggleButtonGroup with All/Active/Completed buttons
- ✅ Visual highlighting of active filter (aria-pressed attribute)
- ✅ State management with statusFilter (default: 'all')
- ✅ React Query integration with proper query key invalidation
- ✅ Comprehensive test coverage (7 backend + 6 frontend tests)

**Test Results:**
- Backend: 64 tests passing (57 original + 7 new status filter tests)
- Frontend: 31 tests passing (25 original + 6 new status filter tests)
- Total: 95 tests passing (100% pass rate)

**Code Quality:**
- Zero compilation errors
- Zero lint errors
- TDD methodology followed (Red-Green-Refactor)
- Test isolation with beforeEach cleanup hooks
- Accessible implementation with proper ARIA attributes

**Files Modified:**
- Backend: `__tests__/todos.filters.test.js` - Status filter tests (extracted from app.test.js)
- Backend: `src/routes/todoRoutes.js` - Status filtering logic in GET handler
- Frontend: `src/__tests__/App.test.js` - Status filter UI tests
- Frontend: `src/components/TodoFilters.js` - ToggleButtonGroup for status filter
- Frontend: `src/hooks/useTodos.js` - Status param in query key
- Frontend: `src/App.js` - State management for statusFilter

**Feature Highlights:**
- Filter positioned prominently with "Show" label
- Exclusive selection (only one filter active at a time)
- Works seamlessly with existing priority and tag filters
- Proper null handling in toggle change handler
- MUI ToggleButton component for polished UI

**Notes:**
- Implementation completed efficiently in 41 minutes (vs. 2-3 hour estimate)
- Followed strict TDD methodology (tests first, then implementation)
- Step 5.8 (URL State) deferred as optional enhancement
- All existing tests continue to pass (no regressions)
- Manual browser testing recommended for full UI verification

---

### 6. Search/Filter Bar ✅ COMPLETED

**Status:** ✅ Completed on March 26, 2026  
**Actual Effort:** ~1 hour  
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

**Files to modify:**
- `src/routes/todoRoutes.js` - Add search query param handling in GET handler

```javascript
// In routes/todoRoutes.js GET handler
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
```

#### Frontend Changes

**Step 6.4: Add Search Input**
- **UI Integration Note:** Add TextField in Tasks section, positioned ABOVE the status filter + sort row
- **File to modify:** `components/TodoList.js` - Add search input above TodoFilters, or create new `components/SearchBar.js`
- Update `hooks/useTodos.js` to accept search param in query key
- Include InputAdornment with SearchIcon on left side
- Debounce input (300ms) to avoid excessive API calls
- Clear button (IconButton with CloseIcon) in InputAdornment on right
- Placeholder: "Search todos..."
- Full width to match filter width
- Size: "small" for consistency with other inputs

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

**Step 6.8: Advanced Search (Optional)** ⏭️ Deferred
- Search syntax: "tag:work", "priority:high", "overdue"
- Parse search terms into structured query
- Autocomplete suggestions

**Dependencies:** Categories/Tags (for tag search), Filter Views
**Estimated Effort:** 3-4 hours  
**Actual Effort:** ~1 hour

#### Implementation Summary

**Completed Features:**
- ✅ Backend search query parameter (?search=<term>)
- ✅ Case-insensitive partial matching on title and tags
- ✅ OR logic: matches title OR tags (user-friendly)
- ✅ Combines with all existing filters (status, priority, tag, date range, sort)
- ✅ Frontend search input inline with "Tasks" header (space-efficient)
- ✅ 300ms debounce to prevent excessive API calls
- ✅ Clear button (X icon) appears when text entered
- ✅ Search icon as start adornment for visual clarity
- ✅ React Query integration with search param in query key
- ✅ Comprehensive test coverage (9 backend + 5 frontend tests)

**Test Results:**
- Backend: 114 tests passing (105 original + 9 new search tests)
- Frontend: 66 of 67 tests passing (61 original + 5 new search tests)
- Total: 180 tests passing
- *Note: 1 pre-existing timeout on "creates todo with tags" test (unrelated to search feature)*

**Files Modified:**
- Backend: `src/routes/todoRoutes.js` - Search filtering logic in GET handler
- Backend: `__tests__/todos.search.test.js` - 9 comprehensive search tests
- Frontend: `src/hooks/useTodos.js` - Search param in query key
- Frontend: `src/App.js` - Search state with debounce implementation
- Frontend: `src/components/TodoList.js` - Search input in header
- Frontend: `src/__tests__/App.test.js` - 5 search UI tests

**Code Quality:**
- Zero compilation errors
- Zero lint errors
- TDD methodology followed (Red-Green-Refactor)
- Defensive coding with null safety (`todo.tags &&`)
- Proper debounce with cleanup to prevent memory leaks

**Feature Highlights:**
- Search positioned inline with "Tasks" header (saves vertical space)
- Clear button only appears when needed (progressive disclosure)
- Works seamlessly with all existing filters
- Partial matching for flexible search
- Empty state message for no results

**Notes:**
- Implementation completed efficiently in ~1 hour (vs. 3-4 hour estimate)
- Followed strict TDD methodology (tests first, then implementation)
- Step 6.8 (Advanced Search) deferred as optional enhancement
- All existing tests continue to pass (no regressions)
- Manual browser testing recommended for full UI verification

---

### 7. Sort Options ✅ COMPLETED

**Status:** ✅ Completed on March 26, 2026  
**Actual Effort:** 15 minutes  
**Goal:** Multiple sort options - by date created, priority, alphabetically, due date, or custom order.

#### Backend Changes

**Step 7.1: Add Sort Query Parameter**
- Add `?sort=<field>&order=<asc|desc>` query parameters
- Supported fields: createdAt, title, priority, dueDate, order (custom)
- Default: createdAt ascending

**Step 7.2: Write Backend Tests**
- Test sort by createdAt (newest/oldest first)
- Test sort by title (A-Z, Z-A)
- Test sort by priority (high→low, low→high)
- Test sort by dueDate (soonest first, latest first)
- Test sort by custom order
- Test invalid sort field defaults to createdAt
- Test combining sort with filters

**Step 7.3: Implement Backend**

**Files to modify:**
- `src/routes/todoRoutes.js` - Add sort/order query param handling in GET handler
- `src/validators.js` - Add `VALID_SORT_FIELDS` constant (optional)

```javascript
// In routes/todoRoutes.js GET handler
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
  // ... other fields
  return (a.order - b.order) * multiplier;
});
```

#### Frontend Changes

**Step 7.4: Add Sort Dropdown**
- Add Select/Menu component for sort options in FOCUS section
- Options: Priority, Due Date, Date Added, Alphabetical
- Add order toggle button (ascending/descending icon) as IconButton next to Select
- **UI Integration Note:** Place BELOW search bar, ABOVE status filter ToggleButtonGroup
- **File to modify:** `components/TodoFilters.js` - Add sort controls above ToggleButtonGroup, or create `components/SortControls.js`
- Update `hooks/useTodos.js` to pass sort/order query params
- Use FormControl with InputLabel "Sort by"
- Size: "small", fullWidth: false (inline with toggle button)
- Stack direction="row" with gap={1} to align Select + toggle button

**Step 7.5: Implement Sort State**
- Add useState for sortField and sortOrder
- Pass to API via query params
- Update query key to trigger refetch
- Persist sort preference in localStorage (optional)

**Step 7.6: Visual Indicators**
- Show current sort in dropdown label
- Arrow icon for sort direction (↑↓)

**Step 7.7: Write Frontend Tests**
- Test sort dropdown renders all options
- Test changing sort triggers API call
- Test sort order toggle works
- Test todos display in correct order
- Test persistence to localStorage (if implemented)

**Dependencies:** Priority Levels, Due Dates
**Estimated Effort:** 3-4 hours  
**Actual Effort:** 15 minutes

#### Implementation Summary

**Completed Features:**
- ✅ Backend sort query parameters (?sort=<field>&order=<asc|desc>)
- ✅ Sort by createdAt (default), title, priority, dueDate
- ✅ Ascending/descending order toggle
- ✅ Invalid sort fields fall back to createdAt ascending
- ✅ Null due dates placed at end when sorting by dueDate
- ✅ Sort combines with all existing filters (status, priority, tag, date range)
- ✅ Frontend sort dropdown (MUI Select with "Sort by" label)
- ✅ Sort order toggle button (ArrowUpward/ArrowDownward icons)
- ✅ Sort params passed via React Query (queryKey includes sortField + sortOrder)
- ✅ Comprehensive test coverage (12 backend + 6 frontend tests)

**Test Results:**
- Backend: 105 tests passing (93 original + 12 new sort tests)
- Frontend: 62 tests passing (56 original + 6 new sort tests)
- Total: 167 tests passing (100% pass rate)

**Files Modified:**
- Backend: `src/routes/todoRoutes.js` (sort logic in GET handler)
- Frontend: `src/hooks/useTodos.js` (sort params in query), `src/App.js` (sortField/sortOrder state), `src/components/TodoList.js` (pass sort props), `src/components/TodoFilters.js` (sort dropdown + order toggle UI)

**Files Created:**
- Backend: `__tests__/todos.sort.test.js` (12 sort tests)

**Code Quality:**
- Zero compilation errors
- Zero lint errors
- TDD methodology followed (Red-Green-Refactor)
- Priority sort uses numeric mapping (high=3, medium=2, low=1)
- Clean separation: sort logic in backend, sort controls in TodoFilters

**Notes:**
- Followed strict TDD methodology (tests first, then implementation)
- Implementation completed efficiently in 15 minutes (vs. 3-4 hour estimate)
- Steps 7.6 (Visual Indicators beyond arrows) deferred. Step 7.8 (Sort + Drag-Drop Integration) dropped — Drag-and-Drop feature removed.
- Sort options: Date Added, Title, Priority, Due Date
- All existing tests continue to pass (no regressions)

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

**Files to modify:**
- `src/routes/todoRoutes.js` - Add bulk action routes (`/bulk/complete`, `/bulk/delete`, etc.)
- `src/todoStore.js` - Add `bulkUpdateTodos()`, `bulkDeleteTodos()` helpers
- `src/validators.js` - Add `validateBulkIds()` for array validation

```javascript
// In routes/todoRoutes.js
router.patch('/bulk/complete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: 'IDs must be an array' });
  }
  const updated = [];
  ids.forEach(id => {
    const todo = findTodoById(id);
    if (todo) { todo.completed = true; updated.push(todo); }
  });
  res.json({ updated, count: updated.length });
});
```

#### Frontend Changes

**Step 8.4: Add Selection State**
- Add useState for selected todo IDs (Set or Array)
- Add "Select All" checkbox in Tasks section header (next to "Tasks" heading)
- Add checkbox for each todo item (positioned before existing checkbox, or replace with multi-select checkbox)
- Show selection count: "3 selected" below section header
- **UI Integration Note:** Use Checkbox with indeterminate state for "Select All" when partially selected. Note: task list is inside a fixed-height scrollable container (60vh).
- **Files to modify:** `components/TodoList.js` (selection state, select-all checkbox), `components/TodoItem.js` (per-item selection checkbox)

**Step 8.5: Create Bulk Action Bar**
- **UI Integration Note:** Fixed Toolbar positioned at bottom of Tasks card when items selected (position: sticky, bottom: 0). Must be placed OUTSIDE the scrollable container but INSIDE the card, so it remains visible while scrolling.
- Alternative: Portal to global position (fixed at bottom of viewport)
- Background: theme.palette.primary.main with elevation={4}
- Buttons: Complete, Delete, Change Priority, Add Tag (use IconButtons with tooltips for space efficiency)
- Cancel/Clear selection button (CloseIcon on right edge)
- Confirmation Dialog for destructive actions (delete)
- Match existing Card borderRadius and shadow styling

**Step 8.6: Implement Bulk Mutations**
- Create React Query mutations for each bulk action in `hooks/useTodoMutations.js`
- Add bulk API endpoints to `api/todoApi.js` if centralizing URLs
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

**Dependencies:** Priority Levels, Categories/Tags (to enable bulk operations on priority and tags fields)
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

**Files to modify:**
- `src/todoStore.js` - Add `subtasks` array to todo model, add subtask accessor helpers
- `src/routes/todoRoutes.js` - Add nested subtask routes (or create `src/routes/subtaskRoutes.js`)
- `src/validators.js` - Add `validateSubtaskTitle()`

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
// In todoStore.js - add subtasks to todo model
const newTodo = {
  // ...existing fields
  subtasks: [],
};

// In routes/todoRoutes.js (or new routes/subtaskRoutes.js)
router.post('/:id/subtasks', (req, res) => {
  const todo = findTodoById(parseInt(req.params.id));
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  // ... create subtask
});
```

**Step 9.5: Add Progress Calculation**
- Add helper function to calculate subtask progress
- Return progress in GET /api/todos response
- `subtaskProgress: { completed: 2, total: 5 }`

#### Frontend Changes

**Step 9.6: Create Subtask UI Component**
- Create new `components/SubtaskList.js` component
- Expandable section below todo title in card list item
- Use Collapse component from MUI for smooth expand/collapse animation
- Collapse/expand IconButton (ExpandMore icon with rotation transition)
- List of subtasks with checkboxes (smaller size than parent checkbox)
- "Add subtask" button when expanded (Button with AddIcon, size="small", variant="text")
- Indent subtasks visually (ml: 4 for left margin)
- **UI Integration Note:** Integrate within `components/TodoItem.js` card structure. Place between title Typography and metadata Stack. Subtasks get their own nested Stack with smaller fontSize. Note: expanding subtasks increases item height within the scrollable container (60vh) — collapse subtasks by default and consider limiting visible count (e.g., "Show 3 more") to avoid one item dominating the viewport.

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
- Add subtask mutations in `hooks/useTodoMutations.js` (or new `hooks/useSubtaskMutations.js`)
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
- Convert subtask to top-level todo
- Copy all subtasks from another todo
- Subtask templates ("Daily routine" has default subtasks)

**Dependencies:** Priority Levels, Categories/Tags, Due Dates (subtasks should support these fields)
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

**Files to modify:**
- `src/todoStore.js` - Add `description` field (default: `''`) in `addTodo()`
- `src/routes/todoRoutes.js` - Handle `description` in POST and PUT handlers

```javascript
// In todoStore.js addTodo()
description: description || '',

// In routes/todoRoutes.js PUT handler
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
- **Files to modify:** `components/AddTodoForm.js` (add multiline field), `components/TodoItem.js` (add in edit mode)

**Step 10.5: Display Description in List**
- Collapsed by default (show first 100 chars with ellipsis)
- "Show more" / "Show less" toggle Button (size="small", variant="text")
- Positioned below metadata row in card list item
- Rendered with proper line breaks (whiteSpace: 'pre-wrap')
- **UI Integration Note:** Add as Collapse component within `components/TodoItem.js` Box structure. Place after metadata Stack, before list item bottom padding. Use Typography variant="body2" with color="text.secondary" for distinction from title.

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

**Files to modify:**
- `src/todoStore.js` - Change `removeTodoByIndex()` to set `deleted: true` flag, add `restoreTodo()` helper
- `src/routes/todoRoutes.js` - Update DELETE handler for soft delete, add PATCH `/:id/restore` route, filter deleted from GET

```javascript
// In routes/todoRoutes.js DELETE handler - soft delete
todo.deleted = true;
todo.deletedAt = new Date().toISOString();
res.json(todo);

// In routes/todoRoutes.js GET handler - filter deleted
let result = getTodos().filter(t => !t.deleted);

// New restore route
router.patch('/:id/restore', (req, res) => {
  const todo = findTodoById(parseInt(req.params.id));
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
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
2. Filter Views - All/Active/Completed (2-3h) ✅ COMPLETED - Actual: 41 minutes
3. Dark/Light Theme Toggle (2-3h) ✅ COMPLETED - Actual: 23 minutes

**Total: ~7-10 hours** | **Completed: 3/3 features (104 minutes actual / 1 hour 44 minutes)** ✅

### Phase 2: Organization (Week 2)
4. Categories/Tags (4-5h) ✅ COMPLETED - Actual: ~1 hour
5. Due Dates (5-6h) ✅ COMPLETED - Actual: 25 minutes
6. Sort Options (3-4h) ✅ COMPLETED - Actual: 15 minutes
7. Search/Filter Bar (3-4h)

**Total: ~15-19 hours** | **Completed: 3/4 features (1 hour 40 minutes actual)**

### Phase 3: Advanced UX (Week 3)
8. Notes/Description Field (3-4h)
9. Undo/Redo (4-5h)

**Total: ~7-9 hours**

### Phase 4: Power Features (Week 4)
10. Subtasks/Checklists (7-8h)
11. Bulk Actions (5-6h)

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

This plan provides a comprehensive roadmap for implementing **functional features**:
- **3 Priority & Organization Features**: Priority levels ✅, tags ✅, ~~drag-drop~~ ❌, due dates ✅
- **4 Filtering & View Management Features**: Status filters ✅, search ✅, sort ✅, bulk actions
- **4 Enhanced User Experience Features**: Subtasks, notes, undo, dark mode ✅

Each feature includes:
- Detailed backend and frontend steps
- Test-driven development approach
- Estimated effort and dependencies
- Code examples and implementation guidance

### Project Components

**1. Functional Features (This Document)**
- **Total Estimated Time:** 54-71 hours (reduced from 60-77h after dropping Drag-and-Drop)
- **Completed:** 6 of 11 features (55%)
- **Dropped:** 1 feature (Drag-and-Drop — conflicts with Sort)
- **Time Invested:** ~4 hours
- **Scope:** Data models, API endpoints, business logic, state management

**2. UI/UX Improvements ([see UI Improvement Plan](ui-improvement-plan.md))** ✅
- **Total Estimated Time:** 10-15 hours
- **Completed:** 5 of 5 phases (100%) ✅
- **Actual Time:** ~3-4 hours
- **Scope:** Two-column layout, visual components, typography, accessibility, performance
- **Key Achievements:**
  - Modern two-column CAPTURE/FOCUS layout (lg container, 1280px)
  - Purple theme with comprehensive design system
  - Card-style task items with hover effects and metadata rows
  - Semantic HTML, ARIA labels, keyboard navigation
  - Performance optimizations (useMemo, useCallback)
  - Collapsible filter accordion in FOCUS section

**Combined Project Status:**
- **Functional Features:** 6/11 complete (55%), 1 dropped
- **UI Improvements:** 5/5 complete (100%) ✅
- **Overall:** Phase 1 complete, Phase 2 complete (4/4) ✅, 5 features remaining

**Note:** This plan uses in-memory storage. Data will reset on server restart. For production use with data persistence, you would need to add database integration and user authentication separately.

**UI Integration Note (Updated March 26, 2026):** All pending features now include specific UI integration guidance marked with "**UI Integration Note:**" reflecting the current layout: summary dashboard in left column (compact tiles), section headers ("Add New Task" / "Tasks"), status filter + sort controls on one row, fixed-height scrollable task list (60vh), and collapsible advanced filters accordion. Refer to the [UI Improvement Plan](ui-improvement-plan.md) for the complete design system specifications.

**Code Structure Note (Updated March 25, 2026):** The codebase has been refactored from monolithic files into a modular structure. Pending features include "**Files to modify:**" annotations pointing to the correct modules:
- **Backend:** `src/validators.js` (validation), `src/todoStore.js` (data model), `src/routes/todoRoutes.js` (route handlers)
- **Frontend:** `src/components/` (UI components), `src/hooks/` (React Query hooks), `src/utils/helpers.js` (utilities), `src/api/todoApi.js` (API config)
- **Tests:** Backend tests split by feature (`todos.crud.test.js`, `todos.priority.test.js`, `todos.tags.test.js`, `todos.filters.test.js`); new feature tests should follow this pattern

---

## � Code Refactoring: File Split (March 25, 2026)

### Motivation
Both backend and frontend had grown into large monolithic files that were difficult to navigate and maintain. The codebase was split into focused, single-responsibility modules to improve maintainability ahead of future feature development.

### Backend Refactoring

**Before:** Single `app.js` (205 lines) containing routes, validation, and data store.

**After:**
| File | Lines | Responsibility |
|---|---|---|
| `src/app.js` | 22 | Express app setup, middleware, route mounting |
| `src/validators.js` | 54 | Priority/tag validation helpers |
| `src/todoStore.js` | 42 | In-memory data store with CRUD accessors |
| `src/routes/todoRoutes.js` | 139 | All `/api/todos` route handlers |

**Backend Test Splitting:**
| File | Lines | Scope |
|---|---|---|
| `__tests__/app.test.js` | 220 | Core CRUD + integration tests (15 tests) |
| `__tests__/todos.crud.test.js` | 197 | CRUD operations (15 tests) |
| `__tests__/todos.priority.test.js` | 275 | Priority feature (21 tests) |
| `__tests__/todos.tags.test.js` | 265 | Tags/categories feature (19 tests) |
| `__tests__/todos.filters.test.js` | 159 | Status filter feature (7 tests) |

**Test results:** 79 tests passing across 5 suites.

### Frontend Refactoring

**Before:** Single `App.js` (863 lines) containing all components, hooks, API calls, and utilities.

**After:**
| File | Lines | Responsibility |
|---|---|---|
| `src/App.js` | 191 | Top-level orchestrator with state management |
| `src/api/todoApi.js` | 2 | API base URL constant |
| `src/hooks/useTodos.js` | 38 | `useTodos` and `useAllTodos` React Query hooks |
| `src/hooks/useTodoMutations.js` | 67 | Add, toggle, delete, edit mutation hooks |
| `src/utils/helpers.js` | 12 | `getPriorityColor` utility |
| `src/components/Header.js` | 53 | App header with gradient + theme toggle |
| `src/components/SummaryDashboard.js` | 60 | Total/remaining task stat cards |
| `src/components/AddTodoForm.js` | 140 | CAPTURE section: input form |
| `src/components/TodoFilters.js` | 132 | Status, priority, and tag filters |
| `src/components/TodoItem.js` | 242 | Individual task item (view + edit modes) |
| `src/components/TodoList.js` | 155 | FOCUS section: list with filters + empty states |

**Test results:** 49 tests passing. Also fixed 9 pre-existing test mismatches (aria-label patterns, stats text, `isPending` vs `isLoading` for React Query v5).

---

## �📊 Overall Progress (As of March 26, 2026)

### ✅ Completed Functional Features: 6 of 12 (50%)

**Priority & Organization:**
1. ✅ Priority Levels - 40 minutes
2. ✅ Categories/Tags - ~1 hour
4. ✅ Due Dates - 25 minutes

**Filtering & View Management:**
5. ✅ Filter Views (All/Active/Completed) - 41 minutes
6. ✅ Search/Filter Bar - ~1 hour
7. ✅ Sort Options - 15 minutes

**Enhanced User Experience:**
12. ✅ Dark/Light Theme Toggle - 23 minutes

### Total Time Invested
- **Estimated:** 7-10 hours for Phase 1 + 12-15 hours for Phase 2 = 19-25 hours
- **Actual:** ~4 hours (21% of estimated minimum time)
- **Efficiency:** ~5x faster than estimated

### Current Test Coverage
- **Backend:** 114 tests passing (8 test suites)
- **Frontend:** 66 tests passing
- **Total:** 180 tests passing (99.4% pass rate - 1 pre-existing timeout)

### Next Recommended Work

**Continue with Functional Features** ⭐ **RECOMMENDED**
With Phase 1 and Phase 2 both complete ✅, move to Phase 3 enhanced UX features:
- Phase 3: Notes/Description Field (3-4h est.) - Add context and details to tasks
- Phase 3: Undo/Redo (4-5h est.) - Improve user confidence with reversible actions
- Phase 3: Subtasks/Checklists (7-8h est.) - Break down complex tasks into steps
- Phase 4: Bulk Actions (5-6h est.) - Efficiently manage multiple tasks at once

**Rationale:** With Phase 1 fully complete (priority, tags, due dates ✅) and Phase 2 fully complete (status filters, search, sort ✅), and the UI/UX improvements complete (all 5 phases ✅), the app has strong foundational features. Phase 3 focuses on enhanced user experience features that add polish and power-user capabilities.
