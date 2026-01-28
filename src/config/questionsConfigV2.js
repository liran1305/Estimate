/**
 * ESTIMATE V2 Question Framework
 * 
 * Visibility-Based + AI-Era Relevant Questions
 * Questions are selected based on:
 * 1. Relationship type (what the reviewer can actually observe)
 * 2. Reviewee's role (position-specific questions for direct/report relationships)
 * 
 * Total: 77 questions across 10 role categories
 */

// =============================================================================
// RELATIONSHIP TYPES - What each relationship can observe
// =============================================================================

export const RELATIONSHIP_TYPES = {
  direct_colleague: {
    id: 'direct_colleague',
    label: 'Direct Colleague',
    description: 'Worked alongside them daily',
    canObserve: [
      'day-to-day reliability',
      'how they handle mistakes',
      'communication in meetings/slack',
      'whether they help others',
      'disagreement handling',
      'learning speed',
      'AI tool usage'
    ],
    cannotObserve: [
      'how they manage people',
      'performance reviews',
      'strategic decision-making (unless senior)'
    ],
    estimatedTime: '3 min',
    totalQuestions: '11-14'
  },
  manager: {
    id: 'manager',
    label: 'They Were My Manager',
    description: 'I reported to them',
    canObserve: [
      'leadership and decision-making style',
      'pressure/crisis handling',
      'people development',
      'feedback quality',
      'team protection vs blame',
      'obstacle removal'
    ],
    cannotObserve: [
      'peer-level collaboration',
      'relationship with their own manager'
    ],
    estimatedTime: '3 min',
    totalQuestions: '11-13'
  },
  report: {
    id: 'report',
    label: 'They Reported To Me',
    description: 'I managed them',
    canObserve: [
      'how much direction they need',
      'response to feedback',
      'problems vs solutions approach',
      'growth over time',
      'initiative and proactivity',
      'ambiguity handling'
    ],
    cannotObserve: [
      'peer collaboration',
      'cross-functional influence'
    ],
    estimatedTime: '3 min',
    totalQuestions: '12-14'
  },
  cross_team: {
    id: 'cross_team',
    label: 'Cross-Team Collaboration',
    description: 'Worked with them across team boundaries',
    canObserve: [
      'delivery on commitments',
      'responsiveness',
      'understanding your needs',
      'politics/territory behavior',
      'professionalism'
    ],
    cannotObserve: [
      'daily work habits',
      'mistake handling',
      'manager relationship',
      'internal team dynamics'
    ],
    estimatedTime: '2 min',
    totalQuestions: '8-10'
  },
  occasional: {
    id: 'occasional',
    label: 'Occasional / Other Professional',
    description: 'Limited direct interaction',
    canObserve: [
      'professional impression',
      'communication clarity',
      'meeting demeanor',
      'desire to work together more'
    ],
    cannotObserve: [
      'almost everything about actual work'
    ],
    estimatedTime: '1 min',
    totalQuestions: '5'
  }
};

// =============================================================================
// ROLE FAMILIES - For role-specific questions
// =============================================================================

export const ROLE_FAMILIES = {
  product_management: {
    id: 'product_management',
    label: 'Product Management',
    aliases: ['product manager', 'pm', 'product lead', 'product owner', 'technical pm', 'tpm'],
    questionCount: 5
  },
  software_engineering: {
    id: 'software_engineering',
    label: 'Software Engineering',
    aliases: ['software engineer', 'developer', 'frontend', 'backend', 'fullstack', 'swe', 'programmer'],
    questionCount: 5
  },
  engineering_management: {
    id: 'engineering_management',
    label: 'Engineering Management',
    aliases: ['engineering manager', 'em', 'tech lead', 'team lead', 'director of engineering', 'vp engineering'],
    questionCount: 5
  },
  design: {
    id: 'design',
    label: 'Design',
    aliases: ['designer', 'ux', 'ui', 'product designer', 'ux designer', 'ui designer', 'visual designer'],
    questionCount: 5
  },
  data_analytics: {
    id: 'data_analytics',
    label: 'Data & Analytics',
    aliases: ['data analyst', 'data scientist', 'analytics', 'bi analyst', 'data engineer'],
    questionCount: 4
  },
  sales: {
    id: 'sales',
    label: 'Sales',
    aliases: ['sales', 'account executive', 'ae', 'sdr', 'bdr', 'sales manager', 'account manager'],
    questionCount: 4
  },
  customer_success: {
    id: 'customer_success',
    label: 'Customer Success',
    aliases: ['customer success', 'csm', 'cs manager', 'account manager', 'client success'],
    questionCount: 4
  },
  marketing: {
    id: 'marketing',
    label: 'Marketing',
    aliases: ['marketing', 'growth', 'content', 'demand gen', 'product marketing', 'pmm'],
    questionCount: 4
  },
  operations: {
    id: 'operations',
    label: 'Operations',
    aliases: ['operations', 'ops', 'project manager', 'program manager', 'business operations'],
    questionCount: 4
  },
  people_hr: {
    id: 'people_hr',
    label: 'People/HR',
    aliases: ['hr', 'people', 'talent', 'recruiter', 'people ops', 'human resources'],
    questionCount: 4
  },
  general: {
    id: 'general',
    label: 'General Professional',
    aliases: [],
    questionCount: 0
  }
};

// =============================================================================
// UNIVERSAL QUESTIONS - Asked for ALL relationships (4 questions)
// =============================================================================

