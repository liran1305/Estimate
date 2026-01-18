/**
 * ESTIMATE - Complete Job Titles & Percentile Ranking System
 * Comprehensive specification for ALL high-tech job positions
 * 
 * This file contains:
 * 1. All high-tech job categories and titles with aliases
 * 2. Seniority level definitions
 * 3. Percentile tier system (1%, 2%, 3%, 4%, 5%, 8%, 10%, 15%, 20%)
 * 4. Default score thresholds for cold start
 * 5. Default average scores by category for cold start
 * 6. Helper functions for normalization and calculation
 */

// =============================================================================
// PERCENTILE TIERS - Your specific requirements
// =============================================================================

const PERCENTILE_TIERS = [
  { tier: 'Top 1%',  minPercentile: 99, badge: 'legendary',   color: '#7c3aed', emoji: '🏆' },
  { tier: 'Top 2%',  minPercentile: 98, badge: 'exceptional', color: '#8b5cf6', emoji: '💎' },
  { tier: 'Top 3%',  minPercentile: 97, badge: 'exceptional', color: '#a78bfa', emoji: '⭐' },
  { tier: 'Top 4%',  minPercentile: 96, badge: 'outstanding', color: '#0ea5e9', emoji: '🌟' },
  { tier: 'Top 5%',  minPercentile: 95, badge: 'outstanding', color: '#06b6d4', emoji: '✨' },
  { tier: 'Top 8%',  minPercentile: 92, badge: 'excellent',   color: '#14b8a6', emoji: '🔥' },
  { tier: 'Top 10%', minPercentile: 90, badge: 'excellent',   color: '#10b981', emoji: '💪' },
  { tier: 'Top 15%', minPercentile: 85, badge: 'very_good',   color: '#22c55e', emoji: '👍' },
  { tier: 'Top 20%', minPercentile: 80, badge: 'good',        color: '#84cc16', emoji: '✓' },
  { tier: 'Top 25%', minPercentile: 75, badge: 'good',        color: '#a3e635', emoji: '' },
  { tier: 'Top 30%', minPercentile: 70, badge: 'above_avg',   color: '#facc15', emoji: '' },
  { tier: 'Top 50%', minPercentile: 50, badge: 'average',     color: '#6b7280', emoji: '' },
  { tier: 'Below Average', minPercentile: 0, badge: 'below_avg', color: '#9ca3af', emoji: '' },
];

// Default score thresholds when insufficient data (< 30 users in category)
// These are used for "cold start" - when you're the only one or have few users
const DEFAULT_SCORE_THRESHOLDS = {
  'Top 1%':  9.6,
  'Top 2%':  9.4,
  'Top 3%':  9.2,
  'Top 4%':  9.0,
  'Top 5%':  8.8,
  'Top 8%':  8.5,
  'Top 10%': 8.2,
  'Top 15%': 7.8,
  'Top 20%': 7.5,
  'Top 25%': 7.2,
  'Top 30%': 7.0,
  'Top 50%': 6.0,
  'Below Average': 0,
};

// Default average scores by skill category for cold start
// These represent industry benchmarks based on typical performance distributions
const DEFAULT_CATEGORY_AVERAGES = {
  teamwork: 7.2,
  reliability: 7.0,
  communication: 6.8,
  problem_solving: 7.1,
  leadership_impact: 6.5,
  initiative: 6.9,
  mentorship: 6.3,
  strategic_thinking: 6.6,
};

// Overall default average score
const DEFAULT_OVERALL_AVERAGE = 6.8;

// Minimum users needed before using real percentile calculation
const MIN_USERS_FOR_REAL_PERCENTILE = 30;

// =============================================================================
// SENIORITY LEVELS
// =============================================================================

const SENIORITY_LEVELS = {
  // Individual Contributor Track - Entry
  intern:           { level: 0,  label: 'Intern',              yearsExp: '0',     track: 'ic' },
  entry:            { level: 1,  label: 'Entry Level',         yearsExp: '0-1',   track: 'ic' },
  junior:           { level: 2,  label: 'Junior',              yearsExp: '1-2',   track: 'ic' },
  
  // Individual Contributor Track - Mid
  mid:              { level: 3,  label: 'Mid-Level',           yearsExp: '2-4',   track: 'ic' },
  mid_senior:       { level: 4,  label: 'Mid-Senior',          yearsExp: '4-5',   track: 'ic' },
  
  // Individual Contributor Track - Senior
  senior:           { level: 5,  label: 'Senior',              yearsExp: '5-8',   track: 'ic' },
  staff:            { level: 6,  label: 'Staff',               yearsExp: '8-10',  track: 'ic' },
  senior_staff:     { level: 7,  label: 'Senior Staff',        yearsExp: '10-12', track: 'ic' },
  principal:        { level: 8,  label: 'Principal',           yearsExp: '12-15', track: 'ic' },
  senior_principal: { level: 9,  label: 'Senior Principal',    yearsExp: '15+',   track: 'ic' },
  distinguished:    { level: 10, label: 'Distinguished',       yearsExp: '15+',   track: 'ic' },
  fellow:           { level: 11, label: 'Fellow',              yearsExp: '18+',   track: 'ic' },
  
  // Management Track
  lead:             { level: 5,  label: 'Lead',                yearsExp: '5-8',   track: 'mgmt' },
  manager:          { level: 6,  label: 'Manager',             yearsExp: '6-10',  track: 'mgmt' },
  senior_manager:   { level: 7,  label: 'Senior Manager',      yearsExp: '8-12',  track: 'mgmt' },
  director:         { level: 8,  label: 'Director',            yearsExp: '10-15', track: 'mgmt' },
  senior_director:  { level: 9,  label: 'Senior Director',     yearsExp: '12-18', track: 'mgmt' },
  vp:               { level: 10, label: 'VP',                  yearsExp: '15+',   track: 'mgmt' },
  svp:              { level: 11, label: 'SVP',                 yearsExp: '18+',   track: 'mgmt' },
  evp:              { level: 12, label: 'EVP',                 yearsExp: '20+',   track: 'mgmt' },
  c_level:          { level: 13, label: 'C-Level',             yearsExp: '15+',   track: 'exec' },
};

