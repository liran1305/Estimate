import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Disclaimer() {
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
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <h1 className="text-4xl font-bold text-gray-900 mb-0">Disclaimer</h1>
          </div>
          <p className="text-gray-500 mb-8"><strong>Estimate — Important Information</strong></p>
          <p className="text-sm text-gray-400 mb-12"><em>Last Updated: January 2025</em></p>

          <Card className="p-6 bg-amber-50 border-amber-200 mb-8">
            <p className="text-gray-800 font-medium mb-2">
              Please read this disclaimer carefully before using the Estimate platform.
            </p>
            <p className="text-gray-700 text-sm">
              By using our Service, you acknowledge and agree to the terms outlined below.
            </p>
          </Card>

          <hr className="my-8" />

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. Nature of the Service</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Estimate is a peer review platform that provides <strong>subjective opinions</strong> from colleagues about your professional soft skills. The scores and feedback you receive represent:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Individual perceptions and opinions, not objective facts</li>
            <li>Aggregated feedback from a limited sample of colleagues</li>
            <li>Assessments of soft skills (communication, teamwork, etc.), not technical competence</li>
            <li>A snapshot in time, not a comprehensive career evaluation</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. No Professional Advice</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Estimate does NOT provide:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Career counseling or professional advice</li>
            <li>Employment recommendations or guarantees</li>
            <li>Psychological or mental health assessments</li>
            <li>Legal, financial, or HR consulting</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you need professional guidance, consult a qualified career counselor, therapist, or HR professional.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. No Guarantee of Accuracy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We do not verify, endorse, or guarantee the accuracy of any reviews. Reviews may be:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Based on limited interactions or outdated experiences</li>
            <li>Influenced by personal biases or misunderstandings</li>
            <li>Incomplete or lacking full context</li>
            <li>Subject to human error or misinterpretation</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Your score is not a definitive measure of your professional worth.</strong>
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. No Employment Guarantees</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Using Estimate and sharing your score with recruiters does NOT guarantee:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Job interviews or offers</li>
            <li>Career advancement or promotions</li>
            <li>Salary increases or bonuses</li>
            <li>Positive hiring decisions</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            Employers make hiring decisions based on many factors beyond peer reviews. We are not responsible for any employment outcomes.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. Emotional Impact</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Receiving feedback, even anonymous feedback, can be emotionally challenging. You may receive:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Criticism or lower scores than expected</li>
            <li>Feedback that conflicts with your self-perception</li>
            <li>Reviews that feel unfair or inaccurate</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Use Estimate at your own discretion.</strong> If you find the feedback distressing, consider:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Taking a break from the platform</li>
            <li>Discussing feedback with a trusted mentor or therapist</li>
            <li>Remembering that scores reflect opinions, not your inherent value</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">6. Anonymity Limitations</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            While we implement strong technical measures to protect reviewer anonymity:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>No system is 100% foolproof</li>
            <li>Users may attempt to infer reviewer identities based on context</li>
            <li>Small sample sizes (e.g., only 3 reviewers) may make identification easier</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Do not attempt to identify reviewers.</strong> Doing so violates our Terms of Service and undermines the platform's integrity.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">7. Third-Party Services</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Estimate integrates with third-party services, including:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>LinkedIn</strong>: For authentication and profile data</li>
            <li><strong>Cloud Providers</strong>: For hosting and data storage</li>
            <li><strong>Email Services</strong>: For notifications</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            We are not responsible for the actions, policies, or security of these third parties. Review their terms and privacy policies independently.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">8. Data Security</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            While we implement industry-standard security measures:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>No online service is completely immune to breaches</li>
            <li>We cannot guarantee absolute security of your data</li>
            <li>You use the Service at your own risk</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            In the event of a data breach, we will notify affected users as required by law.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">9. Recruiter Use of Scores</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you share your score with recruiters:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>We cannot control how recruiters interpret or use your score</li>
            <li>Recruiters may weigh scores differently in hiring decisions</li>
            <li>Some recruiters may not value peer reviews at all</li>
            <li>We are not responsible for recruiter actions or decisions</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">10. Platform Availability</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We strive for 24/7 availability, but:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>The Service may experience downtime for maintenance or technical issues</li>
            <li>Features may change or be discontinued without notice</li>
            <li>We reserve the right to modify or terminate the Service at any time</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">11. Geographic Limitations</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Estimate may not be available in all countries or jurisdictions. We comply with applicable laws, but:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Local laws may restrict or prohibit use of the Service</li>
            <li>You are responsible for ensuring your use complies with local regulations</li>
            <li>We may block access from certain regions if required by law</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">12. Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed mb-4 uppercase font-semibold">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Estimate Ltd. is not liable for any damages arising from use of the Service</li>
            <li>This includes emotional distress, lost opportunities, or career setbacks</li>
            <li>We are not liable for actions taken by users based on reviews or scores</li>
            <li>Our total liability is limited as specified in our Terms of Service</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">13. User Responsibility</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            By using Estimate, you acknowledge that:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>You use the Service voluntarily and at your own risk</li>
            <li>You are responsible for how you interpret and act on feedback</li>
            <li>You will not hold Estimate liable for review content or outcomes</li>
            <li>You understand the limitations and subjective nature of peer reviews</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">14. GDPR Compliance</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We are committed to GDPR compliance and protecting your data rights. However:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Anonymized reviews may be retained even after account deletion to maintain platform integrity</li>
            <li>Some data may be retained for legal compliance or fraud prevention</li>
            <li>Data portability may be limited for anonymized review data</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            See our <Link to={createPageUrl("PrivacyPolicy")} className="text-[#0A66C2] hover:underline">Privacy Policy</Link> for full details on your rights.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">15. Changes to This Disclaimer</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may update this Disclaimer at any time. Material changes will be communicated via email or in-app notification. Continued use constitutes acceptance of changes.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">16. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have questions about this Disclaimer:
          </p>
          <p className="text-gray-700 leading-relaxed mb-2"><strong>Estimate Ltd.</strong></p>
          <p className="text-gray-700 leading-relaxed mb-2">Email: legal@estimatenow.io</p>
          <p className="text-gray-700 leading-relaxed mb-8">Website: https://estimatenow.io</p>

          <hr className="my-8" />

          <Card className="p-6 bg-blue-50 border-blue-200 mt-8">
            <p className="text-gray-800 font-semibold mb-2">
              ✓ By using Estimate, you acknowledge that you have read and understood this Disclaimer.
            </p>
            <p className="text-gray-700 text-sm">
              If you do not agree with any part of this Disclaimer, please discontinue use of the Service immediately.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
