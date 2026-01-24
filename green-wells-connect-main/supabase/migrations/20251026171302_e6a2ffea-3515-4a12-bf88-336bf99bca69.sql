-- Create tables for notifications, youth hub, support, and feedback

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('achievement', 'challenge', 'reward', 'team', 'system', 'recommendation')),
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Youth Hub challenges table
CREATE TABLE IF NOT EXISTS public.youth_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_type TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Support tickets table  
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ticket_number TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'ai',
  language TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'ai', 'agent')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FAQ articles table
CREATE TABLE IF NOT EXISTS public.faq_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  is_published BOOLEAN NOT NULL DEFAULT true,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  not_helpful_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Customer feedback table
CREATE TABLE IF NOT EXISTS public.customer_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category TEXT NOT NULL,
  comment TEXT,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youth_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for youth challenges
CREATE POLICY "Users can view their own challenges" ON public.youth_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own challenges" ON public.youth_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own challenges" ON public.youth_challenges FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for support tickets
CREATE POLICY "Users can view their own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tickets" ON public.support_tickets FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for chat sessions
CREATE POLICY "Users can view their own sessions" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create sessions" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chat messages
CREATE POLICY "Users can view messages from their sessions" ON public.chat_messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid()));
CREATE POLICY "System can insert messages" ON public.chat_messages FOR INSERT WITH CHECK (true);

-- RLS Policies for FAQ articles
CREATE POLICY "Everyone can view published FAQs" ON public.faq_articles FOR SELECT USING (is_published = true);
CREATE POLICY "System can manage FAQs" ON public.faq_articles FOR ALL USING (true);

-- RLS Policies for customer feedback
CREATE POLICY "Users can view their own feedback" ON public.customer_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create feedback" ON public.customer_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_youth_challenges_updated_at
BEFORE UPDATE ON public.youth_challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Generate ticket numbers automatically
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
BEGIN
  new_number := 'TKT-' || LPAD((SELECT COUNT(*) + 1 FROM public.support_tickets)::TEXT, 6, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample FAQ data
INSERT INTO public.faq_articles (category, question, answer, language) VALUES
('ordering', 'How do I place an order?', 'You can place an order by navigating to the Order page, selecting your cylinder size, entering your delivery address, and completing the M-Pesa payment.', 'en'),
('ordering', 'Ninawezaje kuweka oda?', 'Unaweza kuweka oda kwa kwenda kwenye ukurasa wa Oda, kuchagua ukubwa wa silinda, kuingiza anwani yako, na kulipa kupitia M-Pesa.', 'sw'),
('payment', 'What payment methods do you accept?', 'We currently accept M-Pesa payments for all orders. Simply enter your M-Pesa phone number during checkout.', 'en'),
('payment', 'Mnakubali njia gani za malipo?', 'Tunakubali malipo ya M-Pesa kwa oda zote. Ingiza nambari yako ya simu ya M-Pesa wakati wa kulipa.', 'sw'),
('delivery', 'How long does delivery take?', 'Most deliveries are completed within 30-60 minutes. You can track your delivery in real-time on the Tracking page.', 'en'),
('delivery', 'Utoaji huchukua muda gani?', 'Utoaji mwingi hukamilika ndani ya dakika 30-60. Unaweza kufuatilia utoaji wako wakati halisi kwenye ukurasa wa Ufuatiliaji.', 'sw')
ON CONFLICT DO NOTHING;