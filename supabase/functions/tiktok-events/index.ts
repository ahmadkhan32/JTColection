// ─────────────────────────────────────────────────────────────────────────────
// Supabase Edge Function: tiktok-events
// Receives pixel event payloads from the React frontend, stores them in the
// analytics_events table, then forwards to the TikTok Events API (CAPI).
//
// Deploy: npx supabase functions deploy tiktok-events
// Secrets: npx supabase secrets set TIKTOK_PIXEL_ID=D7VPDSBC77UEKU3Q3CT0
//          npx supabase secrets set TIKTOK_ACCESS_TOKEN=e89b03afda2ceff4393a26c56b9f4fe4d3de2098
// ─────────────────────────────────────────────────────────────────────────────

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TIKTOK_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';
const PIXEL_CODE     = Deno.env.get('TIKTOK_PIXEL_ID')    ?? 'D7VPDSBC77UEKU3Q3CT0';
const ACCESS_TOKEN   = Deno.env.get('TIKTOK_ACCESS_TOKEN') ?? '';
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')        ?? '';
const SERVICE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/** SHA-256 hash a string using the Web Crypto API (Deno-compatible). */
async function sha256(value: string): Promise<string> {
  if (!value) return '';
  const encoded = new TextEncoder().encode(value.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface EventPayload {
  event_name:    string;
  value?:        number;
  currency?:     string;
  event_id?:     string;
  contents?:     Array<{
    content_id:   string;
    content_type: string;
    content_name: string;
    quantity?:    number;
    price?:       number;
  }>;
  num_items?:    number;
  search_string?: string;
  page_url?:     string;
  email?:        string;
  phone?:        string;
  external_id?:  string;
  user_id?:      string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  let body: EventPayload;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const {
    event_name,
    value = 0,
    currency = 'PKR',
    event_id,
    contents,
    num_items,
    search_string,
    page_url,
    email,
    phone,
    external_id,
    user_id,
  } = body;

  if (!event_name) {
    return new Response(JSON.stringify({ error: 'event_name is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const generatedId = event_id ?? `ttk-edge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const clientIp    = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
  const userAgent   = (req.headers.get('user-agent') ?? '').slice(0, 512);

  // ── 1. Store in analytics_events table ────────────────────────────────────
  if (SUPABASE_URL && SERVICE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
      await supabase.from('analytics_events').insert([{
        platform:      'tiktok',
        event_name,
        event_id:      generatedId,
        user_id:       user_id ?? null,
        value:         value   ?? null,
        currency,
        contents:      contents ?? null,
        num_items:     num_items ?? null,
        search_string: search_string ?? null,
        page_url:      page_url ?? null,
        user_ip:       clientIp  || null,
        user_agent:    userAgent || null,
      }]);
    } catch (err) {
      console.error('[tiktok-events] DB insert error:', err);
    }
  }

  // ── 2. Forward to TikTok Events API ───────────────────────────────────────
  if (!ACCESS_TOKEN) {
    return new Response(
      JSON.stringify({ message: 'Event stored (CAPI skipped — token missing)', event_id: generatedId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  // Build hashed user data
  const user: Record<string, string> = {};
  if (clientIp)          user['ip']          = clientIp;
  if (userAgent)         user['user_agent']   = userAgent;
  if (email?.trim())     user['email']        = await sha256(email);
  if (phone?.trim())     user['phone_number'] = await sha256(phone.replace(/\D/g, ''));
  if (external_id?.trim()) user['external_id'] = await sha256(external_id);

  const properties: Record<string, unknown> = {
    value:    value ?? 0,
    currency: (currency ?? 'PKR').toUpperCase(),
  };
  if (contents?.length)           properties['contents']      = contents;
  if (num_items !== undefined)    properties['num_items']     = num_items;
  if (search_string)              properties['search_string'] = search_string;

  const capiPayload = {
    pixel_code:      PIXEL_CODE,
    event_source:    'web',
    event_source_id: PIXEL_CODE,
    partner_name:    'JT Collections',
    data: [{
      event:      event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id:   generatedId,
      user,
      properties,
      ...(page_url ? { page: { url: page_url } } : {}),
    }],
  };

  try {
    const response = await fetch(TIKTOK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': ACCESS_TOKEN,
      },
      body: JSON.stringify(capiPayload),
    });

    const data = await response.json();
    if (!response.ok || data.code !== 0) {
      console.error('[tiktok-events] CAPI error:', JSON.stringify(data));
    } else {
      console.log('[tiktok-events] CAPI success:', event_name, generatedId);
    }

    return new Response(
      JSON.stringify({ message: 'Event processed', event_id: generatedId, capi: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[tiktok-events] fetch error:', err);
    return new Response(
      JSON.stringify({ message: 'Event stored (CAPI fetch failed)', event_id: generatedId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
