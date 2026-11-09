import LegalLayout from "../../components/LegalLayout.js";

export default function Contact() {
  return (
    <LegalLayout title="Contact Us" updated="9 November 2026">
      <h2>Business details</h2>
      <ul>
        <li>
          <strong>Legal name:</strong> Akshay Kocharekar (Sole Proprietor)
        </li>
        <li>
          <strong>Trading as:</strong> Palastra
        </li>
        <li>
          <strong>Country of operation:</strong> India
        </li>
        <li>
          <strong>Business type:</strong> Software as a Service (SaaS) — digital
          product
        </li>
      </ul>

      <h2>Support and enquiries</h2>
      <p>
        For any questions about Palastra — technical support, billing,
        refunds, or general enquiries — please contact:
      </p>
      <ul>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:palastrasupport@gmail.com">
            palastrasupport@gmail.com
          </a>
        </li>
        <li>
          <strong>Response time:</strong> Within 1-2 business days
        </li>
      </ul>

      <h2>Grievance Officer (DPDP Act)</h2>
      <p>
        As required under the Digital Personal Data Protection Act, 2023, our
        Grievance Officer is:
      </p>
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

      <h2>What to include in your email</h2>
      <p>
        To help us resolve your issue quickly, please include:
      </p>
      <ul>
        <li>Your gym name and registered email</li>
        <li>A clear description of the issue</li>
        <li>Screenshots if applicable</li>
        <li>Payment ID (if the issue is related to billing)</li>
      </ul>

      <h2>Where we operate</h2>
      <p>
        Palastra is based in <strong>Margao, Goa, India</strong>, and we serve
        gyms across Goa, Mumbai, Bangalore, and the rest of India. All
        communication is remote — we don't require in-person meetings, so
        distance doesn't matter.
      </p>

      <h2>Preferred communication</h2>
      <p>
        We communicate primarily by email. For urgent matters, WhatsApp us at
        the number registered with your gym account.
      </p>
    </LegalLayout>
  );
}
