# Patterns Discovered

This file documents recurring code patterns, solutions, and conventions discovered during development. These patterns help maintain consistency and guide future implementation.

**Purpose**: Accumulate reusable knowledge that applies across the project.

---

## Pattern Template

```markdown
## Pattern: [Pattern Name]

**Context**: When/where this pattern applies

**Problem**: What problem this pattern solves

**Solution**: How to implement the pattern

**Example**:
```language
// Code example showing the pattern
```

**Related files**: 
- List of files using this pattern
- Documentation references

**Notes**: Additional considerations, variants, or warnings
```

---

## Discovered Patterns

### Pattern: Service Data Initialization

**Context**: When initializing data structures in service modules (backend)

**Problem**: Need consistent approach for initializing empty collections - should we use empty arrays or null values?

**Solution**: Use **empty arrays** for collection initialization, not null

**Rationale**:
- Avoids null checks in consumer code
- Array methods (map, filter, find) work immediately
- Consistent with JavaScript best practices
- Reduces potential for null reference errors

**Example**:
```javascript
// ✅ GOOD - Use empty array
let todos = [];

// ❌ AVOID - Using null requires checks
let todos = null;
// Later: if (todos) { todos.map(...) } // Extra null check needed
```

**Related files**:
- `packages/backend/src/app.js` - todos array initialization
- Future service modules should follow same pattern

**Notes**: 
- This applies to in-memory data structures and API responses
- Database results may still return null - handle at the data layer

---

<!-- Add new patterns below this line as they are discovered -->

<!--
Examples of future patterns to document:

## Pattern: API Error Response Format
## Pattern: Request Validation Middleware
## Pattern: React Component State Management
## Pattern: Test Fixture Creation
## Pattern: API Route Organization
-->

## Pattern: React Query Mutation with Cache Invalidation

**Context**: When performing create, update, or delete operations in React with React Query

**Problem**: After mutating data via API, the UI needs to reflect changes without manual state management

**Solution**: Use `useMutation` with `onSuccess` callback that invalidates relevant queries

**Example**:
```javascript
const queryClient = useQueryClient();

const deleteTodoMutation = useMutation({
  mutationFn: async (id) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  },
  onSuccess: () => {
    // Invalidate and refetch todos query
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});

// Usage
const handleDelete = (id) => {
  deleteTodoMutation.mutate(id);
};
```

**Related files**:
- App.js - All mutations (add, delete, edit, toggle)

**Notes**: 
- Always invalidate queries in `onSuccess`, not in the mutation function
- Use specific queryKey to avoid over-fetching
- React Query handles loading states and error states automatically

---

## Pattern: Accessible Icon Buttons with Testing Library

**Context**: When creating icon buttons that need to be tested with React Testing Library

**Problem**: Icon buttons without labels fail accessibility checks and are hard to query in tests

**Solution**: Add `aria-label` to IconButtons and use `getByRole` with name matcher in tests

**Example**:
```javascript
// Component
<IconButton
  size="small"
  color="error"
  onClick={() => handleDelete(id)}
  aria-label="delete todo"
>
  <DeleteIcon />
</IconButton>

// Test
const deleteButtons = screen.getAllByRole('button', { name: /delete todo/i });
await user.click(deleteButtons[0]);
```

**Anti-pattern (avoid)**:
```javascript
// ❌ BAD - No aria-label
<IconButton onClick={...}>
  <DeleteIcon />
</IconButton>

// ❌ BAD - Using DOM traversal in tests
const deleteIcon = screen.getByTestId('DeleteIcon');
await user.click(deleteIcon.closest('button')); // Lint error!
```

**Related files**:
- App.js - Edit and Delete IconButtons
- App.test.js - Button click tests

**Notes**:
- Testing Library lint rule `testing-library/no-node-access` prevents `.closest()`, `.querySelector()`, etc.
- Accessible buttons benefit both automated tests and screen reader users
- Use descriptive aria-labels that indicate the action and target

---

## Pattern: Conditional Edit Mode UI

**Context**: When implementing inline editing for list items

**Problem**: Need to toggle between display mode and edit mode without navigation

**Solution**: Use state to track editing ID and conditionally render TextField or Typography

