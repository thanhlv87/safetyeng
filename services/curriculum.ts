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

// Map days to categories (all 60 days mapped to topics)
export const DAY_CATEGORY_MAP: Record<number, string> = {
  // PHASE 1: FOUNDATION (Days 1-30)

  // Block 1: Days 1-4 (General Safety Intro + Signs + Numbers + PPE)
  1: 'general-safety', // Safety First (Introduction)
  2: 'general-safety', // Safety Colors & Signs
  3: 'general-safety', // Numbers & Quantities on Site
  4: 'general-safety', // Basic PPE (Head & Feet)
  // Day 5: CHECKPOINT TEST 1 (no category)

  // Block 2: Days 6-9 (PPE Equipment)
  6: 'general-safety', // Eye & Ear Protection
  7: 'general-safety', // Hand Protection (Gloves)
  8: 'general-safety', // Work Clothing (High-Vis)
  9: 'equipment',      // Tools: Hand Tools
  // Day 10: CHECKPOINT TEST 2 (no category)

  // Block 3: Days 11-14 (Tools & Basic Hazards)
  11: 'equipment',      // Tools: Power Tools
  12: 'general-safety', // Slips and Trips
  13: 'general-safety', // Lifting Heavy Things
  14: 'height-work',    // Using a Ladder
  // Day 15: CHECKPOINT TEST 3 (no category)

  // Block 4: Days 16-19 (Fire & Electrical)
  16: 'emergency',   // Fire: Basic Words
  17: 'emergency',   // Fire Extinguishers
  18: 'electrical',  // Electricity: On/Off
  19: 'electrical',  // Electrical Cords & Plugs
  // Day 20: CHECKPOINT TEST 4 (no category)

  // Block 5: Days 21-24 (Chemicals)
  21: 'chemicals', // Chemicals: Warning Labels
  22: 'chemicals', // Cleaning Safety
  23: 'chemicals', // Dust & Fumes
  24: 'chemicals', // Ventilation Basics
  // Day 25: CHECKPOINT TEST 5 (no category)

  // Block 6: Days 26-29 (First Aid & Emergency)
  26: 'emergency', // First Aid Kit
  27: 'emergency', // Minor Cuts & Bruises
  28: 'emergency', // Reporting an Injury
  29: 'emergency', // Emergency Numbers
  // Day 30: CHECKPOINT TEST 6 (no category)

  // PHASE 2: APPLICATION (Days 31-60)

  // Block 7: Days 31-34 (Hazard & Risk)
  31: 'general-safety', // Hazard Identification
  32: 'general-safety', // Risk Assessment Basics
  33: 'general-safety', // Work Permits
  34: 'general-safety', // Site Rules
  // Day 35: CHECKPOINT TEST 7 (no category)

  // Block 8: Days 36-39 (Work at Height)
  36: 'height-work', // Working at Height (Scaffolding)
  37: 'height-work', // Fall Harness Safety
  38: 'height-work', // Falling Objects
  39: 'height-work', // Barricades & Tapes
  // Day 40: CHECKPOINT TEST 8 (no category)

  // Block 9: Days 41-44 (LOTO & Machines)
  41: 'electrical',  // Lockout / Tagout (LOTO)
  42: 'equipment',   // Machine Guards
  43: 'equipment',   // Emergency Stop Buttons
  44: 'equipment',   // Conveyor Belt Safety
  // Day 45: CHECKPOINT TEST 9 (no category)

  // Block 10: Days 46-49 (Confined Spaces)
  46: 'general-safety', // Confined Spaces (Basics)
  47: 'chemicals',      // Gas Testing
  48: 'general-safety', // The Buddy System
  49: 'emergency',      // Rescue Equipment
  // Day 50: CHECKPOINT TEST 10 (no category)

  // Block 11: Days 51-54 (Mobile Equipment)
  51: 'equipment', // Crane Signals
  52: 'equipment', // Forklift Safety
  53: 'equipment', // Trucks & Traffic
  54: 'equipment', // Pedestrian Walkways
  // Day 55: CHECKPOINT TEST 11 (no category)

  // Block 12: Days 56-59 (Environmental & Culture)
  56: 'general-safety', // Noise Control
  57: 'emergency',      // Heat Stress
  58: 'chemicals',      // Environmental Spills
  59: 'general-safety', // Safety Culture
  // Day 60: FINAL CERTIFICATION EXAM (no category)
};

// 60-Day Roadmap for Beginners
// Days 1-30: Foundation (Words, Signs, Basic PPE, Simple Commands)
// Days 31-60: Application (Procedures, Reporting, Specific Hazards)
// Every 5th day is a REVIEW & TEST.

const TOPICS = [
  // --- PHASE 1: FOUNDATION (Days 1-30) ---
  "Safety First (Introduction)", "Safety Colors & Signs", "Numbers & Quantities on Site", "Basic PPE (Head & Feet)", "CHECKPOINT TEST 1",
  "Eye & Ear Protection", "Hand Protection (Gloves)", "Work Clothing (High-Vis)", "Tools: Hand Tools", "CHECKPOINT TEST 2",
  "Tools: Power Tools", "Slips and Trips", "Lifting Heavy Things", "Using a Ladder", "CHECKPOINT TEST 3",
  "Fire: Basic Words", "Fire Extinguishers", "Electricity: On/Off", "Electrical Cords & Plugs", "CHECKPOINT TEST 4",
  "Chemicals: Warning Labels", "Cleaning Safety", "Dust & Fumes", "Ventilation Basics", "CHECKPOINT TEST 5",
  "First Aid Kit", "Minor Cuts & Bruises", "Reporting an Injury", "Emergency Numbers", "CHECKPOINT TEST 6",

  // --- PHASE 2: APPLICATION (Days 31-60) ---
  "Hazard Identification", "Risk Assessment Basics", "Work Permits", "Site Rules", "CHECKPOINT TEST 7",
  "Working at Height (Scaffolding)", "Fall Harness Safety", "Falling Objects", "Barricades & Tapes", "CHECKPOINT TEST 8",
  "Lockout / Tagout (LOTO)", "Machine Guards", "Emergency Stop Buttons", "Conveyor Belt Safety", "CHECKPOINT TEST 9",
  "Confined Spaces (Basics)", "Gas Testing", "The Buddy System", "Rescue Equipment", "CHECKPOINT TEST 10",
  "Crane Signals", "Forklift Safety", "Trucks & Traffic", "Pedestrian Walkways", "CHECKPOINT TEST 11",
  "Noise Control", "Heat Stress", "Environmental Spills", "Safety Culture", "FINAL CERTIFICATION EXAM"
];

export const getLessonForDay = (day: number): DailyLesson => {
  const topic = TOPICS[day - 1] || `Day ${day} Topic`;
  const isReviewDay = day % 5 === 0;
  
  // Seed data generators
  const vocab = getVocabForTopic(day, topic);
  const dialogue = getDialogueForTopic(day, topic);
  const scenario = getScenarioForTopic(day, topic);
  const quiz = getQuizForTopic(day, topic, isReviewDay);

  return {
    id: day,
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