import { request } from './client';

export const sortOptions = [
  { value: 'CREATED_DESC', label: 'Newest first' },
  { value: 'CREATED_ASC', label: 'Oldest first' },
  { value: 'ALPHABETICAL_ASC', label: 'Title A-Z' },
  { value: 'ALPHABETICAL_DESC', label: 'Title Z-A' },
  { value: 'REACTIONS_ASC', label: 'Fewest reactions' },
  { value: 'REACTIONS_DESC', label: 'Most reactions' },
];

export async function getBlogs({ q = '', sortBy = 'CREATED_DESC', creatorId }: any = {}) {
  const params = new URLSearchParams();

  if (q.trim()) params.set('q', q.trim());
  if (sortBy) params.set('sortBy', sortBy);
  if (creatorId) params.set('creatorId', creatorId);

  const query = params.toString();
  return request(`/blogs${query ? `?${query}` : ''}`);
}

export async function getBlog(blogId) {
  return request(`/blogs/${blogId}`);
}

export async function getBlogComments(blogId) {
  return request(`/blogs/${blogId}/comments`);
}

export async function getBlogReactions(blogId) {
  return request(`/blogs/${blogId}/react`);
}

export async function addBlogReaction(blogId, reaction, token) {
  return request(`/blogs/${blogId}/react`, {
    method: 'POST',
    headers: { 'X-Authorization': token },
    body: JSON.stringify({ reaction }),
  });
}

export async function removeBlogReaction(blogId, token) {
  return request(`/blogs/${blogId}/react`, {
    method: 'DELETE',
    headers: { 'X-Authorization': token },
  });
}

export async function addBlogComment(blogId, data, token) {
  return request(`/blogs/${blogId}/comments`, {
    method: 'POST',
    headers: { 'X-Authorization': token },
    body: JSON.stringify(data),
  });
}

export async function createBlog(data, token) {
  return request('/blogs', {
    method: 'POST',
    headers: { 'X-Authorization': token },
    body: JSON.stringify(data),
  });
}

export async function updateBlog(blogId, data, token) {
  return request(`/blogs/${blogId}`, {
    method: 'PATCH',
    headers: { 'X-Authorization': token },
    body: JSON.stringify(data),
  });
}

export async function deleteBlog(blogId, token) {
  return request(`/blogs/${blogId}`, {
    method: 'DELETE',
    headers: { 'X-Authorization': token },
  });
}

export async function uploadBlogImage(blogId, file, token) {
  return request(`/blogs/${blogId}/image`, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
      'X-Authorization': token,
    },
    body: file,
  });
}

export async function getCategories() {
  return request('/blogs/categories');
}

export async function getCities() {
  return request('/blogs/cities');
}
