import { User } from 'firebase/auth';
import { logout } from '../lib/firebase';
import { LogOut, Calendar, User as UserIcon, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLogoutSuccess: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Header({ user, onLogoutSuccess, darkMode, onToggleDarkMode }: HeaderProps) {
  const handleLogout = async () => {
    try {
      await logout();
      onLogoutSuccess();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and App Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white shadow-md border dark:border-slate-700">
            <Calendar className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-gray-900 dark:text-white tracking-tight">
              Conecta
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-mono hidden sm:block">
              Eventos Bimestrais da Comunidade
            </p>
          </div>
        </div>

        {/* Right side actions containing Dark Mode Toggle & User Info */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition-all duration-200 cursor-pointer shadow-xs flex items-center justify-center"
            title={darkMode ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
            aria-label="Alternar Tema"
          >
            {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-400 animate-pulse" /> : <Moon className="w-4.5 h-4.5 text-indigo-500" />}
          </button>

          {user && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3 border-r border-gray-200 dark:border-slate-800 pr-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {user.displayName || 'Membro da Central'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                    {user.email || 'comunidade@central.com'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/30 text-slate-700 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900/60 transition-colors duration-200 text-sm font-medium cursor-pointer"
                title="Sair da Conta"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
