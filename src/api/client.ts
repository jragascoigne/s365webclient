import { apiBaseUrl } from '../config';

export class ApiError extends Error {
  status: number | undefined;
  details: unknown;

  constructor(message: string, { status, details }: any = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function request(path: string, options: RequestInit = {}) {
  const isFileBody =
    options.body instanceof FormData ||
    options.body instanceof Blob ||
    options.body instanceof ArrayBuffer;
  const headers = {
    Accept: 'application/json',
    ...(!isFileBody ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const rawBody = response.status === 204 ? '' : await response.text();
  const body = isJson && rawBody ? JSON.parse(rawBody) : rawBody;

  if (!response.ok) {
    const detailMessage =
      typeof body === 'string' && body.trim()
        ? body.trim()
        : response.statusText || `API request failed with ${response.status}`;

    throw new ApiError(detailMessage, {
      status: response.status,
      details: body,
    });
  }

  return body;
}