export const UNIVERSAL_QUESTIONS = [
  {
    id: 'U1',
    key: 'would_work_again',
    question: 'Would you want to work with [Name] again?',
    type: 'emoji_scale',
    options: [
      { value: 1, label: 'Prefer not', emoji: '😬' },
      { value: 2, label: 'Maybe', emoji: '😐' },
      { value: 3, label: 'Sure', emoji: '🙂' },
      { value: 4, label: 'Gladly', emoji: '😊' },
      { value: 5, label: 'Absolutely!', emoji: '🤩' }
    ],
    weight: 'high',
    mapsTo: 'work_again_pct',
    forRelationships: ['direct_colleague', 'manager', 'report', 'cross_team', 'occasional']
  },
  {
    id: 'U2',
    key: 'recommendation_strength',
    question: 'How strongly would you recommend [Name] to a hiring manager?',
    type: 'single_choice',
    options: [
      { value: 1, label: "I wouldn't recommend them" },
      { value: 2, label: 'Weak recommendation - with reservations' },
      { value: 3, label: 'Solid recommendation' },
      { value: 4, label: 'Strong recommendation' },
      { value: 5, label: 'One of the best people I\'ve worked with' }
    ],
    weight: 'high',
    mapsTo: 'recommendation_score',
    forRelationships: ['direct_colleague', 'manager', 'report', 'cross_team']
  },
  {
    id: 'U3',
    key: 'pressure_test',
    question: 'Would you want [Name] on your team during a crisis or tough project?',
    type: 'single_choice',
    options: [
      { value: 1, label: "I'd prefer someone else" },
      { value: 2, label: "They'd be okay" },
      { value: 3, label: "Yes - they're reliable under pressure" },
      { value: 4, label: "Absolutely - they're who I'd want beside me" }
    ],
    weight: 'high',
    mapsTo: 'pressure_test_pct',
    forRelationships: ['direct_colleague', 'manager', 'report', 'cross_team']
  },
  {
    id: 'U4',
    key: 'overall_ranking',
    question: 'Compared to others in similar roles you\'ve worked with, where does [Name] rank?',
    type: 'single_choice',
    options: [
      { value: 1, label: 'Bottom 25%' },
      { value: 2, label: 'Average' },
      { value: 3, label: 'Above average' },
      { value: 4, label: 'Top 25%' },
      { value: 5, label: 'Top 10% - exceptional' }
    ],
    weight: 'high',
    mapsTo: 'role_percentile',
    forRelationships: ['direct_colleague', 'manager', 'report', 'cross_team']
  }
];

// =============================================================================
// AI-ERA QUESTIONS - 2025/2026+ Relevant (4 questions)
// =============================================================================

export const AI_ERA_QUESTIONS = [
  {
    id: 'AI1',
    key: 'ai_tool_adoption',
    question: 'How does [Name] approach new AI tools (ChatGPT, Copilot, Claude, etc.)?',
    type: 'single_choice',
    options: [
      { value: 1, label: 'Avoids or resists them' },
      { value: 2, label: 'Uses them minimally when required' },
      { value: 3, label: 'Uses them regularly for routine tasks' },
      { value: 4, label: 'Power user - finds creative applications' },
      { value: 0, label: "Haven't observed this", skip: true }
    ],
    weight: 'medium',
    mapsTo: 'ai_ready',
    forRelationships: ['direct_colleague', 'manager', 'report', 'cross_team']
  },
  {
    id: 'AI2',
    key: 'ai_judgment',
    question: 'When AI tools produce output, does [Name] know when to trust it vs. verify it?',
    type: 'single_choice',
    options: [
      { value: 1, label: 'Trusts AI output too much without checking' },
      { value: 2, label: "Doesn't trust AI at all (wastes time re-doing)" },
      { value: 3, label: 'Good judgment - knows when to verify' },
      { value: 4, label: 'Excellent judgment - catches AI errors others miss' },
      { value: 0, label: "Haven't observed this", skip: true }
    ],
    weight: 'medium',
    mapsTo: 'ai_ready',
    forRelationships: ['direct_colleague', 'manager', 'report']
  },
  {
    id: 'AI3',
    key: 'learning_velocity',
    question: 'When something new is introduced (tool, process, domain), how quickly does [Name] get up to speed?',
    type: 'single_choice',
    options: [
      { value: 1, label: 'Slower than most - needs significant support' },
      { value: 2, label: 'Average pace' },
      { value: 3, label: 'Faster than most' },
      { value: 4, label: 'Remarkably fast - often teaches others within days' }
    ],
    weight: 'medium',
    mapsTo: 'learns_fast',
    forRelationships: ['direct_colleague', 'manager', 'report']
  },
  {
    id: 'AI4',
    key: 'ambiguity_handling',
    question: 'When requirements are unclear or keep changing, how does [Name] respond?',
    type: 'single_choice',
    options: [
      { value: 1, label: 'Gets frustrated or stuck waiting for clarity' },
      { value: 2, label: 'Asks lots of questions but struggles to move forward' },
      { value: 3, label: 'Makes reasonable assumptions and progresses' },
      { value: 4, label: 'Creates clarity for the whole team - turns chaos into structure' }
    ],
    weight: 'medium',
    mapsTo: 'figures_out',
    forRelationships: ['direct_colleague', 'manager', 'report', 'cross_team']
  }
];

// =============================================================================
// RELATIONSHIP-SPECIFIC QUESTIONS
// =============================================================================

