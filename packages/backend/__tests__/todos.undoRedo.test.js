const request = require('supertest');
const app = require('../src/app');
const { resetStore } = require('../src/todoStore');

describe('Undo/Redo - Soft Delete & Restore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('DELETE /api/todos/:id (soft delete)', () => {
    test('should soft delete a todo (sets deleted flag)', async () => {
      // Create a todo
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Todo to delete' });
      const todoId = createRes.body.id;

      // Soft delete it
      const deleteRes = await request(app).delete(`/api/todos/${todoId}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body).toHaveProperty('deleted', true);
      expect(deleteRes.body).toHaveProperty('deletedAt');
    });

    test('should not return soft-deleted todos in GET', async () => {
      // Create two todos
      const todo1 = await request(app)
        .post('/api/todos')
        .send({ title: 'Keep this' });
      const todo2 = await request(app)
        .post('/api/todos')
        .send({ title: 'Delete this' });

      // Soft delete the second
      await request(app).delete(`/api/todos/${todo2.body.id}`);

      // GET should only return the first
      const getRes = await request(app).get('/api/todos');
      expect(getRes.body).toHaveLength(1);
      expect(getRes.body[0].title).toBe('Keep this');
    });

    test('should return 404 for non-existent todo', async () => {
      const res = await request(app).delete('/api/todos/99999');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/todos/:id/restore', () => {
    test('should restore a soft-deleted todo', async () => {
      // Create and soft delete a todo
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Restore me' });
      const todoId = createRes.body.id;

      await request(app).delete(`/api/todos/${todoId}`);

      // Restore it
      const restoreRes = await request(app).patch(`/api/todos/${todoId}/restore`);
      expect(restoreRes.status).toBe(200);
      expect(restoreRes.body).toHaveProperty('deleted', false);
      expect(restoreRes.body).not.toHaveProperty('deletedAt');
      expect(restoreRes.body.title).toBe('Restore me');
    });

    test('should make restored todo appear in GET again', async () => {
      // Create and soft delete
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Restored Todo' });
      const todoId = createRes.body.id;

      await request(app).delete(`/api/todos/${todoId}`);

      // Verify it's gone
      let getRes = await request(app).get('/api/todos');
      expect(getRes.body).toHaveLength(0);

      // Restore
      await request(app).patch(`/api/todos/${todoId}/restore`);

      // Verify it's back
      getRes = await request(app).get('/api/todos');
      expect(getRes.body).toHaveLength(1);
      expect(getRes.body[0].title).toBe('Restored Todo');
    });

    test('should return 404 when restoring non-existent todo', async () => {
      const res = await request(app).patch('/api/todos/99999/restore');
      expect(res.status).toBe(404);
    });

    test('should be a no-op when restoring an active (non-deleted) todo', async () => {
      // Create a todo (not deleted)
      const createRes = await request(app)
        .post('/api/todos')
        .send({ title: 'Active Todo' });
      const todoId = createRes.body.id;

      // Restore it (already active)
      const restoreRes = await request(app).patch(`/api/todos/${todoId}/restore`);
      expect(restoreRes.status).toBe(200);
      expect(restoreRes.body).toHaveProperty('deleted', false);
    });

    test('should preserve all todo fields after restore', async () => {
      // Create a todo with full data
      const createRes = await request(app)
        .post('/api/todos')
        .send({
          title: 'Full Todo',
          priority: 'high',
          tags: ['work', 'urgent'],
          dueDate: '2026-04-01',
          description: 'Important task',
        });
      const todoId = createRes.body.id;

      // Soft delete then restore
      await request(app).delete(`/api/todos/${todoId}`);
      const restoreRes = await request(app).patch(`/api/todos/${todoId}/restore`);

      expect(restoreRes.body.title).toBe('Full Todo');
      expect(restoreRes.body.priority).toBe('high');
      expect(restoreRes.body.tags).toEqual(['work', 'urgent']);
      expect(restoreRes.body.dueDate).toBe('2026-04-01');
      expect(restoreRes.body.description).toBe('Important task');
      expect(restoreRes.body.deleted).toBe(false);
    });
  });

  describe('Soft delete interaction with other filters', () => {
    test('soft-deleted todos should not appear in filtered results', async () => {
      // Create todos with different priorities
      await request(app)
        .post('/api/todos')
        .send({ title: 'High Todo', priority: 'high' });
      const todo2 = await request(app)
        .post('/api/todos')
        .send({ title: 'Another High', priority: 'high' });

      // Soft delete one high-priority todo
      await request(app).delete(`/api/todos/${todo2.body.id}`);

      // Filter by high priority - should only return one
      const getRes = await request(app).get('/api/todos?priority=high');
      expect(getRes.body).toHaveLength(1);
      expect(getRes.body[0].title).toBe('High Todo');
    });

    test('soft-deleted todos should not appear in search results', async () => {
      await request(app)
        .post('/api/todos')
        .send({ title: 'Keep Todo' });
      const todo2 = await request(app)
        .post('/api/todos')
        .send({ title: 'Delete Todo' });

      await request(app).delete(`/api/todos/${todo2.body.id}`);

      const getRes = await request(app).get('/api/todos?search=todo');
      expect(getRes.body).toHaveLength(1);
      expect(getRes.body[0].title).toBe('Keep Todo');
    });
  });
});
