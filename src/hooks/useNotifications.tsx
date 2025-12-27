import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bell, MessageSquare, TrendingUp, Brain, CheckCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'message' | 'investment' | 'recommendation' | 'system';
  title: string;
  description: string;
  read: boolean;
  created_at: string;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification: Notification = {
            id: crypto.randomUUID(),
            type: 'message',
            title: 'New Message',
            description: 'You have a new message from a startup founder.',
            read: false,
            created_at: new Date().toISOString(),
            link: '/messages'
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          
          toast({
            title: (
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                New Message
              </div>
            ) as unknown as string,
            description: 'You have a new message.',
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'investments',
          filter: `investor_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification: Notification = {
            id: crypto.randomUUID(),
            type: 'investment',
            title: 'Investment Confirmed',
            description: `Your investment has been successfully processed.`,
            read: false,
            created_at: new Date().toISOString(),
            link: '/investor/dashboard'
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          
          toast({
            title: (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                Investment Confirmed
              </div>
            ) as unknown as string,
            description: 'Your investment was successful!',
          });
        }
      )
      .subscribe();

    // Add initial welcome notification for new users
    const welcomeNotification: Notification = {
      id: 'welcome',
      type: 'system',
      title: 'Welcome to Investify!',
      description: 'Start exploring startups and build your investment portfolio.',
      read: false,
      created_at: new Date().toISOString(),
      link: '/startups'
    };

    const aiNotification: Notification = {
      id: 'ai-match',
      type: 'recommendation',
      title: 'AI Recommendations Ready',
      description: 'Get personalized startup recommendations based on your preferences.',
      read: false,
      created_at: new Date().toISOString(),
      link: '/ai-matching'
    };

    setNotifications([aiNotification, welcomeNotification]);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      read: false,
      created_at: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'message':
      return MessageSquare;
    case 'investment':
      return TrendingUp;
    case 'recommendation':
      return Brain;
    default:
      return Bell;
  }
};

export const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'message':
      return 'text-blue-500 bg-blue-500/10';
    case 'investment':
      return 'text-accent bg-accent/10';
    case 'recommendation':
      return 'text-purple-500 bg-purple-500/10';
    default:
      return 'text-primary bg-primary/10';
  }
};
