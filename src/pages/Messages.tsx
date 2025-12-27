import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageSquare, 
  Send, 
  Search,
  Circle
} from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface Conversation {
  partnerId: string;
  partnerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
}

export default function Messages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(searchParams.get('to'));
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchConversations();
      setupRealtimeSubscription();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (selectedPartner) {
      fetchMessages(selectedPartner);
    }
  }, [selectedPartner]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id === selectedPartner) {
            setMessages(prev => [...prev, newMsg]);
          }
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchConversations = async () => {
    if (!user) return;

    // Fetch all messages involving the user
    const { data: messagesData } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!messagesData) {
      setLoading(false);
      return;
    }

    // Get unique partner IDs
    const partnerIds = new Set<string>();
    messagesData.forEach(msg => {
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      partnerIds.add(partnerId);
    });

    // Fetch profiles
    if (partnerIds.size > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', Array.from(partnerIds));

      const profilesMap: Record<string, Profile> = {};
      profilesData?.forEach(p => {
        profilesMap[p.id] = p as Profile;
      });
      setProfiles(profilesMap);

      // Build conversations
      const convMap = new Map<string, Conversation>();
      messagesData.forEach(msg => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!convMap.has(partnerId)) {
          const profile = profilesMap[partnerId];
          convMap.set(partnerId, {
            partnerId,
            partnerName: profile?.full_name || profile?.email || 'Unknown User',
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
            unreadCount: 0
          });
        }
        if (msg.receiver_id === user.id && !msg.read) {
          const conv = convMap.get(partnerId)!;
          conv.unreadCount++;
        }
      });

      setConversations(Array.from(convMap.values()));
    }

    setLoading(false);
  };

  const fetchMessages = async (partnerId: string) => {
    if (!user) return;

    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    setMessages((data || []) as Message[]);

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', partnerId)
      .eq('receiver_id', user.id);

    fetchConversations();
  };

  const sendMessage = async () => {
    if (!user || !selectedPartner || !newMessage.trim()) return;

    setSending(true);

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: selectedPartner,
      content: newMessage.trim()
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Failed to send message' });
    } else {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        sender_id: user.id,
        receiver_id: selectedPartner,
        content: newMessage.trim(),
        read: false,
        created_at: new Date().toISOString()
      }]);
      setNewMessage('');
    }

    setSending(false);
  };

  const filteredConversations = conversations.filter(c => 
    c.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-48 mb-6" />
          <div className="grid md:grid-cols-3 gap-6 h-[600px]">
            <Skeleton className="h-full" />
            <Skeleton className="h-full md:col-span-2" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold mb-6">Messages</h1>

        <div className="grid md:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.partnerId}
                        onClick={() => setSelectedPartner(conv.partnerId)}
                        className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                          selectedPartner === conv.partnerId ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {conv.partnerName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{conv.partnerName}</p>
                              {conv.unreadCount > 0 && (
                                <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="md:col-span-2 flex flex-col">
            {selectedPartner ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {profiles[selectedPartner]?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {profiles[selectedPartner]?.full_name || profiles[selectedPartner]?.email || 'Unknown'}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Circle className="h-2 w-2 fill-accent text-accent" />
                        Online
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-4 overflow-hidden">
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              msg.sender_id === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p className={`text-xs mt-1 ${
                              msg.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {new Date(msg.created_at).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>
                <div className="p-4 border-t">
                  <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sending}
                    />
                    <Button type="submit" disabled={sending || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
