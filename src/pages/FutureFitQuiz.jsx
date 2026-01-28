import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Quiz data with leader quotes and questions
const LEADER_QUOTES = {
  aiAdoption: {
    quote: "The obvious tactical thing is just get really good at using AI tools.",
    author: "Sam Altman",
    role: "CEO, OpenAI"
  },
  learning: {
    quote: "The learn-it-all does better than the know-it-all.",
    author: "Satya Nadella", 
    role: "CEO, Microsoft"
  },
  resilience: {
    quote: "Greatness comes from character, and character isn't formed out of smart people. It's formed out of people who suffered.",
    author: "Jensen Huang",
    role: "CEO, NVIDIA"
  },
  curiosity: {
    quote: "To innovate, you have to be very curious and ask a lot of questions.",
    author: "Brian Chesky",
    role: "CEO, Airbnb"
  },
  humanSkills: {
    quote: "How much people care about other people... that is a skill that will be increasingly important.",
    author: "Sam Altman",
    role: "CEO, OpenAI"
  },
  criticalThinking: {
    quote: "Learn critical thinking, EQ, how to communicate, how to write.",
    author: "Jamie Dimon",
    role: "CEO, JPMorgan Chase"
  },
  adaptability: {
    quote: "People who learn to adopt and adapt to AI will do better.",
    author: "Sundar Pichai",
    role: "CEO, Google"
  },
  questions: {
    quote: "Figuring out what questions to ask will be more important than figuring out the answer.",
    author: "Sam Altman",
    role: "CEO, OpenAI"
  }
};

const ROLES = [
  { id: 'product', label: 'Product Management', icon: '🎯' },
  { id: 'engineering', label: 'Software Engineering', icon: '💻' },
  { id: 'design', label: 'Design (UI/UX)', icon: '🎨' },
  { id: 'data', label: 'Data & Analytics', icon: '📊' },
  { id: 'marketing', label: 'Marketing', icon: '📣' },
  { id: 'sales', label: 'Sales', icon: '💼' },
  { id: 'operations', label: 'Operations', icon: '⚙️' },
  { id: 'hr', label: 'People / HR', icon: '👥' },
  { id: 'leadership', label: 'Leadership / Executive', icon: '👔' },
  { id: 'other', label: 'Other', icon: '✨' }
];

