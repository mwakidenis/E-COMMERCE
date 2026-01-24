import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import { 
  Zap, 
  Trophy, 
  Users, 
  Share2, 
  Award,
  TrendingUp,
  Lightbulb,
  Target,
  Flame,
  Leaf,
  Star,
  MessageCircle,
  Heart,
  BookOpen,
  Video,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: React.ComponentType<{ className?: string }>;
  progress: number;
  total: number;
  category: string;
}

interface LeaderboardEntry {
  id: string;
  username: string;
  points: number;
  level: number;
  avatar?: string;
  rank: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  earned: boolean;
  date?: string;
}

const YouthEnergyHub = () => {
  const { toast } = useToast();
  const [userPoints, setUserPoints] = useState(1250);
  const [userLevel, setUserLevel] = useState(5);
  const [selectedTab, setSelectedTab] = useState("challenges");

  // Mock challenges data
  const [challenges] = useState<Challenge[]>([
    {
      id: "1",
      title: "Eco-Warrior Streak",
      description: "Order from Green Wells 5 times this month",
      points: 500,
      icon: Flame,
      progress: 3,
      total: 5,
      category: "ordering"
    },
    {
      id: "2",
      title: "Safety Ambassador",
      description: "Complete all safety training modules",
      points: 300,
      icon: Award,
      progress: 7,
      total: 10,
      category: "education"
    },
    {
      id: "3",
      title: "Green Influencer",
      description: "Share 3 energy-saving tips on social media",
      points: 200,
      icon: Share2,
      progress: 1,
      total: 3,
      category: "social"
    },
    {
      id: "4",
      title: "Community Leader",
      description: "Invite 5 friends to join Green Wells",
      points: 400,
      icon: Users,
      progress: 2,
      total: 5,
      category: "referral"
    }
  ]);

  // Mock leaderboard data
  const [leaderboard] = useState<LeaderboardEntry[]>([
    { id: "1", username: "EcoChampion", points: 3500, level: 12, rank: 1 },
    { id: "2", username: "GreenWarrior", points: 3200, level: 11, rank: 2 },
    { id: "3", username: "ClimateHero", points: 2800, level: 10, rank: 3 },
    { id: "4", username: "SustainabilityKing", points: 2500, level: 9, rank: 4 },
    { id: "5", username: "YoungInnovator", points: 1250, level: 5, rank: 5 }
  ]);

  // Mock achievements
  const [achievements] = useState<Achievement[]>([
    {
      id: "1",
      title: "First Order",
      description: "Completed your first Green Wells order",
      icon: Trophy,
      earned: true,
      date: "2025-09-15"
    },
    {
      id: "2",
      title: "Safety Certified",
      description: "Passed the LPG safety certification",
      icon: Award,
      earned: true,
      date: "2025-09-20"
    },
    {
      id: "3",
      title: "Social Butterfly",
      description: "Shared your first energy-saving tip",
      icon: Share2,
      earned: true,
      date: "2025-10-01"
    },
    {
      id: "4",
      title: "Sustainability Expert",
      description: "Reduce your carbon footprint by 50%",
      icon: Leaf,
      earned: false
    },
    {
      id: "5",
      title: "Community Builder",
      description: "Refer 10 friends to Green Wells",
      icon: Users,
      earned: false
    },
    {
      id: "6",
      title: "Energy Master",
      description: "Complete all energy challenges",
      icon: Zap,
      earned: false
    }
  ]);

  const levelProgress = ((userPoints % 500) / 500) * 100;

  const handleShareAchievement = (achievement: string) => {
    // In production, this would integrate with actual social media APIs
    toast({
      title: "Ready to Share!",
      description: `Share "${achievement}" on your favorite social media platform`,
    });
  };

  const handleStartChallenge = (challengeId: string) => {
    toast({
      title: "Challenge Accepted!",
      description: "Track your progress in the Challenges tab",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      ordering: "bg-blue-500",
      education: "bg-purple-500",
      social: "bg-pink-500",
      referral: "bg-green-500"
    };
    return colors[category] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pb-20 md:pb-0 md:pt-16">
      <Navbar />
      <div className="container mx-auto p-4 max-w-7xl pt-6">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-10 w-10 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Youth Energy Hub
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Learn, compete, and lead the green energy revolution! 🌱
          </p>
        </div>

        {/* User Stats Card */}
        <Card className="mb-6 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-2 animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-primary">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-white">
                    YI
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold">YoungInnovator</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-gradient-to-r from-primary to-accent">
                      Level {userLevel}
                    </Badge>
                    <Badge variant="outline" className="border-primary text-primary">
                      {userPoints} Points
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex-1 max-w-md w-full">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Level Progress</span>
                  <span className="text-sm text-muted-foreground">{userPoints % 500}/500 XP</span>
                </div>
                <Progress value={levelProgress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  {500 - (userPoints % 500)} XP to Level {userLevel + 1}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="learn" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Learn</span>
            </TabsTrigger>
          </TabsList>

          {/* Seasonal Events Tab */}
          <TabsContent value="events" className="space-y-4 animate-fade-in">
            {/* Active Seasonal Event Banner */}
            <Card className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Leaf className="h-8 w-8 text-green-600" />
                      Earth Month Celebration
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Special challenges and exclusive badges available until the end of the month!
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-600 text-white">Active</Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Limited Edition Badges */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                Limited Edition Badges
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    id: "1",
                    title: "Earth Day Pioneer",
                    description: "Early adopter during Earth Month celebration",
                    rarity: "legendary",
                    icon: "🌍",
                    maxEarners: 100,
                    currentEarners: 47,
                    requirement: "Place 1 order during the event"
                  },
                  {
                    id: "2",
                    title: "Green Champion",
                    description: "Complete 5 eco-challenges during the event",
                    rarity: "epic",
                    icon: "🏆",
                    maxEarners: 500,
                    currentEarners: 234,
                    requirement: "Complete 5 challenges"
                  },
                  {
                    id: "3",
                    title: "Sustainability Star",
                    description: "Reduce energy usage by 30%",
                    rarity: "rare",
                    icon: "⭐",
                    maxEarners: 1000,
                    currentEarners: 678,
                    requirement: "30% energy reduction"
                  }
                ].map((badge, index) => {
                  const rarityColors = {
                    legendary: "from-amber-400 to-yellow-600",
                    epic: "from-purple-400 to-pink-600",
                    rare: "from-blue-400 to-cyan-600"
                  };
                  return (
                    <Card 
                      key={badge.id}
                      className="border-2 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <CardContent className="pt-6">
                        <div className="text-center mb-4">
                          <div className={`mx-auto w-24 h-24 rounded-full bg-gradient-to-br ${rarityColors[badge.rarity as keyof typeof rarityColors]} flex items-center justify-center text-5xl mb-3 shadow-lg`}>
                            {badge.icon}
                          </div>
                          <Badge className={`bg-gradient-to-r ${rarityColors[badge.rarity as keyof typeof rarityColors]} text-white mb-2`}>
                            {badge.rarity.toUpperCase()}
                          </Badge>
                          <h4 className="font-bold text-lg">{badge.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Requirement</p>
                            <p className="text-sm font-semibold">{badge.requirement}</p>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Claimed</span>
                              <span className="font-semibold">{badge.currentEarners}/{badge.maxEarners}</span>
                            </div>
                            <Progress value={(badge.currentEarners / badge.maxEarners) * 100} className="h-2" />
                          </div>
                          <Button className="w-full gap-2">
                            <Target className="h-4 w-4" />
                            Start Challenge
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-4 animate-fade-in">
            <div className="grid gap-4 md:grid-cols-2">
              {challenges.map((challenge, index) => (
                <Card 
                  key={challenge.id} 
                  className="hover:shadow-lg transition-all duration-300 opacity-0 animate-[fade-in_0.5s_ease-out_forwards] hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${getCategoryColor(challenge.category)}`}>
                          <challenge.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                          <CardDescription className="mt-1">{challenge.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        +{challenge.points} XP
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-muted-foreground">
                            {challenge.progress}/{challenge.total}
                          </span>
                        </div>
                        <Progress 
                          value={(challenge.progress / challenge.total) * 100} 
                          className="h-2"
                        />
                      </div>
                      <Button 
                        onClick={() => handleStartChallenge(challenge.id)}
                        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      >
                        Continue Challenge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-4 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Top Energy Innovators
                </CardTitle>
                <CardDescription>
                  Compete with peers and climb the rankings!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 hover:shadow-md ${
                        entry.rank === 5 ? 'bg-primary/5 border-primary' : 'hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 text-center">
                          {entry.rank <= 3 ? (
                            <Trophy 
                              className={`h-8 w-8 mx-auto ${
                                entry.rank === 1 ? 'text-yellow-500' : 
                                entry.rank === 2 ? 'text-gray-400' : 
                                'text-amber-700'
                              }`} 
                            />
                          ) : (
                            <span className="text-2xl font-bold text-muted-foreground">
                              {entry.rank}
                            </span>
                          )}
                        </div>
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                            {entry.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{entry.username}</p>
                          <p className="text-sm text-muted-foreground">Level {entry.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{entry.points.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4 animate-fade-in">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement, index) => (
                <Card 
                  key={achievement.id}
                  className={`transition-all duration-300 opacity-0 animate-[fade-in_0.5s_ease-out_forwards] ${
                    achievement.earned 
                      ? 'border-primary shadow-lg hover:-translate-y-1' 
                      : 'opacity-50 hover:opacity-70'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="pt-6 text-center">
                    <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                      achievement.earned 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                        : 'bg-muted'
                    }`}>
                      <achievement.icon 
                        className={`h-10 w-10 ${
                          achievement.earned ? 'text-white' : 'text-muted-foreground'
                        }`} 
                      />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {achievement.description}
                    </p>
                    {achievement.earned ? (
                      <>
                        <Badge className="bg-green-500 hover:bg-green-600 mb-3">
                          Earned {achievement.date}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleShareAchievement(achievement.title)}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </>
                    ) : (
                      <Badge variant="outline">Locked</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Learn Tab */}
          <TabsContent value="learn" className="space-y-4 animate-fade-in">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Educational Content Cards */}
              <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-full bg-blue-500">
                      <Video className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>Energy Efficiency 101</CardTitle>
                  </div>
                  <CardDescription>
                    Learn how to optimize your LPG usage and save money
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <Button className="w-full">Watch Video (5 min)</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-full bg-green-500">
                      <Leaf className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>Sustainable Living Guide</CardTitle>
                  </div>
                  <CardDescription>
                    Tips for reducing your carbon footprint
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">10 Easy eco-friendly habits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Understanding carbon emissions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Green energy alternatives</span>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">Read Article</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-full bg-purple-500">
                      <Lightbulb className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>Safety First</CardTitle>
                  </div>
                  <CardDescription>
                    Essential LPG safety guidelines
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <Lightbulb className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <Button className="w-full">Start Interactive Quiz</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-full bg-pink-500">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>Community Forum</CardTitle>
                  </div>
                  <CardDescription>
                    Connect with fellow energy innovators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">💡 Energy Saving Tips</p>
                      <p className="text-xs text-muted-foreground">124 discussions</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">🌍 Sustainability Stories</p>
                      <p className="text-xs text-muted-foreground">89 discussions</p>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">Join Discussion</Button>
                </CardContent>
              </Card>
            </div>

            {/* Social Sharing Section */}
            <Card className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-6 w-6" />
                  Share Your Journey
                </CardTitle>
                <CardDescription>
                  Inspire others by sharing your energy-saving achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Share2 className="mr-2 h-4 w-4" />
                    Twitter
                  </Button>
                  <Button className="bg-blue-800 hover:bg-blue-900">
                    <Share2 className="mr-2 h-4 w-4" />
                    Facebook
                  </Button>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90">
                    <Share2 className="mr-2 h-4 w-4" />
                    Instagram
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Share2 className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default YouthEnergyHub;
