const request = require('supertest');
const app = require('../src/app');
const { resetStore } = require('../src/todoStore');

describe('Status Filter Feature', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('GET /api/todos - Filter by completion status', () => {
    test('should return all todos when status=all', async () => {
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
      expect(response.body.every((t) => !t.completed)).toBe(true);
      expect(response.body.some((t) => t.title === 'Active Todo 1')).toBe(true);
      expect(response.body.some((t) => t.title === 'Active Todo 2')).toBe(true);
    });

    test('should return only completed todos when status=completed', async () => {
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
      expect(response.body.every((t) => t.completed)).toBe(true);
      expect(response.body.some((t) => t.title === 'Completed Todo 1')).toBe(true);
      expect(response.body.some((t) => t.title === 'Completed Todo 2')).toBe(true);
    });

    test('should default to all todos when status parameter is missing', async () => {
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
      const todo1 = await request(app)
        .post('/api/todos')
        .send({ title: 'Active Todo' });

      const todo2 = await request(app)
        .post('/api/todos')
        .send({ title: 'Completed Todo' });

      await request(app).patch(`/api/todos/${todo2.body.id}/toggle`);

      const response = await request(app).get('/api/todos?status=invalid');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });

    test('should combine status filter with priority filter', async () => {
      const todo1 = await request(app)
        .post('/api/todos')
        .send({ title: 'Active High', priority: 'high' });

      const todo2 = await request(app)
        .post('/api/todos')
        .send({ title: 'Completed High', priority: 'high' });

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
      const todo1 = await request(app)
        .post('/api/todos')
        .send({ title: 'Active Work', tags: ['work'] });

      const todo2 = await request(app)
        .post('/api/todos')
        .send({ title: 'Completed Work', tags: ['work'] });

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
