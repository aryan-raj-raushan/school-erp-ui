import { ApiGateway } from './api-gateway';
import { ROUTES } from '@/constants';

export const apiGateway = new ApiGateway(
  {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
    timeout: 15_000,
  },
  () => {
    if (typeof window !== 'undefined') {
      window.location.href = ROUTES.login;
    }
  },
);
