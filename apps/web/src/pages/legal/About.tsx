import LegalLayout from "../../components/LegalLayout.js";

export default function About() {
  return (
    <LegalLayout title="About Palastra" updated="11 November 2026">
      <p><strong>PALASTRA</strong> is gym management software built for independent gyms and fitness studios in India.</p>
      
      <p><strong>What it does</strong><br/>
      Member management, expiry tracking, payment recording, trainer/session tracking, WhatsApp templates, and business insights. It features multi-tenant architecture with strict data isolation.</p>
      
      <p><strong>What it is not</strong><br/>
      Not a member-facing app. Not a payment gateway. Not a biometric system. Not enterprise chain software.</p>
      
      <p><strong>Licence vs. Ownership</strong><br/>
      Purchasing a licence gives you a perpetual right to use the software. It does not transfer ownership of the source code or intellectual property.</p>
    </LegalLayout>
  );
}
