/**
 * Integrations Routes
 * Platform integration management (Facebook, Shopee, etc.)
 */

import { Router } from "express";
import { IntegrationsController } from "../controllers/integrations.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

/**
 * @swagger
 * /api/integrations:
 *   get:
 *     summary: List all integrations
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of integrations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       platform:
 *                         type: string
 *                         enum: [facebook, shopee, tiktok, lazada]
 *                       platformPageName:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       lastSyncAt:
 *                         type: string
 *                         format: date-time
 */
router.get("/", IntegrationsController.getIntegrations);

/**
 * @swagger
 * /api/integrations/{id}:
 *   get:
 *     summary: Get integration details
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Integration details
 *       404:
 *         description: Integration not found
 */
router.get("/:id", IntegrationsController.getIntegrationById);

/**
 * @swagger
 * /api/integrations/facebook/connect:
 *   post:
 *     summary: Connect Facebook Page
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - redirectUri
 *               - pageId
 *             properties:
 *               code:
 *                 type: string
 *                 description: Facebook OAuth authorization code
 *               redirectUri:
 *                 type: string
 *                 description: OAuth redirect URI
 *               pageId:
 *                 type: string
 *                 description: Facebook Page ID to connect
 *     responses:
 *       201:
 *         description: Facebook page connected successfully
 *       400:
 *         description: Invalid request or Facebook error
 */
router.post("/facebook/connect", IntegrationsController.connectFacebook);

/**
 * @swagger
 * /api/integrations/facebook/pages:
 *   get:
 *     summary: Get list of Facebook pages
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *         description: Facebook user access token
 *     responses:
 *       200:
 *         description: List of Facebook pages
 */
router.get("/facebook/pages", IntegrationsController.getFacebookPages);

/**
 * @swagger
 * /api/integrations/{id}/disconnect:
 *   delete:
 *     summary: Disconnect an integration
 *     tags: [Integrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Integration disconnected successfully
 *       404:
 *         description: Integration not found
 */
router.delete("/:id/disconnect", IntegrationsController.disconnectIntegration);

export default router;
