import Expo, { ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { Blocker } from '@common/types';

/**
 * Push Notification Service
 * Handles sending push notifications to registered mobile devices using Expo Push Notifications
 */
export class PushNotificationService {
  private expo: Expo;
  private pushTokens: Set<string>;

  constructor() {
    this.expo = new Expo();
    this.pushTokens = new Set();
  }

  /**
   * Register a push token for receiving notifications
   * @param token - Expo push token from the mobile client
   */
  public registerToken(token: string): void {
    const tokenPreview = token.substring(0, 20);

    if (!Expo.isExpoPushToken(token)) {
      console.warn(`[Push] Invalid push token format: ${tokenPreview}...`);
      return;
    }

    this.pushTokens.add(token);
    console.log(`[Push] Token registered: ${tokenPreview}... (Total: ${this.pushTokens.size})`);
  }

  /**
   * Unregister a push token
   * @param token - Expo push token to remove
   */
  public unregisterToken(token: string): void {
    const removed = this.pushTokens.delete(token);
    if (removed) {
      console.log(`[Push] Token unregistered: ${token.substring(0, 20)}...`);
    }
  }

  /**
   * Send a blocker alert notification to all registered devices
   * @param blocker - The blocker object containing alert information
   * @param trackName - Name of the track where the blocker occurred
   */
  public async sendBlockerAlert(blocker: Blocker, trackName: string): Promise<void> {
    if (this.pushTokens.size === 0) {
      console.log('[Push] No registered tokens, skipping blocker alert notification');
      return;
    }

    const messages: ExpoPushMessage[] = [];

    for (const token of this.pushTokens) {
      messages.push({
        to: token,
        sound: 'default',
        title: '⚠️ ブロッカー検出',
        body: `${trackName}: ${blocker.reason}`,
        data: {
          type: 'blocker_alert',
          blockerId: blocker.id,
          taskId: blocker.taskId,
        },
        priority: 'high',
        badge: 1,
      });
    }

    await this.sendPushNotifications(messages, `blocker alert: ${blocker.id}`);
  }

  /**
   * Send a task update notification to all registered devices
   * @param taskId - ID of the updated task
   * @param taskTitle - Title of the task
   * @param newStatus - New status of the task
   */
  public async sendTaskUpdateNotification(
    taskId: string,
    taskTitle: string,
    newStatus: string
  ): Promise<void> {
    if (this.pushTokens.size === 0) {
      console.log('[Push] No registered tokens, skipping task update notification');
      return;
    }

    const statusEmoji = this.getStatusEmoji(newStatus);
    const messages: ExpoPushMessage[] = [];

    for (const token of this.pushTokens) {
      messages.push({
        to: token,
        sound: 'default',
        title: `${statusEmoji} タスク更新`,
        body: `${taskTitle}: ${newStatus}`,
        data: {
          type: 'task_update',
          taskId,
        },
        priority: 'normal',
      });
    }

    await this.sendPushNotifications(messages, `task update: ${taskId}`);
  }

  /**
   * Send a general notification to all registered devices
   * @param title - Notification title
   * @param body - Notification body
   * @param data - Additional data to include in the notification
   */
  public async sendNotification(title: string, body: string, data?: Record<string, unknown>): Promise<void> {
    if (this.pushTokens.size === 0) {
      console.log('[Push] No registered tokens, skipping general notification');
      return;
    }

    const messages: ExpoPushMessage[] = Array.from(this.pushTokens).map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
    }));

    await this.sendPushNotifications(messages, 'general notification');
  }

  /**
   * Internal method to send push notifications in chunks
   * @param messages - Array of push messages to send
   * @param context - Context description for logging
   */
  private async sendPushNotifications(messages: ExpoPushMessage[], context: string): Promise<void> {
    try {
      // Split messages into chunks as required by Expo
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      // Send each chunk
      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error(`[Push] Error sending chunk for ${context}:`, error);
        }
      }

      // Log results
      const successCount = tickets.filter((ticket) => ticket.status === 'ok').length;
      const errorCount = tickets.filter((ticket) => ticket.status === 'error').length;

      console.log(`[Push] Sent ${successCount} notifications successfully for ${context}`);
      if (errorCount > 0) {
        console.warn(`[Push] ${errorCount} notifications failed for ${context}`);
      }

      // Log any specific errors
      tickets.forEach((ticket, index) => {
        if (ticket.status === 'error') {
          console.error(`[Push] Ticket ${index} error:`, ticket.message);
        }
      });
    } catch (error) {
      console.error(`[Push] Fatal error sending notifications for ${context}:`, error);
    }
  }

  /**
   * Get emoji representation for task status
   * @param status - Task status string
   * @returns Emoji string
   */
  private getStatusEmoji(status: string): string {
    const emojiMap: Record<string, string> = {
      done: '✅',
      in_progress: '🟡',
      not_started: '⚪',
      blocked: '⏳',
    };
    return emojiMap[status] || '📋';
  }

  /**
   * Get the number of registered push tokens
   * @returns Number of registered tokens
   */
  public getRegisteredTokenCount(): number {
    return this.pushTokens.size;
  }

  /**
   * Clear all registered push tokens
   */
  public clearAllTokens(): void {
    this.pushTokens.clear();
    console.log('[Push] All tokens cleared');
  }
}

// Export a singleton instance
export const pushNotificationService = new PushNotificationService();