// Keywords to detect seniority from job titles
const SENIORITY_KEYWORDS = {
  intern:           ['intern', 'internship', 'trainee', 'apprentice', 'co-op', 'student'],
  entry:            ['entry', 'entry-level', 'associate', 'i ', ' i', 'level 1', 'l1', 'graduate'],
  junior:           ['junior', 'jr', 'jr.', 'ii', 'level 2', 'l2'],
  mid:              ['mid', 'mid-level', 'intermediate', 'iii', 'level 3', 'l3', 'level 4', 'l4'],
  senior:           ['senior', 'sr', 'sr.', 'iv', 'level 5', 'l5', 'level 6', 'l6'],
  staff:            ['staff'],
  senior_staff:     ['senior staff', 'sr staff'],
  principal:        ['principal', 'level 7', 'l7'],
  distinguished:    ['distinguished', 'level 8', 'l8'],
  fellow:           ['fellow'],
  lead:             ['lead', 'team lead', 'tech lead', 'technical lead'],
  manager:          ['manager', 'mgr'],
  senior_manager:   ['senior manager', 'sr manager', 'sr. manager'],
  director:         ['director', 'dir'],
  senior_director:  ['senior director', 'sr director', 'sr. director'],
  vp:               ['vp', 'vice president'],
  svp:              ['svp', 'senior vice president', 'senior vp'],
  evp:              ['evp', 'executive vice president'],
  c_level:          ['chief', 'cto', 'cpo', 'cdo', 'ceo', 'coo', 'cfo', 'cmo', 'cro', 'chro', 'cio', 'ciso'],
};

// =============================================================================
// JOB CATEGORIES AND TITLES - COMPREHENSIVE
// =============================================================================

