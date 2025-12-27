import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get the authorization header to identify the user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a client with the user's token to get their identity
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the authenticated user
    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, pin, type } = await req.json();
    console.log(`Processing ${action} for type ${type} for user ${user.id}`);

    // Get the user's wallet
    const { data: wallet, error: walletError } = await supabaseClient
      .from('user_wallets')
      .select('id, wallet_pin, tpin, pin_set, tpin_set')
      .eq('user_id', user.id)
      .maybeSingle();

    if (walletError) {
      console.error('Error fetching wallet:', walletError);
      return new Response(JSON.stringify({ error: 'Failed to fetch wallet' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!wallet) {
      console.error('Wallet not found for user:', user.id);
      return new Response(JSON.stringify({ error: 'Wallet not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'set') {
      // Hash the PIN using bcrypt
      const salt = await bcrypt.genSalt(12);
      const hashedPin = await bcrypt.hash(pin, salt);
      console.log(`Setting ${type} for wallet ${wallet.id}`);

      const updateData = type === 'pin'
        ? { wallet_pin: hashedPin, pin_set: true }
        : { tpin: hashedPin, tpin_set: true };

      const { error: updateError } = await supabaseClient
        .from('user_wallets')
        .update(updateData)
        .eq('id', wallet.id);

      if (updateError) {
        console.error('Error updating PIN:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to set PIN' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Successfully set ${type} for user ${user.id}`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'verify') {
      // Get the stored hash
      const storedHash = type === 'pin' ? wallet.wallet_pin : wallet.tpin;
      
      if (!storedHash) {
        console.log(`No ${type} set for user ${user.id}`);
        return new Response(JSON.stringify({ verified: false, error: 'PIN not set' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Compare the provided PIN with the stored hash
      const isValid = await bcrypt.compare(pin, storedHash);
      console.log(`PIN verification for user ${user.id}: ${isValid ? 'success' : 'failed'}`);

      return new Response(JSON.stringify({ verified: isValid }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'status') {
      // Return PIN setup status without exposing the actual PINs
      return new Response(JSON.stringify({
        pin_set: wallet.pin_set || false,
        tpin_set: wallet.tpin_set || false,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in wallet-pin function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
