import { PropsWithChildren } from 'react';
import { ErrorBoundaryProvider } from '@/components/error/ErrorBoundaryProvider';
import { AuthProvider } from './auth';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ErrorBoundaryProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ErrorBoundaryProvider>
  );
}