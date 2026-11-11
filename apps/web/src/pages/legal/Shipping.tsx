import LegalLayout from "../../components/LegalLayout.js";

export default function Shipping() {
  return (
    <LegalLayout title="Shipping Policy" updated="11 November 2026">
      <p><strong>1. Digital Delivery Only</strong><br/>
      PALASTRA is a digital SaaS product. We do not sell or ship physical goods.</p>
      
      <p><strong>2. Activation Process</strong><br/>
      After successful payment, our system verifies the payment, updates your licence status, and sends a confirmation email. Paid features become immediately available.</p>
      
      <p><strong>3. Delayed Activation</strong><br/>
      If your payment succeeds but your account is not updated within 15 minutes, email palastrasupport@gmail.com with your Razorpay Payment ID. We will resolve it within 1 business day. If we cannot, you are entitled to a full refund.</p>
    </LegalLayout>
  );
}
