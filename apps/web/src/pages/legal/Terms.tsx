import LegalLayout from "../../components/LegalLayout.js";

export default function Terms() {
  return (
    <LegalLayout title="Terms of Service" updated="9 November 2026">
      <p>
        These Terms of Service ("Terms") govern your use of Palastra, a gym
        management software provided by Akshay Kocharekar, an individual sole
        proprietor based in Margao, Goa, India ("Palastra", "we", "us", "our").
      </p>
      <p>
        By registering for a Palastra account, accessing the platform, or using
        any Palastra service, you agree to be bound by these Terms. If you do
        not agree, please do not use Palastra.
      </p>

      <h2>1. Who can use Palastra</h2>
      <p>
        You must be at least 18 years of age and legally capable of entering
        into binding contracts to use Palastra. By registering, you represent
        that you own or manage a gym or fitness business and are authorised to
        act on its behalf.
      </p>

      <h2>2. Your account</h2>
      <ul>
        <li>
          You are responsible for keeping your login credentials confidential.
        </li>
        <li>
          You must notify us immediately if you suspect any unauthorised access
          to your account.
        </li>
        <li>
          You are responsible for all activity that occurs under your account,
          including activity by your staff.
        </li>
        <li>
          We may suspend or terminate accounts that violate these Terms or that
          we reasonably believe are fraudulent.
        </li>
      </ul>

      <h2>3. Account approval and activation</h2>
      <p>
        All new gym registrations are reviewed before activation. We may reject
        a registration for any reason at our discretion. Once approved, you
        receive an activation code which must be entered to begin your 30-day
        free trial.
      </p>

      <h2>4. Free trial</h2>
      <p>
        New accounts are eligible for a one-time 30-day free trial beginning
        the day you activate your account. After the trial ends, you must
        purchase a licence to continue using Palastra. Your data is preserved
        if your trial expires, but access is restricted until payment is made.
      </p>

      <h2>5. Licence and payments</h2>
      <p>
        Palastra is licensed on a one-time payment basis. Current pricing:
      </p>
      <ul>
        <li>₹1,999 one-time licence (includes 12 months of maintenance)</li>
        <li>₹499/year maintenance from year 2 onwards (optional)</li>
      </ul>
      <p>
        All payments are processed through Razorpay, our third-party payment
        processor. We do not store your card or bank details. Prices are in
        Indian Rupees (INR) and inclusive of applicable taxes.
      </p>
      <p>
        We reserve the right to change pricing for new purchases at any time,
        but existing licences are honoured at the price you paid.
      </p>

      <h2>6. Member limit</h2>
      <p>
        Each gym licence covers up to 500 active members under our fair-use
        policy. If you need to manage more than 500 members, please contact us
        to discuss an upgrade.
      </p>

      <h2>7. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use Palastra for any illegal purpose.</li>
        <li>
          Reverse engineer, decompile, or attempt to extract source code from
          the Palastra software.
        </li>
        <li>
          Resell, sublicense, or share your Palastra account with another gym
          or business.
        </li>
        <li>
          Use the platform to send unsolicited messages or spam to your members.
        </li>
        <li>
          Interfere with the security or integrity of the platform or other
          users' data.
        </li>
      </ul>

      <h2>8. Your data and content</h2>
      <p>
        You own all data you enter into Palastra (member records, payments,
        notes, etc.). We are a data processor acting on your instructions. You
        are the data controller for your members' personal information under
        India's DPDP Act.
      </p>
      <p>
        You must obtain your members' consent before entering their personal
        data into Palastra, and you are responsible for complying with all
        applicable privacy laws.
      </p>

      <h2>9. Service availability</h2>
      <p>
        We aim to keep Palastra available at all times, but we do not guarantee
        uninterrupted service. We may perform maintenance, push updates, or
        experience outages due to infrastructure issues. Scheduled maintenance
        will be announced in advance where possible.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Palastra and Akshay Kocharekar
        are not liable for any indirect, incidental, special, or consequential
        damages arising from your use of the platform, including lost revenue,
        lost data, or business interruption.
      </p>
      <p>
        Our total liability for any claim related to Palastra is limited to the
        amount you paid us in the 12 months preceding the claim.
      </p>

      <h2>11. Termination</h2>
      <p>
        You may stop using Palastra at any time. We may suspend or terminate
        your account if you violate these Terms. Upon termination, you may
        request an export of your data for up to 30 days after termination,
        after which we may delete it.
      </p>

      <h2>12. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be
        notified via email or in-app. Continued use of Palastra after changes
        means you accept the updated Terms.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These Terms are governed by the laws of Margao, Goa, India. Any disputes will be
        subject to the exclusive jurisdiction of the courts of Mumbai,
        Maharashtra.
      </p>

      <h2>14. Contact</h2>
      <p>
        For questions about these Terms, contact us at{" "}
        <a href="mailto:palastrasupport@gmail.com">
          palastrasupport@gmail.com
        </a>
        .
      </p>
    </LegalLayout>
  );
}
