-- Create reward_redemptions table
CREATE TABLE public.reward_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  redemption_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own redemptions"
  ON public.reward_redemptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own redemptions"
  ON public.reward_redemptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL,
  avatar_url TEXT,
  total_points INTEGER NOT NULL DEFAULT 0,
  member_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view teams"
  ON public.teams
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create teams"
  ON public.teams
  FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Team creators can update their teams"
  ON public.teams
  FOR UPDATE
  USING (auth.uid() = creator_id);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view team members"
  ON public.team_members
  FOR SELECT
  USING (true);

CREATE POLICY "Team admins can add members"
  ON public.team_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = team_members.team_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
    OR auth.uid() = user_id
  );

-- Create team_challenges table
CREATE TABLE public.team_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL,
  category TEXT NOT NULL,
  total_required INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.team_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active challenges"
  ON public.team_challenges
  FOR SELECT
  USING (is_active = true);

-- Create team_challenge_progress table
CREATE TABLE public.team_challenge_progress (
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

ALTER TABLE public.team_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view challenge progress"
  ON public.team_challenge_progress
  FOR SELECT
  USING (true);

CREATE POLICY "System can update challenge progress"
  ON public.team_challenge_progress
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create content_translations table
CREATE TABLE public.content_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_key TEXT NOT NULL,
  language TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(content_type, content_key, language)
);

ALTER TABLE public.content_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view translations"
  ON public.content_translations
  FOR SELECT
  USING (true);

CREATE POLICY "System can manage translations"
  ON public.content_translations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add triggers for updated_at columns
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_challenge_progress_updated_at
  BEFORE UPDATE ON public.team_challenge_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_translations_updated_at
  BEFORE UPDATE ON public.content_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();