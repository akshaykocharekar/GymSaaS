import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button.js";
import { api, ApiError } from "../lib/api.js";
import { useToast } from "./Toast.js";
import { useGym } from "../context/GymContext.js";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Props {
  fullWidth?: boolean;
  label?: string;
}

export default function RenewMaintenanceButton({
  fullWidth = true,
  label = "Renew maintenance — ₹499",
}: Props) {
  const navigate = useNavigate();
  const toast = useToast();
  const { refresh } = useGym();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      const order = await api.post<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
        gymName: string;
        ownerName: string;
        email: string;
        phone: string;
      }>("/api/gym/licence/maintenance", {}, true);

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Gymora",
          description: "Annual maintenance — ₹499",
          order_id: order.orderId,
          prefill: {
            name: order.ownerName,
            email: order.email,
            contact: order.phone,
          },
          theme: { color: "#4f46e5" },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              await api.post(
                "/api/gym/licence/verify",
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
                true
              );
              toast.show("Maintenance renewed");
              refresh();
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled")),
          },
        });
        rzp.on("payment.failed", (resp: any) => {
          reject(new Error(resp?.error?.description || "Payment failed"));
        });
        rzp.open();
      });

      // Refresh view
      setTimeout(() => navigate("/app/billing"), 500);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Payment failed";
      toast.show(msg, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      onClick={handleClick}
      loading={busy}
      fullWidth={fullWidth}
      size="md"
    >
      {label}
    </Button>
  );
}