const QUESTIONS = [
  // Empathy & Caring About Others
  {
    id: 'colleague_struggle',
    category: 'Caring About Others',
    leaderQuote: LEADER_QUOTES.humanSkills,
    question: "A colleague seems stressed and behind on their work. You have your own deadlines. What do you do?",
    options: [
      { text: "Check in with them personally to understand what's really going on", score: 5 },
      { text: "Focus on my work - they need to manage their own tasks", score: 2 },
      { text: "Ask if there's a small way I can help without derailing my work", score: 4 },
      { text: "Send them an encouraging message", score: 3 },
      { text: "Offer to take something off their plate, even if it means staying late", score: 5 }
    ],
    insight: "How you treat colleagues when you're busy reveals your true character."
  },
  {
    id: 'credit_sharing',
    category: 'Caring About Others',
    leaderQuote: LEADER_QUOTES.humanSkills,
    question: "Your idea led to a successful project, but a junior teammate did most of the execution. In the all-hands meeting, you...",
    options: [
      { text: "Share credit equally with everyone involved", score: 4 },
      { text: "Let the junior teammate present it themselves", score: 5 },
      { text: "Present the results - it was my idea after all", score: 1 },
      { text: "Highlight the junior teammate's contribution specifically", score: 5 },
      { text: "Mention the team helped with execution", score: 2 }
    ],
    insight: "The best leaders make others feel like the success was theirs."
  },
  // Self-Awareness & Growth
  {
    id: 'blind_spots',
    category: 'Self-Awareness',
    leaderQuote: LEADER_QUOTES.learning,
    question: "How well do you think you know your own weaknesses?",
    options: [
      { text: "I don't really have major weaknesses in my role", score: 1 },
      { text: "I actively ask others to point out what I can't see", score: 5 },
      { text: "I know exactly what I'm good and bad at", score: 2 },
      { text: "I'm often surprised by feedback about my blind spots", score: 3 },
      { text: "I have a general sense but probably miss some things", score: 4 }
    ],
    insight: "People who think they know all their weaknesses usually have the biggest blind spots."
  },
  {
    id: 'disagreement',
    category: 'Self-Awareness',
    leaderQuote: LEADER_QUOTES.criticalThinking,
    question: "When someone disagrees with your approach in a meeting, your first instinct is to...",
    options: [
      { text: "Consider if they might be right", score: 4 },
      { text: "Defend my position - I've thought this through", score: 2 },
      { text: "Ask them to explain their reasoning", score: 5 },
      { text: "Acknowledge their point but explain why mine is better", score: 2 },
      { text: "Suggest we discuss it offline", score: 3 }
    ],
    insight: "Curiosity about opposing views is rarer, and more valuable, than being right."
  },
  // Collaboration & Making Others Successful
  {
    id: 'new_teammate',
    category: 'Making Others Successful',
    leaderQuote: LEADER_QUOTES.humanSkills,
    question: "A new person joins your team and seems lost in their first week. You...",
    options: [
      { text: "Point them to documentation and resources", score: 3 },
      { text: "Introduce them to key people and share unwritten rules", score: 5 },
      { text: "Let them figure it out - that's how I learned", score: 1 },
      { text: "Proactively check in and offer to pair on tasks", score: 5 },
      { text: "Answer questions when they ask me", score: 2 }
    ],
    insight: "How you treat people who can't help your career says everything."
  },
  {
    id: 'others_success',
    category: 'Making Others Successful',
    leaderQuote: LEADER_QUOTES.humanSkills,
    question: "When a peer gets promoted or recognized, your honest reaction is usually...",
    options: [
      { text: "Genuinely celebrate their success", score: 4 },
      { text: "Wonder why it wasn't me", score: 1 },
      { text: "Think about how I can help them succeed even more", score: 5 },
      { text: "Feel happy for them but also a bit competitive", score: 3 },
      { text: "Ask them what they did well so I can learn", score: 4 }
    ],
    insight: "Your reaction to others' success reveals whether you see work as zero-sum."
  },
  // Handling Difficult Situations
  {
    id: 'difficult_person',
    category: 'Handling Difficulty',
    leaderQuote: LEADER_QUOTES.resilience,
    question: "You need to work closely with someone who has a reputation for being difficult. You...",
    options: [
      { text: "Try to understand why they might be that way", score: 4 },
      { text: "Look for common ground and build rapport", score: 5 },
      { text: "Keep interactions minimal and professional", score: 2 },
      { text: "Ask others how they've managed to work with this person", score: 4 },
      { text: "Treat them the same as everyone else", score: 3 }
    ],
    insight: "Difficult people often become allies when someone takes time to understand them."
  },
  {
    id: 'pressure_behavior',
    category: 'Handling Difficulty',
    leaderQuote: LEADER_QUOTES.resilience,
    question: "When you're under extreme pressure with a tight deadline, how do you typically treat the people around you?",
    options: [
      { text: "I make an effort to not take stress out on others", score: 4 },
      { text: "I get short and focused - people understand", score: 2 },
      { text: "I'm the same person under pressure as I am normally", score: 5 },
      { text: "I try to stay calm but sometimes snap", score: 3 },
      { text: "I actually check in more with my team during stressful times", score: 5 }
    ],
    insight: "Pressure doesn't change who you are. It reveals who you are."
  },
  // Authenticity & Trust
  {
    id: 'admitting_unknown',
    category: 'Authenticity',
    leaderQuote: LEADER_QUOTES.questions,
    question: "In a meeting, someone asks you a question you don't know the answer to. You...",
    options: [
      { text: "Give a partial answer based on what I do know", score: 3 },
      { text: "Say I don't know and offer to find out", score: 5 },
      { text: "Give my best guess confidently", score: 1 },
      { text: "Deflect to someone else who might know", score: 2 },
      { text: "Admit I don't know and ask if anyone else does", score: 5 }
    ],
    insight: "Saying 'I don't know' builds more trust than pretending you do."
  },
  {
    id: 'feedback_giving',
    category: 'Authenticity',
    leaderQuote: LEADER_QUOTES.criticalThinking,
    question: "A colleague asks for honest feedback on their work, which has real problems. You...",
    options: [
      { text: "Ask questions that help them discover the issues themselves", score: 5 },
      { text: "Tell them it's fine - they'll figure it out eventually", score: 1 },
      { text: "Give gentle hints about the issues", score: 3 },
      { text: "Be direct about the problems while being respectful", score: 5 },
      { text: "Focus on the positives to avoid hurting their feelings", score: 2 }
    ],
    insight: "Kind honesty is a gift. Dishonest kindness is a disservice."
  }
];

