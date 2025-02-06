import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { MainContent } from './MainContent';
import { Sidebar } from './Sidebar';
import { SystemHealthMonitor } from '../analysis/SystemHealthMonitor';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const showSidebar = location.pathname !== '/login';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && <Sidebar />}
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}