-- Customer Support System Database Schema
-- This migration adds tables for support tickets, feedback, chat messages, and multilingual content

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('order_issue', 'payment', 'delivery', 'technical', 'general', 'safety', 'feedback')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Support Ticket Messages Table
CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  message TEXT NOT NULL,
  is_staff_response BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Feedback Table
CREATE TABLE IF NOT EXISTS customer_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category VARCHAR(50) NOT NULL CHECK (category IN ('service', 'delivery', 'product', 'support', 'app_experience', 'overall')),
  comment TEXT,
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_type VARCHAR(20) NOT NULL DEFAULT 'ai' CHECK (session_type IN ('ai', 'human', 'escalated')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'waiting', 'closed')),
  assigned_agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  language VARCHAR(10) DEFAULT 'en',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5)
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'ai', 'agent')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ Knowledge Base Table
CREATE TABLE IF NOT EXISTS faq_articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Multilingual Content Translations Table
CREATE TABLE IF NOT EXISTS content_translations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_type VARCHAR(50) NOT NULL,
  content_key VARCHAR(255) NOT NULL,
  language VARCHAR(10) NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_type, content_key, language)
);

-- Support Agent Availability Table
CREATE TABLE IF NOT EXISTS support_agent_availability (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  is_available BOOLEAN DEFAULT FALSE,
  current_capacity INTEGER DEFAULT 0,
  max_capacity INTEGER DEFAULT 5,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX idx_support_ticket_messages_ticket_id ON support_ticket_messages(ticket_id);
CREATE INDEX idx_customer_feedback_user_id ON customer_feedback(user_id);
CREATE INDEX idx_customer_feedback_order_id ON customer_feedback(order_id);
CREATE INDEX idx_customer_feedback_rating ON customer_feedback(rating);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_faq_articles_category ON faq_articles(category);
CREATE INDEX idx_faq_articles_language ON faq_articles(language);
CREATE INDEX idx_content_translations_lookup ON content_translations(content_type, content_key, language);

-- Create function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS VARCHAR(20) AS $$
DECLARE
  new_number VARCHAR(20);
  counter INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM support_tickets;
  new_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ticket number
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_number
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_articles_updated_at
  BEFORE UPDATE ON faq_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_translations_updated_at
  BEFORE UPDATE ON content_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_agent_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
CREATE POLICY "Users can view their own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets"
  ON support_tickets FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for support_ticket_messages
CREATE POLICY "Users can view messages for their tickets"
  ON support_ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = support_ticket_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages for their tickets"
  ON support_ticket_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = support_ticket_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

-- RLS Policies for customer_feedback
CREATE POLICY "Users can view their own feedback"
  ON customer_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback"
  ON customer_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON customer_feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions"
  ON chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create chat sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
  ON chat_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their chat sessions"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their chat sessions"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- RLS Policies for faq_articles (public read access)
CREATE POLICY "Anyone can view published FAQ articles"
  ON faq_articles FOR SELECT
  USING (is_published = TRUE);

-- RLS Policies for content_translations (public read access)
CREATE POLICY "Anyone can view content translations"
  ON content_translations FOR SELECT
  USING (TRUE);

-- RLS Policies for support_agent_availability (authenticated users can view)
CREATE POLICY "Authenticated users can view agent availability"
  ON support_agent_availability FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Insert sample FAQ data
INSERT INTO faq_articles (category, question, answer, language, tags) VALUES
  ('ordering', 'How do I place an order?', 'To place an order, navigate to the Order page, select your cylinder size, enter your delivery address, choose a time slot, and proceed to payment via M-Pesa.', 'en', ARRAY['order', 'getting-started']),
  ('ordering', 'Ninawezaje kuweka oda?', 'Ili kuweka oda, nenda kwenye ukurasa wa Oda, chagua ukubwa wa silinda yako, ingiza anwani ya utoaji, chagua muda, na endelea na malipo kupitia M-Pesa.', 'sw', ARRAY['oda', 'kuanza']),
  ('payment', 'What payment methods do you accept?', 'We currently accept M-Pesa payments for instant and secure transactions. More payment methods will be added soon.', 'en', ARRAY['payment', 'mpesa']),
  ('payment', 'Je, mnakubali njia gani za malipo?', 'Kwa sasa tunakubali malipo ya M-Pesa kwa miamala ya papo hapo na salama. Njia zaidi za malipo zitaongezwa hivi karibuni.', 'sw', ARRAY['malipo', 'mpesa']),
  ('delivery', 'How long does delivery take?', 'Most deliveries are completed within 30-60 minutes in urban areas. You can track your delivery in real-time on the Tracking page.', 'en', ARRAY['delivery', 'time', 'tracking']),
  ('delivery', 'Utoaji huchukua muda gani?', 'Utoaji wengi unakamilika ndani ya dakika 30-60 katika maeneo ya mijini. Unaweza kufuatilia utoaji wako kwa wakati halisi kwenye ukurasa wa Ufuatiliaji.', 'sw', ARRAY['utoaji', 'muda', 'ufuatiliaji']),
  ('safety', 'What safety measures do you follow?', 'We follow strict safety protocols including cylinder inspections, proper handling procedures, and emergency response guidelines. Visit our Safety Hub for more information.', 'en', ARRAY['safety', 'cylinder', 'inspection']),
  ('safety', 'Je, mnafuata hatua gani za usalama?', 'Tunafuata itifaki kali za usalama ikiwa ni pamoja na ukaguzi wa silinda, taratibu za kushughulikia vizuri, na miongozo ya majibu ya dharura. Tembelea Kituo chetu cha Usalama kwa taarifa zaidi.', 'sw', ARRAY['usalama', 'silinda', 'ukaguzi']),
  ('technical', 'How do I track my order?', 'Once your order is confirmed, go to the Tracking page to see real-time GPS location of your delivery, estimated time of arrival, and current status.', 'en', ARRAY['tracking', 'gps', 'status']),
  ('technical', 'Ninawezaje kufuatilia oda yangu?', 'Mara tu oda yako inapothibitishwa, nenda kwenye ukurasa wa Ufuatiliaji kuona eneo la GPS la utoaji wako kwa wakati halisi, muda wa kukaribia wa kuwasili, na hali ya sasa.', 'sw', ARRAY['ufuatiliaji', 'gps', 'hali']),
  ('general', 'How do I contact customer support?', 'You can reach our 24/7 customer support through the Support Hub, live chat, or by creating a support ticket. We typically respond within minutes.', 'en', ARRAY['support', 'contact', 'help']),
  ('general', 'Ninawezaje kuwasiliana na huduma kwa wateja?', 'Unaweza kufikia huduma yetu kwa wateja ya masaa 24/7 kupitia Kituo cha Usaidizi, mazungumzo ya moja kwa moja, au kwa kuunda tiketi ya usaidizi. Kwa kawaida tunajibu ndani ya dakika.', 'sw', ARRAY['usaidizi', 'mawasiliano', 'msaada']);

-- Insert sample content translations
INSERT INTO content_translations (content_type, content_key, language, translated_text) VALUES
  ('ui', 'support_hub_title', 'en', 'Support Hub'),
  ('ui', 'support_hub_title', 'sw', 'Kituo cha Usaidizi'),
  ('ui', 'create_ticket', 'en', 'Create Support Ticket'),
  ('ui', 'create_ticket', 'sw', 'Unda Tiketi ya Usaidizi'),
  ('ui', 'my_tickets', 'en', 'My Tickets'),
  ('ui', 'my_tickets', 'sw', 'Tiketi Zangu'),
  ('ui', 'live_chat', 'en', 'Live Chat'),
  ('ui', 'live_chat', 'sw', 'Mazungumzo ya Moja kwa Moja'),
  ('ui', 'feedback', 'en', 'Feedback'),
  ('ui', 'feedback', 'sw', 'Maoni'),
  ('ui', 'help_center', 'en', 'Help Center'),
  ('ui', 'help_center', 'sw', 'Kituo cha Msaada'),
  ('ui', 'submit_feedback', 'en', 'Submit Feedback'),
  ('ui', 'submit_feedback', 'sw', 'Tuma Maoni'),
  ('ui', 'rate_experience', 'en', 'Rate Your Experience'),
  ('ui', 'rate_experience', 'sw', 'Kadiria Uzoefu Wako');

COMMENT ON TABLE support_tickets IS 'Stores customer support tickets with categorization and priority';
COMMENT ON TABLE support_ticket_messages IS 'Messages and responses within support tickets';
COMMENT ON TABLE customer_feedback IS 'Customer feedback and ratings for orders and services';
COMMENT ON TABLE chat_sessions IS 'Live chat sessions between customers and support (AI or human)';
COMMENT ON TABLE chat_messages IS 'Individual messages within chat sessions';
COMMENT ON TABLE faq_articles IS 'Knowledge base articles for self-service support';
COMMENT ON TABLE content_translations IS 'Multilingual content translations for UI elements';
COMMENT ON TABLE support_agent_availability IS 'Tracks support agent availability and capacity';
