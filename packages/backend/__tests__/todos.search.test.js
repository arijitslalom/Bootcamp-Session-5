const request = require('supertest');
const app = require('../src/app');
const { resetStore } = require('../src/todoStore');

describe('Search Feature', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('GET /api/todos - Search by query parameter', () => {
    test('should find todos by title (partial match)', async () => {
      await request(app).post('/api/todos').send({ title: 'Buy groceries' });
      await request(app).post('/api/todos').send({ title: 'Buy milk' });
      await request(app).post('/api/todos').send({ title: 'Clean kitchen' });

      const response = await request(app).get('/api/todos?search=buy');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body.every(t => t.title.toLowerCase().includes('buy'))).toBe(true);
    });

    test('should find todos by tag', async () => {
      await request(app).post('/api/todos').send({ title: 'Task 1', tags: ['work', 'urgent'] });
      await request(app).post('/api/todos').send({ title: 'Task 2', tags: ['personal'] });
      await request(app).post('/api/todos').send({ title: 'Task 3', tags: ['work'] });

      const response = await request(app).get('/api/todos?search=work');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body.some(t => t.title === 'Task 1')).toBe(true);
      expect(response.body.some(t => t.title === 'Task 3')).toBe(true);
    });

    test('should be case-insensitive', async () => {
      await request(app).post('/api/todos').send({ title: 'Buy Groceries' });
      await request(app).post('/api/todos').send({ title: 'Clean house' });

      const response = await request(app).get('/api/todos?search=BUY');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Buy Groceries');
    });

    test('should return empty array when no matches', async () => {
      await request(app).post('/api/todos').send({ title: 'Buy groceries' });
      await request(app).post('/api/todos').send({ title: 'Clean house' });

      const response = await request(app).get('/api/todos?search=xyz123');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(0);
    });

    test('should return all todos when search is empty', async () => {
      await request(app).post('/api/todos').send({ title: 'Task 1' });
      await request(app).post('/api/todos').send({ title: 'Task 2' });

      const response = await request(app).get('/api/todos?search=');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });

    test('should combine search with status filter', async () => {
      const todo1 = await request(app).post('/api/todos').send({ title: 'Buy groceries' });
      const todo2 = await request(app).post('/api/todos').send({ title: 'Buy milk' });
      await request(app).post('/api/todos').send({ title: 'Clean kitchen' });

      // Complete one "Buy" todo
      await request(app).patch(`/api/todos/${todo1.body.id}/toggle`);

      const response = await request(app).get('/api/todos?search=buy&status=active');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Buy milk');
    });

    test('should combine search with priority filter', async () => {
      await request(app).post('/api/todos').send({ title: 'Buy groceries', priority: 'high' });
      await request(app).post('/api/todos').send({ title: 'Buy milk', priority: 'low' });
      await request(app).post('/api/todos').send({ title: 'Clean kitchen', priority: 'high' });

      const response = await request(app).get('/api/todos?search=buy&priority=high');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Buy groceries');
    });

    test('should match partial tag names', async () => {
      await request(app).post('/api/todos').send({ title: 'Task 1', tags: ['shopping'] });
      await request(app).post('/api/todos').send({ title: 'Task 2', tags: ['personal'] });

      const response = await request(app).get('/api/todos?search=shop');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Task 1');
    });

    test('should match title OR tags (not require both)', async () => {
      await request(app).post('/api/todos').send({ title: 'Shopping list', tags: ['personal'] });
      await request(app).post('/api/todos').send({ title: 'Work report', tags: ['shopping'] });
      await request(app).post('/api/todos').send({ title: 'Clean house', tags: ['home'] });

      const response = await request(app).get('/api/todos?search=shopping');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });
  });
});
