import { Router } from 'express';
import { trackMetaEvent } from '../controllers/metaEvent.controller.js';

const router = Router();

// POST /api/meta/events  — receive pixel event, store in Supabase, forward to CAPI
router.post('/events', trackMetaEvent);

export default router;
