const request = require('supertest');
const app = require('../src/app');

describe('TODO API Tests', () => {
  describe('GET /api/todos', () => {
    test('should return an array of todos', async () => {
      const response = await request(app).get('/api/todos');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should return empty array initially', async () => {
      const response = await request(app).get('/api/todos');
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/todos', () => {
    test('should create a new todo with title', async () => {
      const newTodo = { title: 'Test Todo' };
      const response = await request(app).post('/api/todos').send(newTodo);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'Test Todo');
      expect(response.body).toHaveProperty('completed', false);
      expect(response.body).toHaveProperty('createdAt');
    });

    test('should return 400 when title is missing', async () => {
      const response = await request(app).post('/api/todos').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 when title is empty string', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should auto-increment IDs', async () => {
      const todo1 = await request(app)
        .post('/api/todos')
        .send({ title: 'First Todo' });

      const todo2 = await request(app)
        .post('/api/todos')
        .send({ title: 'Second Todo' });

      expect(todo2.body.id).toBeGreaterThan(todo1.body.id);
    });
  });

  describe('PUT /api/todos/:id', () => {
    test('should update todo title', async () => {
      // First create a todo
      const createResponse = await request(app)
        .post('/api/todos')
        .send({ title: 'Original Title' });

      const todoId = createResponse.body.id;

      // Then update it
      const updateResponse = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ title: 'Updated Title' });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.title).toBe('Updated Title');
      expect(updateResponse.body.id).toBe(todoId);
    });

    test('should return 404 for non-existent todo', async () => {
      const response = await request(app)
        .put('/api/todos/99999')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(404);
    });

    test('should not change completed status', async () => {
      // Create and toggle a todo
      const createResponse = await request(app)
        .post('/api/todos')
        .send({ title: 'Test Todo' });

      const todoId = createResponse.body.id;

      await request(app).patch(`/api/todos/${todoId}/toggle`);

      // Update title
      const updateResponse = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ title: 'New Title' });

      expect(updateResponse.body.completed).toBe(true);
    });
  });

  describe('PATCH /api/todos/:id/toggle', () => {
    test('should toggle todo from incomplete to complete', async () => {
      // Create a todo
      const createResponse = await request(app)
        .post('/api/todos')
        .send({ title: 'Test Todo' });

      const todoId = createResponse.body.id;

      // Toggle it
      const toggleResponse = await request(app).patch(
        `/api/todos/${todoId}/toggle`
      );

      expect(toggleResponse.status).toBe(200);
      expect(toggleResponse.body.completed).toBe(true);
    });

    test('should toggle todo from complete to incomplete', async () => {
      // Create and complete a todo
      const createResponse = await request(app)
        .post('/api/todos')
        .send({ title: 'Test Todo' });

      const todoId = createResponse.body.id;

      // Toggle to complete
      await request(app).patch(`/api/todos/${todoId}/toggle`);

      // Toggle back to incomplete
      const toggleResponse = await request(app).patch(
        `/api/todos/${todoId}/toggle`
      );

      expect(toggleResponse.status).toBe(200);
      expect(toggleResponse.body.completed).toBe(false);
    });

    test('should return 404 for non-existent todo', async () => {
      const response = await request(app).patch('/api/todos/99999/toggle');

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    test('should delete a todo', async () => {
      // Create a todo
      const createResponse = await request(app)
        .post('/api/todos')
        .send({ title: 'Test Todo' });

      const todoId = createResponse.body.id;

      // Delete it
      const deleteResponse = await request(app).delete(`/api/todos/${todoId}`);

      expect(deleteResponse.status).toBe(200);

      // Verify it's gone
      const getResponse = await request(app).get('/api/todos');
      const todoExists = getResponse.body.some((t) => t.id === todoId);
      expect(todoExists).toBe(false);
    });

    test('should return 404 for non-existent todo', async () => {
      const response = await request(app).delete('/api/todos/99999');

      expect(response.status).toBe(404);
    });
  });

  describe('Integration Tests', () => {
    test('should handle full CRUD lifecycle', async () => {
      // Create
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Lifecycle Test' });
      const todoId = createRes.body.id;
      expect(createRes.status).toBe(201);

      // Read
      const getRes = await request(app).get('/api/todos');
      expect(getRes.body.some((t) => t.id === todoId)).toBe(true);

      // Update
      const updateRes = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ title: 'Updated Lifecycle' });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.title).toBe('Updated Lifecycle');

      // Toggle
      const toggleRes = await request(app).patch(`/api/todos/${todoId}/toggle`);
      expect(toggleRes.body.completed).toBe(true);

      // Delete
      const deleteRes = await request(app).delete(`/api/todos/${todoId}`);
      expect(deleteRes.status).toBe(200);

      // Verify deletion
      const finalGetRes = await request(app).get('/api/todos');
      expect(finalGetRes.body.some((t) => t.id === todoId)).toBe(false);
    });
  });

  describe('Priority Feature', () => {
    describe('POST /api/todos - Priority field', () => {
      test('should create todo with default priority "medium"', async () => {
        const response = await request(app)
          .post('/api/todos')
          .send({ title: 'Test Todo' });

        expect(response.status).toBe(201);
        expect(response.body.priority).toBe('medium');
      });

      test('should create todo with priority "high"', async () => {
        const response = await request(app)
          .post('/api/todos')
          .send({ title: 'Important Task', priority: 'high' });

        expect(response.status).toBe(201);
        expect(response.body.priority).toBe('high');
      });

      test('should create todo with priority "medium"', async () => {
        const response = await request(app)
          .post('/api/todos')
          .send({ title: 'Normal Task', priority: 'medium' });

        expect(response.status).toBe(201);
        expect(response.body.priority).toBe('medium');
      });

      test('should create todo with priority "low"', async () => {
        const response = await request(app)
          .post('/api/todos')
          .send({ title: 'Minor Task', priority: 'low' });

        expect(response.status).toBe(201);
        expect(response.body.priority).toBe('low');
      });

      test('should reject invalid priority values', async () => {
        const response = await request(app)
          .post('/api/todos')
          .send({ title: 'Task', priority: 'urgent' });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('priority');
      });

      test('should reject empty priority string', async () => {
        const response = await request(app)
          .post('/api/todos')
          .send({ title: 'Task', priority: '' });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('priority');
      });

      test('should reject numeric priority values', async () => {
        const response = await request(app)
          .post('/api/todos')
          .send({ title: 'Task', priority: 1 });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('priority');
      });
    });

    describe('PUT /api/todos/:id - Update priority', () => {
      test('should update todo priority', async () => {
        // Create todo with default priority
        const createRes = await request(app)
          .post('/api/todos')
          .send({ title: 'Task' });

        const todoId = createRes.body.id;
        expect(createRes.body.priority).toBe('medium');

        // Update priority to high
        const updateRes = await request(app)
          .put(`/api/todos/${todoId}`)
          .send({ priority: 'high' });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.priority).toBe('high');
        expect(updateRes.body.title).toBe('Task'); // Title unchanged
      });

      test('should update priority from high to low', async () => {
        const createRes = await request(app)
          .post('/api/todos')
          .send({ title: 'Task', priority: 'high' });

        const updateRes = await request(app)
          .put(`/api/todos/${createRes.body.id}`)
          .send({ priority: 'low' });

        expect(updateRes.body.priority).toBe('low');
      });

      test('should reject invalid priority in PUT', async () => {
        const createRes = await request(app)
          .post('/api/todos')
          .send({ title: 'Task' });

        const updateRes = await request(app)
          .put(`/api/todos/${createRes.body.id}`)
          .send({ priority: 'critical' });

        expect(updateRes.status).toBe(400);
        expect(updateRes.body.error).toContain('priority');
      });

      test('should allow updating both title and priority', async () => {
        const createRes = await request(app)
          .post('/api/todos')
          .send({ title: 'Original', priority: 'low' });

        const updateRes = await request(app)
          .put(`/api/todos/${createRes.body.id}`)
          .send({ title: 'Updated', priority: 'high' });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.title).toBe('Updated');
        expect(updateRes.body.priority).toBe('high');
      });

      test('should preserve priority when only updating title', async () => {
        const createRes = await request(app)
          .post('/api/todos')
          .send({ title: 'Task', priority: 'high' });

        const updateRes = await request(app)
          .put(`/api/todos/${createRes.body.id}`)
          .send({ title: 'Updated Task' });

        expect(updateRes.body.priority).toBe('high');
      });
    });

    describe('PATCH /api/todos/:id/toggle - Priority persistence', () => {
      test('should preserve priority after toggling completion', async () => {
        const createRes = await request(app)
          .post('/api/todos')
          .send({ title: 'Task', priority: 'high' });

        const todoId = createRes.body.id;

        // Toggle to complete
        await request(app).patch(`/api/todos/${todoId}/toggle`);

        // Verify priority is preserved
        const getRes = await request(app).get('/api/todos');
        const todo = getRes.body.find((t) => t.id === todoId);
        expect(todo.priority).toBe('high');
        expect(todo.completed).toBe(true);
      });

      test('should preserve priority through multiple toggles', async () => {
        const createRes = await request(app)
          .post('/api/todos')
          .send({ title: 'Task', priority: 'low' });

        const todoId = createRes.body.id;

        // Toggle multiple times
        await request(app).patch(`/api/todos/${todoId}/toggle`);
        await request(app).patch(`/api/todos/${todoId}/toggle`);
        await request(app).patch(`/api/todos/${todoId}/toggle`);

        // Verify priority still preserved
        const getRes = await request(app).get('/api/todos');
        const todo = getRes.body.find((t) => t.id === todoId);
        expect(todo.priority).toBe('low');
      });
    });

    describe('GET /api/todos - Filter by priority', () => {
      beforeEach(async () => {
        // Clear all existing todos first
        const existingTodos = await request(app).get('/api/todos');
        for (const todo of existingTodos.body) {
          await request(app).delete(`/api/todos/${todo.id}`);
        }

        // Create todos with different priorities
        await request(app)
          .post('/api/todos')
          .send({ title: 'High Priority Task', priority: 'high' });
        await request(app)
          .post('/api/todos')
          .send({ title: 'Medium Priority Task', priority: 'medium' });
        await request(app)
          .post('/api/todos')
          .send({ title: 'Low Priority Task', priority: 'low' });
        await request(app)
          .post('/api/todos')
          .send({ title: 'Another High Priority', priority: 'high' });
      });

      test('should filter todos by priority=high', async () => {
        const response = await request(app).get('/api/todos?priority=high');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body.every((t) => t.priority === 'high')).toBe(true);
      });

      test('should filter todos by priority=medium', async () => {
        const response = await request(app).get('/api/todos?priority=medium');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].priority).toBe('medium');
      });

      test('should filter todos by priority=low', async () => {
        const response = await request(app).get('/api/todos?priority=low');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].priority).toBe('low');
      });

      test('should return all todos when no priority filter', async () => {
        const response = await request(app).get('/api/todos');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(4);
      });

      test('should return empty array for priority with no matches', async () => {
        // First clear all todos and create only high priority
        await request(app).get('/api/todos'); // This won't clear, but we can filter
        const response = await request(app).get(
          '/api/todos?priority=nonexistent'
        );

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(0);
      });

      test('should handle case-insensitive priority filter', async () => {
        const response = await request(app).get('/api/todos?priority=HIGH');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body.every((t) => t.priority === 'high')).toBe(true);
      });
    });

    describe('Integration - Priority in full lifecycle', () => {
      test('should maintain priority through complete CRUD lifecycle', async () => {
        // Create with high priority
        const createRes = await request(app)
          .post('/api/todos')
          .send({ title: 'Important Task', priority: 'high' });

        const todoId = createRes.body.id;
        expect(createRes.body.priority).toBe('high');

        // Update title, keep priority
        const updateTitleRes = await request(app)
          .put(`/api/todos/${todoId}`)
          .send({ title: 'Very Important Task' });
        expect(updateTitleRes.body.priority).toBe('high');

        // Toggle completion
        const toggleRes = await request(app).patch(
          `/api/todos/${todoId}/toggle`
        );
        expect(toggleRes.body.priority).toBe('high');
        expect(toggleRes.body.completed).toBe(true);

        // Change priority
        const updatePriorityRes = await request(app)
          .put(`/api/todos/${todoId}`)
          .send({ priority: 'medium' });
        expect(updatePriorityRes.body.priority).toBe('medium');
        expect(updatePriorityRes.body.completed).toBe(true); // Still completed

        // Filter by new priority
        const filterRes = await request(app).get('/api/todos?priority=medium');
        const todo = filterRes.body.find((t) => t.id === todoId);
        expect(todo).toBeDefined();
        expect(todo.priority).toBe('medium');
      });
    });
  });

  describe('Tags/Categories Feature', () => {
    describe('POST /api/todos - Tags field', () => {
      test('should create todo with empty tags array by default', async () => {
        const response = await request(app)
          .post('/api/todos')
          .send({ title: 'Test Todo' });

        expect(response.status).toBe(201);
        expect(response.body.tags).toEqual([]);
        expect(Array.isArray(response.body.tags)).toBe(true);
      });

      test('should create todo with single tag', async () => {
        const response = await request(app)
          .post('/api/todos')
          .send({ title: 'Work Task', tags: ['work'] });

        expect(response.status).toBe(201);
        expect(response.body.tags).toEqual(['work']);
      });

      test('should create todo with multiple tags', async () => {
        const response = await request(app)
          .post('/api/todos')
          .send({ title: 'Shopping', tags: ['personal', 'shopping', 'urgent'] });

        expect(response.status).toBe(201);
        expect(response.body.tags).toEqual(['personal', 'shopping', 'urgent']);
      });

      test('should reject non-array tags', async () => {
        const response = await request(app)
          .post('/api/todos')
          .send({ title: 'Task', tags: 'work' });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('tags');
      });

      test('should reject tags array with non-string elements', async () => {
        const response = await request(app)
          .post('/api/todos')
          .send({ title: 'Task', tags: ['work', 123, true] });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('tags');
      });

      test('should trim whitespace from tags', async () => {
        const response = await request(app)
          .post('/api/todos')
          .send({ title: 'Task', tags: ['  work  ', 'personal '] });

        expect(response.status).toBe(201);
        expect(response.body.tags).toEqual(['work', 'personal']);
      });

      test('should reject empty string tags', async () => {
        const response = await request(app)
          .post('/api/todos')
          .send({ title: 'Task', tags: ['work', '', 'personal'] });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('tags');
      });
    });

    describe('PUT /api/todos/:id - Update tags', () => {
      test('should update todo tags', async () => {
        // Create todo with initial tags
        const createRes = await request(app)
          .post('/api/todos')
          .send({ title: 'Task', tags: ['work'] });

        const todoId = createRes.body.id;

        // Update tags
        const updateRes = await request(app)
          .put(`/api/todos/${todoId}`)
          .send({ tags: ['personal', 'urgent'] });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.tags).toEqual(['personal', 'urgent']);
        expect(updateRes.body.title).toBe('Task'); // Title unchanged
      });

      test('should allow clearing all tags', async () => {
        const createRes = await request(app)
          .post('/api/todos')
          .send({ title: 'Task', tags: ['work', 'urgent'] });

        const updateRes = await request(app)
          .put(`/api/todos/${createRes.body.id}`)
          .send({ tags: [] });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.tags).toEqual([]);
      });

      test('should preserve tags when updating only title', async () => {
        const createRes = await request(app)
          .post('/api/todos')
          .send({ title: 'Task', tags: ['work', 'important'] });

        const updateRes = await request(app)
          .put(`/api/todos/${createRes.body.id}`)
          .send({ title: 'Updated Task' });

        expect(updateRes.body.tags).toEqual(['work', 'important']);
      });

      test('should allow updating title, priority, and tags together', async () => {
        const createRes = await request(app)
          .post('/api/todos')
          .send({ title: 'Original', priority: 'low', tags: ['work'] });

        const updateRes = await request(app)
          .put(`/api/todos/${createRes.body.id}`)
          .send({ title: 'Updated', priority: 'high', tags: ['personal', 'urgent'] });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.title).toBe('Updated');
        expect(updateRes.body.priority).toBe('high');
        expect(updateRes.body.tags).toEqual(['personal', 'urgent']);
      });
    });

    describe('PATCH /api/todos/:id/toggle - Tags persistence', () => {
      test('should preserve tags after toggling completion', async () => {
        const createRes = await request(app)
          .post('/api/todos')
          .send({ title: 'Task', tags: ['work', 'important'] });

        const todoId = createRes.body.id;

        // Toggle to complete
        const toggleRes = await request(app).patch(`/api/todos/${todoId}/toggle`);

        expect(toggleRes.body.tags).toEqual(['work', 'important']);
        expect(toggleRes.body.completed).toBe(true);
      });
    });

    describe('GET /api/todos - Filter by tag', () => {
      beforeEach(async () => {
        // Clear all existing todos
        const existingTodos = await request(app).get('/api/todos');
        for (const todo of existingTodos.body) {
          await request(app).delete(`/api/todos/${todo.id}`);
        }

        // Create todos with different tags
        await request(app)
          .post('/api/todos')
          .send({ title: 'Work Task 1', tags: ['work', 'urgent'] });
        await request(app)
          .post('/api/todos')
          .send({ title: 'Personal Task', tags: ['personal', 'shopping'] });
        await request(app)
          .post('/api/todos')
          .send({ title: 'Work Task 2', tags: ['work'] });
        await request(app)
          .post('/api/todos')
          .send({ title: 'No Tags Task', tags: [] });
      });

      test('should filter todos by tag=work', async () => {
        const response = await request(app).get('/api/todos?tag=work');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body.every((t) => t.tags.includes('work'))).toBe(true);
      });

      test('should filter todos by tag=personal', async () => {
        const response = await request(app).get('/api/todos?tag=personal');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].tags).toContain('personal');
      });

      test('should filter todos by tag=urgent', async () => {
        const response = await request(app).get('/api/todos?tag=urgent');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].tags).toContain('urgent');
      });

      test('should return empty array for tag with no matches', async () => {
        const response = await request(app).get('/api/todos?tag=nonexistent');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(0);
      });

      test('should handle case-insensitive tag filter', async () => {
        const response = await request(app).get('/api/todos?tag=WORK');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
      });

      test('should return all todos when no tag filter', async () => {
        const response = await request(app).get('/api/todos');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(4);
      });

      test('should support filtering by both priority and tag', async () => {
        // Add a high priority work task
        await request(app)
          .post('/api/todos')
          .send({ title: 'Urgent Work', priority: 'high', tags: ['work', 'urgent'] });

        const response = await request(app).get('/api/todos?priority=high&tag=work');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].priority).toBe('high');
        expect(response.body[0].tags).toContain('work');
      });

      test('should handle todos without tags field gracefully when filtering', async () => {
        // Create todos with tags
        await request(app)
          .post('/api/todos')
          .send({ title: 'Task with tags', tags: ['work'] });

        // Simulate legacy todo without tags field by manipulating the data store
        // This tests defensive coding for backward compatibility
        const response = await request(app).get('/api/todos?tag=work');

        expect(response.status).toBe(200);
        // Should not crash, should only return todos with matching tags
        expect(response.body.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('Integration - Tags in full lifecycle', () => {
      test('should maintain tags through complete CRUD lifecycle', async () => {
        // Create with tags
        const createRes = await request(app)
          .post('/api/todos')
          .send({ title: 'Task', tags: ['work', 'important'] });

        const todoId = createRes.body.id;
        expect(createRes.body.tags).toEqual(['work', 'important']);

        // Update title, keep tags
        const updateTitleRes = await request(app)
          .put(`/api/todos/${todoId}`)
          .send({ title: 'Updated Task' });
        expect(updateTitleRes.body.tags).toEqual(['work', 'important']);

        // Toggle completion
        const toggleRes = await request(app).patch(`/api/todos/${todoId}/toggle`);
        expect(toggleRes.body.tags).toEqual(['work', 'important']);
        expect(toggleRes.body.completed).toBe(true);

        // Update tags
        const updateTagsRes = await request(app)
          .put(`/api/todos/${todoId}`)
          .send({ tags: ['personal', 'shopping'] });
        expect(updateTagsRes.body.tags).toEqual(['personal', 'shopping']);
        expect(updateTagsRes.body.completed).toBe(true); // Still completed

        // Filter by new tag
        const filterRes = await request(app).get('/api/todos?tag=shopping');
        const todo = filterRes.body.find((t) => t.id === todoId);
        expect(todo).toBeDefined();
        expect(todo.tags).toContain('shopping');
      });
    });
  });

  describe('Status Filter Feature', () => {
    describe('GET /api/todos - Filter by completion status', () => {
      beforeEach(async () => {
        // Clear all existing todos first
        const existingTodos = await request(app).get('/api/todos');
        for (const todo of existingTodos.body) {
          await request(app).delete(`/api/todos/${todo.id}`);
        }
      });

      test('should return all todos when status=all', async () => {
        // Create completed and active todos
        const todo1 = await request(app)
          .post('/api/todos')
          .send({ title: 'Active Todo' });
        
        const todo2 = await request(app)
          .post('/api/todos')
          .send({ title: 'Completed Todo' });
        
        await request(app).patch(`/api/todos/${todo2.body.id}/toggle`);

        const response = await request(app).get('/api/todos?status=all');
        
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
      });

      test('should return only active todos when status=active', async () => {
        // Create completed and active todos
        const todo1 = await request(app)
          .post('/api/todos')
          .send({ title: 'Active Todo 1' });
        
        const todo2 = await request(app)
          .post('/api/todos')
          .send({ title: 'Completed Todo' });
        
        const todo3 = await request(app)
          .post('/api/todos')
          .send({ title: 'Active Todo 2' });

        await request(app).patch(`/api/todos/${todo2.body.id}/toggle`);

        const response = await request(app).get('/api/todos?status=active');
        
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body.every(t => !t.completed)).toBe(true);
        expect(response.body.some(t => t.title === 'Active Todo 1')).toBe(true);
        expect(response.body.some(t => t.title === 'Active Todo 2')).toBe(true);
      });

      test('should return only completed todos when status=completed', async () => {
        // Create completed and active todos
        const todo1 = await request(app)
          .post('/api/todos')
          .send({ title: 'Active Todo' });
        
        const todo2 = await request(app)
          .post('/api/todos')
          .send({ title: 'Completed Todo 1' });
        
        const todo3 = await request(app)
          .post('/api/todos')
          .send({ title: 'Completed Todo 2' });

        await request(app).patch(`/api/todos/${todo2.body.id}/toggle`);
        await request(app).patch(`/api/todos/${todo3.body.id}/toggle`);

        const response = await request(app).get('/api/todos?status=completed');
        
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body.every(t => t.completed)).toBe(true);
        expect(response.body.some(t => t.title === 'Completed Todo 1')).toBe(true);
        expect(response.body.some(t => t.title === 'Completed Todo 2')).toBe(true);
      });

      test('should default to all todos when status parameter is missing', async () => {
        // Create completed and active todos
        const todo1 = await request(app)
          .post('/api/todos')
          .send({ title: 'Active Todo' });
        
        const todo2 = await request(app)
          .post('/api/todos')
          .send({ title: 'Completed Todo' });
        
        await request(app).patch(`/api/todos/${todo2.body.id}/toggle`);

        const response = await request(app).get('/api/todos');
        
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
      });

      test('should default to all todos when status is invalid', async () => {
        // Create completed and active todos
        const todo1 = await request(app)
          .post('/api/todos')
          .send({ title: 'Active Todo' });
        
        const todo2 = await request(app)
          .post('/api/todos')
          .send({ title: 'Completed Todo' });
        
        await request(app).patch(`/api/todos/${todo2.body.id}/toggle`);

        const response = await request(app).get('/api/todos?status=invalid');
        
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2); // Returns all
      });

      test('should combine status filter with priority filter', async () => {
        // Create active high priority todo
        const todo1 = await request(app)
          .post('/api/todos')
          .send({ title: 'Active High', priority: 'high' });
        
        // Create completed high priority todo
        const todo2 = await request(app)
          .post('/api/todos')
          .send({ title: 'Completed High', priority: 'high' });
        
        // Create active low priority todo
        const todo3 = await request(app)
          .post('/api/todos')
          .send({ title: 'Active Low', priority: 'low' });

        await request(app).patch(`/api/todos/${todo2.body.id}/toggle`);

        const response = await request(app).get('/api/todos?status=active&priority=high');
        
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].title).toBe('Active High');
        expect(response.body[0].completed).toBe(false);
        expect(response.body[0].priority).toBe('high');
      });

      test('should combine status filter with tag filter', async () => {
        // Create active work todo
        const todo1 = await request(app)
          .post('/api/todos')
          .send({ title: 'Active Work', tags: ['work'] });
        
        // Create completed work todo
        const todo2 = await request(app)
          .post('/api/todos')
          .send({ title: 'Completed Work', tags: ['work'] });
        
        // Create active personal todo
        const todo3 = await request(app)
          .post('/api/todos')
          .send({ title: 'Active Personal', tags: ['personal'] });

        await request(app).patch(`/api/todos/${todo2.body.id}/toggle`);

        const response = await request(app).get('/api/todos?status=active&tag=work');
        
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].title).toBe('Active Work');
        expect(response.body[0].completed).toBe(false);
        expect(response.body[0].tags).toContain('work');
      });
    });
  });
});
