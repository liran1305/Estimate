// Behavioral Assessment Configuration - Future-Fit Scoring System
// Replaces numeric 1-10 sliders with behavioral questions

export const behavioralConfig = {
  // ============================================================================
  // THE 5 FUTURE-FIT DIMENSIONS
  // ============================================================================
  dimensions: {
    learns_fast: {
      key: 'learns_fast',
      name: 'Picks Things Up Fast',
      icon: '🚀',
      description: 'Learns new tools, processes, and skills quicker than most',
      color: '#10b981'
    },
    figures_out: {
      key: 'figures_out',
      name: 'Figures It Out',
      icon: '🧩',
      description: 'Moves forward even when requirements are unclear or changing',
      color: '#10b981'
    },
    ai_ready: {
      key: 'ai_ready',
      name: 'AI-Ready',
      icon: '🤖',
      description: 'Uses AI tools effectively and knows when to trust them',
      color: '#10b981'
    },
    gets_buyin: {
      key: 'gets_buyin',
      name: 'Gets People On Board',
      icon: '🤝',
      description: 'Convinces and aligns others without being their boss',
      color: '#10b981'
    },
    owns_it: {
      key: 'owns_it',
      name: 'Owns It',
      icon: '💪',
      description: 'Takes responsibility, catches problems before they blow up',
      color: '#10b981'
    }
  },

  // ============================================================================
  // BEHAVIORAL QUESTIONS - One per dimension
  // ============================================================================
  behavioralQuestions: {
    learns_fast: {
      dimension: 'learns_fast',
      question: 'When a new tool or process was introduced, {name} typically...',
      options: [
        { value: 0, label: 'Resisted until forced', level: 'developing' },
        { value: 1, label: 'Waited to be trained', level: 'moderate' },
        { value: 2, label: 'Explored it independently', level: 'strong' },
        { value: 3, label: 'Became the go-to person for others', level: 'very_high' }
      ]
    },
    figures_out: {
      dimension: 'figures_out',
      question: 'When requirements were unclear or changing, {name}...',
      options: [
        { value: 0, label: 'Got frustrated and waited for clarity', level: 'developing' },
        { value: 1, label: 'Escalated immediately', level: 'moderate' },
        { value: 2, label: 'Asked questions then made reasonable assumptions', level: 'strong' },
        { value: 3, label: 'Created clarity for the team', level: 'very_high' }
      ]
    },
    ai_ready: {
      dimension: 'ai_ready',
      question: 'Does {name} effectively use AI tools in their work?',
      options: [
        { value: 0, label: 'No / Rarely', level: 'developing' },
        { value: 1, label: 'Sometimes', level: 'moderate' },
        { value: 2, label: 'Regularly', level: 'strong' },
        { value: 3, label: 'Power user', level: 'very_high' }
      ],
      optional: true,
      skipLabel: "I don't know / Not applicable"
    },
    gets_buyin: {
      dimension: 'gets_buyin',
      question: 'Can {name} get agreement from people who don\'t report to them?',
      options: [
        { value: 0, label: 'Rarely', level: 'developing' },
        { value: 1, label: 'Sometimes', level: 'moderate' },
        { value: 2, label: 'Usually', level: 'strong' },
        { value: 3, label: 'Almost always', level: 'very_high' }
      ]
    },
    owns_it: {
      dimension: 'owns_it',
      question: 'If something fell through the cracks that was partially {name}\'s responsibility...',
      options: [
        { value: 0, label: 'Would point out it wasn\'t clearly theirs', level: 'developing' },
        { value: 1, label: 'Would acknowledge but not take action', level: 'moderate' },
        { value: 2, label: 'Would catch it before it became a problem', level: 'strong' },
        { value: 3, label: 'Would fix it and suggest process improvements', level: 'very_high' }
      ]
    }
  },

  // ============================================================================
  // HIGH-SIGNAL QUESTIONS - The questions that really matter
  // ============================================================================
  highSignalQuestions: {
    harder_job: {
      key: 'harder_job',
      question: 'Would you want {name} on your team if things got 50% harder next month?',
      options: [
        { value: 1, label: 'Definitely not', emoji: '😬' },
        { value: 2, label: 'Probably not', emoji: '😐' },
        { value: 3, label: 'Maybe', emoji: '🤔' },
        { value: 4, label: 'Definitely yes', emoji: '💪' }
      ],
      weight: 2.0
    },
    startup_hire: {
      key: 'startup_hire',
      question: 'If you were starting a company, would you try to hire {name}?',
      options: [
        { value: 1, label: 'No', emoji: '👎' },
        { value: 2, label: 'Maybe for a specific role', emoji: '🤷' },
        { value: 3, label: 'Yes, they\'re a multiplier', emoji: '🚀' }
      ],
      weight: 2.0
    },
    work_again: {
      key: 'work_again',
      question: 'Would you want to work with {name} again?',
      options: [
        { value: 1, label: 'Prefer not', emoji: '😬' },
        { value: 2, label: 'Maybe', emoji: '😐' },
        { value: 3, label: 'Sure', emoji: '🙂' },
        { value: 4, label: 'Gladly', emoji: '😊' },
        { value: 5, label: 'Absolutely!', emoji: '🤩' }
      ],
      weight: 1.5
    }
  },

  // ============================================================================
  // STRENGTH TAGS - Predictive, not generic
  // ============================================================================
  strengthTags: {
    // Keep from old system
    brings_solutions: { label: 'Brings Solutions', icon: '💡', category: 'impact' },
    gets_things_done: { label: 'Gets Things Done', icon: '🛠️', category: 'execution' },
    owns_mistakes: { label: 'Admits When Wrong', icon: '🙋', category: 'character' },
    
    // New predictive tags
    learns_crazy_fast: { label: 'Learns Crazy Fast', icon: '🚀', category: 'adaptability' },
    thrives_in_chaos: { label: 'Thrives in Chaos', icon: '🌊', category: 'adaptability' },
    ai_power_user: { label: 'AI Power User', icon: '🤖', category: 'future_ready' },
    cuts_through_noise: { label: 'Cuts Through Noise', icon: '🎯', category: 'impact' },
    unblocks_others: { label: 'Unblocks Others', icon: '⚡', category: 'collaboration' },
    thinks_ahead: { label: 'Thinks Ahead', icon: '🔮', category: 'strategic' }
  },

  // Maximum tags a reviewer can select
  maxTags: 3,

  // ============================================================================
  // FREE-TEXT QUESTION
  // ============================================================================
  freeTextQuestion: {
    key: 'never_worry_about',
    prompt: 'Working with {name}, I never had to worry about ___',
    placeholder: 'e.g., deadlines, quality, communication...',
    maxLength: 100,
    optional: true
  },

  // ============================================================================
  // LEVEL DEFINITIONS
  // ============================================================================
  levels: {
    very_high: {
      label: 'Very High',
      color: '#10b981',
      bgColor: '#ecfdf5',
      percentileRange: [0, 15]
    },
    strong: {
      label: 'Strong',
      color: '#10b981',
      bgColor: '#ecfdf5',
      percentileRange: [16, 30]
    },
    moderate: {
      label: 'Moderate',
      color: '#f59e0b',
      bgColor: '#fffbeb',
      percentileRange: [31, 60]
    },
    developing: {
      label: 'Developing',
      color: '#6b7280',
      bgColor: '#f1f5f9',
      percentileRange: [61, 100]
    }
  },

  // ============================================================================
  // QUALITATIVE BADGES
  // ============================================================================
  badges: {
    highly_adaptable: {
      label: 'Highly Adaptable',
      description: 'Ready for what\'s next',
      color: '#047857',
      bgGradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      criteria: {
        minVeryHigh: 3,
        minStartupHirePct: 70
      }
    },
    solid_contributor: {
      label: 'Solid Contributor',
      description: 'Reliable and effective',
      color: '#0369a1',
      bgGradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      criteria: {
        minVeryHigh: 1,
        minStrong: 2
      }
    },
    growing: {
      label: 'Growing',
      description: 'Building skills',
      color: '#7c3aed',
      bgGradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
      criteria: {
        default: true
      }
    }
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all behavioral questions as an array
 */
export function getBehavioralQuestions() {
  return Object.values(behavioralConfig.behavioralQuestions);
}

/**
 * Get all high-signal questions as an array
 */
export function getHighSignalQuestions() {
  return Object.values(behavioralConfig.highSignalQuestions);
}

/**
 * Get all strength tags as an array
 */
export function getStrengthTags() {
  return Object.entries(behavioralConfig.strengthTags).map(([key, tag]) => ({
    id: key,
    ...tag
  }));
}

/**
 * Get dimension info by key
 */
export function getDimension(key) {
  return behavioralConfig.dimensions[key];
}

/**
 * Get level info by key
 */
export function getLevel(key) {
  return behavioralConfig.levels[key];
}

/**
 * Calculate dimension level from raw score (0-3 scale)
 */
export function calculateLevel(rawScore) {
  if (rawScore >= 2.5) return 'very_high';
  if (rawScore >= 1.75) return 'strong';
  if (rawScore >= 1.0) return 'moderate';
  return 'developing';
}

/**
 * Calculate percentile estimate from level
 */
export function estimatePercentile(level) {
  const levelConfig = behavioralConfig.levels[level];
  if (!levelConfig) return 50;
  const [min, max] = levelConfig.percentileRange;
  return Math.round((min + max) / 2);
}

/**
 * Determine qualitative badge based on dimension scores and high-signal answers
 */
export function calculateBadge(dimensionScores, highSignalPcts) {
  const veryHighCount = Object.values(dimensionScores).filter(d => d.level === 'very_high').length;
  const strongCount = Object.values(dimensionScores).filter(d => d.level === 'strong').length;
  
  const { badges } = behavioralConfig;
  
  // Check for Highly Adaptable
  if (veryHighCount >= badges.highly_adaptable.criteria.minVeryHigh && 
      (highSignalPcts?.startup_hire || 0) >= badges.highly_adaptable.criteria.minStartupHirePct) {
    return 'highly_adaptable';
  }
  
  // Check for Solid Contributor
  if (veryHighCount >= badges.solid_contributor.criteria.minVeryHigh ||
      strongCount >= badges.solid_contributor.criteria.minStrong) {
    return 'solid_contributor';
  }
  
  // Default to Growing
  return 'growing';
}

/**
 * Map old slider scores to new dimension estimates
 * Used for migrating existing reviews
 */
export function mapOldScoresToDimensions(oldScores) {
  if (!oldScores) return null;
  
  const scores = typeof oldScores === 'string' ? JSON.parse(oldScores) : oldScores;
  
  return {
    // learns_fast: No direct mapping - leave null
    learns_fast: null,
    
    // figures_out: Map from problem_solving
    figures_out: scores.problem_solving ? Math.round((scores.problem_solving / 10) * 3 * 100) / 100 : null,
    
    // ai_ready: New dimension - no data
    ai_ready: null,
    
    // gets_buyin: Map from communication + teamwork average
    gets_buyin: (scores.communication || scores.teamwork) 
      ? Math.round(((scores.communication || 5) + (scores.teamwork || 5)) / 20 * 3 * 100) / 100 
      : null,
    
    // owns_it: Map from reliability + takes_ownership average
    owns_it: (scores.reliability || scores.takes_ownership)
      ? Math.round(((scores.reliability || 5) + (scores.takes_ownership || 5)) / 20 * 3 * 100) / 100
      : null
  };
}

/**
 * Map old strength tags to new tags
 */
export function mapOldTagsToNew(oldTags) {
  if (!oldTags) return [];
  
  const tags = typeof oldTags === 'string' ? JSON.parse(oldTags) : oldTags;
  
  const mapping = {
    quick_learner: 'learns_crazy_fast',
    problem_solver: 'brings_solutions',
    fast_executor: 'gets_things_done',
    adaptable: 'thrives_in_chaos',
    owns_mistakes: 'owns_mistakes',
    brings_solutions: 'brings_solutions',
    gets_things_done: 'gets_things_done'
  };
  
  return tags
    .map(tag => mapping[tag])
    .filter(tag => tag && behavioralConfig.strengthTags[tag]);
}

export default behavioralConfig;
