import { Router } from 'express';
import { getProfiles, getProfileById } from '../controllers/profileController.js';
import { protect, premiumOnly, canBrowseProfiles } from '../middleware/auth.js';

const router = Router();

// All profile routes require authentication + active premium membership
// + the admin-granted `canViewProfiles` permission.
router.use(protect, premiumOnly, canBrowseProfiles);

router.get('/', getProfiles);
router.get('/:id', getProfileById);

export default router;
