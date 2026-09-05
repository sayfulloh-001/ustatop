import { prisma } from '../db/prisma';
import { config } from '../config';
import { logger } from '../utils/logger';

// ─── Payme xato kodlari ───────────────────────────────────────────────────────
export const PAYME_ERROR = {
  PARSE_ERROR:          { code: -32700, message: 'Parse error' },
  METHOD_NOT_FOUND:     { code: -32601, message: 'Method not found' },
  INVALID_AMOUNT:       { code: -31001, message: 'Wrong amount' },
  TRANSACTION_NOT_FOUND:{ code: -31003, message: 'Transaction not found' },
  INVALID_ACCOUNT:      { code: -31050, message: 'Account not found' },
  ALREADY_PAID:         { code: -31099, message: 'Transaction already paid' },
  UNABLE_TO_PERFORM:    { code: -31008, message: 'Unable to perform operation' },
  CANCELLED:            { code: -31007, message: 'Transaction cancelled' },
};

// Payme to'lov holati (Payme dokumentatsiyasi)
const PAYME_STATE = {
  PENDING:   1,  // Yaratildi, kutilmoqda
  PAID:      2,  // To'landi
  CANCELLED: -1, // Bekor qilindi (to'lovdan oldin)
  CANCELLED_AFTER_COMPLETE: -2, // Bekor qilindi (to'lovdan keyin)
};

export class PaymentService {

  // ── Payme yoqilgan-yoqilmaganligini tekshiradi ────────────────────────────
  isPaymeEnabled(): boolean {
    return config.payme.isEnabled;
  }

  // ── Frontend uchun: to'lov holati va Payme checkout URL ──────────────────
  async getPaymentStatus(userId: string) {
    const isEnabled = this.isPaymeEnabled();

    if (!isEnabled) {
      return { required: false, paid: true, paymeEnabled: false };
    }

    // To'langan to'lovni tekshir
    const paid = await prisma.payment.findFirst({
      where: { userId, status: 'PAID', purpose: 'MASTER_REGISTRATION' },
    });

    if (paid) {
      return { required: true, paid: true, paymeEnabled: true, payment: paid };
    }

    // Pending to'lov bormi?
    let pending = await prisma.payment.findFirst({
      where: { userId, status: 'PENDING', purpose: 'MASTER_REGISTRATION' },
      orderBy: { createdAt: 'desc' },
    });

    // Yo'q bo'lsa — yangi yaratamiz
    if (!pending) {
      pending = await prisma.payment.create({
        data: {
          userId,
          amount: config.payme.registrationAmount,
          purpose: 'MASTER_REGISTRATION',
          merchantTransId: `ustatop-${userId}-${Date.now()}`,
        },
      });
    }

    // Payme checkout URL
    const paymeUrl = this.buildPaymeUrl(
      pending.merchantTransId,
      pending.amount,
    );

    return {
      required:    true,
      paid:        false,
      paymeEnabled: true,
      payment:     pending,
      paymeUrl,
    };
  }

  // ── Foydalanuvchi to'lab bo'lganmi? ─────────────────────────────────────
  async hasPaid(userId: string): Promise<boolean> {
    if (!this.isPaymeEnabled()) return true; // Payme yo'q = bepul

    const paid = await prisma.payment.findFirst({
      where: { userId, status: 'PAID', purpose: 'MASTER_REGISTRATION' },
    });

    return !!paid;
  }