export const RELATIONSHIP_QUESTIONS = {
  direct_colleague: [
    { id: 'DC1', key: 'reliability', question: 'How reliable is [Name] when others depend on them?', type: 'single_choice', options: [{ value: 1, label: 'Required multiple follow-ups' }, { value: 2, label: 'Often late or incomplete' }, { value: 3, label: 'Delivered on time' }, { value: 4, label: 'Delivered early or beyond' }], weight: 'medium', mapsTo: 'owns_it' },
    { id: 'DC2', key: 'handling_mistakes', question: 'When [Name] made a mistake, how did they handle it?', type: 'single_choice', options: [{ value: 1, label: 'Deflected blame' }, { value: 2, label: 'Acknowledged quietly' }, { value: 3, label: 'Owned and fixed it' }, { value: 4, label: 'Owned, fixed, prevented recurrence' }], weight: 'medium', mapsTo: 'owns_it' },
    { id: 'DC3', key: 'disagreement_handling', question: 'When you disagreed with [Name], how did they handle it?', type: 'single_choice', options: [{ value: 1, label: 'Avoided or got defensive' }, { value: 2, label: 'Pushed without listening' }, { value: 3, label: 'Found common ground' }, { value: 4, label: 'Made outcome better' }], weight: 'medium', mapsTo: 'gets_buyin' },
    { id: 'DC4', key: 'helping_others', question: 'Did [Name] help teammates beyond their responsibilities?', type: 'single_choice', options: [{ value: 1, label: 'Rarely' }, { value: 2, label: 'When asked' }, { value: 3, label: 'Often willing' }, { value: 4, label: 'Went out of their way' }], weight: 'medium', mapsTo: 'gets_buyin' },
    { id: 'DC5', key: 'intellectual_honesty', question: "When [Name] didn't know something, how did they handle it?", type: 'single_choice', options: [{ value: 1, label: 'Pretended to know' }, { value: 2, label: 'Figured out alone slowly' }, { value: 3, label: 'Asked openly' }, { value: 4, label: 'Asked and learned fast' }], weight: 'medium', mapsTo: 'learns_fast' }
  ],
  manager: [
    { id: 'MG1', key: 'development', question: 'Did working for [Name] help you grow professionally?', type: 'single_choice', options: [{ value: 1, label: 'Felt stuck' }, { value: 2, label: 'Minimal' }, { value: 3, label: 'Somewhat' }, { value: 4, label: 'Grew significantly' }, { value: 5, label: 'Best manager for growth' }], weight: 'high', mapsTo: 'develops_people' },
    { id: 'MG2', key: 'pressure_handling', question: 'How did [Name] behave under pressure?', type: 'single_choice', options: [{ value: 1, label: 'Panicked' }, { value: 2, label: 'Took it out on team' }, { value: 3, label: 'Stayed calm' }, { value: 4, label: 'Calm and motivating' }], weight: 'high', mapsTo: 'pressure_handling' },
    { id: 'MG3', key: 'protection_vs_blame', question: 'When team made a mistake, how did [Name] respond?', type: 'single_choice', options: [{ value: 1, label: 'Blamed publicly' }, { value: 2, label: 'Distanced themselves' }, { value: 3, label: 'Took responsibility' }, { value: 4, label: 'Protected and fixed' }], weight: 'high', mapsTo: 'owns_it' },
    { id: 'MG4', key: 'giving_feedback', question: 'Did [Name] give honest, useful feedback?', type: 'single_choice', options: [{ value: 1, label: 'Avoided difficult talks' }, { value: 2, label: 'Superficial only' }, { value: 3, label: 'Yes but not actionable' }, { value: 4, label: 'Direct and helpful' }], weight: 'medium', mapsTo: 'develops_people' },
    { id: 'MG5', key: 'removing_obstacles', question: 'Did [Name] clear obstacles for you?', type: 'single_choice', options: [{ value: 1, label: 'Created obstacles' }, { value: 2, label: 'Rarely' }, { value: 3, label: 'When escalated' }, { value: 4, label: 'Proactively' }], weight: 'medium', mapsTo: 'gets_buyin' },
    { id: 'MG6', key: 'decision_making', question: 'How did [Name] make team decisions?', type: 'single_choice', options: [{ value: 1, label: 'Slow/indecisive' }, { value: 2, label: 'Too fast' }, { value: 3, label: 'Reasonable' }, { value: 4, label: 'Excellent with input' }], weight: 'medium', mapsTo: 'figures_out' }
  ],
  report: [
    { id: 'RP1', key: 'independence', question: 'How much direction did [Name] need?', type: 'single_choice', options: [{ value: 1, label: 'Constant' }, { value: 2, label: 'Significant' }, { value: 3, label: 'Normal' }, { value: 4, label: 'Minimal - self-driven' }], weight: 'medium', mapsTo: 'owns_it' },
    { id: 'RP2', key: 'coachability', question: 'How did [Name] respond to feedback?', type: 'single_choice', options: [{ value: 1, label: 'Got defensive' }, { value: 2, label: 'Accepted but no change' }, { value: 3, label: 'Improved' }, { value: 4, label: 'Sought feedback actively' }], weight: 'medium', mapsTo: 'learns_fast' },
    { id: 'RP3', key: 'problems_vs_solutions', question: 'When [Name] hit a problem, they...', type: 'single_choice', options: [{ value: 1, label: 'Brought only problems' }, { value: 2, label: 'Vague ideas' }, { value: 3, label: 'Brought solutions' }, { value: 4, label: 'Handled themselves' }], weight: 'medium', mapsTo: 'owns_it' },
    { id: 'RP4', key: 'ambiguity_response', question: 'How did [Name] handle ambiguity?', type: 'single_choice', options: [{ value: 1, label: 'Struggled' }, { value: 2, label: 'Needed guidance' }, { value: 3, label: 'Made assumptions' }, { value: 4, label: 'Created clarity' }], weight: 'medium', mapsTo: 'figures_out' },
    { id: 'RP5', key: 'growth_over_time', question: 'How much did [Name] grow under you?', type: 'single_choice', options: [{ value: 1, label: 'Limited' }, { value: 2, label: 'Some' }, { value: 3, label: 'Good' }, { value: 4, label: 'Exceptional' }], weight: 'medium', mapsTo: 'learns_fast' },
    { id: 'RP6', key: 'rehire', question: 'Would you hire [Name] again?', type: 'single_choice', options: [{ value: 1, label: 'No' }, { value: 2, label: 'Probably not' }, { value: 3, label: 'Maybe' }, { value: 4, label: 'Yes' }, { value: 5, label: 'Absolutely' }], weight: 'high', mapsTo: 'work_again_pct' }
  ],
  cross_team: [
    { id: 'CT1', key: 'delivery_on_commitments', question: 'Did [Name] deliver on commitments to your team?', type: 'single_choice', options: [{ value: 1, label: 'Missed often' }, { value: 2, label: 'Needed follow-ups' }, { value: 3, label: 'Reliably' }, { value: 4, label: 'Over-delivered' }], weight: 'medium', mapsTo: 'owns_it' },
    { id: 'CT2', key: 'responsiveness', question: 'How responsive was [Name]?', type: 'single_choice', options: [{ value: 1, label: 'Unresponsive' }, { value: 2, label: 'Slow' }, { value: 3, label: 'Reasonable' }, { value: 4, label: 'Highly responsive' }], weight: 'medium', mapsTo: 'owns_it' },
    { id: 'CT3', key: 'understanding_needs', question: 'Did [Name] understand your team needs?', type: 'single_choice', options: [{ value: 1, label: 'No - own priorities only' }, { value: 2, label: 'With explanation' }, { value: 3, label: 'Yes' }, { value: 4, label: 'Anticipated needs' }], weight: 'medium', mapsTo: 'gets_buyin' },
    { id: 'CT4', key: 'cross_team_dynamics', question: 'How was working with [Name] across teams?', type: 'single_choice', options: [{ value: 1, label: 'Difficult - politics' }, { value: 2, label: 'Some friction' }, { value: 3, label: 'Smooth' }, { value: 4, label: 'Exceptional' }], weight: 'medium', mapsTo: 'gets_buyin' },
    { id: 'CT5', key: 'communication_clarity', question: 'How clearly did [Name] communicate?', type: 'single_choice', options: [{ value: 1, label: 'Poorly' }, { value: 2, label: 'Okay' }, { value: 3, label: 'Clearly' }, { value: 4, label: 'Excellently' }], weight: 'medium', mapsTo: 'gets_buyin' }
  ],
  occasional: [
    { id: 'OC1', key: 'professional_impression', question: "What's your impression of [Name]?", type: 'single_choice', options: [{ value: 1, label: 'Negative' }, { value: 2, label: 'Neutral' }, { value: 3, label: 'Positive' }, { value: 4, label: 'Very positive' }], weight: 'low', mapsTo: 'general_impression' },
    { id: 'OC2', key: 'communication_quality', question: 'How did [Name] communicate?', type: 'single_choice', options: [{ value: 1, label: 'Poorly' }, { value: 2, label: 'Adequately' }, { value: 3, label: 'Well' }, { value: 4, label: 'Excellently' }], weight: 'low', mapsTo: 'gets_buyin' },
    { id: 'OC3', key: 'would_want_more', question: 'Would you want to work with [Name] more?', type: 'single_choice', options: [{ value: 1, label: 'No' }, { value: 2, label: 'Neutral' }, { value: 3, label: 'Yes' }, { value: 4, label: 'Definitely' }], weight: 'low', mapsTo: 'work_again_pct' }
  ]
};

