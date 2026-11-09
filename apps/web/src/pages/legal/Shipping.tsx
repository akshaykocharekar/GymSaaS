import LegalLayout from "../../components/LegalLayout.js";

export default function Shipping() {
  return (
    <LegalLayout title="Shipping Policy" updated="9 November 2026">
      <h2>Digital delivery only</h2>
      <p>
        Palastra is a <strong>digital software product</strong> (SaaS). We do
        not sell or ship any physical goods. As such, no shipping, delivery,
        or courier services apply to your purchase.
      </p>

      <h2>How you receive Palastra</h2>
      <p>Upon successful payment:</p>
      <ul>
        <li>
          Your Palastra licence is activated <strong>instantly</strong> in your
          account.
        </li>
        <li>
          A confirmation email with your purchase details is sent to the email
          address registered with your gym account.
        </li>
        <li>
          Your account is immediately upgraded from trial to paid status and
          you can continue using the platform with no interruption.
        </li>
      </ul>

      <h2>No delivery delays</h2>
      <p>
        Since there are no physical goods, there is no delivery timeline,
        dispatch, tracking, or courier to wait for. Everything happens
        digitally and immediately.
      </p>

      <h2>What if licence activation fails</h2>
      <p>
        If your licence does not activate within 5 minutes of a successful
        payment, please email{" "}
        <a href="mailto:palastrasupport@gmail.com">
          palastrasupport@gmail.com
        </a>{" "}
        with your Razorpay payment ID. We will resolve it within 1 business
        day, and if we cannot, we will issue a full refund as described in our
        Refund & Cancellation Policy.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about delivery or your licence? Email{" "}
        <a href="mailto:palastrasupport@gmail.com">
          palastrasupport@gmail.com
        </a>
        .
      </p>
    </LegalLayout>
  );
}
