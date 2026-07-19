import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  connected: boolean;
}

export function Header({ connected }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-white">Retro Engineering</h1>
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
            connected ? 'bg-emerald-500' : 'bg-red-500'
          }`}
          title={connected ? 'Connected' : 'Disconnected'}
        />
        <span className="text-xs text-gray-500">
          {connected ? 'Live' : 'Reconnecting...'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">{user?.email}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            user?.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
          }`}>
            {user?.role}
          </span>
        </div>
        <button
          onClick={logout}
          className="px-3 py-1.5 text-sm rounded bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
