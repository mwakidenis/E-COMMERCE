import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, language = 'en' } = await req.json();
    
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing AI chat request:', { message, sessionId, language });

    // Get conversation history if sessionId provided
    let conversationHistory: any[] = [];
    if (sessionId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: messages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(10);

      if (messages) {
        conversationHistory = messages.map(msg => ({
          role: msg.sender_type === 'customer' ? 'user' : 'assistant',
          content: msg.message
        }));
      }
    }

    // System prompt based on language
    const systemPrompt = language === 'sw'
      ? `Wewe ni msaidizi rafiki wa Green Wells - huduma ya utoaji wa gesi ya kupikia nchini Kenya. 
         Unasaidia wateja kuweka oda, kufuatilia utoaji, na kujibu maswali kuhusu huduma zetu.
         
         Maelezo ya Huduma:
         - Tunauza silinda za gesi za ukubwa wa 6kg, 13kg, na 35kg
         - Bei: 6kg - KES 1,500, 13kg - KES 2,800, 35kg - KES 6,500
         - Utoaji kawaida huchukua dakika 30-60
         - Tunakubali malipo ya M-Pesa
         - Unaweza kufuatilia utoaji wako kwa wakati halisi
         
         Jibu kwa ufupi na kwa njia ya msaada. Ikiwa swali linahitaji msaidizi wa binadamu, muelekeze kwenye timu ya msaada.`
      : `You are a helpful assistant for Green Wells - a cooking gas delivery service in Kenya. 
         You help customers place orders, track deliveries, and answer questions about our services.
         
         Service Details:
         - We sell 6kg, 13kg, and 35kg gas cylinders
         - Prices: 6kg - KES 1,500, 13kg - KES 2,800, 35kg - KES 6,500
         - Delivery typically takes 30-60 minutes
         - We accept M-Pesa payments
         - Real-time delivery tracking available
         
         Respond briefly and helpfully. If a question requires human support, direct them to our support team.`;

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Lovable AI request failed: ${errorText}`);
    }

    const data = await aiResponse.json();
    const reply = data.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        reply: 'I apologize, but I encountered an error. Please try again or contact our support team.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});