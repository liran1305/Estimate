/**
 * Role-based key skills configuration for 2026
 * Maps normalized job titles to their key skills and average benchmarks
 * 
 * Each skill maps to a dimension from behavioralConfig.js:
 * - learns_fast: "Picks Things Up Fast"
 * - figures_out: "Figures It Out"  
 * - ai_ready: "AI-Ready"
 * - gets_buyin: "Gets People On Board"
 * - owns_it: "Owns It"
 */

export const roleSkillsConfig = {
  // Product Management
  'product_manager': {
    displayName: 'Product Manager',
    pluralName: 'Product Managers',
    keySkills: ['figures_out', 'gets_buyin', 'owns_it'],
    allSkills: ['learns_fast', 'figures_out', 'ai_ready', 'gets_buyin', 'owns_it'],
    avgBenchmarks: {
      learns_fast: 35,
      figures_out: 30,
      ai_ready: 40,
      gets_buyin: 25,
      owns_it: 30
    }
  },
  
  // Engineering
  'software_engineer': {
    displayName: 'Software Engineer',
    pluralName: 'Software Engineers',
    keySkills: ['figures_out', 'ai_ready', 'owns_it'],
    allSkills: ['learns_fast', 'figures_out', 'ai_ready', 'gets_buyin', 'owns_it'],
    avgBenchmarks: {
      learns_fast: 30,
      figures_out: 25,
      ai_ready: 35,
      gets_buyin: 40,
      owns_it: 30
    }
  },
  
  // Design
  'designer': {
    displayName: 'Designer',
    pluralName: 'Designers',
    keySkills: ['figures_out', 'gets_buyin', 'learns_fast'],
    allSkills: ['learns_fast', 'figures_out', 'ai_ready', 'gets_buyin', 'owns_it'],
    avgBenchmarks: {
      learns_fast: 30,
      figures_out: 30,
      ai_ready: 45,
      gets_buyin: 30,
      owns_it: 35
    }
  },
  
  // Data Science
  'data_scientist': {
    displayName: 'Data Scientist',
    pluralName: 'Data Scientists',
    keySkills: ['figures_out', 'ai_ready', 'learns_fast'],
    allSkills: ['learns_fast', 'figures_out', 'ai_ready', 'gets_buyin', 'owns_it'],
    avgBenchmarks: {
      learns_fast: 25,
      figures_out: 25,
      ai_ready: 30,
      gets_buyin: 40,
      owns_it: 35
    }
  },
  
  // Marketing
  'marketing_manager': {
    displayName: 'Marketing Manager',
    pluralName: 'Marketing Managers',
    keySkills: ['gets_buyin', 'figures_out', 'ai_ready'],
    allSkills: ['learns_fast', 'figures_out', 'ai_ready', 'gets_buyin', 'owns_it'],
    avgBenchmarks: {
      learns_fast: 35,
      figures_out: 35,
      ai_ready: 40,
      gets_buyin: 25,
      owns_it: 35
    }
  },
  
  // Sales
  'sales': {
    displayName: 'Sales Professional',
    pluralName: 'Sales Professionals',
    keySkills: ['gets_buyin', 'owns_it', 'figures_out'],
    allSkills: ['learns_fast', 'figures_out', 'ai_ready', 'gets_buyin', 'owns_it'],
    avgBenchmarks: {
      learns_fast: 35,
      figures_out: 35,
      ai_ready: 50,
      gets_buyin: 20,
      owns_it: 25
    }
  },
  
  // Operations
  'operations': {
    displayName: 'Operations Manager',
    pluralName: 'Operations Managers',
    keySkills: ['owns_it', 'figures_out', 'gets_buyin'],
    allSkills: ['learns_fast', 'figures_out', 'ai_ready', 'gets_buyin', 'owns_it'],
    avgBenchmarks: {
      learns_fast: 35,
      figures_out: 30,
      ai_ready: 45,
      gets_buyin: 30,
      owns_it: 25
    }
  },
  
  // HR / People
  'hr': {
    displayName: 'HR Professional',
    pluralName: 'HR Professionals',
    keySkills: ['gets_buyin', 'owns_it', 'learns_fast'],
    allSkills: ['learns_fast', 'figures_out', 'ai_ready', 'gets_buyin', 'owns_it'],
    avgBenchmarks: {
      learns_fast: 35,
      figures_out: 40,
      ai_ready: 50,
      gets_buyin: 25,
      owns_it: 30
    }
  },
  
  // Finance
  'finance': {
    displayName: 'Finance Professional',
    pluralName: 'Finance Professionals',
    keySkills: ['figures_out', 'owns_it', 'ai_ready'],
    allSkills: ['learns_fast', 'figures_out', 'ai_ready', 'gets_buyin', 'owns_it'],
    avgBenchmarks: {
      learns_fast: 40,
      figures_out: 25,
      ai_ready: 40,
      gets_buyin: 40,
      owns_it: 25
    }
  },
  
  // Executive / Leadership
  'executive': {
    displayName: 'Executive',
    pluralName: 'Executives',
    keySkills: ['gets_buyin', 'owns_it', 'figures_out'],
    allSkills: ['learns_fast', 'figures_out', 'ai_ready', 'gets_buyin', 'owns_it'],
    avgBenchmarks: {
      learns_fast: 30,
      figures_out: 25,
      ai_ready: 45,
      gets_buyin: 20,
      owns_it: 20
    }
  },
  
  // Default for unknown roles
  'default': {
    displayName: 'Professional',
    pluralName: 'Professionals',
    keySkills: ['owns_it', 'figures_out', 'gets_buyin'],
    allSkills: ['learns_fast', 'figures_out', 'ai_ready', 'gets_buyin', 'owns_it'],
    avgBenchmarks: {
      learns_fast: 35,
      figures_out: 35,
      ai_ready: 45,
      gets_buyin: 35,
      owns_it: 35
    }
  }
};

