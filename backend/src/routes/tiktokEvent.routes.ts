import { Router } from 'express';
import { trackTikTokEvent } from '../controllers/tiktokEvent.controller.js';

const router = Router();

// POST /api/tiktok/events  — receive pixel event, store in Supabase, forward to TikTok CAPI
router.post('/events', trackTikTokEvent);

export default router;
