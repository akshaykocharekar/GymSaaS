import LegalLayout from "../../components/LegalLayout.js";

export default function About() {
  return (
    <LegalLayout title="About Palastra" updated="9 November 2026">
      <p>
        <strong>Palastra</strong> is gym management software built for
        independent gyms and fitness studios in Margao, Goa, India.
      </p>

      <h2>Why we built Palastra</h2>
      <p>
        Small and medium-sized gyms in India are run on notebooks, WhatsApp
        groups, and Excel spreadsheets. Every month, gym owners lose money to
        forgotten renewals, uncollected dues, and members who silently churn.
      </p>
      <p>
        Existing gym software is either too expensive (charging ₹1,000-2,000
        per month) or too complicated (built for large gym chains). Neither
        works for a neighbourhood gym run by a single owner.
      </p>
      <p>
        Palastra was built as a simple, honest alternative: a one-time
        payment, no monthly fees, and only the features that actually matter
        to a small gym.
      </p>

      <h2>What Palastra does</h2>
      <ul>
        <li>Member management with expiry tracking</li>
        <li>Payment recording (cash, UPI, other) and outstanding dues</li>
        <li>Trainer and session pack tracking for PT/class-based gyms</li>
        <li>WhatsApp reminder templates with one-tap sending</li>
        <li>Business insights: revenue, retention, ARPU, collection rate</li>
        <li>Multi-tenant security — each gym's data is completely isolated</li>
      </ul>

      <h2>What Palastra is not</h2>
      <ul>
        <li>Not a member-facing app (your members use WhatsApp, not Palastra)</li>
        <li>Not a payment gateway (you collect from members as you always have)</li>
        <li>Not a biometric attendance system (no hardware integration)</li>
        <li>Not a chain-gym enterprise software (we serve independent gyms)</li>
      </ul>

      <h2>Pricing philosophy</h2>
      <p>
        Palastra costs <strong>₹1,999 one-time</strong>, plus an optional{" "}
        <strong>₹499/year maintenance</strong> from year 2 onwards. No monthly
        fees, no per-member charges, no hidden costs. If it works for your gym,
        it works — and you own it for as long as you want to use it.
      </p>

      <h2>Who we are</h2>
      <p>
        Palastra is built and operated by Akshay Kocharekar, an independent
        developer based in Mumbai, Margao, Goa, India. It is a small, focused product made
        for gyms that want simple tools, not enterprise bloat.
      </p>

      <h2>Contact</h2>
      <p>
        To learn more, contact us at{" "}
        <a href="mailto:palastrasupport@gmail.com">
          palastrasupport@gmail.com
        </a>
        .
      </p>
    </LegalLayout>
  );
}
