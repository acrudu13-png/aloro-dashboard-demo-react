import { useState } from 'react';
import { Bell, CheckCheck, Megaphone, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './dropdown-menu';
import { ScrollArea } from './scroll-area';
import { Separator } from './separator';

interface Notification {
  id: string;
  type: 'campaign' | 'whatsapp' | 'review';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'campaign',
    title: 'Campaign Completed',
    description: "Campaign 'Q1 Debt Recovery' has completed successfully",
    time: '5 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'whatsapp',
    title: 'Template Approved',
    description: 'New WhatsApp template "payment_reminder" has been approved',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'review',
    title: 'Calls Require Review',
    description: '3 calls have been flagged for human review',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '4',
    type: 'campaign',
    title: 'Campaign Started',
    description: "Campaign 'Service Renewal - February' has started",
    time: 'Yesterday',
    read: true,
  },
  {
    id: '5',
    type: 'whatsapp',
    title: 'New Message',
    description: 'You have 5 unread WhatsApp messages',
    time: 'Yesterday',
    read: true,
  },
];

const iconMap = {
  campaign: Megaphone,
  whatsapp: MessageSquare,
  review: AlertCircle,
};

const colorMap = {
  campaign: 'bg-green-100 text-green-600',
  whatsapp: 'bg-green-100 text-green-600',
  review: 'bg-amber-100 text-amber-600',
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearAll = () => setNotifications([]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-auto p-1 gap-1">
              <CheckCheck className="w-3 h-3" /> Mark all read
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">No notifications</div>
          ) : (
            notifications.map(notification => {
              const Icon = iconMap[notification.type];
              return (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorMap[notification.type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm ${!notification.read ? 'font-semibold' : 'text-muted-foreground'}`}>{notification.title}</p>
                        {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.description}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">{notification.time}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="px-4 py-2">
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs h-auto p-1 text-muted-foreground">
                Clear all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
