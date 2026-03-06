import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Startup } from '@/types/database';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Eye, TrendingUp, ArrowUp, ArrowDown, Clock, Globe, Users, Smartphone, Monitor } from 'lucide-react';

interface Props {
  startup: Startup;
}

// Generate realistic sample view data
function generateViewData(startupName: string) {
  const today = new Date();
  const hourlyData = [];
  const seed = startupName.length * 7;

  // Last 24 hours hourly data
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(today);
    hour.setHours(hour.getHours() - i);
    const baseViews = Math.floor(Math.sin((24 - i) / 4) * 15 + 20 + (seed % 10));
    const views = Math.max(2, baseViews + Math.floor(Math.random() * 8 - 4));
    hourlyData.push({
      time: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      views,
    });
  }

  // Last 7 days daily data
  const dailyData = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const baseViews = Math.floor(Math.sin(i) * 40 + 80 + (seed % 30));
    dailyData.push({
      day: day.toLocaleDateString('en-US', { weekday: 'short' }),
      views: Math.max(20, baseViews + Math.floor(Math.random() * 25)),
      uniqueVisitors: Math.max(10, Math.floor(baseViews * 0.65 + Math.random() * 15)),
    });
  }

  // Last 30 days for monthly data
  const monthlyData = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const baseViews = Math.floor(Math.sin(i / 5) * 30 + 60 + (seed % 20));
    monthlyData.push({
      date: `${day.getDate()}/${day.getMonth() + 1}`,
      views: Math.max(15, baseViews + Math.floor(Math.random() * 20)),
    });
  }

  const todayViews = hourlyData.reduce((sum, h) => sum + h.views, 0);
  const weekViews = dailyData.reduce((sum, d) => sum + d.views, 0);
  const monthViews = monthlyData.reduce((sum, m) => sum + m.views, 0);
  const weekUniqueVisitors = dailyData.reduce((sum, d) => sum + d.uniqueVisitors, 0);

  // Referral sources
  const sources = [
    { name: 'Direct Search', views: Math.floor(weekViews * 0.35), icon: Globe, pct: 35 },
    { name: 'AI Matching', views: Math.floor(weekViews * 0.28), icon: TrendingUp, pct: 28 },
    { name: 'Sector Browse', views: Math.floor(weekViews * 0.22), icon: Users, pct: 22 },
    { name: 'External Link', views: Math.floor(weekViews * 0.15), icon: Globe, pct: 15 },
  ];

  // Device breakdown
  const devices = [
    { name: 'Mobile', pct: 62, icon: Smartphone },
    { name: 'Desktop', pct: 33, icon: Monitor },
    { name: 'Tablet', pct: 5, icon: Monitor },
  ];

  const yesterdayViews = Math.floor(todayViews * (0.8 + Math.random() * 0.4));
  const changePercent = ((todayViews - yesterdayViews) / yesterdayViews * 100).toFixed(1);
  const isUp = todayViews >= yesterdayViews;

  return { hourlyData, dailyData, monthlyData, todayViews, weekViews, monthViews, weekUniqueVisitors, sources, devices, changePercent, isUp };
}

export function StartupProfileViews({ startup }: Props) {
  const [viewData, setViewData] = useState<ReturnType<typeof generateViewData> | null>(null);

  useEffect(() => {
    setViewData(generateViewData(startup.name));
  }, [startup.name]);

  if (!viewData) return null;

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Today</p>
                <p className="text-2xl font-bold mt-1">{viewData.todayViews}</p>
                <div className={`flex items-center gap-1 text-xs mt-1 ${viewData.isUp ? 'text-success' : 'text-destructive'}`}>
                  {viewData.isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {viewData.changePercent}% vs yesterday
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">This Week</p>
                <p className="text-2xl font-bold mt-1">{viewData.weekViews}</p>
                <p className="text-xs text-muted-foreground mt-1">{viewData.weekUniqueVisitors} unique</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">This Month</p>
                <p className="text-2xl font-bold mt-1">{viewData.monthViews}</p>
                <p className="text-xs text-muted-foreground mt-1">30-day total</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg / Day</p>
                <p className="text-2xl font-bold mt-1">{Math.round(viewData.monthViews / 30)}</p>
                <p className="text-xs text-muted-foreground mt-1">page views</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              Today's Views (Hourly)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={viewData.hourlyData}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                  <XAxis dataKey="time" stroke="hsl(215, 20%, 55%)" fontSize={10} interval={3} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} />
                  <Tooltip contentStyle={{ background: 'hsl(222, 45%, 9%)', border: '1px solid hsl(222, 30%, 18%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }} />
                  <Area type="monotone" dataKey="views" stroke="hsl(38, 92%, 50%)" fill="url(#viewsGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              Weekly Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewData.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                  <XAxis dataKey="day" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'hsl(222, 45%, 9%)', border: '1px solid hsl(222, 30%, 18%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }} />
                  <Bar dataKey="views" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} name="Total Views" />
                  <Bar dataKey="uniqueVisitors" fill="hsl(160, 70%, 42%)" radius={[4, 4, 0, 0]} name="Unique Visitors" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sources & Devices */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Traffic Sources</CardTitle>
            <CardDescription>Where your profile views come from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {viewData.sources.map((source) => (
              <div key={source.name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <source.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{source.name}</span>
                    <span className="text-sm text-muted-foreground">{source.views} views</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${source.pct}%` }} />
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">{source.pct}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Device Breakdown</CardTitle>
            <CardDescription>How investors view your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {viewData.devices.map((device) => (
              <div key={device.name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <device.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{device.name}</span>
                    <Badge variant="secondary" className="text-xs">{device.pct}%</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full transition-all" style={{ width: `${device.pct}%` }} />
                  </div>
                </div>
              </div>
            ))}

            {/* Peak Hours */}
            <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Peak Viewing Hours</p>
              <p className="text-sm font-medium">10:00 AM - 2:00 PM & 7:00 PM - 10:00 PM</p>
              <p className="text-xs text-muted-foreground mt-1">Most investors browse during these windows</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