const JOB_CATEGORIES = {

  // ===========================================================================
  // SOFTWARE ENGINEERING
  // ===========================================================================
  software_engineering: {
    category: 'Software Engineering',
    displayName: 'Software Engineers',
    icon: '💻',
    titles: {
      software_engineer: {
        canonical: 'Software Engineer',
        aliases: [
          'Software Developer', 'Programmer', 'Application Developer', 
          'Software Development Engineer', 'SDE', 'Computer Programmer',
          'Application Engineer', 'Systems Developer', 'Software Specialist',
          'Software Designer', 'Application Programmer', 'Coder',
          'R&D Engineer', 'Research & Development Engineer'
        ],
      },
      frontend_engineer: {
        canonical: 'Frontend Engineer',
        aliases: [
          'Front-End Developer', 'Front End Engineer', 'UI Developer',
          'UI Engineer', 'Web Developer', 'Client-Side Developer',
          'JavaScript Developer', 'React Developer', 'Angular Developer',
          'Vue Developer', 'Frontend Developer', 'Web Engineer',
          'TypeScript Developer', 'Next.js Developer', 'HTML/CSS Developer'
        ],
      },
      backend_engineer: {
        canonical: 'Backend Engineer',
        aliases: [
          'Back-End Developer', 'Back End Engineer', 'Server-Side Developer',
          'API Developer', 'Backend Developer', 'Node.js Developer',
          'Python Developer', 'Java Developer', 'Go Developer', 'Golang Developer',
          'Ruby Developer', '.NET Developer', 'C# Developer', 'PHP Developer',
          'Scala Developer', 'Rust Developer', 'C++ Developer', 'Kotlin Developer'
        ],
      },
      fullstack_engineer: {
        canonical: 'Full Stack Engineer',
        aliases: [
          'Full-Stack Developer', 'Fullstack Developer', 'Full Stack Developer',
          'Full-Stack Engineer', 'Web Application Developer', 'MEAN Stack Developer',
          'MERN Stack Developer', 'LAMP Stack Developer', 'Full Stack Web Developer'
        ],
      },
      mobile_engineer: {
        canonical: 'Mobile Engineer',
        aliases: [
          'Mobile Developer', 'iOS Developer', 'iOS Engineer', 'iPhone Developer',
          'Android Developer', 'Android Engineer', 'Mobile Application Developer',
          'React Native Developer', 'Flutter Developer', 'Swift Developer',
          'Kotlin Developer', 'Xamarin Developer', 'Mobile App Developer',
          'Cross-Platform Developer', 'Native Mobile Developer'
        ],
      },
      embedded_engineer: {
        canonical: 'Embedded Engineer',
        aliases: [
          'Embedded Software Engineer', 'Embedded Systems Engineer', 'Firmware Engineer',
          'Firmware Developer', 'IoT Developer', 'IoT Engineer', 'Hardware Engineer',
          'Systems Programmer', 'RTOS Developer', 'Embedded Linux Developer',
          'Microcontroller Developer', 'Embedded C Developer'
        ],
      },
      platform_engineer: {
        canonical: 'Platform Engineer',
        aliases: [
          'Platform Developer', 'Infrastructure Engineer', 'Systems Engineer',
          'Platform Software Engineer', 'Core Platform Engineer'
        ],
      },
      qa_engineer: {
        canonical: 'QA Engineer',
        aliases: [
          'Quality Assurance Engineer', 'Test Engineer', 'Software Tester',
          'QA Analyst', 'Test Automation Engineer', 'SDET',
          'Software Development Engineer in Test', 'Quality Engineer',
          'QA Developer', 'Automation Engineer', 'Automation Tester',
          'Manual Tester', 'Performance Tester', 'QA Lead', 'Test Lead',
          'Quality Analyst', 'Software Quality Engineer'
        ],
      },
      game_developer: {
        canonical: 'Game Developer',
        aliases: [
          'Game Programmer', 'Game Engineer', 'Unity Developer',
          'Unreal Developer', 'Game Designer', 'Gameplay Programmer',
          'Graphics Programmer', 'Engine Programmer', 'Tools Programmer'
        ],
      },
      blockchain_developer: {
        canonical: 'Blockchain Developer',
        aliases: [
          'Blockchain Engineer', 'Smart Contract Developer', 'Solidity Developer',
          'Web3 Developer', 'Crypto Developer', 'DeFi Developer',
          'NFT Developer', 'Ethereum Developer', 'Consensus Developer'
        ],
      },
      solutions_engineer: {
        canonical: 'Solutions Engineer',
        aliases: [
          'Solutions Architect', 'Technical Solutions Engineer', 'Pre-Sales Engineer',
          'Sales Engineer', 'Technical Consultant', 'Implementation Engineer',
          'Customer Engineer', 'Field Engineer', 'Integration Engineer'
        ],
      },
      support_engineer: {
        canonical: 'Support Engineer',
        aliases: [
          'Technical Support Engineer', 'Customer Support Engineer',
          'Application Support Engineer', 'Production Support Engineer',
          'L2 Support', 'L3 Support', 'Support Specialist', 'IT Support Engineer',
          'Tier 2 Support', 'Tier 3 Support', 'Escalation Engineer'
        ],
      },
    },
  },

  // ===========================================================================
  // DEVOPS & INFRASTRUCTURE
  // ===========================================================================
  devops_infrastructure: {
    category: 'DevOps & Infrastructure',
    displayName: 'DevOps Engineers',
    icon: '🔧',
    titles: {
      devops_engineer: {
        canonical: 'DevOps Engineer',
        aliases: [
          'DevOps Developer', 'Build Engineer', 'Release Engineer',
          'Deployment Engineer', 'CI/CD Engineer', 'Platform Operations Engineer',
          'Build & Release Engineer', 'DevOps Specialist', 'Automation Engineer'
        ],
      },
      sre: {
        canonical: 'Site Reliability Engineer',
        aliases: [
          'SRE', 'Reliability Engineer', 'Production Engineer',
          'Infrastructure Reliability Engineer', 'Systems Reliability Engineer',
          'Operations Engineer', 'Platform Reliability Engineer'
        ],
      },
      cloud_engineer: {
        canonical: 'Cloud Engineer',
        aliases: [
          'Cloud Developer', 'AWS Engineer', 'Azure Engineer', 'GCP Engineer',
          'Cloud Infrastructure Engineer', 'Cloud Solutions Engineer',
          'Cloud Architect', 'Cloud Platform Engineer', 'Cloud Specialist',
          'Multi-Cloud Engineer', 'Hybrid Cloud Engineer', 'Cloud DevOps Engineer',
          'AWS Developer', 'Azure Developer', 'GCP Developer'
        ],
      },
      infrastructure_engineer: {
        canonical: 'Infrastructure Engineer',
        aliases: [
          'Infra Engineer', 'Systems Administrator', 'Sysadmin', 'SysAdmin',
          'Linux Administrator', 'Windows Administrator', 'IT Infrastructure Engineer',
          'Network Engineer', 'Network Administrator', 'Unix Administrator',
          'Server Administrator', 'Platform Administrator', 'IT Systems Engineer'
        ],
      },
      security_engineer: {
        canonical: 'Security Engineer',
        aliases: [
          'Information Security Engineer', 'Cybersecurity Engineer', 'InfoSec Engineer',
          'AppSec Engineer', 'Application Security Engineer', 'Security Analyst',
          'Security Architect', 'Penetration Tester', 'Ethical Hacker',
          'Security Operations Engineer', 'SOC Analyst', 'Security Consultant',
          'Vulnerability Analyst', 'Threat Analyst', 'Security Researcher',
          'Cloud Security Engineer', 'Network Security Engineer'
        ],
      },
      database_administrator: {
        canonical: 'Database Administrator',
        aliases: [
          'DBA', 'Database Engineer', 'Data Administrator', 'Database Developer',
          'SQL Developer', 'Database Analyst', 'Data Platform Engineer',
          'Oracle DBA', 'MySQL DBA', 'PostgreSQL DBA', 'MongoDB Administrator',
          'NoSQL Administrator', 'Database Architect'
        ],
      },
      network_engineer: {
        canonical: 'Network Engineer',
        aliases: [
          'Network Administrator', 'Network Architect', 'Network Specialist',
          'Cisco Engineer', 'Network Operations Engineer', 'NOC Engineer',
          'Network Security Engineer', 'Wireless Engineer', 'LAN/WAN Engineer'
        ],
      },
    },
  },

  // ===========================================================================
  // DATA & ANALYTICS
  // ===========================================================================
  data_analytics: {
    category: 'Data & Analytics',
    displayName: 'Data Professionals',
    icon: '📊',
    titles: {
      data_scientist: {
        canonical: 'Data Scientist',
        aliases: [
          'Research Scientist', 'Applied Scientist', 'Quantitative Analyst',
          'Quant', 'Statistical Analyst', 'Predictive Modeler',
          'Data Science Specialist', 'Quantitative Researcher', 'Statistical Modeler'
        ],
      },
      data_analyst: {
        canonical: 'Data Analyst',
        aliases: [
          'Business Analyst', 'Analytics Analyst', 'Reporting Analyst',
          'Insights Analyst', 'Marketing Analyst', 'Product Analyst',
          'Operations Analyst', 'Research Analyst', 'Financial Analyst',
          'Quantitative Analyst', 'Intelligence Analyst', 'Decision Analyst'
        ],
      },
      data_engineer: {
        canonical: 'Data Engineer',
        aliases: [
          'Big Data Engineer', 'Data Pipeline Engineer', 'ETL Developer',
          'Data Infrastructure Engineer', 'Data Platform Engineer',
          'Hadoop Developer', 'Spark Developer', 'Data Warehouse Engineer',
          'Snowflake Developer', 'Databricks Engineer', 'Data Integration Engineer'
        ],
      },
      bi_analyst: {
        canonical: 'Business Intelligence Analyst',
        aliases: [
          'BI Analyst', 'BI Developer', 'Business Intelligence Developer',
          'BI Engineer', 'Tableau Developer', 'Power BI Developer',
          'Looker Developer', 'Dashboard Developer', 'Reporting Developer',
          'BI Specialist', 'Analytics Developer', 'Data Visualization Developer'
        ],
      },
      ml_engineer: {
        canonical: 'Machine Learning Engineer',
        aliases: [
          'ML Engineer', 'AI Engineer', 'Applied ML Engineer',
          'Deep Learning Engineer', 'NLP Engineer', 'Computer Vision Engineer',
          'MLOps Engineer', 'AI/ML Engineer', 'Machine Learning Developer',
          'AI Developer', 'Neural Network Engineer', 'ML Platform Engineer'
        ],
      },
      data_architect: {
        canonical: 'Data Architect',
        aliases: [
          'Enterprise Data Architect', 'Data Solutions Architect',
          'Big Data Architect', 'Analytics Architect', 'Cloud Data Architect',
          'Data Platform Architect'
        ],
      },
      analytics_engineer: {
        canonical: 'Analytics Engineer',
        aliases: [
          'Data Analytics Engineer', 'dbt Developer', 'Data Modeling Engineer',
          'Analytics Developer'
        ],
      },
      ai_researcher: {
        canonical: 'AI Researcher',
        aliases: [
          'Research Scientist', 'ML Researcher', 'Deep Learning Researcher',
          'AI Research Scientist', 'Machine Learning Scientist',
          'Computer Vision Researcher', 'NLP Researcher'
        ],
      },
    },
  },

  // ===========================================================================
  // PRODUCT MANAGEMENT
  // ===========================================================================
  product_management: {
    category: 'Product Management',
    displayName: 'Product Managers',
    icon: '📱',
    titles: {
      product_manager: {
        canonical: 'Product Manager',
        aliases: [
          'PM', 'Product Lead', 'Product Owner', 'Digital Product Manager',
          'Platform Product Manager', 'Growth Product Manager', 'Core Product Manager',
          'B2B Product Manager', 'B2C Product Manager', 'Consumer Product Manager',
          'Enterprise Product Manager', 'Internal Product Manager'
        ],
      },
      technical_product_manager: {
        canonical: 'Technical Product Manager',
        aliases: [
          'TPM', 'Technical PM', 'Platform PM', 'Infrastructure PM',
          'API Product Manager', 'Developer Product Manager', 'Tech PM',
          'Data Product Manager', 'AI Product Manager', 'ML Product Manager'
        ],
      },
      product_marketing_manager: {
        canonical: 'Product Marketing Manager',
        aliases: [
          'PMM', 'Go-to-Market Manager', 'GTM Manager', 'Product Launch Manager',
          'Product Marketing Lead', 'Solutions Marketing Manager'
        ],
      },
      program_manager: {
        canonical: 'Program Manager',
        aliases: [
          'Technical Program Manager', 'Engineering Program Manager',
          'TPM (Technical Program Manager)', 'Project Manager', 'Delivery Manager',
          'Release Manager', 'Scrum Master', 'Agile Coach', 'Agile Project Manager',
          'Program Lead', 'Portfolio Manager'
        ],
      },
      product_operations: {
        canonical: 'Product Operations Manager',
        aliases: [
          'Product Ops', 'ProductOps Manager', 'Product Operations Lead',
          'Product Strategy Manager'
        ],
      },
      product_analyst: {
        canonical: 'Product Analyst',
        aliases: [
          'Product Data Analyst', 'Product Insights Analyst',
          'Product Research Analyst', 'Product Analytics Manager'
        ],
      },
      product_designer: {
        canonical: 'Product Designer',
        aliases: [
          'Digital Product Designer', 'UX Product Designer', 'Product Design Lead'
        ],
      },
    },
  },

  // ===========================================================================
  // DESIGN (UX/UI)
  // ===========================================================================
  design: {
    category: 'Design',
    displayName: 'Designers',
    icon: '🎨',
    titles: {
      ux_designer: {
        canonical: 'UX Designer',
        aliases: [
          'User Experience Designer', 'Experience Designer', 'Interaction Designer',
          'UX/UI Designer', 'Digital Designer', 'UX Specialist',
          'Usability Designer', 'User Interface Experience Designer'
        ],
      },
      ui_designer: {
        canonical: 'UI Designer',
        aliases: [
          'User Interface Designer', 'Visual Designer', 'Digital Designer',
          'Web Designer', 'App Designer', 'Interface Designer', 'GUI Designer',
          'Visual UI Designer'
        ],
      },
      product_designer_design: {
        canonical: 'Product Designer',
        aliases: [
          'Digital Product Designer', 'UX Product Designer', 'Full Stack Designer',
          'End-to-End Designer'
        ],
      },
      ux_researcher: {
        canonical: 'UX Researcher',
        aliases: [
          'User Researcher', 'Design Researcher', 'Usability Researcher',
          'User Experience Researcher', 'Research Designer', 'Customer Researcher',
          'UXR', 'Qualitative Researcher', 'Quantitative UX Researcher'
        ],
      },
      design_systems: {
        canonical: 'Design Systems Designer',
        aliases: [
          'Design Systems Engineer', 'Design Technologist', 'UI Engineer',
          'Design System Lead', 'Component Designer'
        ],
      },
      ux_writer: {
        canonical: 'UX Writer',
        aliases: [
          'Content Designer', 'UX Copywriter', 'Product Writer',
          'Conversation Designer', 'Voice Designer', 'Content Strategist',
          'Product Content Designer'
        ],
      },
      graphic_designer: {
        canonical: 'Graphic Designer',
        aliases: [
          'Brand Designer', 'Visual Designer', 'Marketing Designer',
          'Creative Designer', 'Digital Graphic Designer'
        ],
      },
      motion_designer: {
        canonical: 'Motion Designer',
        aliases: [
          'Animation Designer', 'Motion Graphics Designer', 'Video Designer',
          'After Effects Designer', 'Visual Effects Designer', 'VFX Artist'
        ],
      },
      service_designer: {
        canonical: 'Service Designer',
        aliases: [
          'Experience Designer', 'Customer Experience Designer', 'CX Designer'
        ],
      },
    },
  },

  // ===========================================================================
  // ENGINEERING MANAGEMENT
  // ===========================================================================
  engineering_management: {
    category: 'Engineering Management',
    displayName: 'Engineering Managers',
    icon: '👨‍💼',
    titles: {
      engineering_manager: {
        canonical: 'Engineering Manager',
        aliases: [
          'Software Engineering Manager', 'Development Manager', 'Team Lead',
          'Tech Lead Manager', 'EM', 'Software Development Manager', 'IT Manager',
          'R&D Manager', 'Engineering Team Lead'
        ],
      },
      tech_lead: {
        canonical: 'Tech Lead',
        aliases: [
          'Technical Lead', 'Team Technical Lead', 'Lead Engineer',
          'Lead Developer', 'Architect', 'Software Architect', 'Technical Architect',
          'TL', 'Technology Lead'
        ],
      },
      director_engineering: {
        canonical: 'Director of Engineering',
        aliases: [
          'Engineering Director', 'Director of Software Engineering',
          'Director of Development', 'Director of Technology', 'R&D Director',
          'Technology Director'
        ],
      },
      vp_engineering: {
        canonical: 'VP of Engineering',
        aliases: [
          'Vice President of Engineering', 'VP Engineering',
          'VP Software Engineering', 'VP Technology', 'VP Development',
          'VP R&D', 'Vice President Technology'
        ],
      },
      cto: {
        canonical: 'CTO',
        aliases: [
          'Chief Technology Officer', 'Chief Technical Officer',
          'Head of Technology', 'Head of Engineering', 'Co-Founder & CTO'
        ],
      },
      cio: {
        canonical: 'CIO',
        aliases: [
          'Chief Information Officer', 'Chief Information Technology Officer'
        ],
      },
    },
  },

  // ===========================================================================
  // PRODUCT LEADERSHIP
  // ===========================================================================
  product_leadership: {
    category: 'Product Leadership',
    displayName: 'Product Leaders',
    icon: '🎯',
    titles: {
      director_product: {
        canonical: 'Director of Product',
        aliases: [
          'Product Director', 'Director of Product Management',
          'Group Product Manager', 'GPM', 'Head of Product Management'
        ],
      },
      vp_product: {
        canonical: 'VP of Product',
        aliases: [
          'Vice President of Product', 'VP Product Management', 'VP Product',
          'Head of Product', 'VP Product Strategy'
        ],
      },
      cpo: {
        canonical: 'Chief Product Officer',
        aliases: [
          'CPO', 'Head of Product', 'Chief Product & Technology Officer', 'CPTO'
        ],
      },
    },
  },

  // ===========================================================================
  // DESIGN LEADERSHIP
  // ===========================================================================
  design_leadership: {
    category: 'Design Leadership',
    displayName: 'Design Leaders',
    icon: '✨',
    titles: {
      design_manager: {
        canonical: 'Design Manager',
        aliases: [
          'UX Manager', 'UI Manager', 'Design Lead', 'UX Lead',
          'Design Team Lead', 'Creative Manager'
        ],
      },
      director_design: {
        canonical: 'Director of Design',
        aliases: [
          'Design Director', 'Director of UX', 'Director of Product Design',
          'Creative Director', 'Director of User Experience'
        ],
      },
      vp_design: {
        canonical: 'VP of Design',
        aliases: [
          'Vice President of Design', 'VP UX', 'VP Product Design',
          'Head of Design', 'VP User Experience'
        ],
      },
      cdo: {
        canonical: 'Chief Design Officer',
        aliases: [
          'CDO', 'Chief Experience Officer', 'CXO', 'Head of Design'
        ],
      },
    },
  },

  // ===========================================================================
  // DATA LEADERSHIP
  // ===========================================================================
  data_leadership: {
    category: 'Data Leadership',
    displayName: 'Data Leaders',
    icon: '📈',
    titles: {
      data_manager: {
        canonical: 'Data Manager',
        aliases: [
          'Data Science Manager', 'Analytics Manager', 'Data Analytics Manager',
          'BI Manager', 'Data Engineering Manager'
        ],
      },
      director_data: {
        canonical: 'Director of Data',
        aliases: [
          'Data Director', 'Director of Data Science', 'Director of Analytics',
          'Director of Data Engineering', 'Director of Business Intelligence'
        ],
      },
      vp_data: {
        canonical: 'VP of Data',
        aliases: [
          'VP Data Science', 'VP Analytics', 'VP Data Engineering',
          'Head of Data', 'VP Business Intelligence'
        ],
      },
      chief_data_officer: {
        canonical: 'Chief Data Officer',
        aliases: [
          'CDO', 'Chief Analytics Officer', 'CAO', 'Chief Data & Analytics Officer'
        ],
      },
    },
  },

  // ===========================================================================
  // MARKETING & GROWTH
  // ===========================================================================
  marketing_growth: {
    category: 'Marketing & Growth',
    displayName: 'Marketing Professionals',
    icon: '📣',
    titles: {
      marketing_manager: {
        canonical: 'Marketing Manager',
        aliases: [
          'Digital Marketing Manager', 'Growth Marketing Manager',
          'Performance Marketing Manager', 'Brand Manager', 'Marketing Lead',
          'Online Marketing Manager', 'Paid Marketing Manager'
        ],
      },
      growth_manager: {
        canonical: 'Growth Manager',
        aliases: [
          'Growth Hacker', 'Head of Growth', 'Growth Lead',
          'User Acquisition Manager', 'Acquisition Manager', 'Growth Specialist',
          'Growth Marketing Lead'
        ],
      },
      content_marketer: {
        canonical: 'Content Marketing Manager',
        aliases: [
          'Content Manager', 'Content Strategist', 'Content Lead',
          'Editorial Manager', 'Blog Manager', 'Content Marketing Lead',
          'Content Writer', 'Content Editor'
        ],
      },
      seo_specialist: {
        canonical: 'SEO Specialist',
        aliases: [
          'SEO Manager', 'SEO Analyst', 'Search Engine Optimization Specialist',
          'SEM Specialist', 'Search Marketing Manager', 'SEO/SEM Specialist',
          'Organic Growth Manager'
        ],
      },
      social_media_manager: {
        canonical: 'Social Media Manager',
        aliases: [
          'Social Media Specialist', 'Community Manager', 'Social Media Coordinator',
          'Social Media Strategist', 'Social Media Lead'
        ],
      },
      demand_gen: {
        canonical: 'Demand Generation Manager',
        aliases: [
          'Demand Gen Manager', 'Lead Generation Manager', 'Pipeline Manager',
          'Marketing Operations Manager', 'Marketing Automation Manager'
        ],
      },
      cmo: {
        canonical: 'Chief Marketing Officer',
        aliases: [
          'CMO', 'VP Marketing', 'Head of Marketing', 'Marketing Director'
        ],
      },
    },
  },

  // ===========================================================================
  // SALES & CUSTOMER SUCCESS
  // ===========================================================================
  sales_customer_success: {
    category: 'Sales & Customer Success',
    displayName: 'Sales & CS Professionals',
    icon: '🤝',
    titles: {
      account_executive: {
        canonical: 'Account Executive',
        aliases: [
          'AE', 'Sales Representative', 'Sales Rep', 'Account Manager',
          'Sales Executive', 'Enterprise Account Executive', 'SMB Account Executive',
          'Inside Sales Representative', 'Field Sales Representative',
          'Strategic Account Executive', 'Mid-Market AE'
        ],
      },
      sdr: {
        canonical: 'Sales Development Representative',
        aliases: [
          'SDR', 'Business Development Representative', 'BDR',
          'Lead Development Representative', 'Outbound Sales Rep',
          'Inside Sales Rep', 'Sales Development Associate', 'Prospector'
        ],
      },
      customer_success: {
        canonical: 'Customer Success Manager',
        aliases: [
          'CSM', 'Client Success Manager', 'Customer Success Lead',
          'Account Success Manager', 'Customer Experience Manager',
          'Customer Relationship Manager', 'Client Manager'
        ],
      },
      solutions_consultant: {
        canonical: 'Solutions Consultant',
        aliases: [
          'Pre-Sales Consultant', 'Technical Account Manager', 'TAM',
          'Solutions Architect', 'Sales Engineer', 'Technical Sales',
          'Demo Engineer', 'POC Engineer'
        ],
      },
      sales_manager: {
        canonical: 'Sales Manager',
        aliases: [
          'Regional Sales Manager', 'Territory Manager', 'Sales Team Lead',
          'Sales Director', 'Area Sales Manager'
        ],
      },
      cro: {
        canonical: 'Chief Revenue Officer',
        aliases: [
          'CRO', 'VP Sales', 'Head of Sales', 'Chief Sales Officer', 'CSO'
        ],
      },
    },
  },

  // ===========================================================================
  // HUMAN RESOURCES & PEOPLE
  // ===========================================================================
  hr_people: {
    category: 'Human Resources & People',
    displayName: 'HR & People Professionals',
    icon: '👥',
    titles: {
      recruiter: {
        canonical: 'Recruiter',
        aliases: [
          'Technical Recruiter', 'Talent Acquisition Specialist', 'Sourcer',
          'Recruiting Coordinator', 'HR Recruiter', 'Campus Recruiter',
          'Executive Recruiter', 'Senior Recruiter', 'Talent Partner',
          'Engineering Recruiter', 'Tech Recruiter'
        ],
      },
      hr_manager: {
        canonical: 'HR Manager',
        aliases: [
          'Human Resources Manager', 'People Manager', 'HR Business Partner',
          'HRBP', 'People Partner', 'Employee Relations Manager',
          'People Operations Manager', 'People Team Manager'
        ],
      },
      people_ops: {
        canonical: 'People Operations Manager',
        aliases: [
          'People Ops', 'HR Operations Manager', 'People Operations Specialist',
          'People Ops Lead'
        ],
      },
      ta_manager: {
        canonical: 'Talent Acquisition Manager',
        aliases: [
          'TA Manager', 'Recruiting Manager', 'Head of Recruiting',
          'Head of Talent Acquisition', 'Talent Manager'
        ],
      },
      compensation: {
        canonical: 'Compensation Analyst',
        aliases: [
          'Compensation & Benefits Manager', 'Total Rewards Manager',
          'Benefits Manager', 'Comp & Ben Specialist', 'Rewards Analyst'
        ],
      },
      learning_development: {
        canonical: 'Learning & Development Manager',
        aliases: [
          'L&D Manager', 'Training Manager', 'Employee Development Manager',
          'Organizational Development Manager', 'Learning Manager'
        ],
      },
      chro: {
        canonical: 'Chief Human Resources Officer',
        aliases: [
          'CHRO', 'Chief People Officer', 'CPO', 'VP People', 'Head of People',
          'VP Human Resources'
        ],
      },
    },
  },

  // ===========================================================================
  // FINANCE & OPERATIONS
  // ===========================================================================
  finance_operations: {
    category: 'Finance & Operations',
    displayName: 'Finance & Ops Professionals',
    icon: '💰',
    titles: {
      financial_analyst: {
        canonical: 'Financial Analyst',
        aliases: [
          'FP&A Analyst', 'Finance Analyst', 'Business Finance Analyst',
          'Corporate Finance Analyst', 'Financial Planning Analyst'
        ],
      },
      controller: {
        canonical: 'Controller',
        aliases: [
          'Financial Controller', 'Accounting Manager', 'Finance Manager',
          'Corporate Controller'
        ],
      },
      operations_manager: {
        canonical: 'Operations Manager',
        aliases: [
          'Business Operations Manager', 'Ops Manager', 'Strategy & Operations Manager',
          'Chief of Staff', 'BizOps Manager', 'Operations Lead'
        ],
      },
      revenue_ops: {
        canonical: 'Revenue Operations Manager',
        aliases: [
          'RevOps Manager', 'Sales Operations Manager', 'GTM Operations Manager',
          'Go-to-Market Operations'
        ],
      },
      cfo: {
        canonical: 'Chief Financial Officer',
        aliases: [
          'CFO', 'VP Finance', 'Head of Finance', 'Finance Director'
        ],
      },
      coo: {
        canonical: 'Chief Operating Officer',
        aliases: [
          'COO', 'VP Operations', 'Head of Operations', 'Operations Director'
        ],
      },
    },
  },

  // ===========================================================================
  // LEGAL & COMPLIANCE
  // ===========================================================================
  legal_compliance: {
    category: 'Legal & Compliance',
    displayName: 'Legal Professionals',
    icon: '⚖️',
    titles: {
      legal_counsel: {
        canonical: 'Legal Counsel',
        aliases: [
          'Corporate Counsel', 'In-House Counsel', 'Attorney', 'Lawyer',
          'General Counsel', 'GC', 'Senior Counsel'
        ],
      },
      compliance_officer: {
        canonical: 'Compliance Officer',
        aliases: [
          'Compliance Manager', 'Regulatory Compliance Manager',
          'Privacy Officer', 'DPO', 'Data Protection Officer',
          'GDPR Officer', 'Compliance Specialist'
        ],
      },
      contracts_manager: {
        canonical: 'Contracts Manager',
        aliases: [
          'Contract Administrator', 'Commercial Contracts Manager',
          'Legal Operations Manager', 'Contracts Specialist'
        ],
      },
    },
  },

  // ===========================================================================
  // EXECUTIVE / C-SUITE
  // ===========================================================================
  executive: {
    category: 'Executive Leadership',
    displayName: 'Executives',
    icon: '👔',
    titles: {
      ceo: {
        canonical: 'CEO',
        aliases: [
          'Chief Executive Officer', 'Founder & CEO', 'Co-Founder & CEO',
          'President & CEO', 'Managing Director', 'General Manager'
        ],
      },
      president: {
        canonical: 'President',
        aliases: [
          'Company President', 'President & COO'
        ],
      },
      founder: {
        canonical: 'Founder',
        aliases: [
          'Co-Founder', 'Founding Partner', 'Co-Founder & CEO',
          'Founder & CEO'
        ],
      },
    },
  },

  // ===========================================================================
  // IT & TECHNICAL SUPPORT
  // ===========================================================================
  it_support: {
    category: 'IT & Technical Support',
    displayName: 'IT Professionals',
    icon: '🖥️',
    titles: {
      it_specialist: {
        canonical: 'IT Specialist',
        aliases: [
          'IT Technician', 'IT Support Specialist', 'IT Administrator',
          'Systems Administrator', 'Desktop Support', 'Help Desk Technician',
          'IT Analyst', 'IT Coordinator'
        ],
      },
      it_manager: {
        canonical: 'IT Manager',
        aliases: [
          'IT Director', 'Information Technology Manager',
          'IT Infrastructure Manager', 'IT Operations Manager'
        ],
      },
      helpdesk: {
        canonical: 'Help Desk Technician',
        aliases: [
          'Help Desk Support', 'IT Help Desk', 'Service Desk Analyst',
          'Technical Support Specialist', 'Tier 1 Support', 'L1 Support'
        ],
      },
    },
  },

  // ===========================================================================
  // CUSTOMER SUPPORT
  // ===========================================================================
  customer_support: {
    category: 'Customer Support',
    displayName: 'Support Professionals',
    icon: '🎧',
    titles: {
      customer_support_rep: {
        canonical: 'Customer Support Representative',
        aliases: [
          'Customer Service Representative', 'Support Agent',
          'Customer Care Representative', 'Customer Support Specialist',
          'Customer Service Agent', 'Support Specialist'
        ],
      },
      support_manager: {
        canonical: 'Support Manager',
        aliases: [
          'Customer Support Manager', 'Customer Service Manager',
          'Head of Support', 'Support Team Lead', 'CS Manager'
        ],
      },
      technical_support: {
        canonical: 'Technical Support Specialist',
        aliases: [
          'Technical Support Representative', 'Tech Support',
          'Product Support Specialist', 'Application Support'
        ],
      },
    },
  },

};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Build a reverse lookup map: alias -> { canonical, category, categoryKey, titleKey }
 */
