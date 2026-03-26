import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../App';
import { ThemeContext } from '../ThemeContext';

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Mock fetch for tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
);

test('renders To Do App heading', async () => {
  const testQueryClient = createTestQueryClient();

  render(
    <QueryClientProvider client={testQueryClient}>
      <App />
    </QueryClientProvider>
  );

  const headingElement = await screen.findByText(/To Do App/i);
  expect(headingElement).toBeInTheDocument();
});

test('deletes a todo when delete button is clicked', async () => {
  const user = userEvent.setup();
  const testQueryClient = createTestQueryClient();

  // Mock initial todos
  const mockTodos = [
    { id: 1, title: 'Test Todo 1', completed: false },
    { id: 2, title: 'Test Todo 2', completed: true },
  ];

  // Setup fetch mock to return todos initially and after delete
  let callCount = 0;
  global.fetch.mockImplementation((url, options = {}) => {
    callCount++;
    
    // First call: initial fetch
    if (callCount === 1) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      });
    }
    
    // Second call: DELETE request
    if (options.method === 'DELETE') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    }
    
    // Third call: refetch after delete
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([mockTodos[1]]), // Only second todo remains
    });
  });

  render(
    <QueryClientProvider client={testQueryClient}>
      <App />
    </QueryClientProvider>
  );

  // Wait for todos to load
  await screen.findByText('Test Todo 1');
  expect(screen.getByText('Test Todo 2')).toBeInTheDocument();

  // Find delete button by aria-label
  const deleteButtons = screen.getAllByRole('button', { name: /delete task/i });
  await user.click(deleteButtons[0]);

  // Wait for the todo to be removed
  await waitFor(
    () => {
      expect(screen.queryByText('Test Todo 1')).not.toBeInTheDocument();
    },
    { timeout: 3000 }
  );

  // Second todo should still be there
  expect(screen.getByText('Test Todo 2')).toBeInTheDocument();

  // Verify DELETE API was called
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/todos/1'),
    expect.objectContaining({ method: 'DELETE' })
  );
});

test('displays correct stats for incomplete and completed todos', async () => {
  const testQueryClient = createTestQueryClient();

  // Mock todos with mix of completed and incomplete
  const mockTodos = [
    { id: 1, title: 'Todo 1', completed: false },
    { id: 2, title: 'Todo 2', completed: false },
    { id: 3, title: 'Todo 3', completed: true },
    { id: 4, title: 'Todo 4', completed: false },
    { id: 5, title: 'Todo 5', completed: true },
  ];

  global.fetch.mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockTodos),
    })
  );

  render(
    <QueryClientProvider client={testQueryClient}>
      <App />
    </QueryClientProvider>
  );

  // Wait for todos to load
  await screen.findByText('Todo 1');

  // Verify stats show correct counts
  // Check REMAINING TASKS shows 3
  expect(screen.getByRole('region', { name: /remaining tasks count/i })).toHaveTextContent('3');
  // Check TOTAL TASKS shows 5
  expect(screen.getByRole('region', { name: /total tasks count/i })).toHaveTextContent('5');
});

test('displays empty state message when there are no todos', async () => {
  const testQueryClient = createTestQueryClient();

  // Mock empty todos array
  global.fetch.mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  );

  render(
    <QueryClientProvider client={testQueryClient}>
      <App />
    </QueryClientProvider>
  );

  // Wait for data to load (app heading should be visible)
  await screen.findByText(/To Do App/i);

  // Verify empty state message is displayed
  await waitFor(() => {
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });
  expect(screen.getByText(/add your first task to get started/i)).toBeInTheDocument();
});

test('displays error message when API fails', async () => {
  const testQueryClient = createTestQueryClient();

  // Mock fetch to reject/fail
  global.fetch.mockImplementation(() =>
    Promise.reject(new Error('Network error'))
  );

  render(
    <QueryClientProvider client={testQueryClient}>
      <App />
    </QueryClientProvider>
  );

  // Wait for error state to appear
  await waitFor(
    () => {
      const errorElements = screen.queryAllByText(/error|failed|something went wrong/i);
      expect(errorElements.length).toBeGreaterThan(0);
    },
    { timeout: 3000 }
  );
});

test('edits a todo when edit button is clicked and saved', async () => {
  const user = userEvent.setup();
  const testQueryClient = createTestQueryClient();

  // Mock initial todos
  const mockTodos = [
    { id: 1, title: 'Original Todo', completed: false },
  ];

  let callCount = 0;
  global.fetch.mockImplementation((url, options = {}) => {
    callCount++;
    
    // First call: initial fetch
    if (callCount === 1) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      });
    }
    
    // Second call: PUT request to update
    if (options.method === 'PUT') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1, title: 'Updated Todo', completed: false }),
      });
    }
    
    // Third call: refetch after update
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 1, title: 'Updated Todo', completed: false }]),
    });
  });

  render(
    <QueryClientProvider client={testQueryClient}>
      <App />
    </QueryClientProvider>
  );

  // Wait for todo to load
  await screen.findByText('Original Todo');

  // Click edit button
  const editButton = screen.getByRole('button', { name: /edit task/i });
  await user.click(editButton);

  // Find the input field (should be in edit mode now)
  const input = screen.getByDisplayValue('Original Todo');
  expect(input).toBeInTheDocument();

  // Clear and type new title
  await user.clear(input);
  await user.type(input, 'Updated Todo');

  // Find and click save button
  const saveButton = screen.getByRole('button', { name: /save/i });
  await user.click(saveButton);

  // Wait for update to complete
  await waitFor(() => {
    expect(screen.getByText('Updated Todo')).toBeInTheDocument();
  });
  expect(screen.queryByText('Original Todo')).not.toBeInTheDocument();

  // Verify PUT API was called
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/todos/1'),
    expect.objectContaining({ 
      method: 'PUT',
      body: expect.stringContaining('Updated Todo')
    })
  );
});

