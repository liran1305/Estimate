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
            Estimate Ltd. ("Estimate," "we," "us," or "our") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your personal data when you use our platform at estimatenow.io ("Service").
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            This policy applies to all users, including professionals seeking peer reviews ("Users") and recruiters accessing candidate scores ("Recruiters").
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. Data Controller</h2>
          <p className="text-gray-700 leading-relaxed mb-2"><strong>Estimate Ltd.</strong></p>
          <p className="text-gray-700 leading-relaxed mb-2">Email: privacy@estimatenow.io</p>
          <p className="text-gray-700 leading-relaxed mb-4">Website: https://estimatenow.io</p>
          <p className="text-gray-700 leading-relaxed mb-4">
            For EU/EEA users, Estimate Ltd. acts as the data controller for your personal data.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Data We Collect</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3.1 Data from LinkedIn Authentication</h3>
          <p className="text-gray-700 leading-relaxed mb-4">When you sign up via LinkedIn, we collect:</p>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">Data Type</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Full name</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Display on your profile</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Email address</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Account communication</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Profile picture</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Display on your profile</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Headline/Position</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Colleague matching</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Current company</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Colleague matching</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">LinkedIn ID</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Account identification</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Note:</strong> We do NOT access your LinkedIn connections, messages, or full work history through OAuth. We only access basic profile data you authorize.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3.2 Data from Company Databases</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            To enable colleague matching, we maintain databases of professional profiles from public sources. This may include:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Name</li>
            <li>Job titles and positions</li>
            <li>Companies worked at</li>
            <li>Employment dates</li>
            <li>Office locations</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3.3 Data You Provide</h3>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">Data Type</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Relationship type (how you worked together)</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Review context and weighting</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Review ratings</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Score calculation</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Skip selections</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Matching improvement</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3.4 Automatically Collected Data</h3>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">Data Type</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">IP address</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Security, fraud prevention</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Device information</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Service optimization</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Browser type</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Service optimization</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Usage data (pages visited, time spent)</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Service improvement</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Time spent on reviews</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Quality assurance</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3.5 Cookies and Tracking</h3>
          <p className="text-gray-700 leading-relaxed mb-4">We use essential cookies for:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Authentication and session management</li>
            <li>Security and fraud prevention</li>
            <li>Basic analytics</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            We do NOT use advertising cookies or sell data to advertisers.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. How We Use Your Data</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4.1 Primary Purposes</h3>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">Purpose</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">Legal Basis (GDPR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Provide the Service</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Contract performance</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Match you with colleagues</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Legitimate interest</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Calculate your score</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Contract performance</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Process reviews you submit</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Contract performance</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Communicate with you</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Contract performance</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Prevent fraud and abuse</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Legitimate interest</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Improve the Service</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Legitimate interest</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4.2 Score Calculation</h3>
          <p className="text-gray-700 leading-relaxed mb-4">Your score is calculated from:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Ratings received from colleagues</li>
            <li>Relationship types (same team, cross-functional, etc.)</li>
            <li>Quality signals (review completeness, time spent)</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">Reviews are weighted based on:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>How closely the reviewer worked with you</li>
            <li>Quality indicators of the review</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4.3 Fraud Prevention</h3>
          <p className="text-gray-700 leading-relaxed mb-4">We analyze patterns to detect:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Rushed or low-quality reviews</li>
            <li>Coordinated score manipulation</li>
            <li>Multiple accounts</li>
            <li>Gaming behavior</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            This analysis is automated but may be reviewed by staff for flagged cases.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. Anonymity and Data Separation</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5.1 How We Protect Reviewer Anonymity</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Reviewer identities are never disclosed to recipients</li>
            <li>We use technical separation between reviewer IDs and review content</li>
            <li>Scores show only aggregate data, never individual reviews</li>
            <li>We never reveal who reviewed whom</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5.2 What Recipients See</h3>
          <p className="text-gray-700 leading-relaxed mb-4">If you are reviewed, you will see:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Your aggregate score per category</li>
            <li>Number of reviews received</li>
            <li>General trends</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">You will NOT see:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Individual review scores</li>
            <li>Who reviewed you</li>
            <li>When specific reviews were submitted</li>
            <li>Any identifying information about reviewers</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5.3 What Reviewers See</h3>
          <p className="text-gray-700 leading-relaxed mb-4">After submitting reviews, you will see:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Confirmation of submission</li>
            <li>Your own unlocked score (after completing 3 reviews)</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">You will NOT see:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>How your review affected someone's score</li>
            <li>Whether the person you reviewed has seen their score</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">6. Data Sharing</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6.1 With Other Users</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Your name and profile are visible to colleagues assigned to review you</li>
            <li>Your score is private by default</li>
            <li>If you opt in, recruiters may view your score</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6.2 With Recruiters (Optional)</h3>
          <p className="text-gray-700 leading-relaxed mb-4">If you choose to share your score:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Recruiters can see your score and category breakdown</li>
            <li>They can see your name and basic profile</li>
            <li>They cannot see who reviewed you or individual reviews</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6.3 With Service Providers</h3>
          <p className="text-gray-700 leading-relaxed mb-4">We share data with:</p>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">Provider</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">Purpose</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">Location</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Cloud hosting</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Data storage</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">EU/US (with safeguards)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">LinkedIn</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Authentication</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">US</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Email provider</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Communications</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">EU/US</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Analytics</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Service improvement</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">EU</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            All providers are bound by data processing agreements.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6.4 Legal Requirements</h3>
          <p className="text-gray-700 leading-relaxed mb-4">We may disclose data if required by:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Law or legal process</li>
            <li>Government requests</li>
            <li>Protection of our rights or safety</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">7. Data Retention</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">7.1 Account Data</h3>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">Data Type</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">Retention Period</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Profile information</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Until account deletion</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Reviews you submitted</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Indefinitely (anonymized)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Reviews you received</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Until account deletion</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Your score</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Until account deletion</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Usage logs</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">12 months</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Security logs</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">24 months</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">7.2 After Account Deletion</h3>
          <p className="text-gray-700 leading-relaxed mb-4">When you delete your account:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Your profile is removed within 30 days</li>
            <li>Reviews you received are deleted</li>
            <li>Reviews you submitted remain (fully anonymized)</li>
            <li>Your score is deleted</li>
            <li>Aggregate statistics may be retained</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">7.3 Inactive Accounts</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Accounts inactive for 24 months may be flagged for deletion after notice.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">8. Your Rights</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">8.1 Under GDPR (EU/EEA Users)</h3>
          <p className="text-gray-700 leading-relaxed mb-4">You have the right to:</p>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">Right</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700 font-semibold">Access</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Request a copy of your personal data</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700 font-semibold">Rectification</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Correct inaccurate data</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700 font-semibold">Erasure</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Request deletion ("right to be forgotten")</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700 font-semibold">Restriction</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Limit how we process your data</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700 font-semibold">Portability</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Receive your data in a portable format</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700 font-semibold">Object</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Object to processing based on legitimate interest</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700 font-semibold">Withdraw consent</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Withdraw consent at any time</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">8.2 Under Israeli Privacy Law</h3>
          <p className="text-gray-700 leading-relaxed mb-4">Israeli users have rights to:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Access their personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete data (with certain exceptions)</li>
            <li>Object to direct marketing</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">8.3 How to Exercise Your Rights</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Email: privacy@estimatenow.io
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            We will respond within 30 days. We may verify your identity before processing requests.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">8.4 Limitations</h3>
          <p className="text-gray-700 leading-relaxed mb-4">We cannot:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Reveal who reviewed you (anonymity protection)</li>
            <li>Delete reviews you submitted (they're anonymized)</li>
            <li>Provide data that would identify other users</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">9. Data Security</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9.1 Technical Measures</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Encryption in transit (TLS 1.2+)</li>
            <li>Encryption at rest</li>
            <li>Secure authentication via LinkedIn OAuth</li>
            <li>Access controls and logging</li>
            <li>Regular security assessments</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9.2 Organizational Measures</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Limited employee access</li>
            <li>Confidentiality agreements</li>
            <li>Security training</li>
            <li>Incident response procedures</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9.3 Breach Notification</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            If a data breach occurs that affects your rights, we will:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Notify affected users within 72 hours</li>
            <li>Report to relevant authorities as required</li>
            <li>Take immediate remediation steps</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">10. International Transfers</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">10.1 Data Location</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Primary data storage is in the European Union.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">10.2 Transfers Outside EU/EEA</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            When data is transferred outside the EU/EEA (e.g., to US service providers), we ensure protection through:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Standard Contractual Clauses (SCCs)</li>
            <li>Data Processing Agreements</li>
            <li>Additional technical safeguards</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">11. Children's Privacy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Estimate is not intended for anyone under 18. We do not knowingly collect data from minors. If we discover such data, we will delete it promptly.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">12. Third-Party Links</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Service may contain links to third-party websites. We are not responsible for their privacy practices.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">13. Changes to This Policy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may update this Privacy Policy periodically. We will notify you of material changes via:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Email notification</li>
            <li>In-app notification</li>
            <li>Updated "Last Updated" date</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            Continued use after changes constitutes acceptance.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">14. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed mb-2"><strong>Estimate Ltd.</strong></p>
          <p className="text-gray-700 leading-relaxed mb-2"><strong>Privacy Inquiries:</strong> privacy@estimatenow.io</p>
          <p className="text-gray-700 leading-relaxed mb-2"><strong>General Inquiries:</strong> support@estimatenow.io</p>
          <p className="text-gray-700 leading-relaxed mb-8"><strong>Data Protection Requests:</strong> privacy@estimatenow.io</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">15. Supervisory Authority</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you are in the EU/EEA and believe we have violated your data protection rights, you have the right to lodge a complaint with your local data protection authority.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            For Israeli users, complaints may be directed to the Israeli Privacy Protection Authority (PPA).
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Summary Table: Your Data at a Glance</h2>
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">What We Collect</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">Why</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">Who Sees It</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">How Long</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">LinkedIn profile (name, email, photo)</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Account & matching</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">You, assigned reviewers</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Until deletion</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Employment history (from public sources)</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Colleague matching</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Internal only</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Until deletion</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Reviews you give</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Score calculation</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Anonymous to recipient</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Indefinitely</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Reviews you receive</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Your score</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Only you (aggregate)</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Until deletion</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Your score</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Your reputation</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">You; recruiters if you opt in</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Until deletion</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Usage data</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Service improvement</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">Internal only</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">12 months</td>
                </tr>
              </tbody>
            </table>
          </div>

          <hr className="my-8" />

          <p className="text-center text-gray-500 italic mt-8">
            By using Estimate, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
