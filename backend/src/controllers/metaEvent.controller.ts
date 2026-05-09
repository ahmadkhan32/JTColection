import type { Request, Response } from 'express';
import { createHash } from 'crypto';
import { supabaseAdmin } from '../config/supabaseClient.js';

const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE; // set to empty string in production
const GRAPH_API_VERSION = 'v19.0';

/** SHA-256 hash a string (email/phone) after lowercase + trim, as Meta requires. */
function hashField(value: string): string {
  return createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

interface EventBody {
  event_name: string;
  value?: number;
  currency?: string;
  event_id: string;
  content_name?: string;
  content_ids?: string[];
  num_items?: number;
  email?: string;  // plain-text; hashed server-side before sending to Meta
  phone?: string;  // plain-text; hashed server-side
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return first.trim();
  }
  return req.socket?.remoteAddress ?? req.ip ?? '';
}

export const trackMetaEvent = async (req: Request, res: Response): Promise<void> => {
  const {
    event_name,
    value,
    currency = 'PKR',
    event_id,
    content_name,
    content_ids,
    num_items,
    email,
    phone,
  }: EventBody = req.body;

  if (!event_name || !event_id) {
    res.status(400).json({ error: 'event_name and event_id are required' });
    return;
  }

  const clientIp = getClientIp(req);
  const userAgent = (req.headers['user-agent'] ?? '').slice(0, 512);

  try {
    const { error: dbError } = await supabaseAdmin.from('meta_events').insert([
      {
        event_name,
        value: value ?? null,
        currency,
        event_id,
        content_name: content_name ?? null,
        content_ids: content_ids ?? null,
        num_items: num_items ?? null,
        user_ip: clientIp || null,
        user_agent: userAgent || null,
      },
    ]);
    if (dbError) console.error('[MetaEvent] Supabase insert error:', dbError.message);
  } catch (err) {
    console.error('[MetaEvent] Unexpected DB error:', err);
  }

  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn('[MetaEvent] META_PIXEL_ID or META_ACCESS_TOKEN not set — CAPI skipped.');
    res.json({ message: 'Event stored (CAPI skipped — tokens missing)' });
    return;
  }

  try {
    const userData: Record<string, string> = {};
    if (clientIp)    userData['client_ip_address']  = clientIp;
    if (userAgent)   userData['client_user_agent']   = userAgent;
    if (email?.trim())  userData['em'] = hashField(email);   // hashed email for advanced matching
    if (phone?.trim())  userData['ph'] = hashField(phone.replace(/\D/g, '')); // digits-only then hash

    const capiPayload: Record<string, unknown> = {
      data: [
        {
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id: String(event_id),  // Meta requires string
          action_source: 'website',
          user_data: userData,
          custom_data: {
            value: value ?? 0,
            currency,
            ...(content_name ? { content_name } : {}),
            ...(content_ids ? { content_ids } : {}),
            ...(num_items != null ? { num_items } : {}),
          },
        },
      ],
    };

    // Include test_event_code only when set (removes it automatically in production)
    if (TEST_EVENT_CODE) {
      (capiPayload as Record<string, unknown>)['test_event_code'] = TEST_EVENT_CODE;
    }

    const graphUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

    const response = await fetch(graphUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(capiPayload),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`[MetaEvent] CAPI error ${response.status}:`, errBody);
      res.status(502).json({ error: 'CAPI upstream error', detail: errBody });
      return;
    }

    const capiResult = await response.json();
    res.json({ message: 'Event tracked', capi: capiResult });
  } catch (err) {
    console.error('[MetaEvent] CAPI request failed:', err);
    res.status(500).json({ error: 'Failed to send event to Meta CAPI' });
  }
};
