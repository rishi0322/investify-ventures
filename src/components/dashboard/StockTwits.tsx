import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Heart, 
  Repeat2, 
  Share, 
  TrendingUp,
  TrendingDown,
  Send,
  Flame,
  Clock
} from 'lucide-react';

interface Tweet {
  id: string;
  user: {
    name: string;
    handle: string;
    avatar?: string;
    verified: boolean;
  };
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  comments: number;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  ticker?: string;
}

const sampleTweets: Tweet[] = [
  {
    id: '1',
    user: { name: 'Raj Investments', handle: '@rajinvests', verified: true },
    content: '🚀 Just increased my position in QuantumAI Labs. The AI sector is about to explode! Their new product launch looks promising. #Bullish #AI #Startups',
    timestamp: '5m ago',
    likes: 234,
    retweets: 45,
    comments: 23,
    sentiment: 'bullish',
    ticker: 'QNTM'
  },
  {
    id: '2',
    user: { name: 'Market Analyst', handle: '@marketpro', verified: true },
    content: '⚠️ Caution on Legacy Systems. Their Q3 numbers don\'t look good. Revenue down 15% YoY. Reducing exposure. #Bearish',
    timestamp: '12m ago',
    likes: 156,
    retweets: 89,
    comments: 67,
    sentiment: 'bearish',
    ticker: 'LGCY'
  },
  {
    id: '3',
    user: { name: 'Startup Watcher', handle: '@startupwatch', verified: false },
    content: 'GreenEnergy Co securing government contracts left and right! This could be the next big thing in the clean energy space. 🌱⚡',
    timestamp: '23m ago',
    likes: 445,
    retweets: 123,
    comments: 56,
    sentiment: 'bullish',
    ticker: 'GREN'
  },
  {
    id: '4',
    user: { name: 'Tech Insider', handle: '@techinsider', verified: true },
    content: 'Breaking: NeuralLink AI announces partnership with major healthcare provider. Stock could gap up tomorrow! 📈 #HealthTech #AI',
    timestamp: '45m ago',
    likes: 892,
    retweets: 234,
    comments: 145,
    sentiment: 'bullish',
    ticker: 'NRLK'
  },
  {
    id: '5',
    user: { name: 'Value Investor', handle: '@valueinv', verified: false },
    content: 'Unpopular opinion: OldRetail Inc is undervalued at current levels. Yes, e-commerce is tough, but their physical presence + loyalty program is strong. Contrarian play.',
    timestamp: '1h ago',
    likes: 67,
    retweets: 12,
    comments: 34,
    sentiment: 'neutral'
  },
  {
    id: '6',
    user: { name: 'Priya Sharma', handle: '@priyasharma', verified: false },
    content: 'My portfolio update: +18% this month! Key winners: QuantumAI (+34%), SolarMax (+22%). Patience pays off 💰',
    timestamp: '1h ago',
    likes: 567,
    retweets: 89,
    comments: 45,
    sentiment: 'bullish'
  },
  {
    id: '7',
    user: { name: 'Bearish Bear', handle: '@bearmarket', verified: true },
    content: '🐻 Market looking overheated. Too much speculation in AI startups. Taking profits and moving to cash. Be careful out there.',
    timestamp: '2h ago',
    likes: 234,
    retweets: 78,
    comments: 123,
    sentiment: 'bearish'
  },
  {
    id: '8',
    user: { name: 'Fintech Focus', handle: '@fintechfocus', verified: false },
    content: 'CryptoPayments processing volume up 300% this quarter! Adoption is accelerating faster than expected. Still early! 🔥',
    timestamp: '2h ago',
    likes: 789,
    retweets: 234,
    comments: 89,
    sentiment: 'bullish',
    ticker: 'CPAY'
  }
];

// Sample discussions/threads
interface Discussion {
  id: string;
  title: string;
  author: string;
  replies: number;
  views: number;
  lastActivity: string;
  pinned?: boolean;
  tags: string[];
}

const sampleDiscussions: Discussion[] = [
  {
    id: 'd1',
    title: '📊 Weekly Market Analysis Thread - December 2024',
    author: 'MarketPro',
    replies: 234,
    views: 4521,
    lastActivity: '2m ago',
    pinned: true,
    tags: ['Analysis', 'Weekly']
  },
  {
    id: 'd2',
    title: 'Best Fintech startups to watch in 2025?',
    author: 'TechInvestor',
    replies: 89,
    views: 1234,
    lastActivity: '15m ago',
    tags: ['Fintech', 'Discussion']
  },
  {
    id: 'd3',
    title: 'AI Startup valuations - are they justified?',
    author: 'SkepticalSam',
    replies: 156,
    views: 2890,
    lastActivity: '32m ago',
    tags: ['AI', 'Valuations']
  },
  {
    id: 'd4',
    title: 'My journey: ₹10L to ₹50L in 18 months',
    author: 'GrowthMindset',
    replies: 445,
    views: 8923,
    lastActivity: '1h ago',
    tags: ['Success Story', 'Portfolio']
  },
  {
    id: 'd5',
    title: 'How to evaluate early-stage startups?',
    author: 'AngelInvestor',
    replies: 78,
    views: 1567,
    lastActivity: '2h ago',
    tags: ['Guide', 'Due Diligence']
  },
  {
    id: 'd6',
    title: 'Green Energy sector outlook - bullish or bubble?',
    author: 'CleanTechFan',
    replies: 112,
    views: 2145,
    lastActivity: '3h ago',
    tags: ['Green Energy', 'Debate']
  }
];

const trendingTopics = [
  { tag: '#QuantumAI', posts: 1234 },
  { tag: '#GreenEnergy', posts: 892 },
  { tag: '#AIStocks', posts: 756 },
  { tag: '#StartupInvesting', posts: 654 },
  { tag: '#FinTech', posts: 543 },
];

