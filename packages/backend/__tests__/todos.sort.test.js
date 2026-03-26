const request = require('supertest');
const app = require('../src/app');
const { resetStore } = require('../src/todoStore');

describe('Sort Feature', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('GET /api/todos - Sort by different fields', () => {
    // Helper to create a set of diverse todos for sorting tests
    async function createSortTestData() {
      const todo1 = await request(app)
        .post('/api/todos')
        .send({ title: 'Charlie Task', priority: 'low', dueDate: '2026-04-10' });

      const todo2 = await request(app)
        .post('/api/todos')
        .send({ title: 'Alpha Task', priority: 'high', dueDate: '2026-03-28' });

      const todo3 = await request(app)
        .post('/api/todos')
        .send({ title: 'Bravo Task', priority: 'medium', dueDate: '2026-04-05' });

      return [todo1.body, todo2.body, todo3.body];
    }

    test('should sort by createdAt ascending by default', async () => {
      const todos = await createSortTestData();

      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
      // Default sort should be createdAt ascending (oldest first)
      expect(response.body[0].title).toBe('Charlie Task');
      expect(response.body[1].title).toBe('Alpha Task');
      expect(response.body[2].title).toBe('Bravo Task');
    });

    test('should sort by title ascending', async () => {
      await createSortTestData();

      const response = await request(app).get('/api/todos?sort=title&order=asc');

      expect(response.status).toBe(200);
      expect(response.body[0].title).toBe('Alpha Task');
      expect(response.body[1].title).toBe('Bravo Task');
      expect(response.body[2].title).toBe('Charlie Task');
    });

    test('should sort by title descending', async () => {
      await createSortTestData();

      const response = await request(app).get('/api/todos?sort=title&order=desc');

      expect(response.status).toBe(200);
      expect(response.body[0].title).toBe('Charlie Task');
      expect(response.body[1].title).toBe('Bravo Task');
      expect(response.body[2].title).toBe('Alpha Task');
    });

    test('should sort by priority ascending (low to high)', async () => {
      await createSortTestData();

      const response = await request(app).get('/api/todos?sort=priority&order=asc');

      expect(response.status).toBe(200);
      expect(response.body[0].priority).toBe('low');
      expect(response.body[1].priority).toBe('medium');
      expect(response.body[2].priority).toBe('high');
    });

    test('should sort by priority descending (high to low)', async () => {
      await createSortTestData();

      const response = await request(app).get('/api/todos?sort=priority&order=desc');

      expect(response.status).toBe(200);
      expect(response.body[0].priority).toBe('high');
      expect(response.body[1].priority).toBe('medium');
      expect(response.body[2].priority).toBe('low');
    });

    test('should sort by dueDate ascending (soonest first)', async () => {
      await createSortTestData();

      const response = await request(app).get('/api/todos?sort=dueDate&order=asc');

      expect(response.status).toBe(200);
      expect(response.body[0].title).toBe('Alpha Task');   // Mar 28
      expect(response.body[1].title).toBe('Bravo Task');   // Apr 5
      expect(response.body[2].title).toBe('Charlie Task'); // Apr 10
    });

    test('should sort by dueDate descending (latest first)', async () => {
      await createSortTestData();

      const response = await request(app).get('/api/todos?sort=dueDate&order=desc');

      expect(response.status).toBe(200);
      expect(response.body[0].title).toBe('Charlie Task'); // Apr 10
      expect(response.body[1].title).toBe('Bravo Task');   // Apr 5
      expect(response.body[2].title).toBe('Alpha Task');   // Mar 28
    });

    test('should sort by createdAt descending (newest first)', async () => {
      await createSortTestData();

      const response = await request(app).get('/api/todos?sort=createdAt&order=desc');

      expect(response.status).toBe(200);
      expect(response.body[0].title).toBe('Bravo Task');   // Created last
      expect(response.body[1].title).toBe('Alpha Task');
      expect(response.body[2].title).toBe('Charlie Task'); // Created first
    });

    test('should default to ascending when order param is missing', async () => {
      await createSortTestData();

      const response = await request(app).get('/api/todos?sort=title');

      expect(response.status).toBe(200);
      expect(response.body[0].title).toBe('Alpha Task');
      expect(response.body[1].title).toBe('Bravo Task');
      expect(response.body[2].title).toBe('Charlie Task');
    });

    test('should ignore invalid sort field and return default order', async () => {
      await createSortTestData();

      const response = await request(app).get('/api/todos?sort=invalidField');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
      // Should fall back to default (createdAt asc)
      expect(response.body[0].title).toBe('Charlie Task');
    });

    test('should put todos without dueDate at end when sorting by dueDate ascending', async () => {
      await request(app)
        .post('/api/todos')
        .send({ title: 'No Date Task', priority: 'medium' });

      await request(app)
        .post('/api/todos')
        .send({ title: 'Has Date Task', priority: 'medium', dueDate: '2026-04-01' });

      const response = await request(app).get('/api/todos?sort=dueDate&order=asc');

      expect(response.status).toBe(200);
      expect(response.body[0].title).toBe('Has Date Task');
      expect(response.body[1].title).toBe('No Date Task');
    });

    test('should combine sort with filters', async () => {
      await request(app)
        .post('/api/todos')
        .send({ title: 'Zebra High', priority: 'high' });

      await request(app)
        .post('/api/todos')
        .send({ title: 'Apple High', priority: 'high' });

      await request(app)
        .post('/api/todos')
        .send({ title: 'Middle Medium', priority: 'medium' });

      const response = await request(app).get('/api/todos?priority=high&sort=title&order=asc');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].title).toBe('Apple High');
      expect(response.body[1].title).toBe('Zebra High');
    });
  });
});
