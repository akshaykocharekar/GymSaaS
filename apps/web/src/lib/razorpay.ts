import { api } from "./api.js";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PurchaseResponse {
  ok: boolean;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  gymName: string;
  ownerName: string;
  email: string;
  phone: string;
}

interface VerifyResponse {
  ok: boolean;
  message: string;
  licenceExpiresAt?: string;
}

/**
 * Full licence purchase flow:
 * 1. Create order on backend
 * 2. Open Razorpay checkout
 * 3. On success, verify on backend
 * 4. Return the verify response
 */
export async function purchaseLicence(): Promise<VerifyResponse> {
  const order = await api.post<PurchaseResponse>(
    "/api/gym/licence/purchase",
    {},
    true
  );

  return new Promise((resolve, reject) => {
    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "Gymora",
      description: "Software licence — ₹1,999 (one-time)",
      order_id: order.orderId,
      prefill: {
        name: order.ownerName,
        email: order.email,
        contact: order.phone,
      },
      notes: {
        gymName: order.gymName,
      },
      theme: {
        color: "#4f46e5",
      },
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        try {
          const verified = await api.post<VerifyResponse>(
            "/api/gym/licence/verify",
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            true
          );
          resolve(verified);
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (resp: any) => {
      reject(
        new Error(
          resp?.error?.description || "Payment failed. Please try again."
        )
      );
    });
    rzp.open();
  });
}