import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve({ port: 8002 }, async (req: Request) => {
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
    
    const { id, data: updateData }: { id: string; data: any } = requestData;

    // Validate required fields
    if (!id) {
      return new Response(JSON.stringify({ error: 'Product ID is required' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!updateData || typeof updateData !== 'object') {
      return new Response(JSON.stringify({ error: 'Valid update data is required' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id);

    if (error) return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json' }
    });

    return new Response(JSON.stringify({ message: "Updated Successfully" }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
