const request = require('supertest');
const app = require('../src/app');
const { resetStore } = require('../src/todoStore');

describe('Priority Feature', () => {
  beforeEach(() => {
    resetStore();
  });

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
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Task' });

      const todoId = createRes.body.id;
      expect(createRes.body.priority).toBe('medium');

      const updateRes = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ priority: 'high' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.priority).toBe('high');
      expect(updateRes.body.title).toBe('Task');
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

      await request(app).patch(`/api/todos/${todoId}/toggle`);

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

      await request(app).patch(`/api/todos/${todoId}/toggle`);
      await request(app).patch(`/api/todos/${todoId}/toggle`);
      await request(app).patch(`/api/todos/${todoId}/toggle`);

      const getRes = await request(app).get('/api/todos');
      const todo = getRes.body.find((t) => t.id === todoId);
      expect(todo.priority).toBe('low');
    });
  });

  describe('GET /api/todos - Filter by priority', () => {
    beforeEach(async () => {
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
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Important Task', priority: 'high' });

      const todoId = createRes.body.id;
      expect(createRes.body.priority).toBe('high');

      const updateTitleRes = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ title: 'Very Important Task' });
      expect(updateTitleRes.body.priority).toBe('high');

      const toggleRes = await request(app).patch(
        `/api/todos/${todoId}/toggle`
      );
      expect(toggleRes.body.priority).toBe('high');
      expect(toggleRes.body.completed).toBe(true);

      const updatePriorityRes = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ priority: 'medium' });
      expect(updatePriorityRes.body.priority).toBe('medium');
      expect(updatePriorityRes.body.completed).toBe(true);

      const filterRes = await request(app).get('/api/todos?priority=medium');
      const todo = filterRes.body.find((t) => t.id === todoId);
      expect(todo).toBeDefined();
      expect(todo.priority).toBe('medium');
    });
  });
});
