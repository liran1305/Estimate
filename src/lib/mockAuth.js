const STORAGE_KEY = 'estimate_user';
const REVIEWS_KEY = 'estimate_reviews';
const WAITLIST_KEY = 'estimate_waitlist';

const mockUser = {
  id: 'user-1',
  full_name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  job_title: 'Senior Software Engineer',
  company: 'TechCorp',
  photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
  onboarding_complete: false,
  reviews_given: 0,
  recruitment_consent: false
};

export const mockAuth = {
  isAuthenticated: () => {
    return Promise.resolve(!!localStorage.getItem(STORAGE_KEY));
  },
  
  me: () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return Promise.resolve(JSON.parse(stored));
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    return Promise.resolve(mockUser);
  },
  
  updateMe: (updates) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const user = stored ? JSON.parse(stored) : mockUser;
    const updated = { ...user, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return Promise.resolve(updated);
  },
  
  redirectToLogin: (redirectUrl) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    window.location.href = redirectUrl;
  },
  
  logout: (redirectUrl) => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REVIEWS_KEY);
    window.location.href = redirectUrl;
  }
};

export const mockEntities = {
  Review: {
    list: () => {
      const stored = localStorage.getItem(REVIEWS_KEY);
      return Promise.resolve(stored ? JSON.parse(stored) : []);
    },
    
    filter: (criteria) => {
      const stored = localStorage.getItem(REVIEWS_KEY);
      const reviews = stored ? JSON.parse(stored) : [];
      
      if (criteria.reviewer_id) {
        return Promise.resolve(reviews.filter(r => r.reviewer_id === criteria.reviewer_id));
      }
      
      return Promise.resolve(reviews);
    },
    
    create: (data) => {
      const stored = localStorage.getItem(REVIEWS_KEY);
      const reviews = stored ? JSON.parse(stored) : [];
      const newReview = { ...data, id: `review-${Date.now()}`, created_at: new Date().toISOString() };
      reviews.push(newReview);
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
      return Promise.resolve(newReview);
    }
  },
  
  WaitlistEntry: {
    create: (data) => {
      const stored = localStorage.getItem(WAITLIST_KEY);
      const entries = stored ? JSON.parse(stored) : [];
      const newEntry = { ...data, id: `waitlist-${Date.now()}`, created_at: new Date().toISOString() };
      entries.push(newEntry);
      localStorage.setItem(WAITLIST_KEY, JSON.stringify(entries));
      return Promise.resolve(newEntry);
    }
  }
};