function buildAliasMap() {
  const aliasMap = new Map();
  
  for (const [categoryKey, category] of Object.entries(JOB_CATEGORIES)) {
    for (const [titleKey, titleData] of Object.entries(category.titles)) {
      const entry = {
        canonical: titleData.canonical,
        category: category.category,
        categoryKey,
        titleKey,
        displayName: category.displayName,
        icon: category.icon,
      };
      
      // Add canonical title
      aliasMap.set(titleData.canonical.toLowerCase(), entry);
      
      // Add all aliases
      for (const alias of titleData.aliases) {
        aliasMap.set(alias.toLowerCase(), entry);
      }
    }
  }
  
  return aliasMap;
}

const ALIAS_MAP = buildAliasMap();

/**
 * Normalize a job title by mapping aliases to canonical titles
 */
function normalizeJobTitle(rawTitle) {
  if (!rawTitle) return null;
  
  const lowerTitle = rawTitle.toLowerCase().trim();
  
  // Try exact match first
  if (ALIAS_MAP.has(lowerTitle)) {
    return ALIAS_MAP.get(lowerTitle);
  }
  
  // Try partial match - check if any alias is contained in the title
  for (const [alias, entry] of ALIAS_MAP.entries()) {
    if (lowerTitle.includes(alias) || alias.includes(lowerTitle)) {
      return entry;
    }
  }
  
  return null; // Unknown title
}

