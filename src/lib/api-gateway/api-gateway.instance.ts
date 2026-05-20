/**
 * api-gateway.instance.ts
 *
 * Creates and exports a **singleton** ApiGateway instance configured from
 * environment variables.  Import this wherever you need to call the API.
 *
 * Usage:
 *   import { apiGateway } from '@/lib/api-gateway';
 *   const data = await apiGateway.get<School[]>('/schools');
 */

import { ApiGateway } from './api-gateway';

function createGateway(): ApiGateway {
  const BASE_URL =process.env.NEXT_PUBLIC_API_BASE_URL;

  return new ApiGateway(
    {
      BASE_URL,
      timeout: 15_000,
    },
    () => {
      // onAuthFailure — called when both access-token and refresh-token are expired.
      // Redirect to login; adjust the path to match your routing setup.
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    },
  );
}

export const apiGateway = createGateway();