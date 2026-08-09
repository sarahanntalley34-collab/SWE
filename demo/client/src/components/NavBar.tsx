import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/users', label: 'Users', end: false },
  { to: '/settings', label: 'Settings', end: false },
];

export function NavBar() {
  return (
    <nav className="border-b border-gray-800 bg-gray-950 px-4 sm:px-6">
      <ul className="flex items-center gap-1 overflow-x-auto">
        {links.map(({ to, label, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `inline-block px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-white border-emerald-500'
                    : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600'
                }`
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
