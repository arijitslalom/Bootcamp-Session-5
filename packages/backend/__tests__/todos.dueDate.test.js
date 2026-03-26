const request = require('supertest');
const app = require('../src/app');
const { resetStore } = require('../src/todoStore');

describe('Due Date Feature', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('POST /api/todos - dueDate field', () => {
    test('should create todo without dueDate (defaults to null)', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'No due date task' });

      expect(response.status).toBe(201);
      expect(response.body.dueDate).toBeNull();
    });

    test('should create todo with valid dueDate', async () => {
      const dueDate = '2026-04-15T00:00:00.000Z';
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Task with due date', dueDate });

      expect(response.status).toBe(201);
      expect(response.body.dueDate).toBe(dueDate);
    });

    test('should reject invalid dueDate format', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Bad date task', dueDate: 'not-a-date' });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/invalid due date/i);
    });

    test('should accept dueDate as date-only string', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Date only task', dueDate: '2026-04-15' });

      expect(response.status).toBe(201);
      expect(response.body.dueDate).toBe('2026-04-15');
    });
  });

  describe('PUT /api/todos/:id - dueDate update', () => {
    test('should update dueDate on existing todo', async () => {
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Update me' });

      const dueDate = '2026-05-01T00:00:00.000Z';
      const updateRes = await request(app)
        .put(`/api/todos/${createRes.body.id}`)
        .send({ dueDate });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.dueDate).toBe(dueDate);
    });

    test('should clear dueDate by setting to null', async () => {
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Clear date', dueDate: '2026-05-01T00:00:00.000Z' });

      const updateRes = await request(app)
        .put(`/api/todos/${createRes.body.id}`)
        .send({ dueDate: null });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.dueDate).toBeNull();
    });

    test('should reject invalid dueDate in PUT', async () => {
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Bad update' });

      const updateRes = await request(app)
        .put(`/api/todos/${createRes.body.id}`)
        .send({ dueDate: 'invalid' });

      expect(updateRes.status).toBe(400);
      expect(updateRes.body.error).toMatch(/invalid due date/i);
    });

    test('should preserve dueDate when updating other fields', async () => {
      const dueDate = '2026-06-01T00:00:00.000Z';
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Keep date', dueDate });

      const updateRes = await request(app)
        .put(`/api/todos/${createRes.body.id}`)
        .send({ title: 'Updated title' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.dueDate).toBe(dueDate);
      expect(updateRes.body.title).toBe('Updated title');
    });
  });

  describe('GET /api/todos - dueDate filtering', () => {
    test('should filter todos with dueBefore parameter', async () => {
      await request(app)
        .post('/api/todos')
        .send({ title: 'Early task', dueDate: '2026-03-15T00:00:00.000Z' });
      await request(app)
        .post('/api/todos')
        .send({ title: 'Late task', dueDate: '2026-06-15T00:00:00.000Z' });
      await request(app)
        .post('/api/todos')
        .send({ title: 'No date task' });

      const response = await request(app)
        .get('/api/todos?dueBefore=2026-04-01');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Early task');
    });

    test('should filter todos with dueAfter parameter', async () => {
      await request(app)
        .post('/api/todos')
        .send({ title: 'Early task', dueDate: '2026-03-15T00:00:00.000Z' });
      await request(app)
        .post('/api/todos')
        .send({ title: 'Late task', dueDate: '2026-06-15T00:00:00.000Z' });

      const response = await request(app)
        .get('/api/todos?dueAfter=2026-04-01');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Late task');
    });

    test('should combine dueBefore and dueAfter for date range', async () => {
      await request(app)
        .post('/api/todos')
        .send({ title: 'March task', dueDate: '2026-03-15T00:00:00.000Z' });
      await request(app)
        .post('/api/todos')
        .send({ title: 'April task', dueDate: '2026-04-15T00:00:00.000Z' });
      await request(app)
        .post('/api/todos')
        .send({ title: 'June task', dueDate: '2026-06-15T00:00:00.000Z' });

      const response = await request(app)
        .get('/api/todos?dueAfter=2026-04-01&dueBefore=2026-05-01');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('April task');
    });

    test('should combine dueDate filter with status filter', async () => {
      const res1 = await request(app)
        .post('/api/todos')
        .send({ title: 'Active early', dueDate: '2026-03-15T00:00:00.000Z' });
      const res2 = await request(app)
        .post('/api/todos')
        .send({ title: 'Completed early', dueDate: '2026-03-20T00:00:00.000Z' });
      await request(app).patch(`/api/todos/${res2.body.id}/toggle`);

      const response = await request(app)
        .get('/api/todos?dueBefore=2026-04-01&status=active');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Active early');
    });

    test('should combine dueDate filter with priority filter', async () => {
      await request(app)
        .post('/api/todos')
        .send({ title: 'High early', dueDate: '2026-03-15T00:00:00.000Z', priority: 'high' });
      await request(app)
        .post('/api/todos')
        .send({ title: 'Low early', dueDate: '2026-03-20T00:00:00.000Z', priority: 'low' });

      const response = await request(app)
        .get('/api/todos?dueBefore=2026-04-01&priority=high');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('High early');
    });
  });

  describe('dueDate persistence through operations', () => {
    test('should persist dueDate after toggling completion', async () => {
      const dueDate = '2026-04-15T00:00:00.000Z';
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Toggle me', dueDate });

      await request(app)
        .patch(`/api/todos/${createRes.body.id}/toggle`);

      const getRes = await request(app).get('/api/todos');
      const todo = getRes.body.find(t => t.title === 'Toggle me');

      expect(todo.dueDate).toBe(dueDate);
      expect(todo.completed).toBe(true);
    });
  });
});