// =============================================================================
// ROLE-SPECIFIC QUESTIONS - Only for direct_colleague, manager, report
// =============================================================================

export const ROLE_SPECIFIC_QUESTIONS = {
  product_management: [
    { id: 'PM1', key: 'stakeholder_alignment', question: 'How effective was [Name] at getting alignment across stakeholders?', forRelationships: ['direct_colleague', 'manager', 'report', 'cross_team'], options: [{ value: 1, label: 'Struggled' }, { value: 2, label: 'Adequate' }, { value: 3, label: 'Good' }, { value: 4, label: 'Exceptional' }], mapsTo: 'gets_buyin' },
    { id: 'PM2', key: 'decision_under_uncertainty', question: 'How did [Name] make decisions with incomplete information?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Avoided deciding' }, { value: 2, label: 'Often reversed' }, { value: 3, label: 'Reasonable' }, { value: 4, label: 'Excellent calls' }], mapsTo: 'figures_out' },
    { id: 'PM3', key: 'saying_no', question: 'How did [Name] handle requests they had to decline?', forRelationships: ['direct_colleague', 'manager', 'report', 'cross_team'], options: [{ value: 1, label: "Couldn't say no" }, { value: 2, label: 'Created friction' }, { value: 3, label: 'Respectfully' }, { value: 4, label: 'Stakeholders appreciated' }], mapsTo: 'gets_buyin' },
    { id: 'PM4', key: 'ai_for_pm', question: 'Does [Name] use AI for PM work (research, specs, analysis)?', forRelationships: ['direct_colleague', 'report'], options: [{ value: 1, label: "Doesn't use" }, { value: 2, label: 'Basic' }, { value: 3, label: 'Good' }, { value: 4, label: 'Advanced' }, { value: 0, label: "Can't observe", skip: true }], mapsTo: 'ai_ready' },
    { id: 'PM5', key: 'signal_vs_noise', question: 'Does [Name] focus the team on what actually matters?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Everything equal' }, { value: 2, label: 'Sometimes' }, { value: 3, label: 'Usually' }, { value: 4, label: 'Exceptional' }], mapsTo: 'figures_out' }
  ],
  software_engineering: [
    { id: 'ENG1', key: 'ai_assisted_dev', question: 'How does [Name] work with AI coding tools (Copilot, Claude, Cursor)?', forRelationships: ['direct_colleague', 'report'], options: [{ value: 1, label: "Doesn't use" }, { value: 2, label: "Doesn't review output" }, { value: 3, label: 'Reviews well' }, { value: 4, label: 'Expert usage' }, { value: 0, label: "Can't observe", skip: true }], mapsTo: 'ai_ready' },
    { id: 'ENG2', key: 'code_review_quality', question: "How valuable were [Name]'s code reviews?", forRelationships: ['direct_colleague', 'report'], options: [{ value: 1, label: 'Unhelpful' }, { value: 2, label: 'Adequate' }, { value: 3, label: 'Good' }, { value: 4, label: 'Everyone learned' }, { value: 0, label: "Didn't observe", skip: true }], mapsTo: 'develops_people' },
    { id: 'ENG3', key: 'technical_communication', question: 'How well did [Name] explain technical concepts to non-technical people?', forRelationships: ['direct_colleague', 'manager', 'report', 'cross_team'], options: [{ value: 1, label: 'Poorly' }, { value: 2, label: 'With difficulty' }, { value: 3, label: 'Well' }, { value: 4, label: 'Excellently' }], mapsTo: 'gets_buyin' },
    { id: 'ENG4', key: 'production_ownership', question: 'When there was a production incident, how did [Name] respond?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Hard to reach' }, { value: 2, label: 'Helped when asked' }, { value: 3, label: 'Jumped in' }, { value: 4, label: 'Led and taught' }], mapsTo: 'owns_it' },
    { id: 'ENG5', key: 'architectural_judgment', question: "How sound were [Name]'s technical decisions?", forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Caused problems' }, { value: 2, label: 'Adequate' }, { value: 3, label: 'Good' }, { value: 4, label: 'Excellent' }, { value: 0, label: "Didn't observe", skip: true }], mapsTo: 'figures_out' }
  ],
  engineering_management: [
    { id: 'EM1', key: 'developing_people', question: 'Did engineers on [Name]\'s team grow professionally?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Stagnated' }, { value: 2, label: 'Some growth' }, { value: 3, label: 'Solid' }, { value: 4, label: 'Exceptional' }], mapsTo: 'develops_people' },
    { id: 'EM2', key: 'ai_transformation', question: 'How well does [Name] help their team adapt to AI tools?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Resists' }, { value: 2, label: 'Leaves to individuals' }, { value: 3, label: 'Encourages' }, { value: 4, label: 'Leads transformation' }, { value: 0, label: "Can't observe", skip: true }], mapsTo: 'ai_ready' },
    { id: 'EM3', key: 'shielding_team', question: 'Did [Name] protect their team from distractions and politics?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Constantly disrupted' }, { value: 2, label: 'Sometimes' }, { value: 3, label: 'Usually' }, { value: 4, label: 'Team could focus' }], mapsTo: 'gets_buyin' },
    { id: 'EM4', key: 'handling_conflict', question: 'When there was conflict, how did [Name] handle it?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Avoided' }, { value: 2, label: 'Made worse' }, { value: 3, label: 'Professionally' }, { value: 4, label: 'Resolved constructively' }], mapsTo: 'gets_buyin' },
    { id: 'EM5', key: 'desirability', question: "Do engineers want to be on [Name]'s team?", forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Avoid' }, { value: 2, label: 'Neutral' }, { value: 3, label: 'Generally yes' }, { value: 4, label: 'Ask to join' }], mapsTo: 'develops_people' }
  ],
  design: [
    { id: 'DES1', key: 'ai_in_design', question: 'How does [Name] incorporate AI tools into design workflow?', forRelationships: ['direct_colleague', 'report'], options: [{ value: 1, label: "Doesn't use" }, { value: 2, label: 'Basic' }, { value: 3, label: 'Good' }, { value: 4, label: 'Advanced' }, { value: 0, label: "Can't observe", skip: true }], mapsTo: 'ai_ready' },
    { id: 'DES2', key: 'receiving_critique', question: 'How did [Name] respond to design feedback?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Defensively' }, { value: 2, label: "Didn't adapt" }, { value: 3, label: 'Improved work' }, { value: 4, label: 'Actively sought' }], mapsTo: 'learns_fast' },
    { id: 'DES3', key: 'research_foundation', question: "Was [Name]'s design work grounded in user research?", forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Rarely' }, { value: 2, label: 'Sometimes' }, { value: 3, label: 'Usually' }, { value: 4, label: 'Always' }], mapsTo: 'figures_out' },
    { id: 'DES4', key: 'eng_collaboration', question: "How were [Name]'s handoffs to engineering?", forRelationships: ['direct_colleague', 'report', 'cross_team'], options: [{ value: 1, label: 'Poor' }, { value: 2, label: 'Adequate' }, { value: 3, label: 'Good' }, { value: 4, label: 'Excellent' }], mapsTo: 'gets_buyin' },
    { id: 'DES5', key: 'user_advocacy', question: 'How strongly did [Name] advocate for user needs?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: "Didn't" }, { value: 2, label: 'Occasionally' }, { value: 3, label: 'Consistently' }, { value: 4, label: 'Passionately' }], mapsTo: 'gets_buyin' }
  ],
  data_analytics: [
    { id: 'DATA1', key: 'ai_for_analysis', question: 'How does [Name] use AI for data analysis?', forRelationships: ['direct_colleague', 'report'], options: [{ value: 1, label: "Doesn't use" }, { value: 2, label: 'Basic' }, { value: 3, label: 'Good' }, { value: 4, label: 'Advanced' }, { value: 0, label: "Can't observe", skip: true }], mapsTo: 'ai_ready' },
    { id: 'DATA2', key: 'insight_communication', question: 'How well did [Name] communicate data findings?', forRelationships: ['direct_colleague', 'manager', 'report', 'cross_team'], options: [{ value: 1, label: 'Poorly' }, { value: 2, label: 'Adequately' }, { value: 3, label: 'Well' }, { value: 4, label: 'Excellently' }], mapsTo: 'gets_buyin' },
    { id: 'DATA3', key: 'business_impact', question: "Did [Name]'s analysis drive decisions?", forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Rarely' }, { value: 2, label: 'Sometimes' }, { value: 3, label: 'Often' }, { value: 4, label: 'Consistently' }], mapsTo: 'figures_out' },
    { id: 'DATA4', key: 'proactivity', question: 'Did [Name] proactively surface insights?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Purely reactive' }, { value: 2, label: 'Mostly reactive' }, { value: 3, label: 'Balanced' }, { value: 4, label: 'Highly proactive' }], mapsTo: 'owns_it' }
  ],
  sales: [
    { id: 'SALES1', key: 'ai_enhanced_selling', question: 'Does [Name] use AI for research and personalization?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: "Doesn't use" }, { value: 2, label: 'Basic' }, { value: 3, label: 'Good' }, { value: 4, label: 'Advanced' }, { value: 0, label: "Can't observe", skip: true }], mapsTo: 'ai_ready' },
    { id: 'SALES2', key: 'forecast_accuracy', question: "How accurate was [Name]'s forecasting?", forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Unreliable' }, { value: 2, label: 'Sometimes off' }, { value: 3, label: 'Generally accurate' }, { value: 4, label: 'Very accurate' }], mapsTo: 'owns_it' },
    { id: 'SALES3', key: 'customer_relationships', question: 'Did customers trust [Name]?', forRelationships: ['direct_colleague', 'manager', 'report', 'cross_team'], options: [{ value: 1, label: 'Felt pushed' }, { value: 2, label: 'Transactional' }, { value: 3, label: 'Solid relationship' }, { value: 4, label: 'Deeply trusted' }], mapsTo: 'gets_buyin' },
    { id: 'SALES4', key: 'handoff_quality', question: "How were [Name]'s customer handoffs?", forRelationships: ['direct_colleague', 'manager', 'report', 'cross_team'], options: [{ value: 1, label: 'Messy' }, { value: 2, label: 'Adequate' }, { value: 3, label: 'Clean' }, { value: 4, label: 'Excellent' }], mapsTo: 'gets_buyin' }
  ],
  customer_success: [
    { id: 'CS1', key: 'ai_enhanced_cs', question: 'Does [Name] use AI to monitor accounts and identify risks?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: "Doesn't use" }, { value: 2, label: 'Basic' }, { value: 3, label: 'Good' }, { value: 4, label: 'Advanced' }, { value: 0, label: "Can't observe", skip: true }], mapsTo: 'ai_ready' },
    { id: 'CS2', key: 'proactive_vs_reactive', question: 'Did [Name] manage accounts proactively?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Mostly reactive' }, { value: 2, label: 'Leaning reactive' }, { value: 3, label: 'Leaning proactive' }, { value: 4, label: 'Highly proactive' }], mapsTo: 'owns_it' },
    { id: 'CS3', key: 'difficult_conversations', question: 'How did [Name] handle difficult customer situations?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Escalated tension' }, { value: 2, label: 'Struggled' }, { value: 3, label: 'Professionally' }, { value: 4, label: 'Turned into advocates' }], mapsTo: 'gets_buyin' },
    { id: 'CS4', key: 'internal_advocacy', question: 'How well did [Name] represent customer needs internally?', forRelationships: ['direct_colleague', 'manager', 'report', 'cross_team'], options: [{ value: 1, label: 'Poorly' }, { value: 2, label: 'Adequately' }, { value: 3, label: 'Well' }, { value: 4, label: 'Excellently' }], mapsTo: 'gets_buyin' }
  ],
  marketing: [
    { id: 'MKT1', key: 'ai_for_marketing', question: 'Does [Name] use AI for content, research, or campaigns?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: "Doesn't use" }, { value: 2, label: 'Basic' }, { value: 3, label: 'Good' }, { value: 4, label: 'Advanced' }, { value: 0, label: "Can't observe", skip: true }], mapsTo: 'ai_ready' },
    { id: 'MKT2', key: 'results_driven', question: "Did [Name]'s work drive measurable results?", forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Unclear' }, { value: 2, label: 'Limited' }, { value: 3, label: 'Solid' }, { value: 4, label: 'Strong impact' }], mapsTo: 'owns_it' },
    { id: 'MKT3', key: 'creative_balance', question: 'How well did [Name] balance creativity with business goals?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Poorly' }, { value: 2, label: 'Struggled' }, { value: 3, label: 'Well' }, { value: 4, label: 'Excellently' }], mapsTo: 'figures_out' },
    { id: 'MKT4', key: 'cross_functional', question: 'How did [Name] collaborate with sales and product?', forRelationships: ['direct_colleague', 'manager', 'report', 'cross_team'], options: [{ value: 1, label: 'Worked in silo' }, { value: 2, label: 'Some friction' }, { value: 3, label: 'Well' }, { value: 4, label: 'True partner' }], mapsTo: 'gets_buyin' }
  ],
  operations: [
    { id: 'OPS1', key: 'project_tracking', question: 'Did [Name] keep projects on track?', forRelationships: ['direct_colleague', 'manager', 'report', 'cross_team'], options: [{ value: 1, label: 'Rarely' }, { value: 2, label: 'Sometimes' }, { value: 3, label: 'Usually' }, { value: 4, label: 'Reliably' }], mapsTo: 'owns_it' },
    { id: 'OPS2', key: 'prioritization', question: 'How did [Name] handle competing priorities?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Poorly' }, { value: 2, label: 'Struggled' }, { value: 3, label: 'Adequately' }, { value: 4, label: 'Expertly' }], mapsTo: 'figures_out' },
    { id: 'OPS3', key: 'process_improvement', question: 'Did [Name] improve processes or just maintain them?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Degraded' }, { value: 2, label: 'Maintained' }, { value: 3, label: 'Some improvements' }, { value: 4, label: 'Continuously improved' }], mapsTo: 'owns_it' },
    { id: 'OPS4', key: 'status_communication', question: 'How well did [Name] communicate project status?', forRelationships: ['direct_colleague', 'manager', 'report', 'cross_team'], options: [{ value: 1, label: 'Poorly' }, { value: 2, label: 'Inconsistently' }, { value: 3, label: 'Well' }, { value: 4, label: 'Everyone always knew' }], mapsTo: 'gets_buyin' }
  ],
  people_hr: [
    { id: 'HR1', key: 'trust_building', question: 'Did employees trust [Name] with sensitive issues?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Avoided HR' }, { value: 2, label: 'Somewhat' }, { value: 3, label: 'Yes' }, { value: 4, label: 'Safe person' }], mapsTo: 'gets_buyin' },
    { id: 'HR2', key: 'balance', question: 'How did [Name] balance employee advocacy with company needs?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Too one-sided' }, { value: 2, label: 'Struggled' }, { value: 3, label: 'Well' }, { value: 4, label: 'Found solutions' }], mapsTo: 'figures_out' },
    { id: 'HR3', key: 'follow_through', question: 'Did [Name] follow through on people issues?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Rarely' }, { value: 2, label: 'Sometimes' }, { value: 3, label: 'Usually' }, { value: 4, label: 'Always' }], mapsTo: 'owns_it' },
    { id: 'HR4', key: 'difficult_conversations', question: 'How did [Name] handle difficult conversations?', forRelationships: ['direct_colleague', 'manager', 'report'], options: [{ value: 1, label: 'Avoided' }, { value: 2, label: 'Reluctantly' }, { value: 3, label: 'Professionally' }, { value: 4, label: 'With empathy' }], mapsTo: 'gets_buyin' }
  ]
};