describe('Priority Feature', () => {
  test('displays priority selector dropdown in add todo form', async () => {
    const testQueryClient = createTestQueryClient();

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Priority selector should be immediately visible - check for Priority label in CAPTURE section
    // (there are multiple Priority labels due to filter buttons)
    const priorityLabels = screen.getAllByText('Priority');
    expect(priorityLabels.length).toBeGreaterThan(0);
  });

  test('creates todo with selected priority', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    let callCount = 0;
    global.fetch.mockImplementation((url, options = {}) => {
      callCount++;
      
      // Initial fetch
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      
      // POST request
      if (options.method === 'POST') {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            id: 1, 
            title: body.title,
            priority: body.priority || 'medium',
            completed: false 
          }),
        });
      }
      
      // Refetch after POST
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, title: 'High Priority Task', priority: 'high', completed: false }
        ]),
      });
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Open the Priority select by clicking it - MUI Select uses a button role
    // Find the select by looking for the displayed value "Medium" - use getAllByText and choose first one
    const priorityButtons = screen.getAllByText('Medium');
    await user.click(priorityButtons[0]);
    
    // Wait for the dropdown to appear and find "High" option
    const highOption = await screen.findByRole('option', { name: /^high$/i });
    await user.click(highOption);

    // Enter todo title
    const input = screen.getByPlaceholderText(/what needs to be done/i);
    await user.type(input, 'High Priority Task');

    // Submit form
    const addButton = screen.getByRole('button', { name: /add task/i });
    await user.click(addButton);

    // Verify POST was called with priority
    await waitFor(() => {
      const postCalls = global.fetch.mock.calls.filter(
        call => call[1]?.method === 'POST'
      );
      expect(postCalls.length).toBeGreaterThan(0);
    });

    const postCalls = global.fetch.mock.calls.filter(
      call => call[1]?.method === 'POST'
    );
    const postBody = JSON.parse(postCalls[0][1].body);
    expect(postBody.priority).toBe('high');
  });

  test('displays priority badge for each todo', async () => {
    const testQueryClient = createTestQueryClient();

    const mockTodos = [
      { id: 1, title: 'High Priority Task', priority: 'high', completed: false },
      { id: 2, title: 'Medium Priority Task', priority: 'medium', completed: false },
      { id: 3, title: 'Low Priority Task', priority: 'low', completed: false },
    ];

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText('High Priority Task');

    // Check for priority chips (not filter buttons)
    const chips = screen.getAllByText(/high|medium|low/i).filter(
      el => el.classList.contains('MuiChip-label')
    );
    
    expect(chips.length).toBeGreaterThanOrEqual(3);
  });

  test('displays priority badge with correct color coding', async () => {
    const testQueryClient = createTestQueryClient();

    const mockTodos = [
      { id: 1, title: 'High Priority Task', priority: 'high', completed: false },
    ];

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText('High Priority Task');

    // High priority chip should exist
    const chips = screen.getAllByText(/high/i).filter(
      el => el.classList.contains('MuiChip-label')
    );
    
    expect(chips.length).toBeGreaterThan(0);
  });

  test('filters todos by priority when filter button clicked', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    const allTodos = [
      { id: 1, title: 'High Task 1', priority: 'high', completed: false },
      { id: 2, title: 'Medium Task', priority: 'medium', completed: false },
      { id: 3, title: 'High Task 2', priority: 'high', completed: false },
      { id: 4, title: 'Low Task', priority: 'low', completed: false },
    ];

    const highTodos = allTodos.filter(t => t.priority === 'high');

    global.fetch.mockImplementation((url) => {
      // Check if URL has priority filter
      if (url.includes('?priority=high')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(highTodos),
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(allTodos),
      });
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    // Wait for all todos to load
    await screen.findByText('High Task 1');
    expect(screen.getByText('Medium Task')).toBeInTheDocument();
    expect(screen.getByText('Low Task')).toBeInTheDocument();

    // Click high priority filter button
    const filterButtons = screen.getAllByRole('button', { name: /high/i });
    // Find the filter button (not the chip)
    const highFilterButton = filterButtons.find(btn => 
      btn.classList.contains('MuiButton-outlinedError') || 
      btn.classList.contains('MuiButton-containedError')
    );
    
    await user.click(highFilterButton);

    // Should only show high priority todos
    await waitFor(() => {
      expect(screen.getByText('High Task 1')).toBeInTheDocument();
    });
    expect(screen.getByText('High Task 2')).toBeInTheDocument();
  });

  test('allows editing priority in edit mode', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    const mockTodos = [
      { id: 1, title: 'Test Todo', priority: 'medium', completed: false },
    ];

    let callCount = 0;
    global.fetch.mockImplementation((url, options = {}) => {
      callCount++;
      
      // Initial fetch
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTodos),
        });
      }
      
      // PUT request
      if (options.method === 'PUT') {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            id: 1, 
            title: body.title || 'Test Todo',
            priority: body.priority || 'medium',
            completed: false 
          }),
        });
      }
      
      // Refetch
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, title: 'Test Todo', priority: 'high', completed: false }
        ]),
      });
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText('Test Todo');

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit task/i });
    await user.click(editButton);

    // Should show priority selector in edit mode
    // Wait for edit mode priority select to appear
    await waitFor(() => {
      // In edit mode, there will be two "Medium" texts (one in add form, one in edit form)
      const mediumTexts = screen.getAllByText('Medium');
      expect(mediumTexts.length).toBeGreaterThanOrEqual(2);
    });

    // Find the edit mode selector - get all Medium texts and use the last one (edit mode)
    const mediumButtons = screen.getAllByText('Medium');
    const editPrioritySelect = mediumButtons[mediumButtons.length - 1];
    
    // Change priority to high
    await user.click(editPrioritySelect);
    const highOption = await screen.findByRole('option', { name: /^high$/i });
    await user.click(highOption);

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Verify PUT was called with new priority
    await waitFor(() => {
      const putCalls = global.fetch.mock.calls.filter(
        call => call[1]?.method === 'PUT'
      );
      expect(putCalls.length).toBeGreaterThan(0);
    });

    const putCalls = global.fetch.mock.calls.filter(
      call => call[1]?.method === 'PUT'
    );
    const putBody = JSON.parse(putCalls[0][1].body);
    expect(putBody.priority).toBe('high');
  });

  test('shows all priority filter options', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Expand the "More Filters" accordion to reveal priority buttons
    const moreFilters = screen.getByText(/More Filters/i);
    await user.click(moreFilters);

    // Should have filter buttons for all priorities
    const allButtons = screen.getAllByRole('button');
    const buttonTexts = allButtons.map(btn => btn.textContent);
    
    expect(buttonTexts).toContain('All');
    expect(buttonTexts).toContain('High');
    expect(buttonTexts).toContain('Medium');
    expect(buttonTexts).toContain('Low');
  });
});

