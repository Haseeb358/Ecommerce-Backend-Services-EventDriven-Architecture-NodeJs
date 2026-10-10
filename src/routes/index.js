import { Router } from 'express';
import { createAuthController } from '../controllers/auth.controller.js';
import { createAuthRoutes } from './auth.routes.js';
import { createProductController } from '../controllers/product.controller.js';
import { createProductRoutes } from './products.routes.js';


export function createRoutes(container) {
  const router = Router();

  const authController = createAuthController({
    authService: container.resolve('authService'),
  });

  const productController = createProductController({
    productService: container.resolve('productService'),
  });
  

  router.use('/products', createProductRoutes({ productController }));

  router.use('/auth', createAuthRoutes({ authController }));
  return router;
}
