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
      "ipa": "/hɑːrd hæt/",
      "vietnamese": "Mũ bảo hiểm"
    }
    // Include 5 vocabulary words directly related to the topic
    // IMPORTANT: Always include Vietnamese translation
  ],
  "dialogue": [
    {
      "speaker": "Tom",
      "role": "Worker",
      "text": "Where is my hard hat?",
      "vietnamese": "Mũ bảo hiểm của tôi ở đâu?"
    },
    {
      "speaker": "Sam",
      "role": "Safety Officer",
      "text": "It's on the table. Always wear it on site!",
      "vietnamese": "Nó ở trên bàn. Luôn đội nó khi ở công trường!"
    },
    {
      "speaker": "Tom",
      "role": "Worker",
      "text": "Thank you! Safety first!",
      "vietnamese": "Cảm ơn! An toàn là trên hết!"
    }
    // Include 3-4 lines of realistic workplace dialogue
    // IMPORTANT: Always include Vietnamese translation for each line
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

CRITICAL Requirements:
- Vocabulary must be practical and commonly used in safety contexts
- Vietnamese translations MUST be accurate and natural
- IPA pronunciation guides must be accurate
- Dialogue should be natural and workplace-appropriate
- Each dialogue line MUST have Vietnamese translation
- Scenario should present a realistic safety situation
- Quiz questions MUST be UNIQUE and DIFFERENT from each other
- Each question must test a DIFFERENT aspect of the topic
- Vary the correctAnswer index (use 0, 1, 2, 3 randomly - NOT always 0!)
- Questions should test: vocabulary, procedures, identification, safety rules, emergency response
- All content must be beginner-friendly (A1-A2 English level)
- Focus on PRACTICAL safety knowledge workers need
- AVOID repetitive question patterns
- Vietnamese translations should be simple and easy to understand

Example of GOOD question variety:
Q1: Vocabulary test - "What does 'hazard' mean?"
Q2: Procedure test - "What should you do first when you see a fire?"
Q3: Identification - "Which sign means 'danger'?"
Q4: Safety rule - "When must you wear a hard hat?"
Q5: Emergency - "Who should you call in an emergency?"

Return ONLY valid JSON, no markdown formatting.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Clean response (remove markdown code blocks if present)
  const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  const aiData = JSON.parse(cleanText);

  // Validate quiz questions are unique
  const questions = aiData.quiz.map((q: any) => q.question);
  const uniqueQuestions = new Set(questions);
  if (uniqueQuestions.size !== questions.length) {
    console.warn(`⚠️ Duplicate questions detected in Day ${day}. Regenerating...`);
    // If duplicates found, try one more time
    const retryResult = await model.generateContent(prompt + "\n\nIMPORTANT: Previous attempt had duplicate questions. Generate COMPLETELY DIFFERENT questions this time!");
    const retryText = retryResult.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const retryData = JSON.parse(retryText);
    return {
      id: day,
      topic: topic,
      isReviewDay: false,
      vocab: retryData.vocab,
      dialogue: retryData.dialogue,
      scenario: {
        ...retryData.scenario,
        imgPlaceholder: `https://raw.githubusercontent.com/thanhlv87/pic/refs/heads/main/safety-day${day}.jpg`
      },
      quiz: retryData.quiz.map((q: any, idx: number) => ({
        ...q,
        id: idx
      }))
    };
  }

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
      "ipa": "/rɪˈvjuː/",
      "vietnamese": "Ôn tập"
    }
    // Include 5 review-related vocabulary
    // IMPORTANT: Always include Vietnamese translation
  ],
  "dialogue": [
    {
      "speaker": "Examiner",
      "role": "Safety Officer",
      "text": "Welcome to Checkpoint Test ${day / 5}. Are you ready?",
      "vietnamese": "Chào mừng đến với bài kiểm tra ${day / 5}. Bạn đã sẵn sàng chưa?"
    },
    {
      "speaker": "You",
      "role": "Trainee",
      "text": "Yes, I'm ready to show what I've learned.",
      "vietnamese": "Vâng, tôi đã sẵn sàng để thể hiện những gì tôi đã học."
    },
    {
      "speaker": "Examiner",
      "role": "Safety Officer",
      "text": "Good! You need 80% to pass. Let's begin.",
      "vietnamese": "Tốt! Bạn cần đạt 80% để vượt qua. Hãy bắt đầu nào."
    }
    // IMPORTANT: Always include Vietnamese translation for each line
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

CRITICAL Requirements:
- 10 questions total (review tests are longer)
- Questions must cover ALL topics from the previous 4 days
- Each question must be COMPLETELY DIFFERENT - no repetition!
- Mix question types: vocabulary, procedures, scenario-based, identification, safety rules
- Vary the correctAnswer index (use 0, 1, 2, 3 randomly - NOT always 0!)
- Make it challenging but fair
- Test DIFFERENT safety topics in each question
- Questions should progressively test different aspects:
  * Question 1-2: Vocabulary from Day ${startDay}
  * Question 3-4: Procedures from Day ${startDay + 1}
  * Question 5-6: Safety rules from Day ${startDay + 2}
  * Question 7-8: Equipment identification from Day ${startDay + 3}
  * Question 9-10: Mixed scenario-based questions

Return ONLY valid JSON, no markdown.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const aiData = JSON.parse(cleanText);

  // Validate quiz questions are unique
  const questions = aiData.quiz.map((q: any) => q.question);
  const uniqueQuestions = new Set(questions);
  if (uniqueQuestions.size !== questions.length) {
    console.warn(`⚠️ Duplicate questions detected in Checkpoint ${day / 5}. Regenerating...`);
    // If duplicates found, try one more time
    const retryResult = await model.generateContent(prompt + "\n\nIMPORTANT: Previous attempt had duplicate questions. Generate 10 COMPLETELY DIFFERENT questions this time!");
    const retryText = retryResult.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const retryData = JSON.parse(retryText);
    return {
      id: day,
      topic: `REVIEW: ${topic}`,
      isReviewDay: true,
      vocab: retryData.vocab,
      dialogue: retryData.dialogue,
      scenario: {
        ...retryData.scenario,
        imgPlaceholder: `https://raw.githubusercontent.com/thanhlv87/pic/refs/heads/main/checkpoint${day / 5}.jpg`
      },
      quiz: retryData.quiz.map((q: any, idx: number) => ({
        ...q,
        id: idx
      }))
    };
  }

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
