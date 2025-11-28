import { DailyLesson, Vocab, DialogueLine, QuizQuestion, LessonScenario, TopicCategory } from '../types';

// Topic Categories for daily lessons
export const TOPIC_CATEGORIES: TopicCategory[] = [
  {
    id: 'general-safety',
    name: 'General Safety',
    nameVietnamese: 'An toàn chung',
    icon: 'fa-hard-hat',
    color: 'bg-blue-500',
    description: 'Basic safety concepts, signs, PPE, and workplace rules'
  },
  {
    id: 'chemicals',
    name: 'Chemical Safety',
    nameVietnamese: 'An toàn hóa chất',
    icon: 'fa-flask',
    color: 'bg-purple-500',
    description: 'Chemical labels, handling, and storage safety'
  },
  {
    id: 'electrical',
    name: 'Electrical Safety',
    nameVietnamese: 'An toàn điện',
    icon: 'fa-bolt',
    color: 'bg-yellow-500',
    description: 'Electrical hazards, LOTO, and power equipment'
  },
  {
    id: 'height-work',
    name: 'Work at Height',
    nameVietnamese: 'Làm việc trên cao',
    icon: 'fa-user-hard-hat',
    color: 'bg-red-500',
    description: 'Scaffolding, ladders, fall protection, and harness safety'
  },
  {
    id: 'equipment',
    name: 'Equipment & Machinery',
    nameVietnamese: 'Thiết bị & Máy móc',
    icon: 'fa-cogs',
    color: 'bg-gray-600',
    description: 'Tools, machines, cranes, and forklifts'
  },
  {
    id: 'emergency',
    name: 'Emergency Response',
    nameVietnamese: 'Ứng phó khẩn cấp',
    icon: 'fa-ambulance',
    color: 'bg-green-600',
    description: 'First aid, fire safety, and emergency procedures'
  }
];

// NEW ARCHITECTURE: Each of the 6 topics is now an independent 60-day course
// Each topic generates its own unique content for days 1-60
// Users can learn multiple topics simultaneously with separate progress tracking

// DEPRECATED: Old single-track lesson system - kept for fallback only
export const getLessonForDay = (day: number): DailyLesson => {
  const isReviewDay = day % 5 === 0;
  const topic = `Day ${day} - Fallback Lesson`;

  // Minimal fallback data
  const vocab = getVocabForTopic(day, topic);
  const dialogue = getDialogueForTopic(day, topic);
  const scenario = getScenarioForTopic(day, topic);
  const quiz = getQuizForTopic(day, topic, isReviewDay);

  return {
    id: day,
    topicId: 'general-safety', // Default fallback
    topic: isReviewDay ? `REVIEW: ${topic}` : topic,
    isReviewDay,
    vocab,
    dialogue,
    scenario,
    quiz
  };
};

// --- Content Generators ---

const getVocabForTopic = (day: number, topic: string): Vocab[] => {
  // Beginner Friendly Day 1
  if (day === 1) {
    return [
      { term: "Safety", meaning: "Being safe; not dangerous", example: "Safety is our number one rule.", ipa: "/ˈseɪf.ti/" },
      { term: "Danger", meaning: "Possibility of getting hurt", example: "Danger! Do not enter.", ipa: "/ˈdeɪn.dʒər/" },
      { term: "Stop", meaning: "Do not move", example: "Stop work immediately.", ipa: "/stɒp/" },
      { term: "Go", meaning: "Start or move", example: "You can go now.", ipa: "/ɡəʊ/" },
      { term: "Help", meaning: "Ask for assistance", example: "Call for help.", ipa: "/help/" },
    ];
  }

  // Review Days have no specific new vocab, they review previous concepts
  if (day % 5 === 0) {
    return [
      { term: "Review", meaning: "Look at again", example: "Let's review the week.", ipa: "/rɪˈvjuː/" },
      { term: "Test", meaning: "Check your knowledge", example: "Pass the test to continue.", ipa: "/test/" },
      { term: "Pass", meaning: "Succeed", example: "You need 80% to pass.", ipa: "/pɑːs/" },
      { term: "Fail", meaning: "Not succeed", example: "If you fail, try again.", ipa: "/feɪl/" },
      { term: "Certificate", meaning: "Official document", example: "Get your certificate at Day 60.", ipa: "/səˈtɪf.ɪ.kət/" },
    ];
  }

  // Generic Generation based on topic
  return [
    { term: topic.split(' ')[0], meaning: `Related to ${topic}`, example: `Check the ${topic.split(' ')[0]} daily.` },
    { term: "Inspection", meaning: "Looking closely at something", example: "Do an inspection every morning." },
    { term: "Protect", meaning: "Keep safe", example: "Protect your eyes." },
    { term: "Worker", meaning: "Person who works", example: "The worker is safe." },
    { term: "Rule", meaning: "What you must do", example: "Follow the safety rule." },
  ];
};

