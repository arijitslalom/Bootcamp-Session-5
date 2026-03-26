import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../api/todoApi';

// React Query hook for fetching todos
export const useTodos = (statusFilter, priorityFilter, tagFilter, sortField, sortOrder) => {
  return useQuery({
    queryKey: ['todos', statusFilter, priorityFilter, tagFilter, sortField, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (tagFilter) params.append('tag', tagFilter);
      if (sortField && sortField !== 'createdAt') params.append('sort', sortField);
      if (sortOrder && sortOrder !== 'asc') params.append('order', sortOrder);
      
      const url = params.toString() ? `${API_URL}?${params}` : API_URL;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      const data = await response.json();
      return data;
    },
  });
};

// React Query hook for fetching ALL todos (unfiltered) - used for tag/priority filter UI
export const useAllTodos = () => {
  return useQuery({
    queryKey: ['todos', 'all'],
    queryFn: async () => {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      const data = await response.json();
      return data;
    },
  });
};
