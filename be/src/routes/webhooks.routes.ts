/**
 * Webhooks Routes
 * Handle incoming webhooks from integrated platforms
 */

import { Router } from "express";
import { WebhooksController } from "../controllers/webhooks.controller";

const router = Router();

/**
 * @swagger
 * /api/webhooks/facebook:
 *   get:
 *     summary: Facebook webhook verification
 *     tags: [Webhooks]
 *     parameters:
 *       - in: query
 *         name: hub.mode
 *         schema:
 *           type: string
 *       - in: query
 *         name: hub.verify_token
 *         schema:
 *           type: string
 *       - in: query
 *         name: hub.challenge
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Webhook verified
 *       403:
 *         description: Invalid verification token
 */
router.get("/facebook", WebhooksController.verifyFacebookWebhook);

/**
 * @swagger
 * /api/webhooks/facebook:
 *   post:
 *     summary: Receive Facebook webhook events
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Event received
 */
router.post("/facebook", WebhooksController.handleFacebookWebhook);

// Shopee webhooks (placeholder for future implementation)
router.get("/shopee", WebhooksController.verifyShopeeWebhook);
router.post("/shopee", WebhooksController.handleShopeeWebhook);

export default router;
