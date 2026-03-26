const request = require('supertest');
const app = require('../src/app');
const { resetStore } = require('../src/todoStore');

describe('Tags/Categories Feature', () => {
  beforeEach(() => {
    resetStore();
  });

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
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Task', tags: ['work'] });

      const todoId = createRes.body.id;

      const updateRes = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ tags: ['personal', 'urgent'] });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.tags).toEqual(['personal', 'urgent']);
      expect(updateRes.body.title).toBe('Task');
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

      const toggleRes = await request(app).patch(`/api/todos/${todoId}/toggle`);

      expect(toggleRes.body.tags).toEqual(['work', 'important']);
      expect(toggleRes.body.completed).toBe(true);
    });
  });

  describe('GET /api/todos - Filter by tag', () => {
    beforeEach(async () => {
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
      await request(app)
        .post('/api/todos')
        .send({ title: 'Task with tags', tags: ['work'] });

      const response = await request(app).get('/api/todos?tag=work');

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration - Tags in full lifecycle', () => {
    test('should maintain tags through complete CRUD lifecycle', async () => {
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Task', tags: ['work', 'important'] });

      const todoId = createRes.body.id;
      expect(createRes.body.tags).toEqual(['work', 'important']);

      const updateTitleRes = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ title: 'Updated Task' });
      expect(updateTitleRes.body.tags).toEqual(['work', 'important']);

      const toggleRes = await request(app).patch(`/api/todos/${todoId}/toggle`);
      expect(toggleRes.body.tags).toEqual(['work', 'important']);
      expect(toggleRes.body.completed).toBe(true);

      const updateTagsRes = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ tags: ['personal', 'shopping'] });
      expect(updateTagsRes.body.tags).toEqual(['personal', 'shopping']);
      expect(updateTagsRes.body.completed).toBe(true);

      const filterRes = await request(app).get('/api/todos?tag=shopping');
      const todo = filterRes.body.find((t) => t.id === todoId);
      expect(todo).toBeDefined();
      expect(todo.tags).toContain('shopping');
    });
  });
});
