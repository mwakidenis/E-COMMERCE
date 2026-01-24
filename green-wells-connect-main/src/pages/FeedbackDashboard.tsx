import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import { 
  Star, 
  ThumbsUp, 
  MessageSquare, 
  TrendingUp,
  BarChart3,
  Smile,
  Meh,
  Frown,
  Award,
  CheckCircle2,
  Send
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Feedback {
  id: string;
  rating: number;
  category: string;
  comment: string;
  sentiment: string;
  created_at: string;
  order_id?: string;
}

interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  categoryBreakdown: { [key: string]: number };
  ratingDistribution: { [key: number]: number };
}

const FeedbackDashboard = () => {
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    totalFeedback: 0,
    averageRating: 0,
    positiveCount: 0,
    neutralCount: 0,
    negativeCount: 0,
    categoryBreakdown: {},
    ratingDistribution: {}
  });
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    rating: 5,
    category: "overall",
    comment: ""
  });
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [feedbacks]);

  const fetchFeedbacks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("customer_feedback")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    }
  };

  const calculateStats = () => {
    const total = feedbacks.length;
    if (total === 0) {
      setStats({
        totalFeedback: 0,
        averageRating: 0,
        positiveCount: 0,
        neutralCount: 0,
        negativeCount: 0,
        categoryBreakdown: {},
        ratingDistribution: {}
      });
      return;
    }

    const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / total;
    const positive = feedbacks.filter(f => f.sentiment === "positive").length;
    const neutral = feedbacks.filter(f => f.sentiment === "neutral").length;
    const negative = feedbacks.filter(f => f.sentiment === "negative").length;

    const categoryBreakdown: { [key: string]: number } = {};
    const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    feedbacks.forEach(f => {
      categoryBreakdown[f.category] = (categoryBreakdown[f.category] || 0) + 1;
      ratingDistribution[f.rating] = (ratingDistribution[f.rating] || 0) + 1;
    });

    setStats({
      totalFeedback: total,
      averageRating: avgRating,
      positiveCount: positive,
      neutralCount: neutral,
      negativeCount: negative,
      categoryBreakdown,
      ratingDistribution
    });
  };

  const submitFeedback = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to submit feedback",
          variant: "destructive"
        });
        return;
      }

      // Determine sentiment based on rating
      let sentiment = "neutral";
      if (newFeedback.rating >= 4) sentiment = "positive";
      else if (newFeedback.rating <= 2) sentiment = "negative";

      const { error } = await supabase
        .from("customer_feedback")
        .insert({
          user_id: user.id,
          rating: newFeedback.rating,
          category: newFeedback.category,
          comment: newFeedback.comment,
          sentiment: sentiment
        });

      if (error) throw error;

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your valuable feedback!"
      });

      setNewFeedback({ rating: 5, category: "overall", comment: "" });
      setShowFeedbackDialog(false);
      fetchFeedbacks();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive"
      });
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return <Smile className="h-5 w-5 text-green-500" />;
      case "neutral": return <Meh className="h-5 w-5 text-yellow-500" />;
      case "negative": return <Frown className="h-5 w-5 text-red-500" />;
      default: return <Meh className="h-5 w-5" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "bg-green-500";
      case "neutral": return "bg-yellow-500";
      case "negative": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const renderStars = (rating: number, size: string = "h-4 w-4") => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  const filteredFeedbacks = selectedFilter === "all" 
    ? feedbacks 
    : feedbacks.filter(f => f.sentiment === selectedFilter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto p-6 pt-24">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Feedback Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Your voice matters - Help us serve you better
            </p>
          </div>
          
          <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
            <DialogTrigger asChild>
              <Button size="lg">
                <MessageSquare className="h-4 w-4 mr-2" />
                Give Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Share Your Feedback</DialogTitle>
                <DialogDescription>
                  Help us improve by sharing your experience
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label>How would you rate your experience?</Label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant={newFeedback.rating === rating ? "default" : "outline"}
                        size="lg"
                        onClick={() => setNewFeedback({ ...newFeedback, rating })}
                      >
                        <Star
                          className={`h-6 w-6 ${
                            rating <= newFeedback.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : ""
                          }`}
                        />
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newFeedback.category} 
                    onValueChange={(value) => setNewFeedback({ ...newFeedback, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Customer Service</SelectItem>
                      <SelectItem value="delivery">Delivery Experience</SelectItem>
                      <SelectItem value="product">Product Quality</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="app_experience">App Experience</SelectItem>
                      <SelectItem value="overall">Overall</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="comment">Your Feedback (Optional)</Label>
                  <Textarea
                    id="comment"
                    placeholder="Tell us more about your experience..."
                    rows={6}
                    value={newFeedback.comment}
                    onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
                  />
                </div>

                <Button onClick={submitFeedback} className="w-full" size="lg">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFeedback}</div>
              <p className="text-xs text-muted-foreground">
                Responses collected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <div className="flex items-center gap-2 mt-1">
                {renderStars(Math.round(stats.averageRating))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positive Feedback</CardTitle>
              <ThumbsUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.positiveCount}</div>
              <Progress 
                value={stats.totalFeedback ? (stats.positiveCount / stats.totalFeedback) * 100 : 0} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalFeedback ? Math.round((stats.positiveCount / stats.totalFeedback) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Based on ratings 4-5
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sentiment Breakdown */}
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smile className="h-5 w-5 text-green-500" />
                Positive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{stats.positiveCount}</div>
              <Progress 
                value={stats.totalFeedback ? (stats.positiveCount / stats.totalFeedback) * 100 : 0}
                className="mt-2 h-2 bg-green-100"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Meh className="h-5 w-5 text-yellow-500" />
                Neutral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{stats.neutralCount}</div>
              <Progress 
                value={stats.totalFeedback ? (stats.neutralCount / stats.totalFeedback) * 100 : 0}
                className="mt-2 h-2 bg-yellow-100"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Frown className="h-5 w-5 text-red-500" />
                Negative
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{stats.negativeCount}</div>
              <Progress 
                value={stats.totalFeedback ? (stats.negativeCount / stats.totalFeedback) * 100 : 0}
                className="mt-2 h-2 bg-red-100"
              />
            </CardContent>
          </Card>
        </div>

        {/* Rating Distribution */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Rating Distribution
            </CardTitle>
            <CardDescription>Breakdown of ratings received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-20">
                    <span className="font-semibold">{rating}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress 
                    value={stats.totalFeedback ? (stats.ratingDistribution[rating] / stats.totalFeedback) * 100 : 0}
                    className="flex-1"
                  />
                  <span className="w-16 text-right text-sm text-muted-foreground">
                    {stats.ratingDistribution[rating] || 0} ({stats.totalFeedback ? Math.round((stats.ratingDistribution[rating] / stats.totalFeedback) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feedback List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Feedback</CardTitle>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Feedback</SelectItem>
                  <SelectItem value="positive">Positive Only</SelectItem>
                  <SelectItem value="neutral">Neutral Only</SelectItem>
                  <SelectItem value="negative">Negative Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredFeedbacks.length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-semibold mb-2">No feedback yet</p>
                <p className="text-muted-foreground mb-4">
                  Share your experience to help us improve
                </p>
                <Button onClick={() => setShowFeedbackDialog(true)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Give Feedback
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFeedbacks.map((feedback) => (
                  <Card key={feedback.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          {renderStars(feedback.rating, "h-5 w-5")}
                          <Badge className={getSentimentColor(feedback.sentiment)}>
                            <div className="flex items-center gap-1">
                              {getSentimentIcon(feedback.sentiment)}
                              {feedback.sentiment}
                            </div>
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(feedback.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {feedback.comment && (
                        <p className="text-muted-foreground mb-2">{feedback.comment}</p>
                      )}
                      
                      <Badge variant="secondary">
                        {feedback.category.replace('_', ' ')}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackDashboard;
