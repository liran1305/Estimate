// Review Configuration - Relationship-Specific Questions and Weighting

export const reviewConfig = {
  relationshipTypes: {
    peer: {
      label: "Direct Colleague",
      description: "Worked directly with them as a peer",
      sliders: ["communication", "reliability", "problem_solving", "teamwork", "disagreements"],
      tags: ["reliable", "creative", "team_player", "detail_oriented", "high_energy", "calm_pressure", "communicator", "quick_learner", "problem_solver", "fast_executor", "helpful", "strategic"],
      maxTags: 3,
      showWorkAgain: true,
      showWouldPromote: false,
      weight: 1.0
    },
    manager: {
      label: "They Were My Manager",
      description: "They managed or supervised me",
      sliders: ["communication", "reliability", "problem_solving", "clear_direction", "supports_growth", "handles_pressure", "recognition_feedback"],
      tags: ["clear_communicator", "shields_team", "grows_people", "approachable", "fair_consistent", "decision_maker", "good_listener", "inspires", "gives_autonomy", "leads_by_example", "clear_goals", "calm_pressure"],
      maxTags: 3,
      showWorkAgain: true,
      showWouldPromote: false,
      weight: 0.9
    },
    direct_report: {
      label: "They Reported to Me",
      description: "I managed or supervised them",
      sliders: ["communication", "reliability", "problem_solving", "receptive_feedback", "takes_ownership", "works_independently", "shows_growth"],
      tags: ["reliable", "high_potential", "quick_learner", "self_starter", "adaptable", "proactive_communicator", "problem_solver", "fast_executor", "team_player", "detail_oriented", "growth_mindset", "exceeds_expectations"],
      maxTags: 3,
      showWorkAgain: true,
      showWouldPromote: true,
      weight: 1.2
    },
    cross_team: {
      label: "Cross-Team Collaboration",
      description: "Worked with them across different teams",
      sliders: ["communication", "reliability", "problem_solving", "cross_team_commitments", "responsive"],
      tags: ["reliable", "communicator", "easy_to_work_with", "responsive", "flexible", "low_drama", "organized", "bridge_builder", "brings_solutions", "gets_things_done", "represents_team", "respects_deadlines"],
      maxTags: 3,
      showWorkAgain: true,
      showWouldPromote: false,
      weight: 0.8
    },
    other: {
      label: "Other Professional Interaction",
      description: "Know them from work but limited interaction",
      sliders: ["communication", "professionalism", "overall_impression"],
      tags: ["communicator", "professional", "positive_impression", "easy_going", "competent", "knowledgeable"],
      maxTags: 2,
      showWorkAgain: false,
      showLimitedWorkAgain: true,
      showWouldPromote: false,
      weight: 0.5
    }
  },

  sliderDefinitions: {
    communication: { label: "Communication Skills", description: "Clear, effective communication" },
    reliability: { label: "Reliability & Follow-Through", description: "Delivers on commitments", weight: 1.2 },
    problem_solving: { label: "Problem-Solving", description: "Analytical thinking and solutions" },
    teamwork: { label: "Teamwork & Collaboration", description: "Works well with others, shares credit" },
    disagreements: { label: "Conflict Resolution", description: "Handles disagreements and conflicts professionally", optional: true },
    clear_direction: { label: "Provides Clear Direction", description: "Sets clear expectations and goals" },
    supports_growth: { label: "Supports Growth & Development", description: "Invests in team members' careers" },
    handles_pressure: { label: "Handles Pressure Well", description: "Stays composed, doesn't dump stress on team" },
    recognition_feedback: { label: "Gives Recognition & Feedback", description: "Acknowledges good work, provides constructive feedback" },
    receptive_feedback: { label: "Receptive to Feedback", description: "Takes feedback well and acts on it", weight: 1.2 },
    takes_ownership: { label: "Takes Ownership", description: "Owns mistakes, doesn't make excuses" },
    works_independently: { label: "Works Independently", description: "Needs minimal supervision" },
    shows_growth: { label: "Shows Growth Over Time", description: "Improved and developed during tenure" },
    cross_team_commitments: { label: "Meets Cross-Team Commitments", description: "Delivers what they promise to other teams" },
    responsive: { label: "Responsive & Accessible", description: "Easy to reach, doesn't block others" },
    professionalism: { label: "Professionalism", description: "Conducted themselves professionally" },
    overall_impression: { label: "Overall Impression", description: "General impression from interactions" }
  },

  tagDefinitions: {
    reliable: { label: "Reliable", emoji: "🎯" },
    creative: { label: "Creative Thinker", emoji: "💡" },
    team_player: { label: "Team Player", emoji: "🤝" },
    detail_oriented: { label: "Detail-Oriented", emoji: "📊" },
    high_energy: { label: "High Energy", emoji: "🔥" },
    calm_pressure: { label: "Calm Under Pressure", emoji: "🧘" },
    communicator: { label: "Great Communicator", emoji: "📣" },
    quick_learner: { label: "Quick Learner", emoji: "🎓" },
    problem_solver: { label: "Problem Solver", emoji: "🛠️" },
    fast_executor: { label: "Fast Executor", emoji: "⚡" },
    helpful: { label: "Helpful to Others", emoji: "🙌" },
    strategic: { label: "Strategic Thinker", emoji: "🎨" },
    clear_communicator: { label: "Clear Communicator", emoji: "🎯" },
    shields_team: { label: "Shields Team from Politics", emoji: "🛡️" },
    grows_people: { label: "Grows Their People", emoji: "📈" },
    approachable: { label: "Approachable", emoji: "🤝" },
    fair_consistent: { label: "Fair & Consistent", emoji: "⚖️" },
    decision_maker: { label: "Strong Decision Maker", emoji: "🧭" },
    good_listener: { label: "Good Listener", emoji: "👂" },
    inspires: { label: "Inspires the Team", emoji: "🌟" },
    gives_autonomy: { label: "Gives Autonomy", emoji: "🔓" },
    leads_by_example: { label: "Leads by Example", emoji: "💪" },
    clear_goals: { label: "Sets Clear Goals", emoji: "🎯" },
    high_potential: { label: "High Potential", emoji: "📈" },
    self_starter: { label: "Self-Starter", emoji: "💪" },
    adaptable: { label: "Adaptable", emoji: "🔄" },
    proactive_communicator: { label: "Communicates Proactively", emoji: "📣" },
    growth_mindset: { label: "Growth Mindset", emoji: "🌱" },
    exceeds_expectations: { label: "Exceeds Expectations", emoji: "🏆" },
    easy_to_work_with: { label: "Easy to Work With", emoji: "🤝" },
    responsive: { label: "Responsive", emoji: "⚡" },
    flexible: { label: "Flexible", emoji: "🔄" },
    low_drama: { label: "Low Drama", emoji: "🧘" },
    organized: { label: "Well Organized", emoji: "📊" },
    bridge_builder: { label: "Good Bridge Builder", emoji: "🌉" },
    brings_solutions: { label: "Brings Solutions", emoji: "💡" },
    gets_things_done: { label: "Gets Things Done", emoji: "🛠️" },
    represents_team: { label: "Represents Team Well", emoji: "👍" },
    respects_deadlines: { label: "Respects Deadlines", emoji: "⏰" },
    professional: { label: "Professional", emoji: "🤝" },
    positive_impression: { label: "Positive Impression", emoji: "👍" },
    easy_going: { label: "Easy Going", emoji: "🧘" },
    competent: { label: "Seemed Competent", emoji: "🎯" },
    knowledgeable: { label: "Knowledgeable", emoji: "💡" }
  },

  workAgainOptions: {
    standard: [
      { value: 1, emoji: "😬", label: "Prefer not" },
      { value: 2, emoji: "😐", label: "Maybe" },
      { value: 3, emoji: "🙂", label: "Sure" },
      { value: 4, emoji: "😊", label: "Gladly" },
      { value: 5, emoji: "🤩", label: "Absolutely!" }
    ],
    limited: [
      { value: 1, emoji: "🤷", label: "Can't say" },
      { value: 2, emoji: "😐", label: "Probably not" },
      { value: 3, emoji: "🙂", label: "Possibly" },
      { value: 4, emoji: "😊", label: "Yes, good impression" }
    ]
  },

  wouldPromoteOptions: [
    { value: 1, label: "Not yet - needs more development" },
    { value: 2, label: "Maybe in 1-2 years" },
    { value: 3, label: "Yes, ready now" },
    { value: 4, label: "Already performing above their level" }
  ],

  questionWeights: {
    work_again: 1.5,
    would_promote: 1.3,
    reliability: 1.2,
    receptive_feedback: 1.2
  }
};

