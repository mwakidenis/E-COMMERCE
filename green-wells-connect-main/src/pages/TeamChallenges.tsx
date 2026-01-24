import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { 
  Users, 
  Trophy, 
  Plus,
  Crown,
  Target,
  Flame,
  Star,
  Award,
  TrendingUp,
  UserPlus,
  Check,
  Clock,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Team {
  id: string;
  name: string;
  description?: string;
  creator_id: string;
  avatar_url?: string;
  total_points: number;
  member_count: number;
  created_at: string;
}

interface TeamChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  total_required: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
}

interface TeamChallengeProgress {
  id: string;
  team_id: string;
  challenge_id: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
}

const TeamChallenges = () => {
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [challenges, setChallenges] = useState<TeamChallenge[]>([]);
  const [progress, setProgress] = useState<TeamChallengeProgress[]>([]);
  const [leaderboard, setLeaderboard] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchMyTeam(),
        fetchChallenges(),
        fetchLeaderboard(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTeam = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's team membership
      const { data: membership } = await (supabase
        .from("team_members") as any)
        .select("team_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (membership) {
        // Get team details
        const { data: team } = await (supabase
          .from("teams") as any)
          .select("*")
          .eq("id", membership.team_id)
          .maybeSingle();

        setMyTeam(team);
        
        // Get team's challenge progress
        const { data: teamProgress } = await (supabase
          .from("team_challenge_progress") as any)
          .select("*")
          .eq("team_id", membership.team_id);

        setProgress(teamProgress || []);
      }
    } catch (error) {
      console.error("Error fetching team:", error);
    }
  };

  const fetchChallenges = async () => {
    try {
      const { data } = await (supabase
        .from("team_challenges") as any)
        .select("*")
        .eq("is_active", true)
        .order("points", { ascending: false });

      setChallenges(data || []);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data } = await (supabase
        .from("teams") as any)
        .select("*")
        .order("total_points", { ascending: false })
        .limit(10);

      setLeaderboard(data || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a team name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create team
      const { data: team, error: teamError } = await (supabase
        .from("teams") as any)
        .insert({
          name: newTeamName,
          description: newTeamDesc,
          creator_id: user.id,
        })
        .select()
        .maybeSingle();

      if (teamError) throw teamError;

      // Add creator as team admin
      const { error: memberError } = await (supabase
        .from("team_members") as any)
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: "admin",
        });

      if (memberError) throw memberError;

      toast({
        title: "Team Created! 🎉",
        description: `${newTeamName} is ready for action!`,
      });

      setCreateDialogOpen(false);
      setNewTeamName("");
      setNewTeamDesc("");
      fetchMyTeam();
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      });
    }
  };

  const getChallengeProgress = (challengeId: string) => {
    return progress.find(p => p.challenge_id === challengeId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue/5 to-purple/10 pb-20 md:pb-0 md:pt-16">
      <Navbar />
      <div className="container mx-auto p-4 max-w-7xl pt-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 opacity-10">
            <Users className="h-64 w-64" />
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Users className="h-10 w-10" />
              Team Challenges
            </h1>
            <p className="text-white/90">Compete together, win together! 🏆</p>
          </div>
        </div>

        {/* My Team Section */}
        {myTeam ? (
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-4 border-primary">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xl">
                      {myTeam.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{myTeam.name}</CardTitle>
                    <CardDescription>{myTeam.description || "No description"}</CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Trophy className="h-4 w-4" />
                    {myTeam.total_points} Points
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Users className="h-4 w-4" />
                    {myTeam.member_count} Members
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        ) : (
          <Card className="border-2 border-dashed">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Team Yet</h3>
              <p className="text-muted-foreground mb-6">Create or join a team to start competing!</p>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2">
                    <Plus className="h-5 w-5" />
                    Create Team
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Your Team</DialogTitle>
                    <DialogDescription>
                      Start your own team and invite friends to join!
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="team-name">Team Name *</Label>
                      <Input
                        id="team-name"
                        placeholder="The Eco Warriors"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="team-desc">Description (Optional)</Label>
                      <Textarea
                        id="team-desc"
                        placeholder="We're committed to saving energy and the planet!"
                        value={newTeamDesc}
                        onChange={(e) => setNewTeamDesc(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={createTeam} className="gap-2">
                      <Check className="h-4 w-4" />
                      Create Team
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {/* Challenges and Leaderboard */}
        <Tabs defaultValue="challenges" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="challenges" className="gap-2">
              <Target className="h-4 w-4" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {challenges.map((challenge) => {
                const challengeProgress = getChallengeProgress(challenge.id);
                const progressPercent = challengeProgress 
                  ? (challengeProgress.progress / challenge.total_required) * 100 
                  : 0;
                const isCompleted = challengeProgress?.completed || false;

                return (
                  <Card 
                    key={challenge.id}
                    className={cn(
                      "hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1",
                      isCompleted && "border-2 border-green-500"
                    )}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {challenge.title}
                            {isCompleted && <Check className="h-5 w-5 text-green-500" />}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {challenge.description}
                          </CardDescription>
                        </div>
                        <Badge className="gap-1">
                          <Star className="h-3 w-3" />
                          {challenge.points}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">
                            {challengeProgress?.progress || 0} / {challenge.total_required}
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-3" />
                        {myTeam && !isCompleted && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Keep going! Your team is making progress 🚀
                          </p>
                        )}
                        {isCompleted && (
                          <p className="text-xs text-green-600 font-semibold mt-2 flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            Completed! +{challenge.points} points earned
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Teams
                </CardTitle>
                <CardDescription>Compete for the top spot!</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((team, index) => {
                    const isMyTeam = team.id === myTeam?.id;
                    const rankColors = [
                      "bg-gradient-to-r from-yellow-400 to-yellow-600",
                      "bg-gradient-to-r from-gray-300 to-gray-500",
                      "bg-gradient-to-r from-amber-600 to-amber-800",
                    ];

                    return (
                      <div
                        key={team.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                          isMyTeam && "border-primary bg-primary/5"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center h-10 w-10 rounded-full text-white font-bold",
                          index < 3 ? rankColors[index] : "bg-muted text-foreground"
                        )}>
                          {index === 0 && <Crown className="h-5 w-5" />}
                          {index !== 0 && index + 1}
                        </div>
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                            {team.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold flex items-center gap-2">
                            {team.name}
                            {isMyTeam && <Badge variant="secondary">Your Team</Badge>}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {team.member_count} members
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1 text-lg font-bold">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            {team.total_points}
                          </div>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeamChallenges;
