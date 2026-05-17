import { Router } from 'express';
import {
  getAllBanners,
  getActiveBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  restoreBannerVersion,
  reorderBanners,
  toggleBannerActive,
  getBannerVersions,
  getBannerAnalytics,
  getAllAnalyticsSummary,
} from '../controllers/banner.controller.js';

const router = Router();

// ── Public ───────────────────────────────────────────────────────────────────
router.get('/active',                getActiveBanners);

// ── Admin CRUD ────────────────────────────────────────────────────────────────
router.get('/',                      getAllBanners);
router.post('/',                     createBanner);
router.get('/analytics',             getAllAnalyticsSummary);
router.get('/:id',                   getBannerById);
router.put('/:id',                   updateBanner);
router.delete('/:id',                deleteBanner);
router.patch('/:id/toggle',          toggleBannerActive);
router.post('/reorder',              reorderBanners);

// ── Version history ──────────────────────────────────────────────────────────
router.get('/:id/versions',          getBannerVersions);
router.post('/:id/restore',          restoreBannerVersion);

// ── Analytics ────────────────────────────────────────────────────────────────
router.get('/:id/analytics',         getBannerAnalytics);

export default router;
