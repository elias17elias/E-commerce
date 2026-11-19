import express from 'express';
import { getUsers, getUserById, deleteUser, updateUserName, increaseUserBalance } from '../controllers/users.controller.js';
import { validateBalanceIncrease, validateId } from '../middleware/validate.js';
import authenticate from '../middleware/authenticate.js';
import authorize, { authorizeSelfOrAdmin } from '../middleware/authorize.js';

const router = express.Router();

router.get('/', authenticate, authorize('admin'), getUsers);
router.get('/:id', validateId('id'), authenticate, authorizeSelfOrAdmin, getUserById);
router.delete('/:id', validateId('id'), authenticate, authorizeSelfOrAdmin, deleteUser);
router.put('/:id', validateId('id'), authenticate, authorizeSelfOrAdmin, updateUserName);
router.post('/:id/balance', validateId('id'), authenticate, authorize('admin'), validateBalanceIncrease, increaseUserBalance);
export default router;