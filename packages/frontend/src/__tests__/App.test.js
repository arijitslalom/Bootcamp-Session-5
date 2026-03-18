import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../App';

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

afterEach(() => {
  jest.clearAllMocks();
});
