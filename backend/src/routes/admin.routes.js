import express from 'express';
import { getStats, getAllIssues, assignIssue, getUsers } from '../controllers/admin.controller.js';
import { protect, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('admin'));

router.get('/stats', getStats);
router.get('/issues', getAllIssues);
router.patch('/issues/:id/assign', assignIssue);
router.get('/users', getUsers);

export default router;