  // ── Payme Checkout URL yasash ────────────────────────────────────────────
  buildPaymeUrl(merchantTransId: string, amountInSom: number): string {
    const { merchantId, isTest } = config.payme;

    // Payme tiyin (so'm * 100)
    const amountInTiyin = Math.round(amountInSom * 100);

    const returnUrl = encodeURIComponent(
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment?from=payme`,
    );

    // Payme checkout parametrlari Base64 ga encode qilinadi
    const params = Buffer.from(
      JSON.stringify({
        m:   merchantId,
        ac:  { order_id: merchantTransId },
        a:   amountInTiyin,
        c:   decodeURIComponent(returnUrl),
        cr:  'UZS',
      }),
    ).toString('base64');

    const baseUrl = isTest
      ? 'https://test.paycom.uz'
      : 'https://checkout.paycom.uz';

    return `${baseUrl}/${params}`;
  }

  // ── Payme Basic Auth ni tekshirish ───────────────────────────────────────
  verifyBasicAuth(authHeader: string | undefined): boolean {
    if (!authHeader || !authHeader.startsWith('Basic ')) return false;
    const base64 = authHeader.slice(6);
    const decoded = Buffer.from(base64, 'base64').toString('utf8');
    // Format: "Paycom:<SECRET_KEY>"
    const [login, password] = decoded.split(':');
    if (login !== 'Paycom') return false;
    return password === config.payme.activeSecretKey;
  }

  // ── Payme JSON-RPC webhook handler ───────────────────────────────────────
  async handlePaymeRequest(body: any, authHeader: string | undefined): Promise<object> {
    const { id, method, params } = body || {};

    // Auth tekshirish
    if (!this.verifyBasicAuth(authHeader)) {
      return this.rpcError(id, -32504, 'Insufficient privilege to perform this method');
    }

    switch (method) {
      case 'CheckPerformTransaction':
        return this.checkPerformTransaction(id, params);
      case 'CreateTransaction':
        return this.createTransaction(id, params);
      case 'PerformTransaction':
        return this.performTransaction(id, params);
      case 'CancelTransaction':
        return this.cancelTransaction(id, params);
      case 'CheckTransaction':
        return this.checkTransaction(id, params);
      case 'GetStatement':
        return this.getStatement(id, params);
      default:
        return this.rpcError(id, PAYME_ERROR.METHOD_NOT_FOUND.code, PAYME_ERROR.METHOD_NOT_FOUND.message);
    }
  }

  // ── CheckPerformTransaction ───────────────────────────────────────────────
  // Payme to'lovni amalga oshirishdan oldin tekshiradi
  private async checkPerformTransaction(id: any, params: any) {
    const { amount, account } = params || {};
    const orderId = account?.order_id;

    if (!orderId) {
      return this.rpcError(id, PAYME_ERROR.INVALID_ACCOUNT.code, 'order_id talab qilinadi');
    }

    const payment = await prisma.payment.findUnique({
      where: { merchantTransId: orderId },
    });

    if (!payment) {
      return this.rpcError(id, PAYME_ERROR.INVALID_ACCOUNT.code, 'Buyurtma topilmadi');
    }

    // Miqdor tekshirish (tiyin)
    const expectedTiyin = Math.round(payment.amount * 100);
    if (Math.abs(expectedTiyin - Number(amount)) > 10) {
      return this.rpcError(id, PAYME_ERROR.INVALID_AMOUNT.code, "Noto'g'ri summa");
    }

    if (payment.status === 'PAID') {
      return this.rpcError(id, PAYME_ERROR.ALREADY_PAID.code, "Allaqachon to'langan");
    }

    logger.info(`Payme CheckPerformTransaction OK: ${orderId}`);
    return { id, result: { allow: true } };
  }

  // ── CreateTransaction ─────────────────────────────────────────────────────
  // Payme tranzaksiya yaratadi
  private async createTransaction(id: any, params: any) {
    const { id: paymeId, time, amount, account } = params || {};
    const orderId = account?.order_id;

    const payment = await prisma.payment.findUnique({
      where: { merchantTransId: orderId },
    });

    if (!payment) {
      return this.rpcError(id, PAYME_ERROR.INVALID_ACCOUNT.code, 'Buyurtma topilmadi');
    }

    const expectedTiyin = Math.round(payment.amount * 100);
    if (Math.abs(expectedTiyin - Number(amount)) > 10) {
      return this.rpcError(id, PAYME_ERROR.INVALID_AMOUNT.code, "Noto'g'ri summa");
    }

    // Agar avval ham shu Payme tranzaksiyasi yaratilgan bo'lsa — qaytaramiz
    if (payment.paymeTransId && payment.paymeTransId !== String(paymeId)) {
      return this.rpcError(id, PAYME_ERROR.UNABLE_TO_PERFORM.code, 'Boshqa tranzaksiya mavjud');
    }

    if (payment.status === 'PAID') {
      return this.rpcError(id, PAYME_ERROR.ALREADY_PAID.code, "Allaqachon to'langan");
    }

    // Tranzaksiyani saqlash
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymeTransId: String(paymeId),
        paymeTime:    BigInt(time),
        status:       'PENDING',
      },
    });

    logger.info(`Payme CreateTransaction OK: ${orderId}, paymeId: ${paymeId}`);

    return {
      id,
      result: {
        create_time: time,
        transaction:  payment.id,
        state:        PAYME_STATE.PENDING,
      },
    };
  }

  // ── PerformTransaction ────────────────────────────────────────────────────
  // To'lov tasdiqlandi — muvaffaqiyatli
  private async performTransaction(id: any, params: any) {
    const { id: paymeId } = params || {};

    const payment = await prisma.payment.findFirst({
      where: { paymeTransId: String(paymeId) },
    });

    if (!payment) {
      return this.rpcError(id, PAYME_ERROR.TRANSACTION_NOT_FOUND.code, 'Tranzaksiya topilmadi');
    }

    if (payment.status === 'PAID') {
      return {
        id,
        result: {
          transaction:  payment.id,
          perform_time: Number(payment.updatedAt),
          state:        PAYME_STATE.PAID,
        },
      };
    }

    if (payment.status === 'CANCELLED') {
      return this.rpcError(id, PAYME_ERROR.CANCELLED.code, 'Tranzaksiya bekor qilingan');
    }

    const performTime = Date.now();
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'PAID' },
    });

    logger.info(`Payme PerformTransaction PAID: ${payment.merchantTransId}, userId: ${payment.userId}`);

    return {
      id,
      result: {
        transaction:  payment.id,
        perform_time: performTime,
        state:        PAYME_STATE.PAID,
      },
    };
  }

  // ── CancelTransaction ─────────────────────────────────────────────────────
  private async cancelTransaction(id: any, params: any) {
    const { id: paymeId, reason } = params || {};

    const payment = await prisma.payment.findFirst({
      where: { paymeTransId: String(paymeId) },
    });

    if (!payment) {
      return this.rpcError(id, PAYME_ERROR.TRANSACTION_NOT_FOUND.code, 'Tranzaksiya topilmadi');
    }

    let cancelState = PAYME_STATE.CANCELLED;

    if (payment.status === 'PAID') {
      // To'lovdan keyin bekor qilish (agar biznes logika ruxsat bersa)
      cancelState = PAYME_STATE.CANCELLED_AFTER_COMPLETE;
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'CANCELLED' },
    });

    logger.info(`Payme CancelTransaction: ${payment.merchantTransId}, reason: ${reason}`);

    return {
      id,
      result: {
        transaction:  payment.id,
        cancel_time:  Date.now(),
        state:        cancelState,
      },
    };
  }

  // ── CheckTransaction ──────────────────────────────────────────────────────
  private async checkTransaction(id: any, params: any) {
    const { id: paymeId } = params || {};

    const payment = await prisma.payment.findFirst({
      where: { paymeTransId: String(paymeId) },
    });

    if (!payment) {
      return this.rpcError(id, PAYME_ERROR.TRANSACTION_NOT_FOUND.code, 'Tranzaksiya topilmadi');
    }

    const state =
      payment.status === 'PAID'      ? PAYME_STATE.PAID :
      payment.status === 'CANCELLED' ? PAYME_STATE.CANCELLED :
                                        PAYME_STATE.PENDING;

    return {
      id,
      result: {
        create_time:  payment.paymeTime ? Number(payment.paymeTime) : Number(payment.createdAt),
        perform_time: payment.status === 'PAID' ? Number(payment.updatedAt) : 0,
        cancel_time:  payment.status === 'CANCELLED' ? Number(payment.updatedAt) : 0,
        transaction:  payment.id,
        state,
        reason:       null,
      },
    };
  }

  // ── GetStatement ──────────────────────────────────────────────────────────
  private async getStatement(id: any, params: any) {
    const { from, to } = params || {};

    const payments = await prisma.payment.findMany({
      where: {
        paymeTransId: { not: null },
        createdAt: {
          gte: new Date(Number(from)),
          lte: new Date(Number(to)),
        },
      },
    });

    const transactions = payments.map((p) => ({
      id:           p.paymeTransId,
      time:         p.paymeTime ? Number(p.paymeTime) : Number(p.createdAt),
      amount:       Math.round(p.amount * 100),
      account:      { order_id: p.merchantTransId },
      create_time:  p.paymeTime ? Number(p.paymeTime) : Number(p.createdAt),
      perform_time: p.status === 'PAID' ? Number(p.updatedAt) : 0,
      cancel_time:  p.status === 'CANCELLED' ? Number(p.updatedAt) : 0,
      transaction:  p.id,
      state:
        p.status === 'PAID'      ? PAYME_STATE.PAID :
        p.status === 'CANCELLED' ? PAYME_STATE.CANCELLED :
                                    PAYME_STATE.PENDING,
      reason: null,
    }));

    return { id, result: { transactions } };
  }

  // ── JSON-RPC xato formatida qaytarish ─────────────────────────────────────
  private rpcError(id: any, code: number, message: string) {
    return { id, error: { code, message, data: null } };
  }
}

export const paymentService = new PaymentService();
