import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import { 
  Package, 
  TrendingUp, 
  Users, 
  DollarSign, 
  MapPin, 
  Clock,
  Truck,
  Activity,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Zap,
  Award,
  Star,
  Gift,
  Sparkles,
  Trophy,
  Flame,
  Target,
  ArrowRight,
  TrendingDown,
  Leaf,
  MessageCircle,
  Heart,
  ShoppingBag
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';

interface DashboardStats {
  totalOrders: number;
  activeDeliveries: number;
  totalRevenue: number;
  averageDeliveryTime: number;
  completionRate: number;
  pendingOrders: number;
  userPoints: number;
  userLevel: number;
  streakDays: number;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: number;
  icon: React.ComponentType<{ className?: string }>;
}

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    activeDeliveries: 0,
    totalRevenue: 0,
    averageDeliveryTime: 0,
    completionRate: 0,
    pendingOrders: 0,
    userPoints: 0,
    userLevel: 1,
    streakDays: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [ordersData, setOrdersData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [revenueData, setRevenueData] = useState<{ week: string; revenue: number }[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view dashboard",
          variant: "destructive",
        });
        return;
      }

      // Fetch user profile
      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();

      setUserName(profile?.full_name?.split(' ')[0] || "User");

      // Fetch user stats from Youth Hub
      const { data: userStats } = await (supabase
        .from("youth_user_stats") as any)
        .select("points, level")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fetch all orders
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Calculate statistics
      const totalOrders = orders?.length || 0;
      const activeDeliveries = orders?.filter(o => o.delivery_status === 'in_transit').length || 0;
      const pendingOrders = orders?.filter(o => o.delivery_status === 'pending').length || 0;
      const completedOrders = orders?.filter(o => o.delivery_status === 'delivered').length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_cost || 0), 0) || 0;
      const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

      // Calculate streak (mock calculation - would need proper logic)
      const streakDays = Math.min(totalOrders * 2, 15);

      setStats({
        totalOrders,
        activeDeliveries,
        totalRevenue,
        averageDeliveryTime: 45,
        completionRate,
        pendingOrders,
        userPoints: userStats?.points || 0,
        userLevel: userStats?.level || 1,
        streakDays,
      });

      // Prepare chart data
      const ordersByStatus = [
        { name: 'Pending', value: pendingOrders, color: '#f59e0b' },
        { name: 'In Transit', value: activeDeliveries, color: '#3b82f6' },
        { name: 'Delivered', value: completedOrders, color: '#10b981' },
      ];

      setOrdersData(ordersByStatus);

      // Mock revenue data by week
      const mockRevenueData = [
        { week: 'Week 1', revenue: 12500 },
        { week: 'Week 2', revenue: 15800 },
        { week: 'Week 3', revenue: 18200 },
        { week: 'Week 4', revenue: totalRevenue },
      ];

      setRevenueData(mockRevenueData);

      // Fetch AI recommendations
      const { data: recs } = await (supabase
        .from("user_recommendations") as any)
        .select("id, title, description, recommendation_type, priority")
        .eq("user_id", user.id)
        .order("priority", { ascending: false })
        .limit(3);

      if (recs && recs.length > 0) {
        setRecommendations(recs.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          type: r.recommendation_type,
          priority: r.priority,
          icon: getRecommendationIcon(r.recommendation_type),
        })));
      } else {
        // Generate default recommendations
        setRecommendations([
          {
            id: '1',
            title: 'Try our new 50kg cylinder',
            description: 'Get 20% off on your first 50kg order this month',
            type: 'product',
            priority: 1,
            icon: Package,
          },
          {
            id: '2',
            title: 'Complete Safety Training',
            description: 'Earn 300 points by completing all safety modules',
            type: 'challenge',
            priority: 2,
            icon: Award,
          },
          {
            id: '3',
            title: 'Invite Friends, Earn Rewards',
            description: 'Get 500 points for each friend who makes an order',
            type: 'tip',
            priority: 3,
            icon: Users,
          },
        ]);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load dashboard data";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'order': return ShoppingBag;
      case 'challenge': return Award;
      case 'reward': return Gift;
      case 'product': return Package;
      default: return Sparkles;
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue, 
    gradient,
    delay = 0 
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    trend?: string;
    trendValue?: string;
    gradient: string;
    delay?: number;
  }) => (
    <Card 
      className="opacity-0 animate-[fade-in_0.5s_ease-out_forwards] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 overflow-hidden group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-3 rounded-full bg-gradient-to-br ${gradient} text-white`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold animate-counter">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
              {trendValue}
            </span>
            from last week
          </p>
        )}
      </CardContent>
    </Card>
  );

  const PerformanceCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor,
    bgColor,
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    bgColor: string;
  }) => (
    <Card className="hover:shadow-xl transition-shadow border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${bgColor}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 pb-20 md:pb-0 md:pt-16">
      <Navbar />
      <div className="container mx-auto p-4 max-w-7xl pt-6 space-y-6">
        {/* Welcome Header with Gamification */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-accent p-8 text-white shadow-2xl animate-fade-in">
          <div className="absolute top-0 right-0 opacity-10">
            <Sparkles className="h-64 w-64" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  Welcome back, {userName}! 
                  <Flame className="h-10 w-10 text-yellow-300 animate-pulse" />
                </h1>
                <p className="text-white/80 text-lg">Your eco-journey continues! 🌱</p>
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-300" />
                    <span className="font-semibold">Level {stats.userLevel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-300" />
                    <span className="font-semibold">{stats.userPoints} Points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-300" />
                    <span className="font-semibold">{stats.streakDays} Day Streak</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center">
                    <Award className="h-12 w-12 text-yellow-300" />
                  </div>
                  <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 hover:bg-yellow-400">
                    Eco Warrior
                  </Badge>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-white/80">Progress to Level {stats.userLevel + 1}</span>
                <span className="text-sm font-semibold">{stats.userPoints % 1000}/1000 XP</span>
              </div>
              <Progress value={(stats.userPoints % 1000) / 10} className="h-3 bg-white/20" />
            </div>
          </div>
        </div>

        {/* AI-Powered Recommendations */}
        {recommendations.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Personalized For You
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {recommendations.map((rec, idx) => (
                <Card 
                  key={rec.id}
                  className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-2 hover:border-primary"
                  style={{ animationDelay: `${100 + idx * 50}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <rec.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{rec.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                        <Button size="sm" variant="ghost" className="gap-2">
                          Learn More <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={Package}
            trend="up"
            trendValue="+12.5%"
            gradient="from-blue-500 to-blue-600"
            delay={0}
          />
          <StatCard
            title="Active Deliveries"
            value={stats.activeDeliveries}
            icon={Truck}
            trend="up"
            trendValue="+8.2%"
            
            gradient="from-purple-500 to-purple-600"
            delay={100}
          />
          <StatCard
            title="Total Savings"
            value={`KES ${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend="up"
            trendValue="+23.1%"
            
            gradient="from-green-500 to-green-600"
            delay={200}
          />
          <StatCard
            title="Success Rate"
            value={`${stats.completionRate.toFixed(1)}%`}
            icon={CheckCircle2}
            trend="up"
            trendValue="+5.4%"
            
            gradient="from-emerald-500 to-emerald-600"
            delay={300}
          />
        </div>

        {/* Quick Actions */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks at your fingertips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Package, label: "New Order", color: "bg-blue-500", action: () => navigate("/order") },
                { icon: MapPin, label: "Track Delivery", color: "bg-purple-500", action: () => navigate("/tracking") },
                { icon: Gift, label: "Rewards", color: "bg-pink-500", action: () => navigate("/youth-hub") },
                { icon: Trophy, label: "Challenges", color: "bg-amber-500", action: () => navigate("/youth-hub") },
              ].map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.action}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all transform hover:scale-105 group"
                >
                  <div className={`p-4 rounded-full ${action.color} text-white group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 animate-fade-in">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Orders Distribution */}
              <Card className="hover:shadow-xl transition-shadow border-2">
                <CardHeader>
                  <CardTitle>Order Distribution</CardTitle>
                  <CardDescription>Current status breakdown</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ordersData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {ordersData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue Trend */}
              <Card className="hover:shadow-xl transition-shadow border-2">
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly performance overview</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10b981" 
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        animationDuration={1000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 animate-fade-in">
            <Card className="hover:shadow-xl transition-shadow border-2">
              <CardHeader>
                <CardTitle>Order Analytics</CardTitle>
                <CardDescription>Detailed breakdown of your orders</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" animationDuration={800} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4 animate-fade-in">
            <div className="grid gap-4 md:grid-cols-3">
              <PerformanceCard
                title="Avg. Delivery Time"
                value={`${stats.averageDeliveryTime} min`}
                subtitle="Target: 45 minutes"
                icon={Clock}
                iconColor="text-blue-500"
                bgColor="bg-blue-50"
              />
              <PerformanceCard
                title="Pending Orders"
                value={stats.pendingOrders}
                subtitle="Awaiting processing"
                icon={AlertCircle}
                iconColor="text-yellow-500"
                bgColor="bg-yellow-50"
              />
              <PerformanceCard
                title="Success Rate"
                value={`${stats.completionRate.toFixed(1)}%`}
                subtitle="Orders completed"
                icon={TrendingUp}
                iconColor="text-green-500"
                bgColor="bg-green-50"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
