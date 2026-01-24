import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('M-Pesa callback received:', JSON.stringify(payload, null, 2));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract payment details
    const { Body } = payload;
    const { stkCallback } = Body;
    
    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata.Item;
      const transactionId = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const accountReference = stkCallback.AccountReference || stkCallback.MerchantRequestID;

      console.log('Payment successful:', { transactionId, accountReference });

      // Update order in database
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'completed',
          mpesa_transaction_id: transactionId,
          delivery_status: 'confirmed',
        })
        .eq('id', accountReference);

      if (error) {
        console.error('Error updating order:', error);
      } else {
        console.log('Order updated successfully');
      }
    } else {
      // Payment failed
      console.log('Payment failed:', stkCallback.ResultDesc);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
