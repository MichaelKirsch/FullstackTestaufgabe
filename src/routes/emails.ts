import { Router } from 'express';
import {
  createBatchEmails,
  getAllEmails,
  getEmailById,
  getEmailStats,
  getPaginatedEmails
} from '../controllers/emailController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Alle Email-Routes benötigen Authentifizierung
router.use(authenticateToken);

// Email-Routes
router.post('/create-batch', createBatchEmails);
router.get('/paginated', getPaginatedEmails); // TODO: Muss vom Bewerber implementiert werden
router.get('/', getAllEmails);
router.get('/stats', getEmailStats);
router.get('/:id', getEmailById);

export default router;

