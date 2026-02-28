import { PageShell } from "@/components/page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | YourDoc",
  description: "How YourDoc protects your health data, respects your privacy, and complies with Indian data protection laws.",
};

export default function PrivacyPage() {
  return (
    <PageShell
      title="Privacy Policy"
      description="Last updated: February 2026. This policy explains how we collect, use, protect, and share your personal and health data."
    >
      <div className="prose prose-stone max-w-none text-sm leading-relaxed md:text-base [&_h2]:font-serif [&_h2]:text-xl [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-stone-600 [&_li]:text-stone-600">
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <strong>🛡️ Your data, your control.</strong> YourDoc is built with privacy-by-design principles. We minimize data collection, encrypt all health records, and never sell your personal information. You can export or delete your data at any time.
        </div>

        <h2>1. Who We Are</h2>
        <p>YourDoc Health Technologies Private Limited (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is the data fiduciary responsible for processing your personal data under the Digital Personal Data Protection Act, 2023 (&ldquo;DPDPA&rdquo;). This Privacy Policy applies to all users of the YourDoc platform (&ldquo;Platform&rdquo;).</p>

        <h2>2. Data We Collect</h2>
        <h3>2.1 Information You Provide</h3>
        <ul>
          <li><strong>Account data:</strong> Name, email address, phone number, date of birth, gender</li>
          <li><strong>Health data:</strong> Symptoms described in triage, medical history, uploaded health records, lab reports, prescriptions</li>
          <li><strong>Consultation data:</strong> Messages exchanged with doctors, consultation notes, prescriptions issued</li>
          <li><strong>Payment data:</strong> Billing address and payment method details (processed securely by Stripe; we do not store card numbers)</li>
        </ul>

        <h3>2.2 Information Collected Automatically</h3>
        <ul>
          <li><strong>Usage data:</strong> Pages visited, features used, time stamps, session duration</li>
          <li><strong>Device data:</strong> Browser type, operating system, IP address, device identifiers</li>
          <li><strong>Wearable data:</strong> If you connect a wearable device, we may receive heart rate, activity, sleep, and related biometric data</li>
        </ul>

        <h2>3. How We Use Your Data</h2>
        <p>We process your data for the following purposes:</p>
        <ul>
          <li><strong>Service delivery:</strong> Providing AI triage, doctor consultations, health record management, and billing</li>
          <li><strong>Clinical safety:</strong> Identifying red-flag symptoms, triggering escalation protocols, and audit logging for quality assurance</li>
          <li><strong>Improvement:</strong> Enhancing AI accuracy, platform reliability, and user experience (using de-identified and aggregated data only)</li>
          <li><strong>Communication:</strong> Sending appointment reminders, health follow-ups, subscription notifications, and critical safety alerts</li>
          <li><strong>Legal compliance:</strong> Meeting obligations under applicable Indian law, including DPDPA, IT Act, and telemedicine regulations</li>
        </ul>

        <h2>4. Legal Basis for Processing</h2>
        <p>Under the DPDPA 2023, we process your data based on:</p>
        <ul>
          <li><strong>Consent:</strong> You provide explicit consent when creating an account and using health features</li>
          <li><strong>Contractual necessity:</strong> Processing needed to deliver the services you have requested</li>
          <li><strong>Legitimate uses:</strong> As permitted under Section 7 of the DPDPA for healthcare purposes and medical emergencies</li>
          <li><strong>Legal obligation:</strong> Where required by Indian law, court order, or regulatory authority</li>
        </ul>

        <h2>5. Data Sharing</h2>
        <p>We do not sell your personal data. We share data only in these circumstances:</p>
        <ul>
          <li><strong>Consulting doctors:</strong> Your health data is shared with assigned doctors for teleconsultation purposes</li>
          <li><strong>Service providers:</strong> Stripe (payments), Supabase (database), and cloud infrastructure providers operating under strict data processing agreements</li>
          <li><strong>AI processing:</strong> Symptom text may be sent to AI providers in de-identified form (names, dates, and identifiers removed) for triage analysis</li>
          <li><strong>Legal requirements:</strong> When required by Indian law enforcement, court order, or regulatory authority</li>
          <li><strong>Emergency situations:</strong> When necessary to protect the vital interests of a data principal</li>
        </ul>

        <h2>6. Data Security</h2>
        <ul>
          <li>All data is encrypted in transit (TLS 1.2+) and at rest (AES-256)</li>
          <li>Row-Level Security (RLS) ensures users can only access their own records</li>
          <li>CSRF protection on all mutating API endpoints</li>
          <li>PHI de-identification before any external AI processing</li>
          <li>Audit logging for all access to sensitive health data</li>
          <li>Role-based access control (patient, doctor, admin) with principle of least privilege</li>
          <li>Regular security reviews and vulnerability assessments</li>
        </ul>

        <h2>7. Data Retention</h2>
        <ul>
          <li><strong>Account data:</strong> Retained while your account is active, plus 30 days after deletion request</li>
          <li><strong>Health records:</strong> Retained for 3 years after last consultation, as required by Indian medical record-keeping guidelines</li>
          <li><strong>Consultation records:</strong> Retained for 3 years per Telemedicine Practice Guidelines</li>
          <li><strong>Billing data:</strong> Retained for 8 years per Indian tax and accounting regulations</li>
          <li><strong>Audit logs:</strong> Retained for 5 years for compliance and safety investigations</li>
          <li><strong>De-identified analytics:</strong> May be retained indefinitely for research and improvement</li>
        </ul>

        <h2>8. Your Rights</h2>
        <p>Under the DPDPA 2023, you have the right to:</p>
        <ul>
          <li><strong>Access:</strong> Request a summary of your personal data and how it is processed</li>
          <li><strong>Correction:</strong> Request correction of inaccurate or incomplete personal data</li>
          <li><strong>Erasure:</strong> Request deletion of your personal data (subject to legal retention requirements)</li>
          <li><strong>Grievance redressal:</strong> Lodge a complaint with our Data Protection Officer or the Data Protection Board of India</li>
          <li><strong>Nomination:</strong> Nominate another individual to exercise your rights in case of your death or incapacity</li>
          <li><strong>Data portability:</strong> Export your health records in standard formats (CSV, FHIR) at any time</li>
        </ul>

        <h2>9. Children&rsquo;s Data</h2>
        <p>The Platform is not intended for use by individuals under 18 without verifiable parental consent. We process children&rsquo;s data in accordance with Section 9 of the DPDPA. We do not engage in tracking or behavioural monitoring of children and do not serve targeted advertising to any users.</p>

        <h2>10. Cross-Border Data Transfers</h2>
        <p>Your data is primarily stored in India (Asia Pacific — Mumbai region). If any data is processed outside India, it is transferred only to countries or entities permitted under the DPDPA and applicable government notifications, with appropriate safeguards in place.</p>

        <h2>11. Cookies and Analytics</h2>
        <p>We use essential cookies for authentication and session management. We may use analytics tools (PostHog) to understand Platform usage in aggregate. We do not use third-party advertising cookies or trackers. You can manage cookie preferences through your browser settings.</p>

        <h2>12. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. Material changes will be communicated via email or in-app notification at least 14 days before they take effect. The &ldquo;Last updated&rdquo; date at the top of this page indicates when the policy was last revised.</p>

        <h2>13. Contact and Grievance Officer</h2>
        <p>For questions, data requests, or complaints:</p>
        <ul>
          <li><strong>Data Protection Officer:</strong> [Name] — dpo@yourdoc.com</li>
          <li><strong>Grievance Officer:</strong> [Name] — grievance@yourdoc.com</li>
          <li><strong>Address:</strong> [Company registered address]</li>
          <li><strong>Response time:</strong> We will acknowledge your request within 48 hours and resolve it within 30 days</li>
        </ul>

        <div className="mt-10 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <strong>📋 Counsel Review Required:</strong> This privacy policy is a comprehensive template aligned with the DPDPA 2023, IT Act 2000, and Telemedicine Practice Guidelines 2020. It must be reviewed and approved by qualified Indian legal counsel specializing in data protection and health-tech before going live.
        </div>
      </div>
    </PageShell>
  );
}
