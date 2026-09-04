import express from 'express';
import { 
  getIssues, getMyIssues, getIssueById, 
  createIssue, updateIssueStatus, upvoteIssue,
  claimIssue, resolveIssueByOfficial
} from '../controllers/issue.controller.js';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', getIssues);
router.get('/my-issues', protect, getMyIssues);
router.get('/:id', getIssueById);
router.post('/', protect, upload.array('images', 5), createIssue);
router.patch('/:id/status', protect, requireRole('admin', 'department_official'), updateIssueStatus);
router.patch('/:id/claim', protect, requireRole('department_official'), claimIssue);
router.patch('/:id/official-resolve', protect, requireRole('department_official'), resolveIssueByOfficial);
router.post('/:id/upvote', protect, upvoteIssue);

export default router;