export function StockTwits() {
  const [newTweet, setNewTweet] = useState('');
  const [tweets, setTweets] = useState(sampleTweets);
  const [activeTab, setActiveTab] = useState('all');
  const [mainView, setMainView] = useState<'feed' | 'discussions'>('feed');

  const handlePost = () => {
    if (!newTweet.trim()) return;
    
    const tweet: Tweet = {
      id: Date.now().toString(),
      user: { name: 'You', handle: '@me', verified: false },
      content: newTweet,
      timestamp: 'Just now',
      likes: 0,
      retweets: 0,
      comments: 0,
      sentiment: 'neutral'
    };
    
    setTweets([tweet, ...tweets]);
    setNewTweet('');
  };

  const handleLike = (tweetId: string) => {
    setTweets(tweets.map(t => 
      t.id === tweetId ? { ...t, likes: t.likes + 1 } : t
    ));
  };

  const filteredTweets = activeTab === 'all' 
    ? tweets 
    : tweets.filter(t => t.sentiment === activeTab);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            StartupTwits
            <Badge variant="secondary">Live</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={mainView === 'feed' ? 'default' : 'outline'}
              onClick={() => setMainView('feed')}
            >
              Feed
            </Button>
            <Button 
              size="sm" 
              variant={mainView === 'discussions' ? 'default' : 'outline'}
              onClick={() => setMainView('discussions')}
            >
              Discussions
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4">
            {mainView === 'feed' ? (
              <>
                {/* Post Box */}
                <div className="flex gap-3 p-4 border rounded-lg bg-muted/30">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>ME</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="What's your market take?"
                      value={newTweet}
                      onChange={(e) => setNewTweet(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handlePost()}
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-success">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Bullish
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          Bearish
                        </Button>
                      </div>
                      <Button size="sm" onClick={handlePost}>
                        <Send className="h-4 w-4 mr-1" />
                        Post
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Filter Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="bullish" className="text-success">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Bullish
                    </TabsTrigger>
                    <TabsTrigger value="bearish" className="text-destructive">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Bearish
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </>
            ) : (
              /* Discussions View */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Community Discussions</h3>
                  <Button size="sm">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    New Thread
                  </Button>
                </div>
                <div className="space-y-2">
                  {sampleDiscussions.map((discussion) => (
                    <div 
                      key={discussion.id} 
                      className={`p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer ${discussion.pinned ? 'bg-primary/5 border-primary/20' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {discussion.pinned && (
                              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">📌 Pinned</Badge>
                            )}
                            <h4 className="font-medium text-sm">{discussion.title}</h4>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>by @{discussion.author}</span>
                            <span>·</span>
                            <span>{discussion.replies} replies</span>
                            <span>·</span>
                            <span>{discussion.views} views</span>
                            <span>·</span>
                            <span>{discussion.lastActivity}</span>
                          </div>
                          <div className="flex gap-1 mt-2">
                            {discussion.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tweets - only show in feed view */}
            {mainView === 'feed' && (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {filteredTweets.map((tweet) => (
                <div key={tweet.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      {tweet.user.avatar ? (
                        <AvatarImage src={tweet.user.avatar} />
                      ) : (
                        <AvatarFallback>{tweet.user.name[0]}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{tweet.user.name}</span>
                        {tweet.user.verified && (
                          <Badge variant="secondary" className="h-4 px-1 text-xs">✓</Badge>
                        )}
                        <span className="text-muted-foreground text-sm">{tweet.user.handle}</span>
                        <span className="text-muted-foreground text-sm">·</span>
                        <span className="text-muted-foreground text-sm flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {tweet.timestamp}
                        </span>
                        {tweet.sentiment && (
                          <Badge 
                            variant="outline" 
                            className={
                              tweet.sentiment === 'bullish' 
                                ? 'text-success border-success/30' 
                                : tweet.sentiment === 'bearish'
                                ? 'text-destructive border-destructive/30'
                                : ''
                            }
                          >
                            {tweet.sentiment === 'bullish' && <TrendingUp className="h-3 w-3 mr-1" />}
                            {tweet.sentiment === 'bearish' && <TrendingDown className="h-3 w-3 mr-1" />}
                            {tweet.sentiment}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mb-3">{tweet.content}</p>
                      {tweet.ticker && (
                        <Badge variant="secondary" className="mb-3">${tweet.ticker}</Badge>
                      )}
                      <div className="flex items-center gap-6 text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors text-sm">
                          <MessageCircle className="h-4 w-4" />
                          {tweet.comments}
                        </button>
                        <button className="flex items-center gap-1 hover:text-success transition-colors text-sm">
                          <Repeat2 className="h-4 w-4" />
                          {tweet.retweets}
                        </button>
                        <button 
                          className="flex items-center gap-1 hover:text-destructive transition-colors text-sm"
                          onClick={() => handleLike(tweet.id)}
                        >
                          <Heart className="h-4 w-4" />
                          {tweet.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors text-sm">
                          <Share className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>

          {/* Trending Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {trendingTopics.map((topic, i) => (
                  <div key={topic.tag} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer">
                    <div>
                      <p className="font-medium text-sm">{topic.tag}</p>
                      <p className="text-xs text-muted-foreground">{topic.posts} posts</p>
                    </div>
                    <span className="text-xs text-muted-foreground">#{i + 1}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Who to Follow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Market Pro', handle: '@marketpro', followers: '45.2K' },
                  { name: 'Startup Guru', handle: '@startupguru', followers: '32.1K' },
                  { name: 'Tech Analyst', handle: '@techanalyst', followers: '28.9K' },
                ].map((user) => (
                  <div key={user.handle} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.followers} followers</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Follow</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
