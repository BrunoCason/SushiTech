import { Router } from 'express';
import { changePassword, deleteUser } from '../controllers/userController';

const router = Router();

// Rotas para manipulação de usuários
router.post('/change-password', changePassword);
router.post('/delete-user', deleteUser);

export default router;