const getDialogueForTopic = (day: number, topic: string): DialogueLine[] => {
  if (day % 5 === 0) {
    return [
      { speaker: "Examiner", role: "Safety Officer", text: "Welcome to your checkpoint test." },
      { speaker: "You", role: "Engineer", text: "I am ready to check my knowledge." },
      { speaker: "Examiner", role: "Safety Officer", text: "You need 80% correct to unlock the next days. Good luck!" }
    ];
  }

  // Simpler dialogues for early days
  if (day < 10) {
    return [
      { speaker: "Tom", role: "Worker", text: "Where is my helmet?" },
      { speaker: "Sam", role: "Safety Officer", text: "It is on the table." },
      { speaker: "Tom", role: "Worker", text: "Thank you. Safety first!" },
    ];
  }

  return [
    { speaker: "Alice", role: "Manager", text: `Please check the ${topic}.` },
    { speaker: "Bob", role: "Engineer", text: "I checked it. It looks safe." },
    { speaker: "Alice", role: "Manager", text: "Did you sign the form?" },
    { speaker: "Bob", role: "Engineer", text: "Yes, here it is." },
  ];
};

const getScenarioForTopic = (day: number, topic: string): LessonScenario => {
  if (day % 5 === 0) {
     return {
      title: `Checkpoint ${day / 5}`,
      description: "This is a mandatory assessment. You will encounter questions from the last 4 days. You must identify the correct safety procedures.",
      dangerLevel: 'Critical',
      imgPlaceholder: `https://picsum.photos/seed/exam${day}/600/300`
    };
  }

  return {
    title: `${topic} Situation`,
    description: `You see a worker dealing with ${topic}. They seem unsure about the correct procedure.`,
    dangerLevel: day % 3 === 0 ? 'High' : 'Low',
    imgPlaceholder: `https://picsum.photos/seed/${day}/600/300`
  };
};

const getQuizForTopic = (day: number, topic: string, isReview: boolean): QuizQuestion[] => {
  const count = isReview ? 10 : 5; // More questions on review days
  const questions: QuizQuestion[] = [];

  for(let i=0; i<count; i++) {
    questions.push({
      id: i,
      question: isReview ? `Review Q${i+1}: What is the rule for this week's safety topics?` : `Question ${i+1} about ${topic}?`,
      options: ["The Safe Way", "The Fast Way", "The Lazy Way", "The Dangerous Way"],
      correctAnswer: 0
    });
  }
  return questions;
};

// Dictionary Data (Unchanged for brevity, but would ideally cover 60 days vocab)
export const DICTIONARY_TERMS = [
  { term: "Abatement", def: "Putting an end to a nuisance or hazard." },
  { term: "Acute Exposure", def: "Single exposure to a toxic substance causing severe damage." },
  { term: "PPE", def: "Personal Protective Equipment like helmets and gloves." },
  { term: "Hazard", def: "Anything that can cause harm." },
  { term: "Risk", def: "The chance that a hazard will cause harm." },
  { term: "Safety Sign", def: "A sign that gives a warning or instruction." },
  { term: "Emergency Stop", def: "A button to stop a machine instantly." },
  { term: "First Aid", def: "Help given to a sick or injured person until full medical treatment is available." },
  { term: "Evacuation", def: "Leaving a dangerous place to go to a safe place." },
  { term: "Flammable", def: "Easily set on fire." },
];