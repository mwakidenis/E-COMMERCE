-- Create youth_user_stats table for tracking user points and levels
CREATE TABLE public.youth_user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  total_challenges_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create youth_challenges table for defining challenges
CREATE TABLE public.youth_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ordering', 'education', 'social', 'referral')),
  total_required INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create youth_user_challenges table for tracking user progress on challenges
CREATE TABLE public.youth_user_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.youth_challenges(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Create youth_achievements table for defining achievements
CREATE TABLE public.youth_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create youth_user_achievements table for tracking earned achievements
CREATE TABLE public.youth_user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.youth_achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create youth_social_shares table for tracking social media shares
CREATE TABLE public.youth_social_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_type TEXT NOT NULL CHECK (share_type IN ('achievement', 'challenge', 'tip', 'general')),
  content TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'facebook', 'instagram', 'whatsapp')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.youth_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youth_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youth_user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youth_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youth_user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youth_social_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for youth_user_stats
CREATE POLICY "Users can view their own stats"
ON public.youth_user_stats
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
ON public.youth_user_stats
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
ON public.youth_user_stats
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for youth_challenges
CREATE POLICY "Anyone can view active challenges"
ON public.youth_challenges
FOR SELECT
USING (is_active = true);

-- RLS Policies for youth_user_challenges
CREATE POLICY "Users can view their own challenges"
ON public.youth_user_challenges
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenges"
ON public.youth_user_challenges
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges"
ON public.youth_user_challenges
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for youth_achievements
CREATE POLICY "Anyone can view achievements"
ON public.youth_achievements
FOR SELECT
USING (true);

-- RLS Policies for youth_user_achievements
CREATE POLICY "Users can view their own achievements"
ON public.youth_user_achievements
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
ON public.youth_user_achievements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for youth_social_shares
CREATE POLICY "Users can view their own shares"
ON public.youth_social_shares
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shares"
ON public.youth_social_shares
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to update youth_user_stats updated_at
CREATE OR REPLACE FUNCTION public.update_youth_user_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for youth_user_stats
CREATE TRIGGER update_youth_user_stats_updated_at
BEFORE UPDATE ON public.youth_user_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_youth_user_stats_updated_at();

-- Create function to update youth_user_challenges updated_at
CREATE OR REPLACE FUNCTION public.update_youth_user_challenges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for youth_user_challenges
CREATE TRIGGER update_youth_user_challenges_updated_at
BEFORE UPDATE ON public.youth_user_challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_youth_user_challenges_updated_at();

-- Enable realtime for youth tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.youth_user_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.youth_user_challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.youth_user_achievements;

-- Insert some initial challenges
INSERT INTO public.youth_challenges (title, description, points, category, total_required) VALUES
('Eco-Warrior Streak', 'Order from Green Wells 5 times this month', 500, 'ordering', 5),
('Safety Ambassador', 'Complete all safety training modules', 300, 'education', 10),
('Green Influencer', 'Share 3 energy-saving tips on social media', 200, 'social', 3),
('Community Leader', 'Invite 5 friends to join Green Wells', 400, 'referral', 5),
('Energy Saver Pro', 'Reduce your average energy consumption by 20%', 600, 'education', 1),
('Consistent User', 'Order LPG cylinders 3 months in a row', 350, 'ordering', 3);

-- Insert some initial achievements
INSERT INTO public.youth_achievements (title, description, icon, requirement_type, requirement_value) VALUES
('First Order', 'Completed your first Green Wells order', 'trophy', 'orders_count', 1),
('Safety Certified', 'Passed the LPG safety certification', 'award', 'safety_modules', 10),
('Social Butterfly', 'Shared your first energy-saving tip', 'share', 'social_shares', 1),
('Sustainability Expert', 'Reduce your carbon footprint by 50%', 'leaf', 'carbon_reduction', 50),
('Community Builder', 'Refer 10 friends to Green Wells', 'users', 'referrals', 10),
('Energy Master', 'Complete all energy challenges', 'zap', 'challenges_completed', 6);