const SCORE_LEVELS = [
  { min: 20, max: 40, level: 'Developing', color: '#EF4444', emoji: '🌱' },
  { min: 41, max: 60, level: 'Emerging', color: '#F59E0B', emoji: '🌿' },
  { min: 61, max: 80, level: 'Competent', color: '#3B82F6', emoji: '🌳' },
  { min: 81, max: 90, level: 'Strong', color: '#06B6D4', emoji: '🚀' },
  { min: 91, max: 100, level: 'Future-Fit', color: '#14B8A6', emoji: '⭐' }
];

const DIMENSION_DESCRIPTIONS = {
  'Caring About Others': { icon: '💜' },
  'Self-Awareness': { icon: '🪞' },
  'Making Others Successful': { icon: '�' },
  'Handling Difficulty': { icon: '💪' },
  'Authenticity': { icon: '🎯' }
};

export default function FutureFitQuiz() {
  const navigate = useNavigate();
  const [stage, setStage] = useState('intro'); // intro, role, questions, insight, results
  const [selectedRole, setSelectedRole] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showInsight, setShowInsight] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [runningScore, setRunningScore] = useState(0);

  const totalQuestions = QUESTIONS.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setAnimatingOut(true);
    setTimeout(() => {
      setStage('questions');
      setAnimatingOut(false);
    }, 300);
  };

  const handleAnswer = (questionId, option) => {
    setSelectedAnswer(option);
    setAnswers({ ...answers, [questionId]: option });
    
    // Calculate percentage score for this answer
    const answerScore = Math.round((option.score / 5) * 100);
    setRunningScore(prev => prev + answerScore);
    
    // Show instant feedback
    setShowFeedback(true);
    
    // Wait for feedback animation, then move on
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      
      // Show insight after certain questions
      if ([1, 4, 7].includes(currentQuestion)) {
        setShowInsight(true);
      } else {
        progressToNext();
      }
    }, 1500);
  };

  const progressToNext = () => {
    setAnimatingOut(true);
    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setStage('results');
      }
      setAnimatingOut(false);
      setShowInsight(false);
    }, 300);
  };

  const calculateResults = () => {
    let totalScore = 0;
    let answeredCount = 0;
    const dimensions = {};
    
    QUESTIONS.forEach(q => {
      const answer = answers[q.id];
      if (answer) {
        totalScore += answer.score;
        answeredCount++;
        if (!dimensions[q.category]) {
          dimensions[q.category] = { total: 0, count: 0 };
        }
        dimensions[q.category].total += answer.score;
        dimensions[q.category].count += 1;
      }
    });

    // Convert to 0-100 scale (each question is 1-5, so max is 5*10=50, convert to 100)
    const percentageScore = answeredCount > 0 ? Math.round((totalScore / (answeredCount * 5)) * 100) : 0;
    const level = SCORE_LEVELS.find(l => percentageScore >= l.min && percentageScore <= l.max) || SCORE_LEVELS[0];
    
    const dimensionScores = Object.entries(dimensions).map(([name, data]) => ({
      name,
      score: Math.round((data.total / (data.count * 5)) * 100),
      ...DIMENSION_DESCRIPTIONS[name]
    }));

    return { totalScore: percentageScore, level, dimensionScores };
  };

  const handleGetRealScore = () => {
    // Navigate to the main app with quiz context
    navigate('/', { state: { fromQuiz: true, quizScore: calculateResults() } });
  };

  // Intro Screen
  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8 animate-fade-in">
            <div className="text-6xl mb-4">🚀</div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Are You <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Future-Fit</span>?
            </h1>
            <p className="text-xl text-blue-200 mb-2">
              The 2026 High-Tech Career Readiness Assessment
            </p>
            <p className="text-slate-400">
              Based on insights from CEOs of OpenAI, Google, Microsoft, NVIDIA, and more
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-5 mb-6 border border-slate-700">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💬</div>
              <div>
                <p className="text-slate-200 italic text-lg leading-relaxed">"How much people care about other people, how much people interact with other people, how much people care about what other people do... that is a skill that I think will be increasingly important in this world of AI."</p>
                <p className="text-cyan-400 text-sm mt-3 font-medium">- Sam Altman, CEO of OpenAI</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-400">2 min</div>
                <div className="text-slate-400 text-sm">Quick assessment</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-400">10</div>
                <div className="text-slate-400 text-sm">Key questions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-teal-400">5</div>
                <div className="text-slate-400 text-sm">Dimensions measured</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStage('role')}
            className="w-full py-4 px-8 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30"
          >
            Start Assessment →
          </button>
          
          <p className="text-center text-slate-500 text-sm mt-4">
            Takes ~2 minutes • No signup required
          </p>
        </div>
      </div>
    );
  }

  // Role Selection
  if (stage === 'role') {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 transition-opacity duration-300 ${animatingOut ? 'opacity-0' : 'opacity-100'}`}>
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-white mb-2">What's your primary role?</h2>
            <p className="text-slate-400">We'll tailor the assessment to your profession</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-cyan-400 rounded-xl transition-all text-left group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{role.icon}</span>
                <span className="text-white font-medium">{role.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Insight Screen
  if (showInsight) {
    const currentQ = QUESTIONS[currentQuestion];
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-xl w-full">
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-2xl p-8 border border-cyan-400/30 text-center">
            <div className="text-5xl mb-4">💡</div>
            <h3 className="text-xl font-bold text-white mb-4">Did You Know?</h3>
            <p className="text-2xl text-blue-200 mb-6">{currentQ.insight}</p>
            <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
              <p className="text-slate-300 italic">"{currentQ.leaderQuote.quote}"</p>
              <p className="text-cyan-400 text-sm mt-2">- {currentQ.leaderQuote.author}, {currentQ.leaderQuote.role}</p>
            </div>
            <button
              onClick={progressToNext}
              className="py-3 px-8 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Questions
  if (stage === 'questions') {
    const q = QUESTIONS[currentQuestion];
    const currentScore = Math.round(runningScore / (currentQuestion + 1));
    
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col p-4 transition-opacity duration-300 ${animatingOut ? 'opacity-0' : 'opacity-100'}`}>
        {/* Progress Bar with Score */}
        <div className="max-w-2xl w-full mx-auto mb-4">
          <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
            <span>Question {currentQuestion + 1} of {totalQuestions}</span>
            <span className="flex items-center gap-3">
              <span className="text-cyan-400 font-semibold">Score: {currentScore}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                q.category === 'Caring About Others' ? 'bg-purple-500/20 text-purple-300' :
                q.category === 'Self-Awareness' ? 'bg-blue-500/20 text-blue-300' :
                q.category === 'Making Others Successful' ? 'bg-yellow-500/20 text-yellow-300' :
                q.category === 'Handling Difficulty' ? 'bg-orange-500/20 text-orange-300' :
                'bg-cyan-500/20 text-cyan-300'
              }`}>
                {q.category}
              </span>
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Quote */}
        <div className="max-w-2xl w-full mx-auto mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 italic text-sm">"{q.leaderQuote.quote}"</p>
            <p className="text-cyan-400 text-xs mt-1">- {q.leaderQuote.author}, {q.leaderQuote.role}</p>
          </div>
        </div>

        {/* Question */}
        <div className="max-w-2xl w-full mx-auto flex-1">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">{q.question}</h2>
          
          <div className="space-y-3">
            {q.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => !showFeedback && handleAnswer(q.id, option)}
                disabled={showFeedback}
                className={`w-full p-4 rounded-xl border transition-all text-left group ${
                  showFeedback && selectedAnswer?.text === option.text
                    ? option.score >= 4 
                      ? 'bg-teal-500/30 border-teal-400 scale-105' 
                      : 'bg-blue-500/30 border-blue-400 scale-105'
                    : showFeedback
                      ? 'opacity-50'
                      : 'hover:scale-[1.02] bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-400/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white">{option.text}</span>
                  {showFeedback && selectedAnswer?.text === option.text && (
                    <span className="text-2xl animate-bounce">
                      {option.score === 5 ? '🌟' : option.score === 4 ? '✨' : option.score === 3 ? '👍' : '💭'}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Overlay */}
        {showFeedback && selectedAnswer && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-gradient-to-br from-blue-600/90 to-cyan-600/90 backdrop-blur-lg rounded-2xl p-6 border border-cyan-400/50 animate-scale-in">
              <div className="text-center">
                <div className="text-6xl mb-2">
                  {selectedAnswer.score === 5 ? '🎉' : selectedAnswer.score === 4 ? '💪' : selectedAnswer.score === 3 ? '👌' : '🤔'}
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  +{Math.round((selectedAnswer.score / 5) * 100)}
                </div>
                <div className="text-cyan-100 text-sm">
                  {selectedAnswer.score === 5 ? 'Excellent!' : selectedAnswer.score === 4 ? 'Great choice!' : selectedAnswer.score === 3 ? 'Good!' : 'Interesting...'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skip */}
        {!showFeedback && (
          <div className="max-w-2xl w-full mx-auto mt-4 text-center">
            <button 
              onClick={progressToNext}
              className="text-slate-500 hover:text-slate-300 text-sm"
            >
              Skip this question
            </button>
          </div>
        )}
      </div>
    );
  }

  // Results
  if (stage === 'results') {
    const results = calculateResults();
    const { totalScore, level, dimensionScores } = results;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Score Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">{level.emoji}</div>
            <h1 className="text-2xl font-bold text-white mb-2">Your Future-Fit Score</h1>
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-xl px-5 py-2 border border-white/20">
              <span className="text-4xl font-bold" style={{ color: level.color }}>{totalScore}</span>
              <span className="text-slate-400">/ 100</span>
            </div>
            <div className="mt-3">
              <span 
                className="text-lg font-semibold px-3 py-1 rounded-full"
                style={{ backgroundColor: `${level.color}20`, color: level.color }}
              >
                {level.level}
              </span>
            </div>
          </div>

          {/* Dimension Breakdown - Compact */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-5 border border-white/20">
            <h3 className="text-sm font-semibold text-white mb-3">Your Dimensions</h3>
            <div className="space-y-3">
              {dimensionScores.map(dim => (
                <div key={dim.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 flex items-center gap-2 text-sm">
                      <span>{dim.icon}</span>
                      {dim.name}
                    </span>
                    <span className="text-white font-semibold text-sm">{dim.score}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        dim.score >= 80 ? 'bg-teal-500' :
                        dim.score >= 60 ? 'bg-blue-500' :
                        dim.score >= 40 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* The Hook - Short & Punchy */}
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 mb-5 border border-cyan-400/30">
            <p className="text-slate-300 text-sm text-center">
              This is how <strong className="text-white">you</strong> see yourself. 
              But how do your <strong className="text-white">colleagues</strong> see you?
            </p>
          </div>

          {/* CTA to Estimate - Cleaner */}
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-5 border border-blue-400/30">
            <div className="text-center">
              {/* Estimate Logo */}
              <div className="mb-3">
                <span className="text-2xl font-bold text-white">E</span>
                <span className="text-xl font-semibold text-white">stimate</span>
              </div>
              
              {/* Demo Video */}
              <div className="mb-4">
                <video 
                  className="w-full rounded-lg border border-blue-400/30 shadow-lg"
                  controls
                  autoPlay
                  muted
                  playsInline
                  onLoadedMetadata={(e) => {
                    setTimeout(() => {
                      e.target.play();
                    }, 5000);
                  }}
                >
                  <source src="/videos/estimate-demo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              <p className="text-blue-100 text-sm mb-4">
                Get anonymous peer reviews from people who've actually worked with you.
              </p>
              
              <div className="flex justify-center gap-3 text-center mb-4 text-xs">
                <div className="bg-white/10 rounded-lg px-3 py-2">
                  <span className="text-blue-100">🔒 Anonymous</span>
                </div>
                <div className="bg-white/10 rounded-lg px-3 py-2">
                  <span className="text-blue-100">📊 Real Data</span>
                </div>
                <div className="bg-white/10 rounded-lg px-3 py-2">
                  <span className="text-blue-100">🎯 Free</span>
                </div>
              </div>

              <button
                onClick={handleGetRealScore}
                className="w-full py-3 px-6 bg-white text-blue-700 font-bold rounded-xl hover:bg-slate-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Get My Real Score →
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return null;
}