/**
 * Detect seniority level from job title
 */
function detectSeniority(rawTitle) {
  if (!rawTitle) return SENIORITY_LEVELS.mid;
  
  const lowerTitle = rawTitle.toLowerCase();
  
  // Check from most senior to least senior (order matters!)
  const orderedChecks = [
    'c_level', 'evp', 'svp', 'vp', 'senior_director', 'director',
    'senior_manager', 'manager', 'lead', 'fellow', 'distinguished',
    'senior_principal', 'principal', 'senior_staff', 'staff', 'senior',
    'mid_senior', 'mid', 'junior', 'entry', 'intern'
  ];
  
  for (const level of orderedChecks) {
    for (const keyword of SENIORITY_KEYWORDS[level]) {
      // Word boundary check for more accurate matching
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lowerTitle)) {
        return {
          level,
          ...SENIORITY_LEVELS[level],
        };
      }
    }
  }
  
  // Default to mid-level if not specified
  return {
    level: 'mid',
    ...SENIORITY_LEVELS.mid,
  };
}

/**
 * Calculate percentile tier based on score
 * Uses default thresholds when insufficient data
 */
function calculatePercentileTier(score, categoryStats = null) {
  // If we have sufficient data, use actual percentiles
  if (categoryStats && categoryStats.totalUsers >= MIN_USERS_FOR_REAL_PERCENTILE) {
    const percentile = calculateActualPercentile(score, categoryStats.scores);
    for (const tier of PERCENTILE_TIERS) {
      if (percentile >= tier.minPercentile) {
        return { ...tier, percentile };
      }
    }
  }
  
  // Use default thresholds (cold start)
  for (const tier of PERCENTILE_TIERS) {
    const threshold = DEFAULT_SCORE_THRESHOLDS[tier.tier];
    if (threshold !== undefined && score >= threshold) {
      return { ...tier, usingDefaults: true };
    }
  }
  
  return { 
    ...PERCENTILE_TIERS[PERCENTILE_TIERS.length - 1], 
    usingDefaults: true 
  };
}

