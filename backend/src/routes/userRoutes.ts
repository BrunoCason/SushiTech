import { Router } from 'express';
import { changePassword, deleteUser, createTableUser } from '../controllers/userController';

const router = Router();

// Rotas para manipulação de usuários
router.post('/change-password', changePassword);
router.post('/delete-user', deleteUser);
router.post('/create-table-user', createTableUser);

export default router;
