// admin-functions/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { addProduct } from './add-product.ts';
import { updateProduct } from './update-product.ts';
import { updateOrderStatus } from './update-order-status.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

Deno.serve({ port: 8001 }, async (req: Request) => {
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401 });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) return new Response('Unauthorized', { status: 401 });

    // Check role in DB
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    let requestData: any;
    try {
      requestData = await req.json();
    } catch (jsonError: unknown) {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { action, payload }: { action: string; payload: any } = requestData;

    let result;
    switch (action) {
      case 'add_product':
        result = await addProduct(supabase, payload);
        break;
      case 'update_product':
        result = await updateProduct(supabase, payload);
        break;
      case 'update_order_status':
        result = await updateOrderStatus(supabase, payload);
        break;
      default:
        return new Response('Action not found', { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, data: result }), { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      }
    });

  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), { 
      status: 500, 
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      }
    });
  }
});

