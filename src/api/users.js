import { request } from './client.js';

export async function registerUser(data) {
  return request('/users/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function loginUser(data) {
  return request('/users/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function logoutUser(token) {
  return request('/users/logout', {
    method: 'POST',
    headers: { 'X-Authorization': token },
  });
}

export async function getUser(userId, token) {
  return request(`/users/${userId}`, {
    headers: token ? { 'X-Authorization': token } : {},
  });
}

export async function updateUser(userId, data, token) {
  return request(`/users/${userId}`, {
    method: 'PATCH',
    headers: { 'X-Authorization': token },
    body: JSON.stringify(data),
  });
}

export async function uploadUserImage(userId, file, token) {
  return request(`/users/${userId}/image`, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
      'X-Authorization': token,
    },
    body: file,
  });
}

export async function deleteUserImage(userId, token) {
  return request(`/users/${userId}/image`, {
    method: 'DELETE',
    headers: { 'X-Authorization': token },
  });
}
