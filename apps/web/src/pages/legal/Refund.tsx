import LegalLayout from "../../components/LegalLayout.js";

export default function Refund() {
  return (
    <LegalLayout title="Refund & Cancellation Policy" updated="11 November 2026">
      <p><strong>1. Free Trial</strong><br/>
      New gyms receive a 30-day free trial upon activation. This allows you to fully evaluate the software before purchasing a licence.</p>
      
      <p><strong>2. Licence Purchase</strong><br/>
      The initial licence costs ₹1,999, which includes 12 months of maintenance. From Year 2 onwards, the annual maintenance fee is ₹499/year.</p>
      
      <p><strong>3. Refund Conditions</strong><br/>
      Because we offer a 30-day free trial, all licence purchases are generally final. However, we will issue a full refund in these cases:</p>
      <ul>
        <li>Duplicate Payment</li>
        <li>Failed Activation (if we cannot resolve within 7 business days)</li>
        <li>Unauthorised Transaction (subject to verification)</li>
        <li>Any refund required under Indian consumer laws</li>
      </ul>
      
      <p><strong>4. Annual Maintenance</strong><br/>
      The ₹499/year maintenance fee is mandatory. It is not automatically charged. If you fail to renew, your access to the hosted platform will be suspended until payment is made. Refunds for maintenance are not provided once the period has begun.</p>
      
      <p><strong>5. How to Request</strong><br/>
      Email palastrasupport@gmail.com with your Gym name, Razorpay Payment ID, and issue description. We will respond within 1-2 business days.</p>
    </LegalLayout>
  );
}
