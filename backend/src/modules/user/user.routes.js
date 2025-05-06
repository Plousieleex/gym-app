import { Router } from 'express';
import userController from './user.controller.js';
import authMiddleware from '../auth/auth.middleware.js';

const router = Router();

router
  .route('/userprofile')
  .post(authMiddleware.protect, userController.createUserProfile);

export default router;
