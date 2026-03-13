import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/HealthCheck',async (req,res) => res.status(200).json({
      success: true,
      message: 'Hello World',
    }))
export default router;

