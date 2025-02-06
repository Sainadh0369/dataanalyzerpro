import { Routes } from '@/routes';
import { AppProviders } from '@/providers';

export function App() {
  return (
    <AppProviders>
      <Routes />
    </AppProviders>
  );
}