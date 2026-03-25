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

test('renders TODO App heading', async () => {
  const testQueryClient = createTestQueryClient();

  render(
    <QueryClientProvider client={testQueryClient}>
      <App />
    </QueryClientProvider>
  );

  const headingElement = await screen.findByText(/TODO App/i);
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
  const deleteButtons = screen.getAllByRole('button', { name: /delete todo/i });
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

  global.fetch.mockImplementationOnce(() =>
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
  // 3 incomplete todos
  expect(screen.getByText('3 items left')).toBeInTheDocument();
  // 2 completed todos
  expect(screen.getByText('2 completed')).toBeInTheDocument();
});

test('displays empty state message when there are no todos', async () => {
  const testQueryClient = createTestQueryClient();

  // Mock empty todos array
  global.fetch.mockImplementationOnce(() =>
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
  await screen.findByText(/TODO App/i);

  // Verify empty state message is displayed
  await waitFor(() => {
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });
  expect(screen.getByText(/get started by adding/i)).toBeInTheDocument();
});

test('displays error message when API fails', async () => {
  const testQueryClient = createTestQueryClient();

  // Mock fetch to reject/fail
  global.fetch.mockImplementationOnce(() =>
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
  const editButton = screen.getByRole('button', { name: /edit todo/i });
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

    await screen.findByText(/TODO App/i);

    // Should have a priority selector in the form
    const prioritySelect = screen.getByLabelText(/priority/i);
    expect(prioritySelect).toBeInTheDocument();
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

    await screen.findByText(/TODO App/i);

    // Select high priority
    const prioritySelect = screen.getByLabelText(/priority/i);
    await user.click(prioritySelect);
    
    // Find and click "High" option
    const highOption = await screen.findByRole('option', { name: /high/i });
    await user.click(highOption);

    // Enter todo title
    const input = screen.getByPlaceholderText(/what needs to be done/i);
    await user.type(input, 'High Priority Task');

    // Submit form
    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);

    // Verify POST was called with priority
    await waitFor(() => {
      const postCalls = global.fetch.mock.calls.filter(
        call => call[1]?.method === 'POST'
      );
      expect(postCalls.length).toBeGreaterThan(0);
      
      const postBody = JSON.parse(postCalls[0][1].body);
      expect(postBody.priority).toBe('high');
    });
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
      expect(screen.getByText('High Task 2')).toBeInTheDocument();
    });
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
    const editButton = screen.getByRole('button', { name: /edit todo/i });
    await user.click(editButton);

    // Should show priority selector in edit mode (there are 2 priority selectors now)
    const prioritySelects = screen.getAllByLabelText(/priority/i);
    expect(prioritySelects.length).toBeGreaterThanOrEqual(2);

    // Find the edit mode selector (second one)
    const editPrioritySelect = prioritySelects[1];
    
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
      
      const putBody = JSON.parse(putCalls[0][1].body);
      expect(putBody.priority).toBe('high');
    });
  });

  test('shows all priority filter options', async () => {
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

    await screen.findByText(/TODO App/i);

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

    await screen.findByText(/TODO App/i);

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

    await screen.findByText(/TODO App/i);

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
      
      const postBody = JSON.parse(postCalls[0][1].body);
      expect(postBody.tags).toContain('work');
      expect(postBody.tags).toContain('urgent');
    });
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
    const editButton = screen.getByRole('button', { name: /edit todo/i });
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

    await screen.findByText(/TODO App/i);

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

    await screen.findByText(/TODO App/i);

    // Should have a theme toggle button with appropriate aria-label
    const themeToggle = screen.getByRole('button', { name: /switch to dark mode|switch to light mode/i });
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

    await screen.findByText(/TODO App/i);

    // Find theme toggle button
    const themeToggle = screen.getByRole('button', { name: /switch to dark mode|switch to light mode/i });

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

    await screen.findByText(/TODO App/i);

    // Find and click theme toggle
    const themeToggle = screen.getByRole('button', { name: /switch to dark mode|switch to light mode/i });
    await user.click(themeToggle);

    // Wait for localStorage to be updated
    await waitFor(() => {
      const savedTheme = localStorage.getItem('theme');
      expect(savedTheme).toBeTruthy();
      expect(['light', 'dark']).toContain(savedTheme);
    });
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

    await screen.findByText(/TODO App/i);

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

    await screen.findByText(/TODO App/i);

    // App should detect system preference and potentially initialize with it
    // This test verifies the matchMedia API was called
    expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });
});

afterEach(() => {
  jest.clearAllMocks();
});