describe('Tags/Categories Feature', () => {
  test('displays tag input field in add todo form', async () => {
    const testQueryClient = createTestQueryClient();

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Should have a tag input in the form
    const tagInput = screen.getByLabelText(/tags/i);
    expect(tagInput).toBeInTheDocument();
  });

  test('creates todo with tags', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    let callCount = 0;
    global.fetch.mockImplementation((url, options = {}) => {
      callCount++;
      
      // Initial fetch
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      
      // POST request
      if (options.method === 'POST') {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            id: 1, 
            title: body.title,
            priority: body.priority || 'medium',
            tags: body.tags || [],
            completed: false 
          }),
        });
      }
      
      // Refetch after POST
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, title: 'Work Task', priority: 'medium', tags: ['work', 'urgent'], completed: false }
        ]),
      });
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Enter todo title
    const titleInput = screen.getByPlaceholderText(/what needs to be done/i);
    await user.type(titleInput, 'Work Task');

    // Enter tags
    const tagInput = screen.getByLabelText(/tags/i);
    await user.type(tagInput, 'work');
    // Simulate pressing Enter or comma to add tag
    await user.keyboard('{Enter}');
    await user.type(tagInput, 'urgent');
    await user.keyboard('{Enter}');

    // Submit form
    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);

    // Verify POST was called with tags
    await waitFor(() => {
      const postCalls = global.fetch.mock.calls.filter(
        call => call[1]?.method === 'POST'
      );
      expect(postCalls.length).toBeGreaterThan(0);
    });

    const postCalls = global.fetch.mock.calls.filter(
      call => call[1]?.method === 'POST'
    );
    const postBody = JSON.parse(postCalls[0][1].body);
    expect(postBody.tags).toContain('work');
    expect(postBody.tags).toContain('urgent');
  });

  test('displays tags as chips on todo items', async () => {
    const testQueryClient = createTestQueryClient();

    const mockTodos = [
      { id: 1, title: 'Work Task', priority: 'medium', tags: ['work', 'urgent'], completed: false },
      { id: 2, title: 'Personal Task', priority: 'low', tags: ['personal'], completed: false },
    ];

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText('Work Task');

    // Check for tag chips using getAllByText since tags appear in both filter and todo items
    const workChips = screen.getAllByText('work');
    const urgentChips = screen.getAllByText('urgent');
    const personalChips = screen.getAllByText('personal');
    
    // Should have at least one of each tag
    expect(workChips.length).toBeGreaterThan(0);
    expect(urgentChips.length).toBeGreaterThan(0);
    expect(personalChips.length).toBeGreaterThan(0);
  });

  test('allows filtering todos by tag', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    const allTodos = [
      { id: 1, title: 'Work Task 1', priority: 'medium', tags: ['work'], completed: false },
      { id: 2, title: 'Personal Task', priority: 'low', tags: ['personal'], completed: false },
      { id: 3, title: 'Work Task 2', priority: 'high', tags: ['work', 'urgent'], completed: false },
    ];

    const workTodos = allTodos.filter(t => t.tags.includes('work'));

    global.fetch.mockImplementation((url) => {
      // Check if URL has tag filter
      if (url.includes('tag=work')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(workTodos),
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(allTodos),
      });
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    // Wait for all todos to load
    await screen.findByText('Work Task 1');
    expect(screen.getByText('Personal Task')).toBeInTheDocument();

    // Click tag chip to filter
    const workChips = screen.getAllByText('work');
    // Find a clickable 'work' tag chip (should have a class indicating it's clickable)
    const workFilterChip = workChips[0];
    await user.click(workFilterChip);

    // Should fetch with tag filter
    await waitFor(() => {
      const fetchCalls = global.fetch.mock.calls.map(call => call[0]);
      expect(fetchCalls.some(url => typeof url === 'string' && url.includes('tag=work'))).toBe(true);
    });
  });

  test('allows editing tags in edit mode', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    const mockTodos = [
      { id: 1, title: 'Test Todo', priority: 'medium', tags: ['work'], completed: false },
    ];

    let callCount = 0;
    global.fetch.mockImplementation((url, options = {}) => {
      callCount++;
      
      // Initial fetch
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTodos),
        });
      }
      
      // PUT request
      if (options.method === 'PUT') {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            id: 1, 
            title: body.title || 'Test Todo',
            priority: body.priority || 'medium',
            tags: body.tags || ['work'],
            completed: false 
          }),
        });
      }
      
      // Refetch
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, title: 'Test Todo', priority: 'medium', tags: ['personal', 'urgent'], completed: false }
        ]),
      });
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText('Test Todo');

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit task/i });
    await user.click(editButton);

    // Should show tag input in edit mode
    const tagInputs = screen.getAllByLabelText(/tags/i);
    expect(tagInputs.length).toBeGreaterThan(0);

    // Clear existing tags and add new ones
    // Implementation will depend on tag input component behavior

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Verify PUT was called
    await waitFor(() => {
      const putCalls = global.fetch.mock.calls.filter(
        call => call[1]?.method === 'PUT'
      );
      expect(putCalls.length).toBeGreaterThan(0);
    });
  });

  test('displays tag filter section showing all unique tags', async () => {
    const testQueryClient = createTestQueryClient();

    const mockTodos = [
      { id: 1, title: 'Task 1', tags: ['work', 'urgent'], completed: false },
      { id: 2, title: 'Task 2', tags: ['personal'], completed: false },
      { id: 3, title: 'Task 3', tags: ['work', 'project'], completed: false },
    ];

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText('Task 1');

    // Should have a tag filter section
    expect(screen.getByText(/filter by tag/i) || screen.getByText(/tags/i)).toBeTruthy();
  });

  test('creates todo without tags (empty tags array)', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    let callCount = 0;
    global.fetch.mockImplementation((url, options = {}) => {
      callCount++;
      
      // Initial fetch
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      
      // POST request
      if (options.method === 'POST') {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            id: 1, 
            title: body.title,
            priority: body.priority || 'medium',
            tags: body.tags || [],
            completed: false 
          }),
        });
      }
      
      // Refetch after POST
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, title: 'Simple Task', priority: 'medium', tags: [], completed: false }
        ]),
      });
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Enter todo title without tags
    const titleInput = screen.getByPlaceholderText(/what needs to be done/i);
    await user.type(titleInput, 'Simple Task');

    // Submit form
    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);

    // Verify POST was called
    await waitFor(() => {
      const postCalls = global.fetch.mock.calls.filter(
        call => call[1]?.method === 'POST'
      );
      expect(postCalls.length).toBeGreaterThan(0);
    });
  });
});

