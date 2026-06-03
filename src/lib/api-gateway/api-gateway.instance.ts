import { ApiGateway } from './api-gateway';
import { TokenStorage } from './token.storage';
import { ROUTES } from '@/constants';

function handleAuthFailure() {
  if (typeof window === 'undefined') return;
  // Clear all stored auth state
  TokenStorage.clear();
  // Clear cookies that store user profile / isAuthenticated
  document.cookie = 'auth:user=;max-age=0;path=/';
  document.cookie = 'auth:is_authenticated=;max-age=0;path=/';
  document.cookie = 'auth:context=;max-age=0;path=/';
  window.location.href = ROUTES.login;
}

export const apiGateway = new ApiGateway(
  {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
    timeout: 15_000,
  },
  handleAuthFailure,
);
