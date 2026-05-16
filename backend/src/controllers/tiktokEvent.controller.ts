import type { Request, Response } from 'express';
import { createHash } from 'crypto';
import { supabaseAdmin } from '../config/supabaseClient.js';

const PIXEL_CODE    = process.env.TIKTOK_PIXEL_ID   ?? 'D7VPDSBC77UEKU3Q3CT0';
const ACCESS_TOKEN  = process.env.TIKTOK_ACCESS_TOKEN;
const TIKTOK_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';

/** SHA-256 hash after lowercase + trim (TikTok hashing requirement). */
function hashField(value: string): string {
  return createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return first.trim();
  }
  return req.socket?.remoteAddress ?? req.ip ?? '';
}

interface TikTokEventBody {
  event_name: string;
  value?: number;
  currency?: string;
  event_id?: string;
  contents?: Array<{
    content_id: string;
    content_type: string;
    content_name: string;
    quantity?: number;
    price?: number;
  }>;
  num_items?: number;
  search_string?: string;
  page_url?: string;
  email?: string;
  phone?: string;
  external_id?: string;
}

export const trackTikTokEvent = async (req: Request, res: Response): Promise<void> => {
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
  }: TikTokEventBody = req.body;

  if (!event_name) {
    res.status(400).json({ error: 'event_name is required' });
    return;
  }

  const clientIp     = getClientIp(req);
  const userAgent    = (req.headers['user-agent'] ?? '').slice(0, 512);
  const generatedId  = event_id ?? `ttk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Persist to Supabase for audit / replay (best-effort — table may not exist yet)
  try {
    await supabaseAdmin.from('tiktok_events').insert([{
      event_name,
      event_id:    generatedId,
      value:       value ?? null,
      currency,
      num_items:   num_items ?? null,
      search_string: search_string ?? null,
      user_ip:     clientIp  || null,
      user_agent:  userAgent || null,
    }]);
  } catch {
    // Non-blocking — table may not exist, skip silently
  }

  if (!ACCESS_TOKEN) {
    console.warn('[TikTokEvent] TIKTOK_ACCESS_TOKEN not set — CAPI skipped.');
    res.json({ message: 'Event stored (CAPI skipped — token missing)', event_id: generatedId });
    return;
  }

  // Build user object (hashed PII)
  const user: Record<string, string> = {};
  if (clientIp)          user['ip']          = clientIp;
  if (userAgent)         user['user_agent']   = userAgent;
  if (email?.trim())     user['email']        = hashField(email);
  if (phone?.trim())     user['phone_number'] = hashField(phone.replace(/\D/g, ''));
  if (external_id?.trim()) user['external_id'] = hashField(external_id);

  // Build properties
  const properties: Record<string, unknown> = {
    value:    value ?? 0,
    currency: (currency ?? 'PKR').toUpperCase(),
  };
  if (contents?.length)    properties['contents']      = contents;
  if (num_items !== undefined) properties['num_items'] = num_items;
  if (search_string)       properties['search_string'] = search_string;

  const capiPayload = {
    pixel_code:       PIXEL_CODE,
    event_source:     'web',
    event_source_id:  PIXEL_CODE,
    partner_name:     'JT Collections',
    data: [
      {
        event:      event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id:   generatedId,
        user,
        properties,
        ...(page_url ? { page: { url: page_url } } : {}),
      },
    ],
  };

  try {
    const response = await fetch(TIKTOK_API_URL, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': ACCESS_TOKEN,
      },
      body: JSON.stringify(capiPayload),
    });

    const data = await response.json() as Record<string, unknown>;
    if (!response.ok || data['code'] !== 0) {
      console.error('[TikTokEvent] CAPI error:', JSON.stringify(data));
    } else {
      console.log('[TikTokEvent] CAPI success:', event_name, generatedId);
    }

    res.json({ message: 'Event processed', event_id: generatedId, capi_response: data });
  } catch (err) {
    console.error('[TikTokEvent] CAPI fetch error:', err);
    res.json({ message: 'Event stored (CAPI fetch failed)', event_id: generatedId });
  }
};
