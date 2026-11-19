import express from 'express';
import { getAllOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder } from '../controllers/orders.controller.js';
import { validateOrder, validateId, validateOrderListQuery } from '../middleware/validate.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
const router = express.Router();

router.get('/', authenticate, authorize('admin'), validateOrderListQuery, getAllOrders);
router.get('/:id', authenticate, validateId('id'), getOrderById);
router.post('/', authenticate, authorize('user', 'admin'), validateOrder, createOrder);
router.put('/:id', authenticate, authorize('admin'), validateId('id'), updateOrderStatus);
router.delete('/:id', authenticate, authorize('admin'), validateId('id'), deleteOrder);

export default router;