**Example**:
```javascript
const [editingId, setEditingId] = useState(null);
const [editingTitle, setEditingTitle] = useState('');

// In render
{editingId === todo.id ? (
  // Edit mode
  <>
    <TextField
      value={editingTitle}
      onChange={(e) => setEditingTitle(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && handleSave()}
      autoFocus
    />
    <IconButton onClick={handleSave} aria-label="save">
      <CheckIcon />
    </IconButton>
    <IconButton onClick={handleCancel} aria-label="cancel">
      <CloseIcon />
    </IconButton>
  </>
) : (
  // Display mode
  <>
    <Typography>{todo.title}</Typography>
    <IconButton onClick={() => handleStartEdit(todo)} aria-label="edit todo">
      <EditIcon />
    </IconButton>
  </>
)}
```

**Related files**:
- App.js - Edit todo functionality

**Notes**:
- Store both `editingId` and `editingTitle` separately to avoid mutating props
- Use `autoFocus` on TextField for better UX
- Support Enter key to save, Escape to cancel (optional enhancement)
- Disable other actions (like checkbox) while editing

---

## Pattern: Error Handling in React Query

**Context**: When fetching data with React Query that might fail

**Problem**: Network errors or API failures need to be caught and displayed to users

**Solution**: Check `response.ok`, throw errors in queryFn, destructure `error` from useQuery, conditionally render error UI

**Example**:
```javascript
// Query with error handling
const useTodos = () => {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      return response.json();
    },
  });
};

// Component
const { data: todos = [], isLoading, error } = useTodos();

// Error UI
{error && (
  <Box sx={{ textAlign: 'center', py: 4, color: 'error.main' }}>
    <Typography variant="h6">Something went wrong</Typography>
    <Typography variant="body2">{error.message}</Typography>
  </Box>
)}
```

**Related files**:
- App.js - useTodos query and error UI
- App.test.js - Error handling test

**Notes**:
- Always check `response.ok` before calling `response.json()`
- React Query automatically catches thrown errors and sets `error` state
- Provide user-friendly error messages, not technical stack traces
- Consider retry logic for transient failures (React Query supports this)

---

## Pattern: Relative API URLs for Portability

**Context**: When making API calls in a React app that needs to run in different environments (localhost, Codespaces, production)

**Problem**: Hardcoded `http://localhost:3001` URLs fail in Codespaces and other environments

**Solution**: Use relative URLs with proxy configuration in package.json

**Example**:
```javascript
// ✅ GOOD - Relative URL
const API_URL = '/api/todos';

// package.json (frontend)
{
  "proxy": "http://localhost:3001"
}

// ❌ AVOID - Hardcoded URL
const API_URL = 'http://localhost:3001/api/todos';
```

**Related files**:
- App.js - API_URL constant
- package.json - proxy configuration

**Notes**:
- In development, CRA proxy forwards `/api` requests to backend
- In production, both frontend and backend typically run on same domain
- Environment variables can be used for different proxy targets if needed
- This pattern works with any backend API, not just Express

---

## Pattern: TDD Red-Green-Refactor Cycle

**Context**: When implementing new features or fixing bugs

**Problem**: Need systematic approach to ensure code correctness and test coverage

**Solution**: Follow strict Red-Green-Refactor cycle - write failing test first, implement minimal code to pass, then refactor

**Example**:
```javascript
// 🔴 RED - Write failing test first
test('deletes a todo when delete button is clicked', async () => {
  // Setup and expectations that will fail
  const deleteButtons = screen.getAllByRole('button', { name: /delete todo/i });
  await user.click(deleteButtons[0]);
  
  await waitFor(() => {
    expect(screen.queryByText('Test Todo 1')).not.toBeInTheDocument();
  });
  
  // Verify API called
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/todos/1'),
    expect.objectContaining({ method: 'DELETE' })
  );
});

// Run test - it FAILS (no delete implementation exists)

// 🟢 GREEN - Implement minimal code to pass
const deleteTodoMutation = useMutation({
  mutationFn: async (id) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});

// Run test - it PASSES

// 🔵 REFACTOR - Clean up while keeping tests green
// Add error handling, improve naming, extract helpers
// Run tests after each refactor to ensure they still pass
```