/**
 * Calculate actual percentile from score distribution
 */
function calculateActualPercentile(score, allScores) {
  if (!allScores || allScores.length === 0) return 50;
  
  const sortedScores = [...allScores].sort((a, b) => a - b);
  const position = sortedScores.filter(s => s < score).length;
  return Math.round((position / sortedScores.length) * 100);
}

/**
 * Get default average scores for a category (cold start)
 * Returns both individual category averages and overall average
 */
function getDefaultAverages() {
  return {
    categoryAverages: { ...DEFAULT_CATEGORY_AVERAGES },
    overallAverage: DEFAULT_OVERALL_AVERAGE,
  };
}

/**
 * Get average score for a specific skill category
 * @param {string} category - The skill category (e.g., 'teamwork', 'communication')
 * @param {object} realAverages - Optional real averages from database
 * @returns {number} The average score for that category
 */
function getCategoryAverage(category, realAverages = null) {
  // If we have real data with enough samples, use it
  if (realAverages && realAverages[category] && realAverages.sampleSize >= MIN_USERS_FOR_REAL_PERCENTILE) {
    return realAverages[category];
  }
  
  // Otherwise use default
  return DEFAULT_CATEGORY_AVERAGES[category] || DEFAULT_OVERALL_AVERAGE;
}

