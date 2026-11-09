import LegalLayout from "../../components/LegalLayout.js";

export default function Refund() {
  return (
    <LegalLayout title="Refund & Cancellation Policy" updated="9 November 2026">
      <h2>1. Free trial</h2>
      <p>
        Palastra offers a <strong>30-day free trial</strong> to every new gym
        after approval. During this trial, you can fully use every feature
        without paying anything. This trial is our way of letting you decide
        whether Palastra is right for your gym before you spend money.
      </p>

      <h2>2. Licence purchase</h2>
      <p>
        When you purchase a Palastra licence (currently ₹1,999 one-time), you
        are buying a lifetime licence to use the software. Because it is a
        digital product delivered instantly, and because you had 30 days of
        free trial to evaluate it, <strong>all purchases are final</strong>.
      </p>

      <h2>3. No refunds after purchase</h2>
      <p>
        We do not offer refunds for licence purchases once the payment is
        completed, except in the following specific cases:
      </p>
      <ul>
        <li>
          <strong>Duplicate charge:</strong> If you were accidentally charged
          twice for the same purchase, we will refund the duplicate amount.
        </li>
        <li>
          <strong>Technical failure:</strong> If our system failed to activate
          your licence after payment, and we cannot fix it within 7 business
          days, we will issue a full refund.
        </li>
        <li>
          <strong>Unauthorised transaction:</strong> If a payment was made
          fraudulently without your knowledge, contact us immediately. We will
          investigate and coordinate with Razorpay to reverse the charge.
        </li>
      </ul>

      <h2>4. Annual maintenance</h2>
      <p>
        The ₹499 annual maintenance fee is optional and charged from year 2
        onwards. Once paid, the maintenance fee is <strong>non-refundable</strong>.
        If you decide not to renew maintenance next year, you can simply not
        pay it — your licence continues to work, but you won't receive updates
        or support.
      </p>

      <h2>5. How to request a refund</h2>
      <p>
        If you believe you qualify for a refund under one of the scenarios
        above, email{" "}
        <a href="mailto:palastrasupport@gmail.com">
          palastrasupport@gmail.com
        </a>{" "}
        with:
      </p>
      <ul>
        <li>Your gym name and registered email</li>
        <li>Your Razorpay payment ID</li>
        <li>A brief description of the issue</li>
      </ul>
      <p>
        We will respond within 3 business days. Approved refunds are processed
        through Razorpay and typically reflect in your account within 5-7
        business days.
      </p>

      <h2>6. Cancellation</h2>
      <p>
        You may stop using Palastra at any time and delete your account from
        the gym profile page. Cancellation does not entitle you to a refund
        unless you qualify under one of the scenarios in section 3.
      </p>

      <h2>7. Chargebacks</h2>
      <p>
        Please contact us before initiating a chargeback with your bank or
        card issuer. We will help resolve any legitimate issue. Fraudulent
        chargebacks may result in account suspension.
      </p>

      <h2>8. Contact</h2>
      <p>
        Questions about refunds? Email{" "}
        <a href="mailto:palastrasupport@gmail.com">
          palastrasupport@gmail.com
        </a>
        .
      </p>
    </LegalLayout>
  );
}
