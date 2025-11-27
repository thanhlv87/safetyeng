import { GoogleGenerativeAI } from "@google/generative-ai";
import { DailyLesson } from '../types';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

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

export async function generateLessonWithAI(day: number): Promise<DailyLesson> {
  const topic = TOPICS[day - 1] || `Day ${day} Topic`;
  const isReviewDay = day % 5 === 0;

  console.log(`🤖 Generating lesson for Day ${day}: ${topic}`);

  try {
    if (isReviewDay) {
      return await generateReviewLesson(day, topic);
    } else {
      return await generateRegularLesson(day, topic);
    }
  } catch (error) {
    console.error("AI generation failed, using fallback:", error);
    return generateFallbackLesson(day, topic, isReviewDay);
  }
}

async function generateRegularLesson(day: number, topic: string): Promise<DailyLesson> {
  const prompt = `You are an expert English teacher for occupational safety training.
Create a complete English lesson for beginners working in construction/manufacturing.

Topic: "${topic}"
Day: ${day}/60

Generate a JSON response with this EXACT structure:
{
  "vocab": [
    {
      "term": "Hard hat",
      "meaning": "Protective helmet worn on construction sites",
      "example": "Always wear your hard hat in the work area.",
      "ipa": "/hɑːrd hæt/"
    }
    // Include 5 vocabulary words directly related to the topic
  ],
  "dialogue": [
    {
      "speaker": "Tom",
      "role": "Worker",
      "text": "Where is my hard hat?"
    },
    {
      "speaker": "Sam",
      "role": "Safety Officer",
      "text": "It's on the table. Always wear it on site!"
    },
    {
      "speaker": "Tom",
      "role": "Worker",
      "text": "Thank you! Safety first!"
    }
    // Include 3-4 lines of realistic workplace dialogue
  ],
  "scenario": {
    "title": "Missing PPE Situation",
    "description": "You see a colleague entering a work area without proper safety equipment. What should you do?",
    "dangerLevel": "High"
  },
  "quiz": [
    {
      "question": "What is the main purpose of a hard hat?",
      "options": [
        "Protect head from falling objects and impacts",
        "Keep your head warm",
        "Look professional",
        "Company requirement only"
      ],
      "correctAnswer": 0
    }
    // Include 5 multiple-choice questions with realistic options
    // Make sure correctAnswer varies (not always 0)
  ]
}

Requirements:
- Vocabulary must be practical and commonly used in safety contexts
- IPA pronunciation guides must be accurate
- Dialogue should be natural and workplace-appropriate
- Scenario should present a realistic safety situation
- Quiz questions should test understanding, not just memorization
- All content must be beginner-friendly (A1-A2 English level)
- Focus on PRACTICAL safety knowledge workers need

Return ONLY valid JSON, no markdown formatting.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Clean response (remove markdown code blocks if present)
  const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  const aiData = JSON.parse(cleanText);

  return {
    id: day,
    topic: topic,
    isReviewDay: false,
    vocab: aiData.vocab,
    dialogue: aiData.dialogue,
    scenario: {
      ...aiData.scenario,
      imgPlaceholder: `https://raw.githubusercontent.com/thanhlv87/pic/refs/heads/main/safety-day${day}.jpg`
    },
    quiz: aiData.quiz.map((q: any, idx: number) => ({
      ...q,
      id: idx
    }))
  };
}

async function generateReviewLesson(day: number, topic: string): Promise<DailyLesson> {
  const startDay = day - 4;
  const endDay = day - 1;
  const reviewTopics = TOPICS.slice(startDay - 1, endDay).join(", ");

  const prompt = `You are creating a CHECKPOINT TEST for an occupational safety English course.

This test reviews Days ${startDay}-${endDay}, covering: ${reviewTopics}

Generate a JSON response with:
{
  "vocab": [
    {
      "term": "Review",
      "meaning": "To look at something again to remember it",
      "example": "Let's review what we learned this week.",
      "ipa": "/rɪˈvjuː/"
    }
    // Include 5 review-related vocabulary
  ],
  "dialogue": [
    {
      "speaker": "Examiner",
      "role": "Safety Officer",
      "text": "Welcome to Checkpoint Test ${day / 5}. Are you ready?"
    },
    {
      "speaker": "You",
      "role": "Trainee",
      "text": "Yes, I'm ready to show what I've learned."
    },
    {
      "speaker": "Examiner",
      "role": "Safety Officer",
      "text": "Good! You need 80% to pass. Let's begin."
    }
  ],
  "scenario": {
    "title": "Checkpoint ${day / 5} Assessment",
    "description": "This is a comprehensive test of the safety concepts you've learned. You must score 80% or higher to proceed.",
    "dangerLevel": "Critical"
  },
  "quiz": [
    // Create 10 challenging questions that review topics from Days ${startDay}-${endDay}
    // Mix of vocabulary, safety procedures, and scenario-based questions
    // Vary the correctAnswer (don't make them all 0)
  ]
}

Requirements:
- 10 questions total (review tests are longer)
- Questions must cover ALL topics from the previous 4 days
- Mix question types: vocabulary, procedures, scenario-based
- Make it challenging but fair
- Correct answers should vary across questions

Return ONLY valid JSON, no markdown.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const aiData = JSON.parse(cleanText);

  return {
    id: day,
    topic: `REVIEW: ${topic}`,
    isReviewDay: true,
    vocab: aiData.vocab,
    dialogue: aiData.dialogue,
    scenario: {
      ...aiData.scenario,
      imgPlaceholder: `https://raw.githubusercontent.com/thanhlv87/pic/refs/heads/main/checkpoint${day / 5}.jpg`
    },
    quiz: aiData.quiz.map((q: any, idx: number) => ({
      ...q,
      id: idx
    }))
  };
}

function generateFallbackLesson(day: number, topic: string, isReviewDay: boolean): DailyLesson {
  // Fallback nếu AI fail - trả về lesson cơ bản
  console.warn(`Using fallback lesson for day ${day}`);

  return {
    id: day,
    topic: isReviewDay ? `REVIEW: ${topic}` : topic,
    isReviewDay,
    vocab: [
      { term: "Safety", meaning: "Being safe; not dangerous", example: "Safety is our priority.", ipa: "/ˈseɪf.ti/" },
      { term: topic.split(' ')[0], meaning: `Related to ${topic}`, example: `Learn about ${topic}.`, ipa: "//" }
    ],
    dialogue: [
      { speaker: "Tom", role: "Worker", text: `Tell me about ${topic}.` },
      { speaker: "Sam", role: "Safety Officer", text: "It's very important for safety." }
    ],
    scenario: {
      title: `${topic} Scenario`,
      description: `A situation involving ${topic}.`,
      dangerLevel: "High",
      imgPlaceholder: `https://raw.githubusercontent.com/thanhlv87/pic/refs/heads/main/safety-day${day}.jpg`
    },
    quiz: [
      {
        id: 0,
        question: `What is important about ${topic}?`,
        options: ["Safety comes first", "Speed is priority", "Cost matters most", "No rules needed"],
        correctAnswer: 0
      }
    ]
  };
}