/**
 * Normalize a job title to a role key
 */
export function normalizeToRoleKey(position) {
  if (!position) return 'default';
  
  const lower = position.toLowerCase();
  
  // Product Management
  if (lower.includes('product') && (lower.includes('manager') || lower.includes('owner') || lower.includes('lead'))) {
    return 'product_manager';
  }
  
  // Engineering
  if (lower.includes('engineer') || lower.includes('developer') || lower.includes('programmer') || lower.includes('architect')) {
    return 'software_engineer';
  }
  
  // Design
  if (lower.includes('design') || lower.includes('ux') || lower.includes('ui')) {
    return 'designer';
  }
  
  // Data Science
  if (lower.includes('data') && (lower.includes('scientist') || lower.includes('analyst') || lower.includes('engineer'))) {
    return 'data_scientist';
  }
  
  // Marketing
  if (lower.includes('marketing') || lower.includes('growth') || lower.includes('brand')) {
    return 'marketing_manager';
  }
  
  // Sales
  if (lower.includes('sales') || lower.includes('account') || lower.includes('business development') || lower.includes('bd')) {
    return 'sales';
  }
  
  // Operations
  if (lower.includes('operations') || lower.includes('ops') || lower.includes('supply chain') || lower.includes('logistics')) {
    return 'operations';
  }
  
  // HR
  if (lower.includes('hr') || lower.includes('human') || lower.includes('people') || lower.includes('talent') || lower.includes('recruit')) {
    return 'hr';
  }
  
  // Finance
  if (lower.includes('finance') || lower.includes('accounting') || lower.includes('cfo') || lower.includes('controller')) {
    return 'finance';
  }
  
  // Executive
  if (lower.includes('ceo') || lower.includes('cto') || lower.includes('coo') || lower.includes('chief') || 
      lower.includes('vp') || lower.includes('vice president') || lower.includes('director') || lower.includes('head of')) {
    return 'executive';
  }
  
  return 'default';
}

/**
 * Get role config for a position
 */
export function getRoleConfig(position) {
  const roleKey = normalizeToRoleKey(position);
  return roleSkillsConfig[roleKey] || roleSkillsConfig['default'];
}

/**
 * Calculate skill comparison vs role average
 */
export function calculateSkillComparison(userPercentile, avgPercentile) {
  // Both are "Top X%" - lower is better
  // Difference = how much better/worse than average
  const diff = avgPercentile - userPercentile;
  return {
    difference: diff,
    isAboveAverage: diff > 0,
    displayDiff: diff > 0 ? `+${diff}%` : `${diff}%`,
    arrow: diff > 0 ? '↑' : diff < 0 ? '↓' : '→'
  };
}
