import { HomePage } from '@/pages/home';
import { AppProviders } from '@/app/providers';

export function App() {
  return (
    <AppProviders>
      <HomePage />
    </AppProviders>
  );
}
