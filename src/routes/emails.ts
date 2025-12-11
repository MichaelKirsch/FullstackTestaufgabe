import { Router } from 'express';
import {
  createBatchEmails,
  getAllEmails,
  getEmailById,
  getEmailStats
} from '../controllers/emailController';

const router = Router();

// Email-Routes
router.post('/create-batch', createBatchEmails);
router.get('/', getAllEmails);
router.get('/stats', getEmailStats);
router.get('/:id', getEmailById);

export default router;

