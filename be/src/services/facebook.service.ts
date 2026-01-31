/**
 * Facebook Integration Service
 * Handles Facebook OAuth, Messenger API, and webhook processing
 */

import axios, { AxiosError } from "axios";
import { prisma } from "../utils/database";
import { AppError } from "../middleware/error.middleware";
import { HTTP_STATUS, ERROR_MESSAGES } from "../utils/constants";
import { logger } from "../utils/logger";
import { EncryptionService } from "../utils/encryption";
import {
  FacebookOAuthResponse,
  FacebookPageAccessToken,
  FacebookSendMessageRequest,
  FacebookSendMessageResponse,
  FacebookErrorResponse,
  FacebookPageInfo,
} from "../types/facebook.types";

const FACEBOOK_GRAPH_API = "https://graph.facebook.com/v18.0";
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || "";
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || "";

export class FacebookService {
  /**
   * Exchange authorization code for access token
   */
  public static async exchangeCodeForToken(
    code: string,
    redirectUri: string
  ): Promise<FacebookOAuthResponse> {
    try {
      const response = await axios.get(`${FACEBOOK_GRAPH_API}/oauth/access_token`, {
        params: {
          client_id: FACEBOOK_APP_ID,
          client_secret: FACEBOOK_APP_SECRET,
          code,
          redirect_uri: redirectUri,
        },
      });

      return response.data;
    } catch (error) {
      logger.error("Facebook OAuth error:", error);
      throw new AppError(
        "Không thể kết nối với Facebook. Vui lòng thử lại.",
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  /**
   * Get long-lived user access token
   */
  public static async getLongLivedToken(shortLivedToken: string): Promise<string> {
    try {
      const response = await axios.get(`${FACEBOOK_GRAPH_API}/oauth/access_token`, {
        params: {
          grant_type: "fb_exchange_token",
          client_id: FACEBOOK_APP_ID,
          client_secret: FACEBOOK_APP_SECRET,
          fb_exchange_token: shortLivedToken,
        },
      });

      return response.data.access_token;
    } catch (error) {
      logger.error("Error getting long-lived token:", error);
      throw new AppError(
        "Không thể lấy token dài hạn từ Facebook",
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  /**
   * Get Facebook Pages managed by the user
   */
  public static async getUserPages(
    userAccessToken: string
  ): Promise<FacebookPageInfo[]> {
    try {
      const response = await axios.get(`${FACEBOOK_GRAPH_API}/me/accounts`, {
        params: {
          access_token: userAccessToken,
        },
      });

      return response.data.data || [];
    } catch (error) {
      logger.error("Error fetching user pages:", error);
      throw new AppError(
        "Không thể lấy danh sách trang Facebook",
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  /**
   * Subscribe page to webhook
   */
  public static async subscribePageToWebhook(
    pageId: string,
    pageAccessToken: string
  ): Promise<boolean> {
    try {
      const response = await axios.post(
        `${FACEBOOK_GRAPH_API}/${pageId}/subscribed_apps`,
        null,
        {
          params: {
            access_token: pageAccessToken,
            subscribed_fields: [
              "messages",
              "messaging_postbacks",
              "messaging_optins",
              "message_deliveries",
              "message_reads",
            ].join(","),
          },
        }
      );

      return response.data.success === true;
    } catch (error) {
      logger.error("Error subscribing to webhook:", error);
      throw new AppError(
        "Không thể đăng ký webhook cho trang Facebook",
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  /**
   * Save Facebook integration to database
   */
  public static async saveIntegration(
    userId: string,
    pageId: string,
    pageName: string,
    pageAccessToken: string
  ): Promise<any> {
    try {
      // Encrypt the access token before storing
      const encryptedToken = EncryptionService.encrypt(pageAccessToken);

      // Check if integration already exists
      const existing = await prisma.integration.findFirst({
        where: {
          userId,
          platform: "facebook",
          platformPageId: pageId,
        },
      });

      if (existing) {
        // Update existing integration
        return await prisma.integration.update({
          where: { id: existing.id },
          data: {
            platformPageName: pageName,
            accessToken: encryptedToken,
            isActive: true,
            lastSyncAt: new Date(),
          },
        });
      }

      // Create new integration
      return await prisma.integration.create({
        data: {
          userId,
          platform: "facebook",
          platformPageId: pageId,
          platformPageName: pageName,
          accessToken: encryptedToken,
          isActive: true,
          lastSyncAt: new Date(),
        },
      });
    } catch (error) {
      logger.error("Error saving integration:", error);
      throw new AppError(
        "Không thể lưu thông tin tích hợp Facebook",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get integration by page ID
   */
  public static async getIntegrationByPageId(pageId: string) {
    const integration = await prisma.integration.findFirst({
      where: {
        platform: "facebook",
        platformPageId: pageId,
        isActive: true,
      },
    });

    if (!integration) {
      throw new AppError("Không tìm thấy tích hợp Facebook", HTTP_STATUS.NOT_FOUND);
    }

    return integration;
  }

  /**
   * Send message to Facebook user
   */
  public static async sendMessage(
    pageId: string,
    recipientId: string,
    messageText: string
  ): Promise<FacebookSendMessageResponse> {
    try {
      // Get integration to retrieve access token
      const integration = await this.getIntegrationByPageId(pageId);
      const pageAccessToken = EncryptionService.decrypt(integration.accessToken);

      const payload: FacebookSendMessageRequest = {
        recipient: {
          id: recipientId,
        },
        message: {
          text: messageText,
        },
        messaging_type: "RESPONSE",
      };

      const response = await axios.post(
        `${FACEBOOK_GRAPH_API}/me/messages`,
        payload,
        {
          params: {
            access_token: pageAccessToken,
          },
        }
      );

      logger.info(`Message sent to Facebook user ${recipientId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<FacebookErrorResponse>;
      logger.error("Error sending Facebook message:", axiosError.response?.data);

      throw new AppError(
        "Không thể gửi tin nhắn qua Facebook",
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  /**
   * Send typing indicator
   */
  public static async sendTypingIndicator(
    pageId: string,
    recipientId: string,
    action: "typing_on" | "typing_off"
  ): Promise<void> {
    try {
      const integration = await this.getIntegrationByPageId(pageId);
      const pageAccessToken = EncryptionService.decrypt(integration.accessToken);

      await axios.post(
        `${FACEBOOK_GRAPH_API}/me/messages`,
        {
          recipient: {
            id: recipientId,
          },
          sender_action: action,
        },
        {
          params: {
            access_token: pageAccessToken,
          },
        }
      );
    } catch (error) {
      logger.error("Error sending typing indicator:", error);
      // Don't throw error for typing indicators
    }
  }

  /**
   * Mark message as read
   */
  public static async markMessageAsRead(
    pageId: string,
    recipientId: string
  ): Promise<void> {
    try {
      const integration = await this.getIntegrationByPageId(pageId);
      const pageAccessToken = EncryptionService.decrypt(integration.accessToken);

      await axios.post(
        `${FACEBOOK_GRAPH_API}/me/messages`,
        {
          recipient: {
            id: recipientId,
          },
          sender_action: "mark_seen",
        },
        {
          params: {
            access_token: pageAccessToken,
          },
        }
      );
    } catch (error) {
      logger.error("Error marking message as read:", error);
      // Don't throw error for read receipts
    }
  }

  /**
   * Disconnect Facebook integration
   */
  public static async disconnectIntegration(
    userId: string,
    integrationId: string
  ): Promise<void> {
    try {
      const integration = await prisma.integration.findFirst({
        where: {
          id: integrationId,
          userId,
          platform: "facebook",
        },
      });

      if (!integration) {
        throw new AppError(
          "Không tìm thấy tích hợp Facebook",
          HTTP_STATUS.NOT_FOUND
        );
      }

      // Mark as inactive instead of deleting
      await prisma.integration.update({
        where: { id: integrationId },
        data: { isActive: false },
      });

      logger.info(`Facebook integration ${integrationId} disconnected`);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error("Error disconnecting integration:", error);
      throw new AppError(
        "Không thể ngắt kết nối Facebook",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Verify webhook signature
   */
  public static verifyWebhookSignature(
    payload: string,
    signature: string
  ): boolean {
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", FACEBOOK_APP_SECRET)
      .update(payload)
      .digest("hex");

    return `sha256=${expectedSignature}` === signature;
  }
}
