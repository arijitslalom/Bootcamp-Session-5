const request = require('supertest');
const app = require('../src/app');
const { resetStore } = require('../src/todoStore');

describe('TODO Description Field Tests', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('POST /api/todos - Description support', () => {
    test('should create todo with description', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Task with notes', description: 'Some detailed notes here' });

      expect(response.status).toBe(201);
      expect(response.body.description).toBe('Some detailed notes here');
    });

    test('should create todo without description (defaults to empty string)', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Task without notes' });

      expect(response.status).toBe(201);
      expect(response.body.description).toBe('');
    });

    test('should create todo with empty description', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Task', description: '' });

      expect(response.status).toBe(201);
      expect(response.body.description).toBe('');
    });

    test('should reject non-string description', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Task', description: 123 });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/description/i);
    });
  });

  describe('PUT /api/todos/:id - Description updates', () => {
    test('should update description via PUT', async () => {
      // Create a todo first
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Task' });

      const id = createRes.body.id;

      const updateRes = await request(app)
        .put(`/api/todos/${id}`)
        .send({ description: 'Added some notes' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.description).toBe('Added some notes');
    });

    test('should clear description by setting to empty string', async () => {
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Task', description: 'Some notes' });

      const id = createRes.body.id;

      const updateRes = await request(app)
        .put(`/api/todos/${id}`)
        .send({ description: '' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.description).toBe('');
    });

    test('should reject non-string description on update', async () => {
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Task' });

      const id = createRes.body.id;

      const updateRes = await request(app)
        .put(`/api/todos/${id}`)
        .send({ description: ['not', 'a', 'string'] });

      expect(updateRes.status).toBe(400);
      expect(updateRes.body.error).toMatch(/description/i);
    });

    test('should preserve description when updating other fields', async () => {
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Task', description: 'My notes' });

      const id = createRes.body.id;

      // Update only the title
      const updateRes = await request(app)
        .put(`/api/todos/${id}`)
        .send({ title: 'Updated Task' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.title).toBe('Updated Task');
      expect(updateRes.body.description).toBe('My notes');
    });
  });

  describe('GET /api/todos - Description in results', () => {
    test('should include description in GET response', async () => {
      await request(app)
        .post('/api/todos')
        .send({ title: 'Task', description: 'Notes here' });

      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(response.body[0].description).toBe('Notes here');
    });

    test('should search in description when search param provided', async () => {
      await request(app)
        .post('/api/todos')
        .send({ title: 'Task One', description: 'Contains special keyword' });
      await request(app)
        .post('/api/todos')
        .send({ title: 'Task Two', description: 'Nothing relevant' });

      const response = await request(app).get('/api/todos?search=special');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Task One');
    });
  });

  describe('Description persistence through operations', () => {
    test('should persist description after toggle', async () => {
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Task', description: 'Important notes' });

      const id = createRes.body.id;

      // Toggle completion
      const toggleRes = await request(app)
        .patch(`/api/todos/${id}/toggle`);

      expect(toggleRes.status).toBe(200);
      expect(toggleRes.body.description).toBe('Important notes');
      expect(toggleRes.body.completed).toBe(true);
    });

    test('should handle long descriptions', async () => {
      const longDescription = 'A'.repeat(5000);
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Task', description: longDescription });

      expect(response.status).toBe(201);
      expect(response.body.description).toBe(longDescription);
      expect(response.body.description.length).toBe(5000);
    });
  });
});
