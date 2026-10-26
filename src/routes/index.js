import { Router } from 'express';
import { createAuthController } from '../controllers/auth.controller.js';
import { createAuthRoutes } from './auth.routes.js';
import { createProductController } from '../controllers/product.controller.js';
import { createProductRoutes } from './products.routes.js';
import { createOrderRoutes } from './order.routes.js';
import { createOrderController } from '../controllers/order.controller.js';


export function createRoutes(container) {
  const router = Router();

  const authController = createAuthController({
    authService: container.resolve('authService'),
  });

  const productController = createProductController({
    productService: container.resolve('productService'),
  });

  const orderController = createOrderController({
    orderService: container.resolve('orderService'),
  });
  

  router.use('/products', createProductRoutes({ productController }));

  router.use('/auth', createAuthRoutes({ authController }));
  router.use('/orders', createOrderRoutes({ orderController}));
  
  return router;
}
