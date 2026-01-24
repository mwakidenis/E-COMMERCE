-- Team Challenges Tables
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  total_points INTEGER NOT NULL DEFAULT 0,
  member_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.team_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL,
  category TEXT NOT NULL,
  total_required INTEGER NOT NULL DEFAULT 1,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.team_challenges(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, challenge_id)
);

-- Rewards Marketplace Tables
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  points_required INTEGER NOT NULL,
  discount_percentage INTEGER,
  discount_amount DECIMAL(10,2),
  category TEXT NOT NULL CHECK (category IN ('discount', 'gift', 'service', 'exclusive')),
  quantity_available INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.reward_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  redemption_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('achievement', 'challenge', 'reward', 'team', 'system', 'recommendation')),
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Seasonal Events and Limited Edition Badges
CREATE TABLE IF NOT EXISTS public.seasonal_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('seasonal', 'holiday', 'special', 'limited')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  theme_color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.limited_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  event_id UUID REFERENCES public.seasonal_events(id) ON DELETE CASCADE,
  max_earners INTEGER,
  current_earners INTEGER NOT NULL DEFAULT 0,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.user_limited_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.limited_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- AI Recommendations Table
CREATE TABLE IF NOT EXISTS public.user_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('order', 'challenge', 'reward', 'tip', 'product')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB,
  priority INTEGER NOT NULL DEFAULT 1,
  shown BOOLEAN NOT NULL DEFAULT false,
  clicked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.limited_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_limited_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams
CREATE POLICY "Users can view teams they are members of"
ON public.teams
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.team_id = teams.id
    AND team_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create teams"
ON public.teams
FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Team admins can update teams"
ON public.teams
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.team_id = teams.id
    AND team_members.user_id = auth.uid()
    AND team_members.role = 'admin'
  )
);

-- RLS Policies for team_members
CREATE POLICY "Users can view team members of their teams"
ON public.team_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = team_members.team_id
    AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Team admins can add members"
ON public.team_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = team_members.team_id
    AND tm.user_id = auth.uid()
    AND tm.role = 'admin'
  )
);

-- RLS Policies for team_challenges
CREATE POLICY "Anyone can view active team challenges"
ON public.team_challenges
FOR SELECT
USING (is_active = true);

-- RLS Policies for team_challenge_progress
CREATE POLICY "Users can view their team's challenge progress"
ON public.team_challenge_progress
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.team_id = team_challenge_progress.team_id
    AND team_members.user_id = auth.uid()
  )
);

-- RLS Policies for rewards
CREATE POLICY "Anyone can view active rewards"
ON public.rewards
FOR SELECT
USING (is_active = true);

-- RLS Policies for reward_redemptions
CREATE POLICY "Users can view their own redemptions"
ON public.reward_redemptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own redemptions"
ON public.reward_redemptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for seasonal_events
CREATE POLICY "Anyone can view active seasonal events"
ON public.seasonal_events
FOR SELECT
USING (is_active = true);

-- RLS Policies for limited_badges
CREATE POLICY "Anyone can view active limited badges"
ON public.limited_badges
FOR SELECT
USING (is_active = true);

-- RLS Policies for user_limited_badges
CREATE POLICY "Users can view their own badges"
ON public.user_limited_badges
FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policies for user_recommendations
CREATE POLICY "Users can view their own recommendations"
ON public.user_recommendations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations"
ON public.user_recommendations
FOR UPDATE
USING (auth.uid() = user_id);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_challenge_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_recommendations;

-- Insert sample rewards
INSERT INTO public.rewards (title, description, points_required, discount_percentage, category) VALUES
('10% Off Next Order', 'Get 10% discount on your next cylinder purchase', 500, 10, 'discount'),
('Free Delivery', 'Free delivery on your next order', 300, NULL, 'service'),
('20% Off Premium Cylinder', 'Get 20% off on a 50kg cylinder', 1000, 20, 'discount'),
('Green Wells T-Shirt', 'Limited edition branded t-shirt', 750, NULL, 'gift'),
('VIP Priority Service', '1 month of priority delivery service', 1500, NULL, 'exclusive'),
('500 KES Voucher', 'KES 500 off your next order', 1200, NULL, 'discount');

-- Insert sample team challenges
INSERT INTO public.team_challenges (title, description, points, category, total_required) VALUES
('Team Energy Savers', 'Complete 20 orders as a team this month', 2000, 'ordering', 20),
('Safety Champions', 'All team members complete safety training', 1500, 'education', 1),
('Social Warriors', 'Share 50 energy tips collectively', 1000, 'social', 50),
('Referral Masters', 'Refer 10 new users as a team', 2500, 'referral', 10);

-- Insert sample seasonal event
INSERT INTO public.seasonal_events (title, description, event_type, start_date, end_date, theme_color) VALUES
('Earth Month Celebration', 'Special challenges and rewards for Earth Month', 'seasonal', NOW(), NOW() + INTERVAL '30 days', '#22c55e');

-- Insert sample limited badges
INSERT INTO public.limited_badges (title, description, icon, rarity, max_earners, requirement_type, requirement_value, expires_at) VALUES
('Earth Day Pioneer', 'Early adopter during Earth Month celebration', 'globe', 'legendary', 100, 'orders_count', 1, NOW() + INTERVAL '30 days'),
('Green Champion', 'Complete 5 eco-challenges during the event', 'leaf', 'epic', 500, 'challenges_completed', 5, NOW() + INTERVAL '30 days'),
('Sustainability Star', 'Reduce energy usage by 30%', 'star', 'rare', 1000, 'energy_reduction', 30, NOW() + INTERVAL '30 days');

-- Create function to send notification
CREATE OR REPLACE FUNCTION public.create_achievement_notification(
  p_user_id UUID,
  p_achievement_title TEXT,
  p_achievement_description TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, data)
  VALUES (
    p_user_id,
    'New Achievement Unlocked! 🏆',
    p_achievement_title || ': ' || p_achievement_description,
    'achievement',
    jsonb_build_object('achievement_title', p_achievement_title)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for achievement notifications
CREATE OR REPLACE FUNCTION public.notify_achievement_earned()
RETURNS TRIGGER AS $$
DECLARE
  v_achievement RECORD;
BEGIN
  SELECT title, description INTO v_achievement
  FROM public.youth_achievements
  WHERE id = NEW.achievement_id;
  
  PERFORM create_achievement_notification(
    NEW.user_id,
    v_achievement.title,
    v_achievement.description
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_achievement_notification
AFTER INSERT ON public.youth_user_achievements
FOR EACH ROW
EXECUTE FUNCTION public.notify_achievement_earned();
