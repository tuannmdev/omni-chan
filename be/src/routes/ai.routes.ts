/**
 * AI Routes
 * AI-powered features and analytics
 */

import { Router } from "express";
import { AiController } from "../controllers/ai.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

/**
 * @swagger
 * /api/conversations/{id}/ai-suggestions:
 *   get:
 *     summary: Get AI-powered suggestions for a conversation
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: AI suggestions generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     conversationId:
 *                       type: string
 *                     analysis:
 *                       type: object
 *                       properties:
 *                         intent:
 *                           type: string
 *                         sentiment:
 *                           type: string
 *                         purchaseProbability:
 *                           type: number
 *                         urgencyLevel:
 *                           type: string
 *                         keywords:
 *                           type: array
 *                           items:
 *                             type: string
 *                     productRecommendations:
 *                       type: array
 *                     responseSuggestions:
 *                       type: array
 *       404:
 *         description: Conversation not found
 */
router.get(
  "/conversations/:id/ai-suggestions",
  AiController.getConversationSuggestions
);

/**
 * @swagger
 * /api/ai/suggestions/{id}/feedback:
 *   post:
 *     summary: Provide feedback on AI suggestion
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adopted:
 *                 type: boolean
 *               helpful:
 *                 type: boolean
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback recorded
 */
router.post("/ai/suggestions/:id/feedback", AiController.provideFeedback);

/**
 * @swagger
 * /api/ai/analytics:
 *   get:
 *     summary: Get AI performance analytics
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     adoptionRate:
 *                       type: number
 *                     totalSuggestions:
 *                       type: integer
 *                     adoptedSuggestions:
 *                       type: integer
 */
router.get("/ai/analytics", AiController.getAnalytics);

/**
 * @swagger
 * /api/products/recommendations/{customerId}:
 *   get:
 *     summary: Get product recommendations for a customer
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Product recommendations
 */
router.get(
  "/products/recommendations/:customerId",
  AiController.getCustomerRecommendations
);

export default router;
