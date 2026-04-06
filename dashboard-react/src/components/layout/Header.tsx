import { Menu, Search } from 'lucide-react';
import { NotificationBell } from '../ui/NotificationBell';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';

interface HeaderProps { onMenuClick: () => void; }

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b z-50 flex items-center justify-between px-4 lg:px-5">
      <div className="flex items-center gap-3 lg:gap-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="text-muted-foreground lg:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold">Aloro</span>
          <span className="hidden sm:inline text-xs text-muted-foreground font-medium ml-1">Voice AI Platform</span>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="Search..." className="pl-9 w-48 lg:w-64 bg-muted border-0 focus-visible:ring-1" />
        </div>
        <NotificationBell />
        <Separator orientation="vertical" className="h-6 hidden lg:block" />
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium">James Wilson</p>
          <p className="text-xs text-muted-foreground">Meridian Financial</p>
        </div>
        <Avatar className="w-9 h-9 cursor-pointer">
          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-sm">JW</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
