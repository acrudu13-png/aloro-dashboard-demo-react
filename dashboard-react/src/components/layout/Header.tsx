import { Menu, Search } from 'lucide-react';
import { NotificationBell } from '../ui/NotificationBell';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4 lg:px-5">
      <div className="flex items-center gap-3 lg:gap-4">
        <button
          onClick={onMenuClick}
          className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-slate-800">Aloro</span>
          <span className="hidden sm:inline text-xs text-slate-400 font-medium ml-1">
            Voice AI Platform
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        {/* Search - hidden on mobile */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search..."
            className="bg-slate-100 rounded-lg pl-9 pr-4 py-2 text-sm w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-white transition"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* User */}
        <div className="flex items-center gap-2 lg:gap-3 lg:pl-3 lg:border-l border-slate-200">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-slate-700">James Wilson</p>
            <p className="text-xs text-slate-400">Meridian Financial</p>
          </div>
          <button className="w-9 h-9 bg-accent-100 rounded-full flex items-center justify-center hover:bg-accent-200 transition">
            <span className="text-accent-600 font-semibold text-sm">JW</span>
          </button>
        </div>
      </div>
    </header>
  );
}
