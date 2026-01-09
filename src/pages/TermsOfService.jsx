import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-500 mb-8"><strong>Estimate — Anonymous Peer Review Platform</strong></p>
          <p className="text-sm text-gray-400 mb-12"><em>Last Updated: January 2025</em></p>

          <hr className="my-8" />

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. Introduction</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Welcome to Estimate ("Platform," "Service," "we," "us," or "our"), operated by Estimate Ltd. These Terms of Service ("Terms") govern your access to and use of the Estimate platform at estimatenow.io.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            By accessing or using Estimate, you agree to be bound by these Terms. If you do not agree, do not use the Service.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. Description of Service</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Estimate is an anonymous peer review platform for professionals. The Service allows users to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Receive anonymous professional feedback from colleagues</li>
            <li>Provide anonymous reviews of colleagues they have worked with</li>
            <li>Obtain a professional reputation score based on peer feedback</li>
            <li>Optionally share their score with recruiters</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">2.1 How It Works</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Users sign up via LinkedIn authentication</li>
            <li>Users are assigned colleagues to review based on shared work history</li>
            <li>Users must complete 3 reviews to unlock their own score</li>
            <li>Reviews are anonymous — reviewers' identities are never disclosed to recipients</li>
            <li>Users must receive a minimum of 3 reviews before their score is displayed</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">2.2 Key Principles</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Anonymity</strong>: Reviewers remain anonymous to those they review</li>
            <li><strong>Random Assignment</strong>: Users cannot choose who to review</li>
            <li><strong>Fairness</strong>: Limited skips prevent selection bias</li>
            <li><strong>Soft Skills Focus</strong>: Scores measure communication, reliability, collaboration, and professionalism — not technical ability</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Eligibility</h2>
          <p className="text-gray-700 leading-relaxed mb-4">To use Estimate, you must:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Be at least 18 years old</li>
            <li>Have a valid LinkedIn account</li>
            <li>Have professional work experience</li>
            <li>Be able to enter into a binding agreement</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. Account Registration</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4.1 LinkedIn Authentication</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            You register by authenticating with your LinkedIn account. By doing so, you authorize us to access certain LinkedIn profile information as described in our Privacy Policy.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4.2 Account Accuracy</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            You represent that all information provided is accurate and current. You are responsible for maintaining the confidentiality of your account.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4.3 One Account Per Person</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Each individual may maintain only one Estimate account. Creating multiple accounts is prohibited.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. User Conduct</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5.1 Honest Reviews</h3>
          <p className="text-gray-700 leading-relaxed mb-4">You agree to:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Provide honest, fair, and good-faith reviews</li>
            <li>Only review colleagues you have actually worked with</li>
            <li>Consider each person individually when rating</li>
            <li>Take reasonable time to complete reviews thoughtfully</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5.2 Prohibited Conduct</h3>
          <p className="text-gray-700 leading-relaxed mb-4">You agree NOT to:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Submit false, misleading, or defamatory reviews</li>
            <li>Attempt to identify anonymous reviewers</li>
            <li>Coordinate with others to manipulate scores</li>
            <li>Use automated tools or scripts to interact with the Service</li>
            <li>Rush through reviews without genuine consideration</li>
            <li>Give identical scores to all colleagues</li>
            <li>Attempt to circumvent the random assignment system</li>
            <li>Harass, threaten, or retaliate against anyone based on suspected reviews</li>
            <li>Create fake accounts or impersonate others</li>
            <li>Reverse engineer, decompile, or attempt to extract the source code</li>
            <li>Use the Service for any unlawful purpose</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5.3 Skip System</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            The skip feature exists for legitimate cases where you did not work closely with an assigned colleague. Abuse of skips to select preferred reviewees is prohibited.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">6. Reviews and Scores</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6.1 Anonymity</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Reviewer identities are never disclosed to recipients</li>
            <li>We maintain technical and organizational measures to protect anonymity</li>
            <li>Attempting to identify or unmask reviewers violates these Terms</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6.2 Score Calculation</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Scores are calculated based on multiple reviews</li>
            <li>Reviews are weighted by relationship type and quality signals</li>
            <li>We may adjust weighting based on fraud detection signals</li>
            <li>The exact algorithm is proprietary</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6.3 No Guarantee</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>We do not guarantee any specific score outcome</li>
            <li>Scores reflect aggregated peer opinions, not objective truth</li>
            <li>We are not responsible for career outcomes based on scores</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6.4 Score Visibility</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Your score is private by default</li>
            <li>You control whether to share your score with recruiters</li>
            <li>Once shared, you can revoke access at any time</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">7. Recruiter Features</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">7.1 Optional Sharing</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Sharing your score with recruiters is entirely optional. You choose:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Whether to make your score visible to recruiters</li>
            <li>Which recruiters or companies can view your score</li>
            <li>When to revoke access</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">7.2 Recruiter Accounts</h3>
          <p className="text-gray-700 leading-relaxed mb-4">Recruiters accessing the platform agree to:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Use scores only for legitimate hiring purposes</li>
            <li>Not discriminate unlawfully based on scores</li>
            <li>Maintain confidentiality of candidate information</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">8. Intellectual Property</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">8.1 Our Rights</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Service, including its design, features, algorithms, and content, is owned by Estimate Ltd. and protected by intellectual property laws.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">8.2 Your Content</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            By submitting reviews, you grant us a non-exclusive, worldwide, royalty-free license to use, store, and process that content to operate the Service.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">8.3 Restrictions</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            You may not copy, modify, distribute, sell, or lease any part of the Service without our written permission.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">9. Disclaimers</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9.1 "As Is" Service</h3>
          <p className="text-gray-700 leading-relaxed mb-4 uppercase font-semibold">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9.2 No Endorsement</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We do not endorse or verify the accuracy of any reviews. Reviews represent individual opinions.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9.3 Third-Party Services</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use third-party services (e.g., LinkedIn) that have their own terms. We are not responsible for their actions or policies.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">10. Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed mb-4 uppercase font-semibold">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages</li>
            <li>We are not liable for lost profits, data, or opportunities</li>
            <li>Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim (if any)</li>
            <li>We are not liable for any employment or career decisions made based on scores</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">11. Indemnification</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You agree to indemnify and hold harmless Estimate Ltd., its officers, directors, employees, and agents from any claims, damages, or expenses arising from:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any third-party rights</li>
            <li>Reviews you submit</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">12. Termination</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">12.1 By You</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            You may delete your account at any time through account settings.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">12.2 By Us</h3>
          <p className="text-gray-700 leading-relaxed mb-4">We may suspend or terminate your account if you:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Violate these Terms</li>
            <li>Engage in fraudulent or abusive behavior</li>
            <li>Create risk or legal exposure for us</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">12.3 Effect of Termination</h3>
          <p className="text-gray-700 leading-relaxed mb-4">Upon termination:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Your access to the Service ends immediately</li>
            <li>Reviews you submitted remain in the system (anonymously)</li>
            <li>We may retain certain data as required by law</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">13. Dispute Resolution</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">13.1 Governing Law</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            These Terms are governed by the laws of the State of Israel.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">13.2 Jurisdiction</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Any disputes shall be resolved in the courts of Tel Aviv-Jaffa, Israel.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">13.3 Informal Resolution</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Before filing any claim, you agree to contact us at legal@estimatenow.io to attempt informal resolution.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">14. Changes to Terms</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may modify these Terms at any time. We will notify you of material changes via email or in-app notification. Continued use after changes constitutes acceptance.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">15. General Provisions</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">15.1 Entire Agreement</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            These Terms, together with our Privacy Policy, constitute the entire agreement between you and Estimate.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">15.2 Severability</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            If any provision is found unenforceable, the remaining provisions remain in effect.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">15.3 No Waiver</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our failure to enforce any right does not waive that right.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">15.4 Assignment</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            You may not assign these Terms. We may assign them to any successor.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">16. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed mb-2"><strong>Estimate Ltd.</strong></p>
          <p className="text-gray-700 leading-relaxed mb-2">Email: legal@estimatenow.io</p>
          <p className="text-gray-700 leading-relaxed mb-8">Website: https://estimatenow.io</p>

          <hr className="my-8" />

          <p className="text-center text-gray-500 italic mt-8">
            By using Estimate, you acknowledge that you have read, understood, and agree to these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