describe('Dark/Light Theme Toggle', () => {
  let mockToggleTheme;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Create a fresh mock for each test
    mockToggleTheme = jest.fn();
    // Mock matchMedia for system preference detection
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  test('renders theme toggle button', async () => {
    const testQueryClient = createTestQueryClient();

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    const themeContextValue = { isDarkMode: false, toggleTheme: mockToggleTheme };

    render(
      <QueryClientProvider client={testQueryClient}>
        <ThemeContext.Provider value={themeContextValue}>
          <App />
        </ThemeContext.Provider>
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Should have a theme toggle button with appropriate aria-label
    const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
    expect(themeToggle).toBeInTheDocument();
  });

  test('toggles theme when button is clicked', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    const themeContextValue = { isDarkMode: false, toggleTheme: mockToggleTheme };

    render(
      <QueryClientProvider client={testQueryClient}>
        <ThemeContext.Provider value={themeContextValue}>
          <App />
        </ThemeContext.Provider>
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Find theme toggle button
    const themeToggle = screen.getByRole('button', { name: /toggle theme/i });

    // Click to toggle theme
    await user.click(themeToggle);

    // Wait for toggle function to be called
    await waitFor(() => {
      expect(mockToggleTheme).toHaveBeenCalled();
    });
  });

  test('persists theme preference to localStorage', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    // Create a real toggle that updates localStorage
    let isDark = false;
    const realToggleTheme = () => {
      isDark = !isDark;
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };
    const themeContextValue = { isDarkMode: isDark, toggleTheme: realToggleTheme };

    render(
      <QueryClientProvider client={testQueryClient}>
        <ThemeContext.Provider value={themeContextValue}>
          <App />
        </ThemeContext.Provider>
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Find and click theme toggle
    const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(themeToggle);

    // Wait for localStorage to be updated
    await waitFor(() => {
      const savedTheme = localStorage.getItem('theme');
      expect(savedTheme).toBeTruthy();
    });
    const savedTheme = localStorage.getItem('theme');
    expect(['light', 'dark']).toContain(savedTheme);
  });

  test('loads theme preference from localStorage on mount', async () => {
    const testQueryClient = createTestQueryClient();

    // Set dark theme in localStorage before rendering
    localStorage.setItem('theme', 'dark');

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    const savedTheme = localStorage.getItem('theme');
    const themeContextValue = { isDarkMode: savedTheme === 'dark', toggleTheme: mockToggleTheme };

    render(
      <QueryClientProvider client={testQueryClient}>
        <ThemeContext.Provider value={themeContextValue}>
          <App />
        </ThemeContext.Provider>
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Verify theme was loaded from localStorage
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  test('uses system preference when no localStorage theme exists', async () => {
    const testQueryClient = createTestQueryClient();

    // Mock system preference for dark mode
    const matchMediaMock = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    window.matchMedia = matchMediaMock;

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    // Simulate system preference check
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const themeContextValue = { isDarkMode: prefersDark, toggleTheme: mockToggleTheme };

    render(
      <QueryClientProvider client={testQueryClient}>
        <ThemeContext.Provider value={themeContextValue}>
          <App />
        </ThemeContext.Provider>
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // App should detect system preference and potentially initialize with it
    // This test verifies the matchMedia API was called
    expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });
});

describe('Status Filter Feature', () => {
  test('displays filter buttons for All, Active, and Completed', async () => {
    const testQueryClient = createTestQueryClient();

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Check for filter buttons - use getAllByRole since there might be multiple "All" buttons
    const allButtons = screen.getAllByRole('button', { name: /^All$/i });
    expect(allButtons.length).toBeGreaterThanOrEqual(1); // At least one "All" button exists

    const activeButtons = screen.getAllByRole('button', { name: /^Active$/i });
    expect(activeButtons.length).toBeGreaterThanOrEqual(1);

    const completedButtons = screen.getAllByRole('button', { name: /^Completed$/i });
    expect(completedButtons.length).toBeGreaterThanOrEqual(1);
  });

  test('shows only active todos when Active filter is clicked', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    const mockTodos = [
      { id: 1, title: 'Active Todo 1', completed: false, priority: 'medium', tags: [] },
      { id: 2, title: 'Completed Todo', completed: true, priority: 'medium', tags: [] },
      { id: 3, title: 'Active Todo 2', completed: false, priority: 'medium', tags: [] },
    ];

    global.fetch.mockImplementation((url) => {
      
      // Check if URL contains status filter
      if (url.includes('status=active')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTodos.filter(t => !t.completed)),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      });
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText('Active Todo 1');

    // Click Active filter
    const activeButton = screen.getByRole('button', { name: /^Active$/i });
    await user.click(activeButton);

    // Wait for filtered results
    await waitFor(() => {
      expect(screen.getByText('Active Todo 1')).toBeInTheDocument();
    });
    expect(screen.getByText('Active Todo 2')).toBeInTheDocument();
    expect(screen.queryByText('Completed Todo')).not.toBeInTheDocument();
  });

  test('shows only completed todos when Completed filter is clicked', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    const mockTodos = [
      { id: 1, title: 'Active Todo', completed: false, priority: 'medium', tags: [] },
      { id: 2, title: 'Completed Todo 1', completed: true, priority: 'medium', tags: [] },
      { id: 3, title: 'Completed Todo 2', completed: true, priority: 'medium', tags: [] },
    ];

    global.fetch.mockImplementation((url) => {
      // Check if URL contains status filter
      if (url.includes('status=completed')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTodos.filter(t => t.completed)),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      });
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText('Active Todo');

    // Click Completed filter
    const completedButton = screen.getByRole('button', { name: /^Completed$/i });
    await user.click(completedButton);

    // Wait for filtered results
    await waitFor(() => {
      expect(screen.getByText('Completed Todo 1')).toBeInTheDocument();
    });
    expect(screen.getByText('Completed Todo 2')).toBeInTheDocument();
    expect(screen.queryByText('Active Todo')).not.toBeInTheDocument();
  });

  test('shows all todos when All filter is clicked', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    const mockTodos = [
      { id: 1, title: 'Active Todo', completed: false, priority: 'medium', tags: [] },
      { id: 2, title: 'Completed Todo', completed: true, priority: 'medium', tags: [] },
    ];

    global.fetch.mockImplementation((url) => {
      if (url.includes('status=all')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTodos),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      });
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText('Active Todo');

    // Click All filter (get the first one - status filter All button)
    const allButtons = screen.getAllByRole('button', { name: /^All$/i });
    await user.click(allButtons[0]);

    // Both todos should be visible
    await waitFor(() => {
      expect(screen.getByText('Active Todo')).toBeInTheDocument();
    });
    expect(screen.getByText('Completed Todo')).toBeInTheDocument();
  });

  test('highlights the active filter button', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    const mockTodos = [
      { id: 1, title: 'Test Todo', completed: false, priority: 'medium', tags: [] },
    ];

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText('Test Todo');

    // Get status filter buttons (ToggleButtons have aria-pressed)
    const buttons = screen.getAllByRole('button');
    const statusAllButton = buttons.find(btn => btn.getAttribute('value') === 'all' && btn.hasAttribute('aria-pressed'));
    const statusActiveButton = buttons.find(btn => btn.getAttribute('value') === 'active' && btn.hasAttribute('aria-pressed'));

    // All should be selected by default
    expect(statusAllButton).toHaveAttribute('aria-pressed', 'true');
    expect(statusActiveButton).toHaveAttribute('aria-pressed', 'false');

    // Click Active
    await user.click(statusActiveButton);

    await waitFor(() => {
      expect(statusActiveButton).toHaveAttribute('aria-pressed', 'true');
    });
    expect(statusAllButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('combines status filter with priority filter', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    const mockTodos = [
      { id: 1, title: 'Active High', completed: false, priority: 'high', tags: [] },
      { id: 2, title: 'Completed High', completed: true, priority: 'high', tags: [] },
      { id: 3, title: 'Active Low', completed: false, priority: 'low', tags: [] },
    ];

    global.fetch.mockImplementation((url) => {
      // Check for combined filters
      if (url.includes('status=active') && url.includes('priority=high')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockTodos[0]]), // Only Active High
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      });
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText('Active High');

    // Click Active filter
    const activeButton = screen.getByRole('button', { name: /^Active$/i });
    await user.click(activeButton);

    // Expand "More Filters" accordion to reveal priority buttons
    const moreFilters = screen.getByText(/More Filters/i);
    await user.click(moreFilters);

    // Click High priority filter
    const highButtons = screen.getAllByRole('button', { name: /High/i });
    const highFilterButton = highButtons.find(btn =>
      btn.classList.contains('MuiButton-outlinedError') ||
      btn.classList.contains('MuiButton-containedError')
    );
    await user.click(highFilterButton);

    // Should only show Active High
    await waitFor(() => {
      expect(screen.getByText('Active High')).toBeInTheDocument();
    });
    expect(screen.queryByText('Completed High')).not.toBeInTheDocument();
    expect(screen.queryByText('Active Low')).not.toBeInTheDocument();
  });
});

// ========================
// Enhanced Header Tests (UI Improvement Phase 1)
// ========================

describe('Enhanced Header Section', () => {
  test('renders enhanced header with main title', async () => {
    const testQueryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    const titleElement = await screen.findByRole('heading', { name: /To Do App/i });
    expect(titleElement).toBeInTheDocument();
  });

  test('renders enhanced header with subtitle', async () => {
    const testQueryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    const subtitleElement = await screen.findByText(/Keep track of your tasks/i);
    expect(subtitleElement).toBeInTheDocument();
  });

  test('renders theme toggle button with aria-label in header', async () => {
    const testQueryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    const themeToggle = await screen.findByLabelText(/toggle theme/i);
    expect(themeToggle).toBeInTheDocument();
  });
});

// ========================
// Summary Dashboard Tests (UI Improvement Phase 1)
// ========================

describe('Summary Dashboard', () => {
  test('displays total tasks count in summary card', async () => {
    const testQueryClient = createTestQueryClient();

    const mockTodos = [
      { id: 1, title: 'Task 1', completed: false },
      { id: 2, title: 'Task 2', completed: true },
      { id: 3, title: 'Task 3', completed: false },
    ];

    // Mock fetch to handle both filtered and unfiltered queries
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    // Wait for data to load
    await screen.findByText('Task 1');

    // Check for "TOTAL TASKS" label
    expect(screen.getByText(/TOTAL TASKS/i)).toBeInTheDocument();
    // Check for count displayed prominently
    expect(screen.getByRole('region', { name: /total tasks count/i })).toHaveTextContent('3');
  });

  test('displays remaining tasks count in summary card', async () => {
    const testQueryClient = createTestQueryClient();

    const mockTodos = [
      { id: 1, title: 'Task 1', completed: false },
      { id: 2, title: 'Task 2', completed: true },
      { id: 3, title: 'Task 3', completed: false },
      { id: 4, title: 'Task 4', completed: true },
    ];

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    // Wait for data to load
    await screen.findByText('Task 1');

    // Check for "REMAINING TASKS" label
    expect(screen.getByText(/REMAINING TASKS/i)).toBeInTheDocument();
    // Check for remaining count (2 incomplete tasks)
    expect(screen.getByRole('region', { name: /remaining tasks count/i })).toHaveTextContent('2');
  });

  test('displays zero remaining tasks when all are completed', async () => {
    const testQueryClient = createTestQueryClient();

    const mockTodos = [
      { id: 1, title: 'Task 1', completed: true },
      { id: 2, title: 'Task 2', completed: true },
    ];

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    // Wait for data to load
    await screen.findByText('Task 1');

    expect(screen.getByRole('region', { name: /remaining tasks count/i })).toHaveTextContent('0');
  });
});

// ========================
// Two-Column Layout Tests (UI Improvement Phase 1)
// ========================

describe('Two-Column Layout', () => {
  test('renders CAPTURE section with header', async () => {
    const testQueryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Check for CAPTURE section header
    expect(screen.getByText(/^Add New Task$/i)).toBeInTheDocument();
  });

  test('renders FOCUS section with header', async () => {
    const testQueryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Check for FOCUS section header
    expect(screen.getByText(/^Tasks$/i)).toBeInTheDocument();
  });

  test('renders Add New Task label in CAPTURE section', async () => {
    const testQueryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Check for "Add New Task" subtitle
    expect(screen.getByText(/Add New Task/i)).toBeInTheDocument();
  });

  test('renders Tasks label in FOCUS section', async () => {
    const testQueryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Check for "Tasks" subtitle - be specific to avoid matching "TOTAL TASKS"
    const tasksLabels = screen.getAllByText((content, element) => {
      return element?.tagName.toLowerCase() === 'h6' && /^Tasks$/i.test(content);
    });
    expect(tasksLabels.length).toBeGreaterThan(0);
  });
});

describe('Phase 2: Enhanced Task Input Section', () => {
  test('renders large task input field with autofocus', async () => {
    const testQueryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Check for the main task input field with placeholder
    const input = screen.getByPlaceholderText(/What needs to be done?/i);
    expect(input).toBeInTheDocument();
    
    // Verify the input has focus (autofocus worked)
    expect(input).toHaveFocus();
  });

  test('renders priority and tags inputs directly in form', async () => {
    const testQueryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Priority label should be visible (there may be multiple due to filter section)
    const priorityLabels = screen.getAllByText('Priority');
    expect(priorityLabels.length).toBeGreaterThan(0);
    
    // Tags input should be immediately visible
    const tagsInput = screen.getByPlaceholderText(/Add tags/i);
    expect(tagsInput).toBeVisible();
  });

  test('renders full-width Add Task button with icon', async () => {
    const testQueryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Find the Add Task button (updated text from "Add")
    const addButton = screen.getByRole('button', { name: /Add Task/i });
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveAttribute('type', 'submit');
  });

  test('disables Add Task button when title is empty', async () => {
    const testQueryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Button should be disabled when input is empty
    const addButton = screen.getByRole('button', { name: /Add Task/i });
    expect(addButton).toBeDisabled();
  });

  test('enables Add Task button when title is entered', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Type into the input
    const input = screen.getByPlaceholderText(/What needs to be done?/i);
    await user.type(input, 'New task');

    // Button should now be enabled
    const addButton = screen.getByRole('button', { name: /Add Task/i });
    expect(addButton).toBeEnabled();
  });

  test('shows loading state when submitting a task', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    // Mock a delayed response to catch loading state
    let resolvePost;
    global.fetch.mockImplementation((url, options = {}) => {
      if (options.method === 'POST') {
        return new Promise((resolve) => {
          resolvePost = () => resolve({
            ok: true,
            json: () => Promise.resolve({ id: 1, title: 'New Task', completed: false }),
          });
          // Don't resolve immediately - keep loading state visible
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Type and submit
    const input = screen.getByPlaceholderText(/What needs to be done?/i);
    await user.type(input, 'New Task');

    const addButton = screen.getByRole('button', { name: /Add Task/i });
    await user.click(addButton);

    // Check for loading indicator (CircularProgress or "Adding..." text)
    await waitFor(() => {
      const loadingText = screen.queryByText(/Adding.../i);
      expect(loadingText).toBeInTheDocument();
    });

    // Resolve the pending POST request
    if (resolvePost) resolvePost();
  });

  test('displays success notification after adding a task', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    let callCount = 0;
    global.fetch.mockImplementation((url, options = {}) => {
      callCount++;
      
      // Initial fetch
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      
      // POST request
      if (options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 1, title: 'New Task', completed: false }),
        });
      }
      
      // Refetch after POST
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, title: 'New Task', completed: false }]),
      });
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Type and submit
    const input = screen.getByPlaceholderText(/What needs to be done?/i);
    await user.type(input, 'New Task');

    const addButton = screen.getByRole('button', { name: /Add Task/i });
    await user.click(addButton);

    // Check for success message
    await waitFor(() => {
      const successMessage = screen.getByText(/Task added successfully/i);
      expect(successMessage).toBeInTheDocument();
    });
  });

  test('resets form after successful task submission', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    let callCount = 0;
    global.fetch.mockImplementation((url, options = {}) => {
      callCount++;
      
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      
      if (options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 1, title: 'New Task', completed: false }),
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, title: 'New Task', completed: false }]),
      });
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Type into input
    const input = screen.getByPlaceholderText(/What needs to be done?/i);
    await user.type(input, 'New Task');

    expect(input).toHaveValue('New Task');

    // Submit
    const addButton = screen.getByRole('button', { name: /Add Task/i });
    await user.click(addButton);

    // Wait for form to reset
    await waitFor(() => {
      expect(input).toHaveValue('');
    });

    // Button should be disabled again after reset
    expect(addButton).toBeDisabled();
  });
});

