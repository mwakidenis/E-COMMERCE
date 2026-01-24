import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import { 
  Gift, 
  Star, 
  ShoppingBag, 
  Ticket, 
  Crown,
  Sparkles,
  Check,
  TrendingUp,
  Award,
  Zap,
  Heart,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Reward {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  points_required: number;
  discount_percentage?: number;
  discount_amount?: number;
  category: 'discount' | 'gift' | 'service' | 'exclusive';
  quantity_available?: number;
  is_active: boolean;
  expires_at?: string;
}

interface UserRedemption {
  id: string;
  reward_id: string;
  points_spent: number;
  redemption_code: string;
  status: 'active' | 'used' | 'expired';
  redeemed_at: string;
  expires_at?: string;
}

const RewardsMarketplace = () => {
  const { toast } = useToast();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<UserRedemption[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchRewards();
    fetchUserData();
    fetchRedemptions();
  }, []);

  const fetchRewards = async () => {
    try {
      const { data, error } = await (supabase
        .from("rewards") as any)
        .select("*")
        .order("points_required", { ascending: true });

      if (error) throw error;
      const mapped = (data || []).map((r: any) => ({
        id: r.id,
        title: r.name,
        description: r.description,
        image_url: r.image_url || undefined,
        points_required: r.points_required,
        discount_percentage: r.discount_percentage || undefined,
        discount_amount: r.discount_amount || undefined,
        category: r.category,
        quantity_available: r.available_quantity,
        is_active: true,
        expires_at: r.expires_at || undefined,
      } as Reward));
      setRewards(mapped);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      toast({
        title: "Error",
        description: "Failed to load rewards",
        variant: "destructive",
      });
    }
  };

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase
        .from("youth_user_stats") as any)
        .select("points")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setUserPoints(data?.points || 0);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRedemptions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase
        .from("reward_redemptions") as any)
        .select("*")
        .eq("user_id", user.id)
        .order("redeemed_at", { ascending: false });

      if (error) throw error;
      setRedemptions(data || []);
    } catch (error) {
      console.error("Error fetching redemptions:", error);
    }
  };

  const redeemReward = async (reward: Reward) => {
    if (userPoints < reward.points_required) {
      toast({
        title: "Insufficient Points",
        description: `You need ${reward.points_required - userPoints} more points to redeem this reward.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate redemption code
      const redemptionCode = `GW-${Date.now().toString(36).toUpperCase()}`;
      
      // Create redemption record
      const { error: redemptionError } = await (supabase
        .from("reward_redemptions") as any)
        .insert({
          user_id: user.id,
          reward_id: reward.id,
          points_spent: reward.points_required,
          redemption_code: redemptionCode,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (redemptionError) throw redemptionError;

      // Update user points
      const { error: updateError } = await (supabase
        .from("youth_user_stats") as any)
        .update({ points: userPoints - reward.points_required })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Update quantity if applicable
      if (reward.quantity_available !== null) {
        await (supabase
          .from("rewards") as any)
          .update({ available_quantity: (reward.quantity_available || 1) - 1 })
          .eq("id", reward.id);
      }

      setUserPoints(userPoints - reward.points_required);
      fetchRedemptions();

      toast({
        title: "Reward Redeemed! 🎉",
        description: `Your redemption code is: ${redemptionCode}`,
        duration: 7000,
      });
    } catch (error) {
      console.error("Error redeeming reward:", error);
      toast({
        title: "Error",
        description: "Failed to redeem reward. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'discount': return Ticket;
      case 'gift': return Gift;
      case 'service': return Star;
      case 'exclusive': return Crown;
      default: return ShoppingBag;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'discount': return 'bg-blue-500';
      case 'gift': return 'bg-purple-500';
      case 'service': return 'bg-green-500';
      case 'exclusive': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredRewards = selectedCategory === "all" 
    ? rewards 
    : rewards.filter(r => r.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple/5 to-pink/10 pb-20 md:pb-0 md:pt-16">
      <Navbar />
      <div className="container mx-auto p-4 max-w-7xl pt-6 space-y-6">
        {/* Header with Points Display */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 opacity-10">
            <Gift className="h-64 w-64" />
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <ShoppingBag className="h-10 w-10" />
              Rewards Marketplace
            </h1>
            <p className="text-white/90 mb-6">Redeem your points for amazing rewards!</p>
            
            <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
              <div>
                <p className="text-white/80 text-sm mb-2">Your Points Balance</p>
                <div className="flex items-center gap-3">
                  <Star className="h-8 w-8 text-yellow-300 fill-yellow-300" />
                  <span className="text-5xl font-bold">{userPoints.toLocaleString()}</span>
                </div>
              </div>
              
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => window.location.href = "/youth-hub"}
                className="gap-2"
              >
                <Zap className="h-5 w-5" />
                Earn More Points
              </Button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "all", label: "All Rewards", icon: ShoppingBag },
            { value: "discount", label: "Discounts", icon: Ticket },
            { value: "gift", label: "Gifts", icon: Gift },
            { value: "service", label: "Services", icon: Star },
            { value: "exclusive", label: "Exclusive", icon: Crown },
          ].map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.value)}
              className="gap-2"
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Rewards Grid */}
        <Tabs defaultValue="available" className="space-y-4">
          <TabsList>
            <TabsTrigger value="available">Available Rewards</TabsTrigger>
            <TabsTrigger value="redeemed">My Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredRewards.map((reward) => {
                const CategoryIcon = getCategoryIcon(reward.category);
                const canAfford = userPoints >= reward.points_required;
                const isLimited = reward.quantity_available !== null && reward.quantity_available !== undefined;
                const isSoldOut = isLimited && reward.quantity_available <= 0;

                return (
                  <Card 
                    key={reward.id}
                    className={cn(
                      "overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2",
                      !canAfford && "opacity-60",
                      isSoldOut && "opacity-40"
                    )}
                  >
                    <div className={cn("h-2", getCategoryColor(reward.category))} />
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={cn("p-3 rounded-full", getCategoryColor(reward.category), "text-white")}>
                          <CategoryIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="secondary" className="gap-1">
                            <Star className="h-3 w-3" />
                            {reward.points_required}
                          </Badge>
                          {isLimited && (
                            <Badge variant="outline" className="text-xs">
                              {reward.quantity_available} left
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="mt-4">{reward.title}</CardTitle>
                      <CardDescription>{reward.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {reward.discount_percentage && (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg">
                          <p className="text-green-700 font-semibold text-center">
                            {reward.discount_percentage}% OFF
                          </p>
                        </div>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full gap-2" 
                            disabled={!canAfford || isSoldOut}
                          >
                            {isSoldOut ? (
                              <>Sold Out</>
                            ) : !canAfford ? (
                              <>Need {reward.points_required - userPoints} more points</>
                            ) : (
                              <>
                                <Gift className="h-4 w-4" />
                                Redeem Now
                              </>
                            )}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Redemption</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to redeem {reward.points_required} points for {reward.title}?
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-4 bg-muted rounded-lg space-y-2">
                              <div className="flex justify-between">
                                <span>Current Points:</span>
                                <span className="font-semibold">{userPoints}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Cost:</span>
                                <span className="font-semibold text-red-500">-{reward.points_required}</span>
                              </div>
                              <div className="border-t pt-2 flex justify-between">
                                <span>Remaining:</span>
                                <span className="font-bold">{userPoints - reward.points_required}</span>
                              </div>
                            </div>
                            <Button 
                              className="w-full gap-2" 
                              onClick={() => redeemReward(reward)}
                            >
                              <Check className="h-4 w-4" />
                              Confirm Redemption
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="redeemed">
            {redemptions.length === 0 ? (
              <Card className="p-12 text-center">
                <Gift className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Rewards Yet</h3>
                <p className="text-muted-foreground mb-4">Start redeeming rewards to see them here!</p>
                <Button onClick={() => setSelectedCategory("all")}>
                  Browse Rewards
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {redemptions.map((redemption) => {
                  const reward = rewards.find(r => r.id === redemption.reward_id);
                  if (!reward) return null;

                  return (
                    <Card key={redemption.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{reward.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <Badge variant={redemption.status === 'active' ? 'default' : 'secondary'}>
                                {redemption.status}
                              </Badge>
                              <span className="text-muted-foreground">
                                Code: <span className="font-mono font-semibold">{redemption.redemption_code}</span>
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              Redeemed: {new Date(redemption.redeemed_at).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className="gap-1">
                              <Star className="h-3 w-3" />
                              {redemption.points_spent}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RewardsMarketplace;
