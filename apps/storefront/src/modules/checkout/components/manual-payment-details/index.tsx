import { manualPaymentAddresses } from "@lib/constants"
import { Text } from "@modules/common/components/ui"
import { QRCodeSVG } from "qrcode.react"

/**
 * Shown under a manual payment tile (PayPal/Zelle/USDT) once selected —
 * customer sends funds directly to this address, then confirms via
 * "Continue to review". Staff verify the transfer actually arrived and
 * capture the order manually in admin, same flow as WalletUp Pro today.
 */
const ManualPaymentDetails = ({ providerId }: { providerId: string }) => {
  const address = manualPaymentAddresses[providerId]
  if (!address) return null

  return (
    <div className="my-4 flex items-center gap-4 border border-regenx-navy/10 bg-regenx-cream/40 p-4">
      <QRCodeSVG value={address} size={96} />
      <div>
        <Text className="txt-medium-plus text-ui-fg-base mb-1">
          Send payment to:
        </Text>
        <Text className="txt-medium text-ui-fg-subtle break-all">
          {address}
        </Text>
        <Text className="text-xs text-ui-fg-muted mt-2">
          After sending, click &quot;Continue to review&quot; — our team
          confirms and processes your order once the transfer arrives.
        </Text>
      </div>
    </div>
  )
}

export default ManualPaymentDetails
