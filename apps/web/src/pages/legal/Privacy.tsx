import LegalLayout from "../../components/LegalLayout.js";

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" updated="9 November 2026">
      <p>
        This Privacy Policy explains how Palastra ("we", "us", "our"),
        operated by Akshay Kocharekar as a sole proprietor in India, collects,
        uses, and protects your personal data. This policy is compliant with
        the Digital Personal Data Protection Act, 2023 (DPDP Act) of Margao, Goa, India.
      </p>

      <h2>1. Data we collect</h2>
      <p>When you register a gym on Palastra, we collect:</p>
      <ul>
        <li>
          <strong>Account data:</strong> gym name, owner name, email address,
          phone number, gym address, password (hashed)
        </li>
        <li>
          <strong>Billing data:</strong> payment records via Razorpay (order ID,
          payment ID, amount, date). We never store card numbers or UPI IDs.
        </li>
        <li>
          <strong>Member data you enter:</strong> names, phone numbers, email
          addresses, membership plans, payment records, and notes about your
          members (data you control)
        </li>
        <li>
          <strong>Usage data:</strong> IP address, browser type, login
          timestamps, actions taken in the platform (for security and
          debugging)
        </li>
      </ul>

      <h2>2. Purpose of processing</h2>
      <p>We use your data only for:</p>
      <ul>
        <li>Creating and managing your Palastra account</li>
        <li>Processing licence payments through Razorpay</li>
        <li>Providing the gym management software features</li>
        <li>Sending activation codes, receipts, and service notifications</li>
        <li>Responding to support requests</li>
        <li>Detecting and preventing fraud, abuse, or security threats</li>
        <li>Complying with legal obligations</li>
      </ul>

      <h2>3. Legal basis for processing</h2>
      <p>
        We process your personal data based on your <strong>consent</strong>{" "}
        (which you provide when registering) and our <strong>legitimate
        interest</strong> in operating and securing the service. For payments,
        processing is necessary for the performance of our contract with you.
      </p>

      <h2>4. Third-party data processors</h2>
      <p>
        We share minimal data with the following trusted service providers who
        act as data processors on our behalf:
      </p>
      <ul>
        <li>
          <strong>MongoDB Atlas (database):</strong> Stores all account and
          member data on encrypted servers. Data is hosted in Mumbai, Margao, Goa, India.
        </li>
        <li>
          <strong>Razorpay (payments):</strong> Processes licence payments.
          Razorpay is PCI-DSS compliant and handles all card/UPI data.
        </li>
        <li>
          <strong>Brevo (email delivery):</strong> Sends activation codes and
          transactional emails.
        </li>
        <li>
          <strong>Render (hosting):</strong> Hosts the Palastra API server.
        </li>
        <li>
          <strong>Cloudflare (hosting):</strong> Serves the Palastra web
          application.
        </li>
      </ul>
      <p>
        We do not sell your data to any third party. We do not share your data
        for marketing purposes.
      </p>

      <h2>5. Your rights as a Data Principal (DPDP Act)</h2>
      <p>Under the DPDP Act, you have the right to:</p>
      <ul>
        <li>
          <strong>Access:</strong> Request a copy of the personal data we hold
          about you
        </li>
        <li>
          <strong>Correction:</strong> Request correction of inaccurate or
          incomplete data
        </li>
        <li>
          <strong>Erasure:</strong> Request deletion of your personal data
          (subject to legal retention requirements)
        </li>
        <li>
          <strong>Withdraw consent:</strong> Withdraw your consent to
          processing at any time. Withdrawing consent may mean we can no longer
          provide you with Palastra services.
        </li>
        <li>
          <strong>Grievance redressal:</strong> File a complaint about our data
          handling
        </li>
        <li>
          <strong>Nominate:</strong> Nominate another person to exercise your
          rights in case of death or incapacity
        </li>
      </ul>
      <p>
        To exercise any of these rights, email{" "}
        <a href="mailto:palastrasupport@gmail.com">
          palastrasupport@gmail.com
        </a>
        . We will respond within 30 days.
      </p>

      <h2>6. Member data you control</h2>
      <p>
        Data about your gym members (names, phones, payments, etc.) is entered
        by you. You are the data controller for that data; we are only a data
        processor. You must obtain your members' consent before entering their
        data into Palastra. We do not use your members' data for any purpose
        other than providing the service to you.
      </p>

      <h2>7. Data retention</h2>
      <p>
        We retain your account data for as long as your account is active. If
        you cancel your account or your account is terminated:
      </p>
      <ul>
        <li>
          We retain your data for <strong>30 days</strong> to allow you to
          export it
        </li>
        <li>
          After 30 days, we securely delete your account data and all member
          data you entered
        </li>
        <li>
          Payment records (licence transactions) are retained for 8 years as
          required by Indian tax law
        </li>
      </ul>

      <h2>8. Data security</h2>
      <p>
        We use industry-standard security measures, including password
        hashing (bcrypt), encrypted connections (HTTPS/TLS), strict tenant
        isolation (no gym can access another gym's data), and limited employee
        access. However, no system is 100% secure, and you accept this risk when
        using any online service.
      </p>

      <h2>9. Cookies and tracking</h2>
      <p>
        Palastra uses only essential cookies for authentication and session
        management. We do not use tracking cookies, advertising cookies, or
        third-party analytics scripts. We do not track you across other
        websites.
      </p>

      <h2>10. Children</h2>
      <p>
        Palastra is not intended for use by anyone under 18 years of age. We do
        not knowingly collect data from children.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes
        will be notified via email or in-app. Continued use of Palastra after
        changes means you accept the updated policy.
      </p>

      <h2>12. Grievance Officer</h2>
      <p>In accordance with the DPDP Act, our Grievance Officer is:</p>
      <ul>
        <li>
          <strong>Name:</strong> Akshay Kocharekar
        </li>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:palastrasupport@gmail.com">
            palastrasupport@gmail.com
          </a>
        </li>
        <li>
          <strong>Response time:</strong> Within 30 days of receiving your
          grievance
        </li>
      </ul>
      <p>
        If your grievance is not resolved, you may escalate to the Data
        Protection Board of Margao, Goa, India.
      </p>
    </LegalLayout>
  );
}