/**
 * Generate display text for percentile
 * @example "Top 10% of Product Managers"
 */
function getPercentileDisplayText(tier, normalizedTitle) {
  if (!normalizedTitle) {
    return tier.tier;
  }
  
  // Pluralize the canonical title
  let plural = normalizedTitle.canonical;
  if (!plural.endsWith('s')) {
    plural += 's';
  }
  
  return `${tier.tier} of ${plural}`;
}

/**
 * Get display name for a job title (pluralized for comparison)
 */
function getDisplayNameForRole(rawTitle) {
  const normalized = normalizeJobTitle(rawTitle);
  if (normalized) {
    return normalized.displayName;
  }
  
  // Fallback: just pluralize the raw title
  if (rawTitle && !rawTitle.endsWith('s')) {
    return rawTitle + 's';
  }
  return rawTitle || 'Professionals';
}

/**
 * Get all titles for a category (for dropdown/autocomplete)
 */
function getTitlesForCategory(categoryKey) {
  const category = JOB_CATEGORIES[categoryKey];
  if (!category) return [];
  
  const titles = [];
  for (const [titleKey, titleData] of Object.entries(category.titles)) {
    titles.push({
      canonical: titleData.canonical,
      key: titleKey,
      aliases: titleData.aliases,
    });
  }
  return titles;
}

