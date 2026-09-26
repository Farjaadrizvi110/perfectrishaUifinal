import { Router } from 'express';
import { getProfiles, getProfileById } from '../controllers/profileController.js';
import { protect, premiumOnly } from '../middleware/auth.js';

const router = Router();

// All profile routes require authentication + active premium membership
router.use(protect, premiumOnly);

router.get('/', getProfiles);
router.get('/:id', getProfileById);

export default router;