**Related files**:
- All test files follow this pattern
- App.test.js - Frontend TDD examples

**Notes**:
- ALWAYS write the test first - this is the core TDD principle
- Don't skip the RED phase - verify the test actually fails
- Implement minimal code in GREEN phase - don't over-engineer
- Refactor with confidence because tests verify behavior unchanged
- Run tests after EVERY change

---

## Pattern: Systematic Error Resolution by Category

**Context**: When facing multiple linting errors or test failures

**Problem**: Fixing errors randomly is inefficient and can introduce new issues

**Solution**: Categorize errors by type, fix all instances of one category at a time, verify after each category

**Example**:
```bash
# 1. Gather all errors
npm run lint 2>&1 | tee lint-errors.txt

# 2. Categorize errors
# - no-unused-vars: 5 instances
# - no-console: 8 instances
# - react-hooks/exhaustive-deps: 3 instances

# 3. Fix by category
# Fix all no-unused-vars errors
# Run: npm run lint (verify category resolved)

# Fix all no-console errors  
# Run: npm run lint (verify category resolved)

# Fix all react-hooks/exhaustive-deps errors
# Run: npm run lint (verify category resolved)

# 4. Final verification
npm run lint # Should show 0 errors
npm test # Ensure no regressions
```

**Related files**:
- Applied to both frontend and backend in Step 5-2

**Notes**:
- Systematic approach is faster than random fixes
- Prevents fix-one-break-another scenarios
- Creates reusable knowledge for similar errors
- Document patterns for frequently occurring error types
- Always run tests after fixing lint to catch regressions

---

## Pattern: Single Assertion in waitFor

**Context**: When writing async tests with React Testing Library

**Problem**: ESLint rule `testing-library/no-wait-for-multiple-assertions` flags multiple assertions in waitFor

**Solution**: Use waitFor for the async assertion that needs to resolve, place synchronous assertions outside

**Example**:
```javascript
// ✅ GOOD - Single assertion in waitFor
await waitFor(() => {
  expect(screen.getByText('Updated Todo')).toBeInTheDocument();
});
expect(screen.queryByText('Original Todo')).not.toBeInTheDocument();

// ❌ AVOID - Multiple assertions in waitFor
await waitFor(() => {
  expect(screen.getByText('Updated Todo')).toBeInTheDocument();
  expect(screen.queryByText('Original Todo')).not.toBeInTheDocument(); // Lint error!
});
```

**Related files**:
- App.test.js - All async tests

**Notes**:
- `waitFor` should only contain the assertion that needs polling
- Synchronous checks can happen immediately after waitFor resolves
- This makes tests more explicit about what is async vs sync
- Improves test performance by not polling for already-resolved conditions

---

## Pattern: Test Isolation with Mock Reset

**Context**: When writing multiple tests that share mock implementations

**Problem**: Mock state from one test can leak into another test, causing flaky tests

**Solution**: Reset mocks in `afterEach` hook to ensure test isolation

**Example**:
```javascript
// Mock setup
global.fetch = jest.fn();

test('test 1', async () => {
  global.fetch.mockImplementationOnce(() => 
    Promise.resolve({ json: () => Promise.resolve([...]) })
  );
  // ... test code
});

test('test 2', async () => {
  // Without reset, test 2 might see mock state from test 1
  global.fetch.mockImplementationOnce(() => 
    Promise.resolve({ json: () => Promise.resolve([...]) })
  );
  // ... test code
});

// ✅ SOLUTION - Reset after each test
afterEach(() => {
  jest.clearAllMocks(); // Clears call counts and mock state
});
```

**Related files**:
- App.test.js - Uses afterEach cleanup
- app.test.js - Uses beforeEach/afterEach for data reset

**Notes**:
- `jest.clearAllMocks()` - Clears mock call history and state
- `jest.resetAllMocks()` - Also removes mock implementations
- `jest.restoreAllMocks()` - Restores original non-mocked implementation
- Always clean up in afterEach, not beforeEach (allows debugging last test)
- Test isolation prevents "works alone, fails in suite" issues

---


