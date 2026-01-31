/**
 * Customers Routes
 */

import { Router } from "express";
import { CustomersController } from "../controllers/customers.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

router.get("/", CustomersController.getCustomers);
router.get("/:id", CustomersController.getCustomerById);
router.post("/", CustomersController.createCustomer);
router.put("/:id", CustomersController.updateCustomer);
router.delete("/:id", CustomersController.deleteCustomer);

export default router;
