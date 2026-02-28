import { PageShell } from "@/components/page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | YourDoc",
  description: "Terms of Service for YourDoc telemedicine platform. Please read carefully before using our services.",
};

export default function TermsPage() {
  return (
    <PageShell
      title="Terms of Service"
      description="Last updated: February 2026. Please read these terms carefully before using YourDoc."
    >
      <div className="prose prose-stone max-w-none text-sm leading-relaxed md:text-base [&_h2]:font-serif [&_h2]:text-xl [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-stone-600 [&_li]:text-stone-600">
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>⚠️ Medical Disclaimer:</strong> YourDoc is a telemedicine platform that provides AI-assisted health guidance and doctor consultations. YourDoc does <strong>not</strong> replace in-person medical care, emergency services, or licensed physician judgment. Always call emergency services (112) for life-threatening situations.
        </div>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using YourDoc (&ldquo;Platform&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, do not use the Platform. These Terms constitute a legally binding agreement between you and YourDoc Health Technologies Private Limited (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;).</p>

        <h2>2. Eligibility</h2>
        <p>You must be at least 18 years of age and a resident of India to use the Platform independently. Minors (under 18) may use the Platform only with verifiable parental or guardian consent. By using the Platform, you represent that you meet these eligibility requirements.</p>

        <h2>3. Nature of Services</h2>
        <h3>3.1 AI-Assisted Triage</h3>
        <p>Our AI symptom triage feature provides preliminary health guidance only. It is not a medical diagnosis, prescription, or treatment plan. AI outputs are advisory and must not be relied upon as a substitute for consultation with a licensed medical practitioner.</p>

        <h3>3.2 Doctor Teleconsultation</h3>
        <p>Teleconsultations are conducted by licensed, registered medical practitioners in accordance with the Telemedicine Practice Guidelines, 2020 issued by the Board of Governors of the Medical Council of India. Consultations are limited to conditions appropriate for remote assessment as determined by the consulting physician.</p>

        <h3>3.3 Prescription Boundaries</h3>
        <p>Prescriptions issued through the Platform comply with Schedule H, H1, and X drug regulations under the Drugs and Cosmetics Act, 1940. Our doctors will not prescribe controlled substances, habit-forming drugs, or medications requiring in-person examination via the teleconsultation channel.</p>

        <h3>3.4 Not Emergency Services</h3>
        <p>YourDoc is <strong>not</strong> an emergency medical service. If you are experiencing a medical emergency, call 112 (India national emergency) or visit your nearest hospital emergency department immediately. Do not use the Platform for emergencies.</p>

        <h2>4. User Accounts and Responsibilities</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. You must not share your account with others or allow others to access your health data through your account.</p>

        <h2>5. Health Records</h2>
        <p>You may upload, store, and manage health records on the Platform. You retain ownership of your health data at all times. We process your data solely to provide the services described herein, in accordance with applicable Indian data protection laws. You may export or delete your records at any time through your account settings.</p>

        <h2>6. Payments, Subscriptions, and Refunds</h2>
        <p>Paid features are billed in Indian Rupees (INR) inclusive of applicable GST. Subscription plans auto-renew monthly unless cancelled before the renewal date. You may cancel your subscription at any time through the billing portal. Refunds for unused subscription periods are processed within 5-7 business days at the Company&rsquo;s discretion. Individual consultation fees are non-refundable once the consultation has commenced.</p>

        <h2>7. Prohibited Conduct</h2>
        <p>You agree not to: (a) use the Platform for any unlawful purpose; (b) impersonate any person or entity; (c) submit false or misleading health information; (d) attempt to access other users&rsquo; data; (e) interfere with the Platform&rsquo;s technical infrastructure; (f) use automated systems to access the Platform without permission; (g) share consultation content or prescriptions with unauthorized third parties.</p>

        <h2>8. Intellectual Property</h2>
        <p>All content, software, algorithms, designs, and trademarks on the Platform are owned by or licensed to the Company. You may not copy, modify, distribute, or create derivative works from any Platform content without our express written permission.</p>

        <h2>9. Limitation of Liability</h2>
        <p>To the maximum extent permitted by applicable law, the Company shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the Platform. Our total aggregate liability shall not exceed the amount paid by you to the Company in the twelve (12) months preceding the claim. This limitation does not apply to claims arising from gross negligence or wilful misconduct.</p>

        <h2>10. Indemnification</h2>
        <p>You agree to indemnify and hold harmless the Company, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Platform or violation of these Terms.</p>

        <h2>11. Governing Law and Dispute Resolution</h2>
        <p>These Terms shall be governed by and construed in accordance with the laws of India. Any dispute arising from these Terms shall first be attempted to be resolved through mediation. If mediation fails, disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka, India.</p>

        <h2>12. Changes to Terms</h2>
        <p>We reserve the right to modify these Terms at any time. Material changes will be communicated via email or in-app notification at least 14 days before they take effect. Your continued use of the Platform after changes take effect constitutes acceptance of the modified Terms.</p>

        <h2>13. Termination</h2>
        <p>We may suspend or terminate your account if you violate these Terms or engage in conduct harmful to other users, doctors, or the Platform. You may terminate your account at any time by contacting support. Upon termination, your right to use the Platform ceases, but your data may be retained in accordance with our Data Retention Policy and applicable law.</p>

        <h2>14. Contact</h2>
        <p>For questions about these Terms, contact us at:</p>
        <ul>
          <li>Email: legal@yourdoc.com</li>
          <li>Address: [Company registered address]</li>
        </ul>

        <div className="mt-10 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <strong>📋 Counsel Review Required:</strong> These terms are a comprehensive template covering key India telemedicine legal requirements. They must be reviewed and approved by qualified Indian legal counsel specializing in health-tech / telemedicine before going live.
        </div>
      </div>
    </PageShell>
  );
}
