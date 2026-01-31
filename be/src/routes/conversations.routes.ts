/**
 * Conversations Routes
 */

import { Router } from "express";
import { ConversationsController } from "../controllers/conversations.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

router.get("/", ConversationsController.getConversations);
router.get("/:id", ConversationsController.getConversationById);
router.post("/", ConversationsController.createConversation);
router.patch("/:id/status", ConversationsController.updateConversationStatus);
router.patch("/:id/assign", ConversationsController.assignConversation);
router.post("/:id/messages", ConversationsController.sendMessage);

export default router;
