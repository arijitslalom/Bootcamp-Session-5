import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../api/todoApi';

export const useTodoMutations = ({ onAddSuccess }) => {
  const queryClient = useQueryClient();

  const addTodoMutation = useMutation({
    mutationFn: async ({ title, priority, tags, dueDate, description }) => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, priority, tags, dueDate, description }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      if (onAddSuccess) onAddSuccess();
    },
  });

  const toggleTodoMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`${API_URL}/${id}/toggle`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const editTodoMutation = useMutation({
    mutationFn: async ({ id, title, priority, tags, dueDate, description }) => {
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (priority !== undefined) updateData.priority = priority;
      if (tags !== undefined) updateData.tags = tags;
      if (dueDate !== undefined) updateData.dueDate = dueDate;
      if (description !== undefined) updateData.description = description;
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  return {
    addTodoMutation,
    toggleTodoMutation,
    deleteTodoMutation,
    editTodoMutation,
  };
};
