import { request } from './client.js';

export const sortOptions = [
  { value: 'CREATED_DESC', label: 'Newest first' },
  { value: 'CREATED_ASC', label: 'Oldest first' },
  { value: 'ALPHABETICAL_ASC', label: 'Title A-Z' },
  { value: 'ALPHABETICAL_DESC', label: 'Title Z-A' },
  { value: 'REACTS_ASC', label: 'Fewest reactions' },
  { value: 'REACTS_DESC', label: 'Most reactions' },
];

export async function getBlogs({ q = '', sortBy = 'CREATED_DESC' } = {}) {
  const params = new URLSearchParams();

  if (q.trim()) params.set('q', q.trim());
  if (sortBy) params.set('sortBy', sortBy);

  const query = params.toString();
  return request(`/blogs${query ? `?${query}` : ''}`);
}

export async function getCategories() {
  return request('/blogs/categories');
}

export async function getCities() {
  return request('/blogs/cities');
}
