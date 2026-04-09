// create-order/index.ts
// Supabase Edge Functions use Deno.serve for modern native performance.

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      } 
    });
  }

  try {
    const { amount, currency = 'INR' } = await req.json();

    // Mocking Razorpay Order Creation
    const mockOrderId = `order_${Math.random().toString(36).substring(7)}`;

    return new Response(
      JSON.stringify({ id: mockOrderId, amount, currency }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

