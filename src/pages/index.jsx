import Layout from "./Layout.jsx";

import Landing from "./Landing";

import Onboarding from "./Onboarding";

import LinkedInAuth from "./LinkedInAuth";

import Review from "./Review";

import Profile from "./Profile";

import TermsOfService from "./TermsOfService";

import PrivacyPolicy from "./PrivacyPolicy";

import Disclaimer from "./Disclaimer";

import LinkedInCallback from "./LinkedInCallback";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

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
                
            </Routes>
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