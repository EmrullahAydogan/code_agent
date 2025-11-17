import { Outlet, Link, useLocation } from 'react-router-dom';
import { Bot, FolderKanban, Settings, Sparkles, BarChart3 } from 'lucide-react';
import clsx from 'clsx';
import { useWebSocket } from '../providers/WebSocketProvider';

export const Layout = () => {
  const location = useLocation();
  const { connected } = useWebSocket();

  const navigation = [
    { name: 'Agents', href: '/agents', icon: Bot },
    { name: 'Templates', href: '/templates', icon: Sparkles },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
            <Bot className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Code Agent</h1>
              <div className="flex items-center gap-2">
                <div className={clsx(
                  'w-2 h-2 rounded-full',
                  connected ? 'bg-green-500' : 'bg-red-500'
                )} />
                <span className="text-xs text-gray-500">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Local Code Agent Platform v1.0.0
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
