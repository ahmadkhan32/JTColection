// create-order/index.ts
// Supabase Edge Functions use Deno.serve for modern native performance.

Deno.serve({ port: 8000 }, async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      } 
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    let requestData: any;
    try {
      requestData = await req.json();
    } catch (jsonError: unknown) {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { amount, currency = 'INR' }: { amount: number; currency?: string } = requestData;

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
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

