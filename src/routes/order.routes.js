import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import {placeOrderSchema} from "../validations/order.validation.js";



/** authenticateUser is passed in so this file doesn't guess where yours lives. */
export function createOrderRoutes({ orderController }) {
  const router = Router();

  router.post('/placeOrder',validate(placeOrderSchema,"body"), orderController.placeOrder);
 

  return router;
}
