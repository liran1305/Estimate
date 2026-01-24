import React, { Suspense } from 'react';
import Layout from "./Layout.jsx";
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Loader2 } from "lucide-react";

// Lazy load all pages for faster initial load (critical for mobile OAuth callback)
const Landing = React.lazy(() => import("./Landing"));
const Onboarding = React.lazy(() => import("./Onboarding"));
const LinkedInAuth = React.lazy(() => import("./LinkedInAuth"));
const Review = React.lazy(() => import("./Review"));
const Profile = React.lazy(() => import("./Profile"));
const TermsOfService = React.lazy(() => import("./TermsOfService"));
const PrivacyPolicy = React.lazy(() => import("./PrivacyPolicy"));
const Disclaimer = React.lazy(() => import("./Disclaimer"));
const LinkedInCallback = React.lazy(() => import("./LinkedInCallback"));
const Blocked = React.lazy(() => import("./Blocked"));
const Unsubscribe = React.lazy(() => import("./Unsubscribe"));
const Leaderboard = React.lazy(() => import("./Leaderboard"));
const Contact = React.lazy(() => import("./Contact"));

// Minimal loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-[#0A66C2] animate-spin" />
  </div>
);

const PAGES = {
    
    Landing: Landing,
    
    Onboarding: Onboarding,
    
    LinkedInAuth: LinkedInAuth,
    
    Review: Review,
    
    Profile: Profile,
    
    TermsOfService: TermsOfService,
    
    PrivacyPolicy: PrivacyPolicy,
    
    Disclaimer: Disclaimer,
    
    LinkedInCallback: LinkedInCallback,
    
    Blocked: Blocked,
    
    Leaderboard: Leaderboard,
    
    Contact: Contact,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Suspense fallback={<PageLoader />}>
                <Routes>            
                    <Route path="/" element={<Landing />} />
                    <Route path="/Landing" element={<Landing />} />
                    <Route path="/Onboarding" element={<Onboarding />} />
                    <Route path="/LinkedInAuth" element={<LinkedInAuth />} />
                    <Route path="/Review" element={<Review />} />
                    <Route path="/Profile" element={<Profile />} />
                    <Route path="/TermsOfService" element={<TermsOfService />} />
                    <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                    <Route path="/Disclaimer" element={<Disclaimer />} />
                    <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
                    <Route path="/Blocked" element={<Blocked />} />
                    <Route path="/unsubscribe/:token" element={<Unsubscribe />} />
                    <Route path="/Leaderboard" element={<Leaderboard />} />
                    <Route path="/top-performers" element={<Leaderboard />} />
                    <Route path="/Contact" element={<Contact />} />
                </Routes>
            </Suspense>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}