import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button.js";
import { purchaseLicence } from "../lib/razorpay.js";
import { useToast } from "./Toast.js";
import { useGym } from "../context/GymContext.js";
import { ApiError } from "../lib/api.js";

interface Props {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  label?: string;
  fullWidth?: boolean;
}

export default function BuyLicenceButton({
  variant = "primary",
  size = "lg",
  label = "Buy licence — ₹1,999",
  fullWidth = true,
}: Props) {
  const navigate = useNavigate();
  const toast = useToast();
  const { refresh } = useGym();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      const res = await purchaseLicence();
      toast.show("Licence activated");
      refresh();
      navigate("/app/billing/success", { replace: true });
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
      variant={variant}
      size={size}
      fullWidth={fullWidth}
    >
      {label}
    </Button>
  );
}