// Helper function to get sliders for a relationship type
export function getSlidersForRelationship(relationshipType) {
  const config = reviewConfig.relationshipTypes[relationshipType];
  if (!config) return [];
  
  return config.sliders.map(sliderKey => ({
    key: sliderKey,
    ...reviewConfig.sliderDefinitions[sliderKey]
  }));
}

// Helper function to get tags for a relationship type
export function getTagsForRelationship(relationshipType) {
  const config = reviewConfig.relationshipTypes[relationshipType];
  if (!config) return [];
  
  return config.tags.map(tagKey => ({
    id: tagKey,
    ...reviewConfig.tagDefinitions[tagKey]
  }));
}

// Helper function to calculate weighted score
export function calculateWeightedScore(scores, relationshipType, workAgain, wouldPromote = null) {
  const relationshipWeight = reviewConfig.relationshipTypes[relationshipType]?.weight || 1.0;
  
  let totalWeightedScore = 0;
  let totalWeight = 0;

  // Add slider scores with their weights
  Object.entries(scores).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      const sliderWeight = reviewConfig.sliderDefinitions[key]?.weight || 1.0;
      totalWeightedScore += value * sliderWeight;
      totalWeight += sliderWeight;
    }
  });

  // Add work_again score with heavy weight
  if (workAgain) {
    const workAgainWeight = reviewConfig.questionWeights.work_again;
    totalWeightedScore += workAgain * 2 * workAgainWeight; // Scale to 10
    totalWeight += workAgainWeight;
  }

  // Add would_promote score if applicable
  if (wouldPromote) {
    const promoteWeight = reviewConfig.questionWeights.would_promote;
    totalWeightedScore += (wouldPromote / 4) * 10 * promoteWeight; // Scale to 10
    totalWeight += promoteWeight;
  }

  // Calculate average and apply relationship weight
  const averageScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  return averageScore * relationshipWeight;
}