// =============================================================================
// TAGS - Selectable strength tags by role
// =============================================================================

export const TAGS = {
  universal: [
    { id: 'learns_fast', label: 'Learns Crazy Fast', emoji: '🚀', mapsTo: 'learns_fast' },
    { id: 'ai_power_user', label: 'AI Power User', emoji: '🤖', mapsTo: 'ai_ready' },
    { id: 'makes_clarity', label: 'Makes Clarity from Chaos', emoji: '🧩', mapsTo: 'figures_out' },
    { id: 'gets_done', label: 'Gets Things Done', emoji: '⚡', mapsTo: 'owns_it' },
    { id: 'brings_solutions', label: 'Brings Solutions', emoji: '💡', mapsTo: 'owns_it' },
    { id: 'owns_mistakes', label: 'Owns Their Mistakes', emoji: '🙋', mapsTo: 'owns_it' },
    { id: 'easy_to_work_with', label: 'Easy to Work With', emoji: '🤝', mapsTo: 'gets_buyin' },
    { id: 'reliable_pressure', label: 'Reliable Under Pressure', emoji: '🛡️', mapsTo: 'pressure_handling' }
  ],
  product_management: [
    { id: 'sharp_prioritizer', label: 'Sharp Prioritizer', emoji: '🎯' },
    { id: 'stakeholder_whisperer', label: 'Stakeholder Whisperer', emoji: '🤝' },
    { id: 'data_driven', label: 'Data-Driven Decisions', emoji: '📊' },
    { id: 'customer_obsessed', label: 'Customer Obsessed', emoji: '💡' },
    { id: 'says_no_well', label: 'Says No Well', emoji: '✂️' },
    { id: 'strategic_thinker', label: 'Strategic Thinker', emoji: '🔮' }
  ],
  software_engineering: [
    { id: 'architectural_thinker', label: 'Architectural Thinker', emoji: '🏗️' },
    { id: 'ai_dev_expert', label: 'AI-Assisted Dev Expert', emoji: '🤖' },
    { id: 'tech_communicator', label: 'Clear Technical Communicator', emoji: '📖' },
    { id: 'debugs_anything', label: 'Debugs Anything', emoji: '🔧' },
    { id: 'levels_up_others', label: 'Levels Up Others', emoji: '🎓' },
    { id: 'ships_reliably', label: 'Ships Reliably', emoji: '🚢' }
  ],
  engineering_management: [
    { id: 'grows_people', label: 'Grows Their People', emoji: '🌱' },
    { id: 'team_shield', label: 'Team Shield', emoji: '🛡️' },
    { id: 'calm_pressure', label: 'Calm Under Pressure', emoji: '🧘' },
    { id: 'delivers_results', label: 'Delivers Results', emoji: '🎯' },
    { id: 'clear_direction', label: 'Clear Direction', emoji: '💬' },
    { id: 'navigates_change', label: 'Navigates Change Well', emoji: '🔄' }
  ],
  design: [
    { id: 'user_advocate', label: 'User Advocate', emoji: '🎯' },
    { id: 'research_driven', label: 'Research-Driven', emoji: '🔬' },
    { id: 'eng_friendly', label: 'Eng-Friendly', emoji: '🤝' },
    { id: 'creative_solver', label: 'Creative Problem Solver', emoji: '💡' },
    { id: 'ai_designer', label: 'AI-Enhanced Designer', emoji: '🤖' },
    { id: 'systems_thinker', label: 'Systems Thinker', emoji: '📐' }
  ],
  data_analytics: [
    { id: 'compelling_storyteller', label: 'Compelling Storyteller', emoji: '📊' },
    { id: 'business_minded', label: 'Business-Minded', emoji: '🎯' },
    { id: 'finds_insights', label: 'Finds Hidden Insights', emoji: '🔍' },
    { id: 'stakeholder_partner', label: 'Stakeholder Partner', emoji: '🤝' },
    { id: 'ai_analyst', label: 'AI-Augmented Analyst', emoji: '🤖' }
  ],
  sales: [
    { id: 'accurate_forecaster', label: 'Accurate Forecaster', emoji: '🎯' },
    { id: 'trusted_advisor', label: 'Trusted Advisor', emoji: '🤝' },
    { id: 'ai_seller', label: 'AI-Enhanced Seller', emoji: '🤖' },
    { id: 'clean_handoffs', label: 'Clean Handoffs', emoji: '🔄' },
    { id: 'persistent', label: 'Persistent (Good Way)', emoji: '📞' }
  ],
  customer_success: [
    { id: 'early_warning', label: 'Early Warning System', emoji: '🚨' },
    { id: 'customer_advocate', label: 'Customer Advocate', emoji: '🛡️' },
    { id: 'difficult_convos', label: 'Difficult Conversations', emoji: '💬' },
    { id: 'ai_cs', label: 'AI-Enhanced CS', emoji: '🤖' },
    { id: 'retention_driver', label: 'Retention Driver', emoji: '📈' }
  ],
  marketing: [
    { id: 'data_marketer', label: 'Data-Driven Marketer', emoji: '📊' },
    { id: 'creative_thinker', label: 'Creative Thinker', emoji: '🎨' },
    { id: 'growth_mindset', label: 'Growth Mindset', emoji: '📈' },
    { id: 'cross_functional', label: 'Cross-Functional', emoji: '🤝' },
    { id: 'results_focused', label: 'Results-Focused', emoji: '🎯' }
  ],
  operations: [
    { id: 'ultra_organized', label: 'Ultra Organized', emoji: '📋' },
    { id: 'risk_spotter', label: 'Risk Spotter', emoji: '🚦' },
    { id: 'process_improver', label: 'Process Improver', emoji: '🔄' },
    { id: 'gets_done_ops', label: 'Gets Things Done', emoji: '⚡' }
  ],
  people_hr: [
    { id: 'employee_advocate', label: 'Employee Advocate', emoji: '🛡️' },
    { id: 'confidential', label: 'Confidential', emoji: '🤐' },
    { id: 'hard_convos', label: 'Hard Conversations', emoji: '💬' },
    { id: 'culture_builder', label: 'Culture Builder', emoji: '🌱' }
  ]
};