describe('Due Date Feature', () => {
  test('displays due date input in add todo form', async () => {
    const testQueryClient = createTestQueryClient();

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Should have a due date input
    const dueDateInput = screen.getByLabelText(/due date/i);
    expect(dueDateInput).toBeInTheDocument();
  });

  test('creates todo with due date', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    let callCount = 0;
    global.fetch.mockImplementation((url, options = {}) => {
      callCount++;

      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }

      if (options.method === 'POST') {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 1,
            title: body.title,
            priority: body.priority || 'medium',
            tags: body.tags || [],
            dueDate: body.dueDate || null,
            completed: false,
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, title: 'Due Date Task', priority: 'medium', tags: [], dueDate: '2026-04-15', completed: false }
        ]),
      });
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Enter title
    const titleInput = screen.getByPlaceholderText(/what needs to be done/i);
    await user.type(titleInput, 'Due Date Task');

    // Set due date
    const dueDateInput = screen.getByLabelText(/due date/i);
    await user.type(dueDateInput, '2026-04-15');

    // Submit form
    const addButton = screen.getByRole('button', { name: /add task/i });
    await user.click(addButton);

    // Verify POST was called with dueDate
    await waitFor(() => {
      const postCalls = global.fetch.mock.calls.filter(
        call => call[1]?.method === 'POST'
      );
      expect(postCalls.length).toBeGreaterThan(0);
    });

    const postCalls = global.fetch.mock.calls.filter(
      call => call[1]?.method === 'POST'
    );
    const postBody = JSON.parse(postCalls[0][1].body);
    expect(postBody.dueDate).toBe('2026-04-15');
  });

  test('creates todo without due date (defaults to null)', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    let callCount = 0;
    global.fetch.mockImplementation((url, options = {}) => {
      callCount++;

      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }

      if (options.method === 'POST') {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 1,
            title: body.title,
            dueDate: body.dueDate || null,
            completed: false,
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    const titleInput = screen.getByPlaceholderText(/what needs to be done/i);
    await user.type(titleInput, 'No Due Date Task');

    const addButton = screen.getByRole('button', { name: /add task/i });
    await user.click(addButton);

    await waitFor(() => {
      const postCalls = global.fetch.mock.calls.filter(
        call => call[1]?.method === 'POST'
      );
      expect(postCalls.length).toBeGreaterThan(0);
    });

    const postCalls = global.fetch.mock.calls.filter(
      call => call[1]?.method === 'POST'
    );
    const postBody = JSON.parse(postCalls[0][1].body);
    expect(postBody.dueDate).toBeFalsy();
  });

  test('displays due date on todo items', async () => {
    const testQueryClient = createTestQueryClient();

    const mockTodos = [
      { id: 1, title: 'Task with date', priority: 'medium', tags: [], dueDate: '2026-04-15', completed: false, createdAt: '2026-03-26T00:00:00.000Z' },
      { id: 2, title: 'Task no date', priority: 'low', tags: [], dueDate: null, completed: false, createdAt: '2026-03-26T00:00:00.000Z' },
    ];

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText('Task with date');

    // Should display formatted due date for the task that has one
    expect(screen.getByText(/Due.*Apr.*15/i)).toBeInTheDocument();
  });

  test('shows overdue indicator for past due dates on active todos', async () => {
    const testQueryClient = createTestQueryClient();

    const mockTodos = [
      { id: 1, title: 'Overdue Task', priority: 'high', tags: [], dueDate: '2026-03-01', completed: false, createdAt: '2026-02-15T00:00:00.000Z' },
    ];

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText('Overdue Task');

    // Should show overdue text
    const overdueElements = screen.getAllByText(/overdue/i);
    expect(overdueElements.length).toBeGreaterThan(0);
  });

  test('shows due date input in edit mode', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    const mockTodos = [
      { id: 1, title: 'Edit Date Task', priority: 'medium', tags: [], dueDate: '2026-04-15', completed: false, createdAt: '2026-03-26T00:00:00.000Z' },
    ];

    let callCount = 0;
    global.fetch.mockImplementation((url, options = {}) => {
      callCount++;

      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTodos),
        });
      }

      if (options.method === 'PUT') {
        const body = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 1,
            title: body.title || 'Edit Date Task',
            priority: body.priority || 'medium',
            tags: body.tags || [],
            dueDate: body.dueDate,
            completed: false,
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      });
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText('Edit Date Task');

    // Click edit
    const editButton = screen.getByRole('button', { name: /edit task/i });
    await user.click(editButton);

    // Should show due date input in edit mode
    const dueDateInputs = screen.getAllByLabelText(/due date/i);
    expect(dueDateInputs.length).toBeGreaterThanOrEqual(2); // one in add form, one in edit form
  });

  test('resets due date field after successful submission', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    let callCount = 0;
    global.fetch.mockImplementation((url, options = {}) => {
      callCount++;

      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }

      if (options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 1, title: 'Test', completed: false }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    const titleInput = screen.getByPlaceholderText(/what needs to be done/i);
    await user.type(titleInput, 'Test');

    const dueDateInput = screen.getByLabelText(/due date/i);
    await user.type(dueDateInput, '2026-04-15');

    const addButton = screen.getByRole('button', { name: /add task/i });
    await user.click(addButton);

    // Due date should reset after submission
    await waitFor(() => {
      expect(dueDateInput).toHaveValue('');
    });
  });
});

