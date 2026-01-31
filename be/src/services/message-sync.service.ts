/**
 * Message Sync Service
 * Handles syncing messages from platforms to database
 */

import { prisma } from "../utils/database";
import { logger } from "../utils/logger";
import { FacebookMessaging } from "../types/facebook.types";

export class MessageSyncService {
  /**
   * Process incoming Facebook message
   */
  public static async processFacebookMessage(
    pageId: string,
    messaging: FacebookMessaging
  ): Promise<void> {
    try {
      // Get integration to find userId
      const integration = await prisma.integration.findFirst({
        where: {
          platform: "facebook",
          platformPageId: pageId,
          isActive: true,
        },
      });

      if (!integration) {
        logger.warn(`No active integration found for Facebook page ${pageId}`);
        return;
      }

      const senderId = messaging.sender.id;
      const recipientId = messaging.recipient.id;

      // Find or create customer
      const customer = await this.findOrCreateCustomer(
        integration.userId,
        senderId,
        "facebook"
      );

      // Find or create conversation
      const conversation = await this.findOrCreateConversation(
        integration.userId,
        customer.id,
        pageId,
        "facebook"
      );

      // Handle different message types
      if (messaging.message) {
        await this.handleIncomingMessage(
          conversation.id,
          customer.id,
          messaging.message.mid,
          messaging.message.text || "",
          messaging.message.attachments,
          new Date(messaging.timestamp)
        );
      }

      // Handle read receipts
      if (messaging.read) {
        await this.handleMessageRead(conversation.id, messaging.read.watermark);
      }

      // Handle delivery confirmations
      if (messaging.delivery) {
        await this.handleMessageDelivery(
          conversation.id,
          messaging.delivery.mids
        );
      }
    } catch (error) {
      logger.error("Error processing Facebook message:", error);
      throw error;
    }
  }

  /**
   * Find or create customer from Facebook user
   */
  private static async findOrCreateCustomer(
    userId: string,
    facebookId: string,
    platform: string
  ) {
    let customer = await prisma.customer.findFirst({
      where: {
        userId,
        facebookId,
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          userId,
          facebookId,
          name: `Facebook User ${facebookId}`,
        },
      });

      logger.info(`Created new customer for Facebook user ${facebookId}`);
    }

    return customer;
  }

  /**
   * Find or create conversation
   */
  private static async findOrCreateConversation(
    userId: string,
    customerId: string,
    platformConversationId: string,
    platform: string
  ) {
    let conversation = await prisma.conversation.findFirst({
      where: {
        userId,
        customerId,
        platformConversationId,
        platform,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          customerId,
          platformConversationId,
          platform,
          status: "open",
          lastMessageAt: new Date(),
        },
      });

      logger.info(`Created new conversation ${conversation.id}`);
    }

    return conversation;
  }

  /**
   * Handle incoming message
   */
  private static async handleIncomingMessage(
    conversationId: string,
    customerId: string,
    platformMessageId: string,
    text: string,
    attachments: any[] | undefined,
    timestamp: Date
  ) {
    // Check if message already exists
    const existing = await prisma.message.findFirst({
      where: {
        conversationId,
        platformMessageId,
      },
    });

    if (existing) {
      logger.debug(`Message ${platformMessageId} already exists, skipping`);
      return;
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        platformMessageId,
        senderId: customerId,
        senderType: "customer",
        content: text,
        sentAt: timestamp,
      },
    });

    // Handle attachments
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        await prisma.messageAttachment.create({
          data: {
            messageId: message.id,
            type: attachment.type,
            url: attachment.payload?.url || "",
          },
        });
      }
    }

    // Update conversation last message
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: text,
        lastMessageAt: timestamp,
      },
    });

    logger.info(`Message ${platformMessageId} saved to database`);
  }

  /**
   * Handle message read
   */
  private static async handleMessageRead(
    conversationId: string,
    watermark: number
  ) {
    const readAt = new Date(watermark);

    await prisma.message.updateMany({
      where: {
        conversationId,
        sentAt: {
          lte: readAt,
        },
        readAt: null,
      },
      data: {
        readAt: readAt,
      },
    });

    logger.debug(`Messages in conversation ${conversationId} marked as read`);
  }

  /**
   * Handle message delivery
   */
  private static async handleMessageDelivery(
    conversationId: string,
    messageIds: string[]
  ) {
    const deliveredAt = new Date();

    for (const mid of messageIds) {
      await prisma.message.updateMany({
        where: {
          conversationId,
          platformMessageId: mid,
          deliveredAt: null,
        },
        data: {
          deliveredAt,
        },
      });
    }

    logger.debug(`Messages delivered in conversation ${conversationId}`);
  }

  /**
   * Send message to customer
   */
  public static async sendMessageToCustomer(
    conversationId: string,
    senderId: string,
    messageText: string
  ): Promise<any> {
    try {
      // Get conversation details
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          customer: true,
        },
      });

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // Get integration
      const integration = await prisma.integration.findFirst({
        where: {
          userId: conversation.userId,
          platform: conversation.platform,
          platformPageId: conversation.platformConversationId,
          isActive: true,
        },
      });

      if (!integration) {
        throw new Error("Integration not found");
      }

      // Send message via Facebook
      const { FacebookService } = require("./facebook.service");
      const response = await FacebookService.sendMessage(
        integration.platformPageId!,
        conversation.customer.facebookId!,
        messageText
      );

      // Save message to database
      const message = await prisma.message.create({
        data: {
          conversationId,
          platformMessageId: response.message_id,
          senderId,
          senderType: "agent",
          content: messageText,
          sentAt: new Date(),
        },
      });

      // Update conversation
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessage: messageText,
          lastMessageAt: new Date(),
        },
      });

      logger.info(`Message sent to customer in conversation ${conversationId}`);

      return message;
    } catch (error) {
      logger.error("Error sending message to customer:", error);
      throw error;
    }
  }
}
