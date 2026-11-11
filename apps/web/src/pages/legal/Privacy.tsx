import LegalLayout from "../../components/LegalLayout.js";

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" updated="11 November 2026">
      <p><strong>1. Data Collected</strong><br/>
      We collect account info (name, email, phone), billing info (Razorpay IDs), member info you enter (names, payments), and technical info (IP, logs).</p>
      
      <p><strong>2. Processing Purposes</strong><br/>
      We process data for account management, payment processing, customer support, fraud prevention, and legal compliance. We do not use member data for marketing.</p>
      
      <p><strong>3. Third-Party Processors</strong><br/>
      We share necessary data with MongoDB Atlas (Database), Razorpay (Payments), Brevo/Resend (Emails), Render (Backend), and Cloudflare (Frontend). We do not sell your data.</p>
      
      <p><strong>4. Data Rights</strong><br/>
      You may have the right to access, correct, or delete your data. Gym members must contact their gym for member data requests. Contact us at palastrasupport@gmail.com for account data.</p>
      
      <p><strong>5. Minors</strong><br/>
      Gym owners must obtain verifiable parental consent before entering information about minors (under 18) into the platform.</p>
      
      <p><strong>6. Retention</strong><br/>
      Active accounts are retained as long as active. Terminated accounts are retained for 30 days for export, then deleted. Payment records are retained for 8 years for Indian tax compliance.</p>
      
      <p><strong>7. Security</strong><br/>
      We use bcrypt hashing, HTTPS/TLS, and strict tenant isolation. In case of a breach, we will investigate and notify affected parties as required by law.</p>
      
      <p><strong>8. Grievance Officer</strong><br/>
      Name: Akshay Kocharekar<br/>
      Email: palastrasupport@gmail.com<br/>
      Response Time: Within 30 days.</p>
    </LegalLayout>
  );
}
