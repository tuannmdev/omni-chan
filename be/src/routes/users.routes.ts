/**
 * Users Routes
 */

import { Router } from "express";
import { UsersController } from "../controllers/users.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { USER_ROLES } from "../utils/constants";

const router = Router();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

// Get all users (admin only)
router.get("/", AuthMiddleware.authorize(USER_ROLES.ADMIN, USER_ROLES.OWNER), UsersController.getUsers);

// Get user by ID
router.get("/:id", UsersController.getUserById);

// Update user
router.put("/:id", UsersController.updateUser);

// Delete user (admin only)
router.delete("/:id", AuthMiddleware.authorize(USER_ROLES.ADMIN, USER_ROLES.OWNER), UsersController.deleteUser);

export default router;
