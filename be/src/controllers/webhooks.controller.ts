/**
 * Webhooks Controller
 * Handles incoming webhooks from Facebook, Shopee, etc.
 */

import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../utils/constants";
import { logger } from "../utils/logger";
import { FacebookWebhookPayload } from "../types/facebook.types";
import { MessageSyncService } from "../services/message-sync.service";

const FACEBOOK_VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || "omnichan-webhook-verify-token";

export class WebhooksController {
  /**
   * GET /api/webhooks/facebook
   * Facebook webhook verification
   */
  public static async verifyFacebookWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];

      logger.info("Facebook webhook verification request received");

      if (mode === "subscribe" && token === FACEBOOK_VERIFY_TOKEN) {
        logger.info("Facebook webhook verified successfully");
        res.status(HTTP_STATUS.OK).send(challenge);
      } else {
        logger.warn("Facebook webhook verification failed - invalid token");
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: "Invalid verification token",
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/webhooks/facebook
   * Receive Facebook webhook events
   */
  public static async handleFacebookWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload: FacebookWebhookPayload = req.body;

      // Verify webhook signature
      const signature = req.headers["x-hub-signature-256"] as string;
      if (signature) {
        const rawBody = JSON.stringify(req.body);
        const { FacebookService } = require("../services/facebook.service");
        const isValid = FacebookService.verifyWebhookSignature(rawBody, signature);

        if (!isValid) {
          logger.warn("Invalid webhook signature");
          res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            error: "Invalid signature",
          });
          return;
        }
      }

      logger.info("Facebook webhook event received:", payload.object);

      // Respond quickly to Facebook
      res.status(HTTP_STATUS.OK).json({ success: true });

      // Process webhook events asynchronously
      if (payload.object === "page") {
        for (const entry of payload.entry) {
          if (entry.messaging) {
            for (const messagingEvent of entry.messaging) {
              // Process message in background
              MessageSyncService.processFacebookMessage(
                entry.id,
                messagingEvent
              ).catch((error) => {
                logger.error("Error processing Facebook message:", error);
              });
            }
          }
        }
      }
    } catch (error) {
      // Log error but still respond 200 to Facebook
      logger.error("Error handling Facebook webhook:", error);
      res.status(HTTP_STATUS.OK).json({ success: true });
    }
  }

  /**
   * GET /api/webhooks/shopee
   * Shopee webhook verification (placeholder for future)
   */
  public static async verifyShopeeWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO: Implement Shopee webhook verification
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Shopee webhook - Coming soon",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/webhooks/shopee
   * Receive Shopee webhook events (placeholder for future)
   */
  public static async handleShopeeWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO: Implement Shopee webhook handling
      logger.info("Shopee webhook event received");
      res.status(HTTP_STATUS.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
