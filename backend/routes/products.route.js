import express from 'express';
import { validateProduct, validateId, validateProductListQuery } from '../middleware/validate.js';

import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/products.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

router.get('/', validateProductListQuery, getAllProducts);
router.get('/:id', validateId('id'), getProductById);
router.post('/', validateProduct, authenticate, authorize('admin'), createProduct);
router.put('/:id', validateId('id'), validateProduct, authenticate, authorize('admin'), updateProduct);
router.delete('/:id', validateId('id'), authenticate, authorize('admin'), deleteProduct);

export default router;



