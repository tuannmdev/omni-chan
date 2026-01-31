/**
 * Facebook Integration Type Definitions
 */

export interface FacebookOAuthResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface FacebookPageAccessToken {
  access_token: string;
  id: string;
  name: string;
}

export interface FacebookUserProfile {
  id: string;
  name: string;
  email?: string;
}

export interface FacebookWebhookEntry {
  id: string;
  time: number;
  messaging?: FacebookMessaging[];
}

export interface FacebookMessaging {
  sender: {
    id: string;
  };
  recipient: {
    id: string;
  };
  timestamp: number;
  message?: FacebookMessage;
  read?: {
    watermark: number;
  };
  delivery?: {
    watermark: number;
    mids: string[];
  };
}

export interface FacebookMessage {
  mid: string;
  text?: string;
  attachments?: FacebookAttachment[];
  quick_reply?: {
    payload: string;
  };
}

export interface FacebookAttachment {
  type: "image" | "video" | "audio" | "file";
  payload: {
    url: string;
  };
}

export interface FacebookWebhookPayload {
  object: string;
  entry: FacebookWebhookEntry[];
}

export interface FacebookSendMessageRequest {
  recipient: {
    id: string;
  };
  message: {
    text?: string;
    attachment?: FacebookAttachment;
  };
  messaging_type: "RESPONSE" | "UPDATE" | "MESSAGE_TAG";
}

export interface FacebookSendMessageResponse {
  recipient_id: string;
  message_id: string;
}

export interface FacebookErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

export interface ConnectFacebookDto {
  code: string;
  redirectUri: string;
}

export interface FacebookPageInfo {
  id: string;
  name: string;
  access_token: string;
  category: string;
}
