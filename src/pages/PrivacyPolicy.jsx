import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to={createPageUrl("Landing")}>
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8"><strong>Estimate — Anonymous Peer Review Platform</strong></p>
          <p className="text-sm text-gray-400 mb-12"><em>Last Updated: January 2025</em></p>

          <hr className="my-8" />

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. Introduction</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Estimate Ltd. ("we," "us," "our") operates the Estimate platform at estimatenow.io. We are committed to protecting your privacy and complying with applicable data protection laws, including the General Data Protection Regulation (GDPR) and Israeli Privacy Protection Law.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our Service.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. Data Controller</h2>
          <p className="text-gray-700 leading-relaxed mb-2"><strong>Estimate Ltd.</strong></p>
          <p className="text-gray-700 leading-relaxed mb-2">Email: privacy@estimatenow.io</p>
          <p className="text-gray-700 leading-relaxed mb-4">Website: https://estimatenow.io</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Information We Collect</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3.1 Information from LinkedIn</h3>
          <p className="text-gray-700 leading-relaxed mb-4">When you sign up via LinkedIn OAuth, we collect:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Profile Information</strong>: Name, profile photo, headline, job title, company, location</li>
            <li><strong>Email Address</strong>: Your primary LinkedIn email</li>
            <li><strong>LinkedIn ID</strong>: Unique identifier for authentication</li>
            <li><strong>Work History</strong>: Past positions and companies (to identify colleagues)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3.2 Review Data</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Reviews You Submit</strong>: Ratings and feedback about colleagues (stored anonymously)</li>
            <li><strong>Reviews You Receive</strong>: Aggregated scores and feedback from peers</li>
            <li><strong>Interaction Type</strong>: How you worked with reviewed colleagues (direct collaboration, departmental, general)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3.3 Usage Data</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Activity Logs</strong>: Login times, pages visited, features used</li>
            <li><strong>Device Information</strong>: Browser type, operating system, IP address</li>
            <li><strong>Cookies</strong>: Session cookies for authentication and functionality</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3.4 Recruiter Consent Data</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Consent Status</strong>: Whether you've opted to share your score with recruiters</li>
            <li><strong>Sharing Preferences</strong>: Which recruiters or companies can view your score</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. How We Use Your Information</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4.1 To Provide the Service</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Authenticate your account</li>
            <li>Match you with colleagues to review</li>
            <li>Calculate your professional reputation score</li>
            <li>Display your profile and scores</li>
            <li>Enable recruiter sharing (if you consent)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4.2 To Maintain Anonymity</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Separate reviewer identities from review content</li>
            <li>Aggregate scores to prevent identification</li>
            <li>Apply technical safeguards to protect anonymity</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4.3 To Improve the Service</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Analyze usage patterns to enhance features</li>
            <li>Detect and prevent fraud or abuse</li>
            <li>Troubleshoot technical issues</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4.4 To Communicate with You</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Send important service updates</li>
            <li>Notify you when you receive reviews</li>
            <li>Respond to support requests</li>
            <li>Send optional product updates (you can opt out)</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. Legal Basis for Processing (GDPR)</h2>
          <p className="text-gray-700 leading-relaxed mb-4">We process your data under the following legal bases:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Contractual Necessity</strong>: To provide the Service you signed up for</li>
            <li><strong>Consent</strong>: For recruiter sharing and optional communications</li>
            <li><strong>Legitimate Interests</strong>: To improve the Service, prevent fraud, and ensure security</li>
            <li><strong>Legal Obligation</strong>: To comply with applicable laws</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">6. How We Protect Anonymity</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6.1 Technical Measures</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Data Separation</strong>: Reviewer identities stored separately from review content</li>
            <li><strong>One-Way Hashing</strong>: Reviewer-review links use cryptographic hashes</li>
            <li><strong>Minimum Threshold</strong>: Scores displayed only after 3+ reviews to prevent identification</li>
            <li><strong>Aggregation</strong>: Individual reviews never shown, only aggregated scores</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6.2 Access Controls</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Strict internal access policies</li>
            <li>Audit logs for all data access</li>
            <li>Employees cannot view individual review-reviewer mappings</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">7. Data Sharing and Disclosure</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">7.1 With Your Consent</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Recruiters</strong>: If you opt in, verified recruiters can view your aggregated score</li>
            <li><strong>You Control</strong>: You can revoke recruiter access at any time</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">7.2 Service Providers</h3>
          <p className="text-gray-700 leading-relaxed mb-4">We share data with trusted third parties who help us operate the Service:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Cloud Hosting</strong>: AWS, Google Cloud, or similar (data storage and processing)</li>
            <li><strong>Authentication</strong>: LinkedIn OAuth</li>
            <li><strong>Email Services</strong>: For transactional emails</li>
            <li><strong>Analytics</strong>: Anonymized usage analytics</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            All service providers are contractually bound to protect your data and use it only for specified purposes.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">7.3 Legal Requirements</h3>
          <p className="text-gray-700 leading-relaxed mb-4">We may disclose data if required by law or to:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Comply with legal process (court orders, subpoenas)</li>
            <li>Protect our rights or property</li>
            <li>Prevent fraud or illegal activity</li>
            <li>Protect user safety</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">7.4 Business Transfers</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            If we are acquired or merge with another company, your data may be transferred. We will notify you and ensure the new entity honors this Privacy Policy.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">8. Data Retention</h2>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Active Accounts</strong>: We retain your data as long as your account is active</li>
            <li><strong>Deleted Accounts</strong>: Profile data deleted within 30 days; anonymized reviews retained for platform integrity</li>
            <li><strong>Legal Holds</strong>: Data may be retained longer if required by law</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">9. Your Rights (GDPR)</h2>
          <p className="text-gray-700 leading-relaxed mb-4">Under GDPR, you have the following rights:</p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9.1 Right to Access</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Request a copy of your personal data we hold.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9.2 Right to Rectification</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Correct inaccurate or incomplete data.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9.3 Right to Erasure ("Right to be Forgotten")</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Request deletion of your personal data. Note: Anonymized reviews may be retained for platform integrity.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9.4 Right to Restrict Processing</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Limit how we use your data in certain circumstances.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9.5 Right to Data Portability</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Receive your data in a structured, machine-readable format.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9.6 Right to Object</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Object to processing based on legitimate interests or for marketing purposes.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9.7 Right to Withdraw Consent</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Withdraw consent for recruiter sharing or optional communications at any time.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9.8 Right to Lodge a Complaint</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            File a complaint with your local data protection authority if you believe we've violated your rights.
          </p>

          <p className="text-gray-700 leading-relaxed mb-4 font-semibold">
            To exercise any of these rights, contact us at privacy@estimatenow.io.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">10. International Data Transfers</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Your data may be transferred to and processed in countries outside the European Economic Area (EEA) or Israel. We ensure adequate protection through:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
            <li>Adequacy decisions for certain countries</li>
            <li>Other lawful transfer mechanisms</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">11. Cookies and Tracking</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">11.1 Essential Cookies</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use session cookies to keep you logged in and ensure the Service functions properly. These are necessary for the Service to work.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">11.2 Analytics Cookies</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may use anonymized analytics to understand how users interact with the Service. You can opt out via browser settings.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">11.3 Third-Party Cookies</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            LinkedIn may set cookies during OAuth authentication. Refer to LinkedIn's privacy policy for details.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">12. Security Measures</h2>
          <p className="text-gray-700 leading-relaxed mb-4">We implement industry-standard security measures:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Encryption</strong>: Data encrypted in transit (TLS/SSL) and at rest</li>
            <li><strong>Access Controls</strong>: Role-based access with least privilege principle</li>
            <li><strong>Regular Audits</strong>: Security assessments and penetration testing</li>
            <li><strong>Incident Response</strong>: Procedures for detecting and responding to breaches</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            However, no system is 100% secure. We cannot guarantee absolute security.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">13. Children's Privacy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Estimate is not intended for users under 18. We do not knowingly collect data from children. If we discover we've collected data from a child, we will delete it promptly.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">14. Changes to This Policy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may update this Privacy Policy from time to time. We will notify you of material changes via email or in-app notification. Continued use after changes constitutes acceptance.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">15. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            For privacy-related questions, data requests, or to exercise your rights:
          </p>
          <p className="text-gray-700 leading-relaxed mb-2"><strong>Estimate Ltd.</strong></p>
          <p className="text-gray-700 leading-relaxed mb-2">Email: privacy@estimatenow.io</p>
          <p className="text-gray-700 leading-relaxed mb-2">Data Protection Officer: dpo@estimatenow.io</p>
          <p className="text-gray-700 leading-relaxed mb-8">Website: https://estimatenow.io</p>

          <hr className="my-8" />

          <p className="text-center text-gray-500 italic mt-8">
            By using Estimate, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
