import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { NavBar } from './NavBar';

/** Shared authenticated shell: header + nav + page content. */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Header />
      <NavBar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        <Outlet />
      </main>
    </div>
  );
}