/**
 * Get all categories with their titles
 */
function getAllCategoriesWithTitles() {
  const result = [];
  for (const [categoryKey, category] of Object.entries(JOB_CATEGORIES)) {
    result.push({
      key: categoryKey,
      category: category.category,
      displayName: category.displayName,
      icon: category.icon,
      titles: getTitlesForCategory(categoryKey),
    });
  }
  return result;
}

/**
 * Search titles by query (for autocomplete)
 */
function searchTitles(query, limit = 10) {
  if (!query) return [];
  
  const lowerQuery = query.toLowerCase();
  const results = [];
  const seen = new Set();
  
  for (const [alias, entry] of ALIAS_MAP.entries()) {
    if (alias.includes(lowerQuery) && !seen.has(entry.canonical)) {
      seen.add(entry.canonical);
      results.push(entry);
      if (results.length >= limit) break;
    }
  }
  
  return results;
}

// =============================================================================
// STATISTICS
// =============================================================================

function getStatistics() {
  let totalCategories = 0;
  let totalTitles = 0;
  let totalAliases = 0;
  
  for (const [, category] of Object.entries(JOB_CATEGORIES)) {
    totalCategories++;
    for (const [, titleData] of Object.entries(category.titles)) {
      totalTitles++;
      totalAliases += titleData.aliases.length;
    }
  }
  
  return {
    totalCategories,
    totalTitles,
    totalAliases,
    totalSearchable: totalTitles + totalAliases,
    percentileTiers: PERCENTILE_TIERS.length,
    seniorityLevels: Object.keys(SENIORITY_LEVELS).length,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  // Data
  PERCENTILE_TIERS,
  DEFAULT_SCORE_THRESHOLDS,
  DEFAULT_CATEGORY_AVERAGES,
  DEFAULT_OVERALL_AVERAGE,
  SENIORITY_LEVELS,
  SENIORITY_KEYWORDS,
  JOB_CATEGORIES,
  ALIAS_MAP,
  MIN_USERS_FOR_REAL_PERCENTILE,
  
  // Functions
  normalizeJobTitle,
  detectSeniority,
  calculatePercentileTier,
  calculateActualPercentile,
  getDefaultAverages,
  getCategoryAverage,
  getPercentileDisplayText,
  getDisplayNameForRole,
  getTitlesForCategory,
  getAllCategoriesWithTitles,
  searchTitles,
  
  // Statistics
  getStatistics,
};

// Print statistics when run directly
if (require.main === module) {
  const stats = getStatistics();
  console.log('\n📊 ESTIMATE Job Titles System Statistics:');
  console.log('==========================================');
  console.log(`📁 Total Categories: ${stats.totalCategories}`);
  console.log(`🏷️  Total Job Titles: ${stats.totalTitles}`);
  console.log(`🔗 Total Aliases: ${stats.totalAliases}`);
  console.log(`🔍 Total Searchable Terms: ${stats.totalSearchable}`);
  console.log(`📈 Percentile Tiers: ${stats.percentileTiers}`);
  console.log(`⬆️  Seniority Levels: ${stats.seniorityLevels}`);
  console.log('==========================================\n');
}
