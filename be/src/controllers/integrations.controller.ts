/**
 * Integrations Controller
 * Handles platform integrations (Facebook, Shopee, etc.)
 */

import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../utils/database";
import { AuthRequest } from "../types/api.types";
import { HTTP_STATUS, SUCCESS_MESSAGES } from "../utils/constants";
import { AppError } from "../middleware/error.middleware";
import { FacebookService } from "../services/facebook.service";
import { logger } from "../utils/logger";

const connectFacebookSchema = z.object({
  code: z.string().min(1, "Authorization code is required"),
  redirectUri: z.string().url("Invalid redirect URI"),
  pageId: z.string().min(1, "Page ID is required"),
});

export class IntegrationsController {
  /**
   * GET /api/integrations
   * List all integrations for the current user
   */
  public static async getIntegrations(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;

      const integrations = await prisma.integration.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          platform: true,
          platformPageId: true,
          platformPageName: true,
          isActive: true,
          lastSyncAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: integrations,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/integrations/facebook/connect
   * Connect Facebook Page
   */
  public static async connectFacebook(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const dto = connectFacebookSchema.parse(req.body);

      logger.info(`Connecting Facebook page for user ${userId}`);

      // Step 1: Exchange code for access token
      const oauthResponse = await FacebookService.exchangeCodeForToken(
        dto.code,
        dto.redirectUri
      );

      // Step 2: Get long-lived token
      const longLivedToken = await FacebookService.getLongLivedToken(
        oauthResponse.access_token
      );

      // Step 3: Get user's pages
      const pages = await FacebookService.getUserPages(longLivedToken);
      const selectedPage = pages.find((page) => page.id === dto.pageId);

      if (!selectedPage) {
        throw new AppError(
          "Không tìm thấy trang Facebook được chọn",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // Step 4: Subscribe page to webhook
      await FacebookService.subscribePageToWebhook(
        selectedPage.id,
        selectedPage.access_token
      );

      // Step 5: Save integration to database
      const integration = await FacebookService.saveIntegration(
        userId,
        selectedPage.id,
        selectedPage.name,
        selectedPage.access_token
      );

      logger.info(`Facebook page ${selectedPage.name} connected successfully`);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: "Kết nối Facebook thành công",
        data: {
          id: integration.id,
          platform: integration.platform,
          pageName: integration.platformPageName,
          pageId: integration.platformPageId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/integrations/facebook/pages
   * Get list of Facebook pages accessible to the user
   */
  public static async getFacebookPages(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { accessToken } = req.query;

      if (!accessToken || typeof accessToken !== "string") {
        throw new AppError(
          "Access token is required",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const pages = await FacebookService.getUserPages(accessToken);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: pages,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/integrations/:id/disconnect
   * Disconnect an integration
   */
  public static async disconnectIntegration(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await FacebookService.disconnectIntegration(userId, id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Ngắt kết nối thành công",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/integrations/:id
   * Get integration details
   */
  public static async getIntegrationById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const integration = await prisma.integration.findFirst({
        where: {
          id,
          userId,
        },
        select: {
          id: true,
          platform: true,
          platformPageId: true,
          platformPageName: true,
          isActive: true,
          lastSyncAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!integration) {
        throw new AppError(
          "Không tìm thấy tích hợp",
          HTTP_STATUS.NOT_FOUND
        );
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: integration,
      });
    } catch (error) {
      next(error);
    }
  }
}