// =============================================================================
// FREE TEXT QUESTIONS
// =============================================================================

export const FREE_TEXT_QUESTIONS = [
  {
    id: 'FT1',
    key: 'never_worry_about',
    question: 'Working with [Name], I never had to worry about...',
    purpose: 'Surface reliable behaviors',
    powersSection: 'What You Can Count On',
    required: false,
    forRelationships: ['direct_colleague', 'manager', 'report', 'cross_team', 'occasional']
  },
  {
    id: 'FT2',
    key: 'growth_support',
    question: 'What support or environment would help [Name] be even MORE successful?',
    purpose: 'Surface growth areas diplomatically',
    powersSection: 'Room to Grow (Private)',
    required: false,
    forRelationships: ['direct_colleague', 'manager', 'report']
  },
  {
    id: 'FT3',
    key: 'testimonial',
    question: 'In one sentence, what stands out about working with [Name]?',
    purpose: 'Quotable testimonials',
    powersSection: 'Peer Feedback quotes',
    required: false,
    forRelationships: ['direct_colleague', 'manager', 'report', 'cross_team']
  }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Detect role family from job title
 */
export function detectRoleFamily(jobTitle) {
  if (!jobTitle) return 'general';
  const lower = jobTitle.toLowerCase();
  
  for (const [familyId, family] of Object.entries(ROLE_FAMILIES)) {
    if (familyId === 'general') continue;
    for (const alias of family.aliases) {
      if (lower.includes(alias)) return familyId;
    }
  }
  return 'general';
}

/**
 * Get all questions for a review based on relationship and role
 */
export function getQuestionsForReview(relationshipType, revieweeRole) {
  const questions = [];
  const roleFamily = detectRoleFamily(revieweeRole);
  
  // 1. Universal questions (filtered by relationship)
  UNIVERSAL_QUESTIONS.forEach(q => {
    if (q.forRelationships.includes(relationshipType)) {
      questions.push({ ...q, category: 'universal' });
    }
  });
  
  // 2. AI-Era questions (filtered by relationship)
  AI_ERA_QUESTIONS.forEach(q => {
    if (q.forRelationships.includes(relationshipType)) {
      questions.push({ ...q, category: 'ai_era' });
    }
  });
  
  // 3. Relationship-specific questions
  const relQuestions = RELATIONSHIP_QUESTIONS[relationshipType] || [];
  relQuestions.forEach(q => {
    questions.push({ ...q, category: 'relationship' });
  });
  
  // 4. Role-specific questions (only for direct_colleague, manager, report, and some cross_team)
  if (roleFamily !== 'general' && ROLE_SPECIFIC_QUESTIONS[roleFamily]) {
    ROLE_SPECIFIC_QUESTIONS[roleFamily].forEach(q => {
      if (q.forRelationships.includes(relationshipType)) {
        questions.push({ ...q, category: 'role_specific', roleFamily });
      }
    });
  }
  
  return questions;
}

/**
 * Get tags for a role (universal + role-specific)
 */
export function getTagsForRole(revieweeRole) {
  const roleFamily = detectRoleFamily(revieweeRole);
  const tags = [...TAGS.universal];
  
  if (roleFamily !== 'general' && TAGS[roleFamily]) {
    tags.push(...TAGS[roleFamily]);
  }
  
  return tags;
}

/**
 * Get free text questions for a relationship
 */
export function getFreeTextQuestions(relationshipType) {
  return FREE_TEXT_QUESTIONS.filter(q => 
    q.forRelationships.includes(relationshipType)
  );
}

/**
 * Get estimated review time and question count for a relationship + role
 */
export function getReviewEstimate(relationshipType, revieweeRole) {
  const questions = getQuestionsForReview(relationshipType, revieweeRole);
  const freeText = getFreeTextQuestions(relationshipType);
  
  const totalQuestions = questions.length + 1 + freeText.length; // +1 for tags
  
  const estimates = {
    direct_colleague: { time: '3 min', range: '11-14' },
    manager: { time: '3 min', range: '11-13' },
    report: { time: '3 min', range: '12-14' },
    cross_team: { time: '2 min', range: '8-10' },
    occasional: { time: '1 min', range: '5' }
  };
  
  return {
    questionCount: totalQuestions,
    ...estimates[relationshipType] || { time: '2-3 min', range: '8-12' }
  };
}

