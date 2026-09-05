import { config } from '../config';
import { logger } from '../utils/logger';

export interface ISmsProvider {
  sendSms(phone: string, message: string): Promise<boolean>;
}

export class MockSmsProvider implements ISmsProvider {
  // In-memory debug store for dev inspection
  private static recentMessages: { phone: string; message: string; timestamp: Date }[] = [];

  async sendSms(phone: string, message: string): Promise<boolean> {
    logger.info(`[MOCK SMS] To: ${phone} | Content: "${message}"`);
    MockSmsProvider.recentMessages.unshift({
      phone,
      message,
      timestamp: new Date(),
    });
    // Keep max 50 recent
    if (MockSmsProvider.recentMessages.length > 50) {
      MockSmsProvider.recentMessages.pop();
    }
    return true;
  }

  static getRecentMessages() {
    return this.recentMessages;
  }
}

export class EskizSmsProvider implements ISmsProvider {
  private token: string | null = null;
  private tokenExpiresAt: number = 0;

  private async getAuthToken(): Promise<string | null> {
    if (this.token && Date.now() < this.tokenExpiresAt) {
      return this.token;
    }

    try {
      const response = await fetch('https://notify.eskiz.uz/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: config.sms.eskizEmail,
          password: config.sms.eskizPassword,
        }),
      });

      if (!response.ok) {
        logger.error(`Eskiz auth error: ${response.statusText}`);
        return null;
      }

      const data = (await response.json()) as any;
      if (data && data.data && data.data.token) {
        this.token = data.data.token;
        // Eskiz token valid for 30 days, cache for 25 days
        this.tokenExpiresAt = Date.now() + 25 * 24 * 60 * 60 * 1000;
        return this.token;
      }
      return null;
    } catch (err) {
      logger.error('Failed to authenticate with Eskiz SMS:', err);
      return null;
    }
  }

  async sendSms(phone: string, message: string): Promise<boolean> {
    // Standardize phone (remove leading + for Eskiz format: 998901234567)
    const formattedPhone = phone.replace(/\D/g, '');

    const token = await this.getAuthToken();
    if (!token) {
      logger.error('Eskiz token unavailable. Falling back to Mock SMS log.');
      logger.info(`[FALLBACK SMS] To: ${phone} | Content: "${message}"`);
      return true;
    }

    try {
      const response = await fetch('https://notify.eskiz.uz/api/message/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mobile_phone: formattedPhone,
          message: message,
          from: '4546', // Default Eskiz sender or customized
        }),
      });

      const resData = (await response.json()) as any;
      logger.info('Eskiz SMS response:', resData);
      return response.ok;
    } catch (error) {
      logger.error('Eskiz SMS delivery failed:', error);
      return false;
    }
  }
}

export class SmsService {
  private provider: ISmsProvider;

  constructor() {
    if (config.sms.provider === 'eskiz' && config.sms.eskizEmail && config.sms.eskizPassword) {
      logger.info('Initialized Eskiz SMS Provider.');
      this.provider = new EskizSmsProvider();
    } else {
      logger.info('Initialized Mock SMS Provider for local development.');
      this.provider = new MockSmsProvider();
    }
  }

  async sendOtp(phone: string, code: string): Promise<boolean> {
    const message = `UstaTop: Tasdiqlash kodi: ${code}. Kodni hech kimga bermang!`;
    return this.provider.sendSms(phone, message);
  }
}

export const smsService = new SmsService();
