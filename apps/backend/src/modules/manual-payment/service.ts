import crypto from "crypto"
import { AbstractPaymentProvider, PaymentSessionStatus, PaymentActions } from "@medusajs/framework/utils"
import type {
  InitiatePaymentInput,
  InitiatePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  ProviderWebhookPayload,
  WebhookActionResult,
} from "@medusajs/framework/types"

/**
 * Manual "pay outside Stripe" provider — customer sends money directly to a
 * PayPal/Zelle/crypto address shown at checkout (screenshot from Vu's real
 * WalletUp setup: PayPal handle, Zelle email, USDT address), then confirms
 * "I've sent it". No live API — payment is verified and captured by staff
 * in the admin after checking the actual account, same as the WalletUp Pro
 * flow on the WordPress site. Registered multiple times under different
 * ids (see medusa-config.ts) so each method shows as its own tile.
 */
class ManualPaymentProviderService extends AbstractPaymentProvider {
  static identifier = "manual-payment"

  async initiatePayment(
    _input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    return { data: {}, id: crypto.randomUUID() }
  }

  async getPaymentStatus(
    _input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    return { status: "pending" }
  }

  async retrievePayment(
    _input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    return { data: {} }
  }

  async authorizePayment(
    _input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    // Not auto-authorized — stays pending until staff confirms the manual
    // transfer actually arrived and captures it from the admin.
    return { data: {}, status: "pending" as PaymentSessionStatus }
  }

  async updatePayment(
    _input: UpdatePaymentInput
  ): Promise<UpdatePaymentOutput> {
    return { data: {} }
  }

  async deletePayment(
    _input: DeletePaymentInput
  ): Promise<DeletePaymentOutput> {
    return { data: {} }
  }

  async capturePayment(
    _input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    return { data: {} }
  }

  async refundPayment(
    _input: RefundPaymentInput
  ): Promise<RefundPaymentOutput> {
    return { data: {} }
  }

  async cancelPayment(
    _input: CancelPaymentInput
  ): Promise<CancelPaymentOutput> {
    return { data: {} }
  }

  async getWebhookActionAndData(
    _data: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    return { action: PaymentActions.NOT_SUPPORTED }
  }
}

export default ManualPaymentProviderService