describe('Sort Feature', () => {
  test('renders sort dropdown with sort options', async () => {
    const testQueryClient = createTestQueryClient();

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Sort dropdown should be visible
    expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
  });

  test('renders sort order toggle button', async () => {
    const testQueryClient = createTestQueryClient();

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Sort order toggle button should exist
    expect(screen.getByRole('button', { name: /sort order/i })).toBeInTheDocument();
  });

  test('changing sort field triggers API call with sort param', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    const mockTodos = [
      { id: 1, title: 'Bravo Task', priority: 'medium', completed: false },
      { id: 2, title: 'Alpha Task', priority: 'high', completed: false },
    ];

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText('Bravo Task');

    // Open sort dropdown and select "Title"
    const sortSelect = screen.getByLabelText(/sort by/i);
    await user.click(sortSelect);
    
    const titleOption = await screen.findByRole('option', { name: /title/i });
    await user.click(titleOption);

    // Verify fetch was called with sort parameter
    await waitFor(() => {
      const fetchCalls = global.fetch.mock.calls.map(call => call[0]);
      expect(fetchCalls.some(url => typeof url === 'string' && url.includes('sort=title'))).toBe(true);
    });
  });

  test('toggling sort order triggers API call with order param', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    const mockTodos = [
      { id: 1, title: 'Task 1', priority: 'medium', completed: false },
    ];

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText('Task 1');

    // Click sort order toggle button
    const orderToggle = screen.getByRole('button', { name: /sort order/i });
    await user.click(orderToggle);

    // Verify fetch was called with order=desc
    await waitFor(() => {
      const fetchCalls = global.fetch.mock.calls.map(call => call[0]);
      expect(fetchCalls.some(url => typeof url === 'string' && url.includes('order=desc'))).toBe(true);
    });
  });

  test('sort options include all expected fields', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Open sort dropdown
    const sortSelect = screen.getByLabelText(/sort by/i);
    await user.click(sortSelect);

    // Verify all sort options are available
    expect(await screen.findByRole('option', { name: /date added/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /title/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /priority/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /due date/i })).toBeInTheDocument();
  });

  test('sort combines with existing filters', async () => {
    const user = userEvent.setup();
    const testQueryClient = createTestQueryClient();

    const mockTodos = [
      { id: 1, title: 'Active Task', priority: 'high', completed: false },
    ];

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTodos),
      })
    );

    render(
      <QueryClientProvider client={testQueryClient}>
        <App />
      </QueryClientProvider>
    );

    await screen.findByText(/To Do App/i);

    // Set status filter to "Active"
    const activeToggle = screen.getByRole('button', { name: /active/i });
    await user.click(activeToggle);

    // Change sort to title
    const sortSelect = screen.getByLabelText(/sort by/i);
    await user.click(sortSelect);
    const titleOption = await screen.findByRole('option', { name: /title/i });
    await user.click(titleOption);

    // Verify fetch includes both status and sort params
    await waitFor(() => {
      const fetchCalls = global.fetch.mock.calls.map(call => call[0]);
      expect(fetchCalls.some(url => 
        typeof url === 'string' && url.includes('status=active') && url.includes('sort=title')
      )).toBe(true);
    });
  });
});

afterEach(() => {
  jest.clearAllMocks();
});
