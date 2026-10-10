import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { getProductsQuery, productIdParam } from '../validations/product.validation.js';

export function createProductRoutes({ productController }) {
    const router = Router();
   
    // source: 'query' | 'params' | 'body'
     // router.get('/all', productController.getAllProducts);
    router.get('/all', validate(getProductsQuery, 'query'), productController.listProducts);
    router.get('/:id', validate(productIdParam, 'params'), productController.getProductById);
    return router;
}