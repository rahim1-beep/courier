import { Injectable, Logger } from '@nestjs/common';

/**
 * Notification service stub.
 * Ready for email (SendGrid, SES) and SMS (Twilio) integration.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // TODO: Integrate with SendGrid / AWS SES
    this.logger.log(`[EMAIL STUB] To: ${to}, Subject: ${subject}`);
  }

  async sendSms(to: string, message: string): Promise<void> {
    // TODO: Integrate with Twilio / SNS
    this.logger.log(`[SMS STUB] To: ${to}, Message: ${message}`);
  }

  async notifyShipmentStatusChange(
    customerEmail: string,
    trackingId: string,
    status: string,
  ): Promise<void> {
    await this.sendEmail(
      customerEmail,
      `Shipment ${trackingId} - Status Update`,
      `Your shipment ${trackingId} status has been updated to: ${status}`,
    );
  }
}
