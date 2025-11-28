import { GoogleGenerativeAI } from "@google/generative-ai";
import { DailyLesson } from '../types';
import { TOPIC_CATEGORIES } from './curriculum';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

// Each topic has its own 60-day curriculum
export async function generateLessonWithAI(topicId: string, day: number): Promise<DailyLesson> {
  const category = TOPIC_CATEGORIES.find(c => c.id === topicId);
  if (!category) {
    throw new Error(`Topic ${topicId} not found`);
  }

  const isReviewDay = day % 5 === 0;

  console.log(`🤖 Generating lesson for ${category.name} Day ${day}`);

  try {
    if (isReviewDay) {
      return await generateReviewLesson(topicId, category, day);
    } else {
      return await generateRegularLesson(topicId, category, day);
    }
  } catch (error) {
    console.error("AI generation failed, using fallback:", error);
    return generateFallbackLesson(topicId, category, day, isReviewDay);
  }
}

async function generateRegularLesson(topicId: string, category: any, day: number): Promise<DailyLesson> {
  const prompt = `You are an expert English teacher for occupational safety training.
Create a complete English lesson for beginners working in construction/manufacturing.

Topic Category: "${category.name}" (${category.nameVietnamese})
Category Focus: ${category.description}
Day: ${day}/60 in this specific topic

IMPORTANT: This is Day ${day} of a 60-day course specifically about "${category.name}".
- All content must be directly related to ${category.name.toLowerCase()}
- Create progressive difficulty: Days 1-20 are basic, Days 21-40 intermediate, Days 41-60 advanced
- Focus on practical, workplace-relevant vocabulary and scenarios for ${category.name.toLowerCase()}

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
    "titleVietnamese": "Tình huống thiếu thiết bị bảo hộ",
    "description": "You see a colleague entering a work area without proper safety equipment. What should you do?",
    "vietnamese": "Bạn thấy một đồng nghiệp đang vào khu vực làm việc mà không có thiết bị an toàn đầy đủ. Bạn nên làm gì?",
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
- Scenario MUST include both "titleVietnamese" and "vietnamese" fields
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
      topicId: topicId,
      topic: `${category.name} - Day ${day}`,
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
    topicId: topicId,
    topic: `${category.name} - Day ${day}`,
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

async function generateReviewLesson(topicId: string, category: any, day: number): Promise<DailyLesson> {
  const startDay = day - 4;
  const endDay = day - 1;

  const prompt = `You are creating a CHECKPOINT TEST for an occupational safety English course.

Topic Category: "${category.name}" (${category.nameVietnamese})
This test reviews Days ${startDay}-${endDay} within the ${category.name} topic.
Focus: ${category.description}

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
    "titleVietnamese": "Đánh giá điểm kiểm tra ${day / 5}",
    "description": "This is a comprehensive test of the safety concepts you've learned. You must score 80% or higher to proceed.",
    "vietnamese": "Đây là bài kiểm tra toàn diện về các khái niệm an toàn bạn đã học. Bạn phải đạt 80% trở lên để tiếp tục.",
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
      topicId: topicId,
      topic: `${category.name} - CHECKPOINT ${day / 5}`,
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
    topicId: topicId,
    topic: `${category.name} - CHECKPOINT ${day / 5}`,
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

function generateFallbackLesson(topicId: string, category: any, day: number, isReviewDay: boolean): DailyLesson {
  // Fallback nếu AI fail - trả về lesson cơ bản
  console.warn(`Using fallback lesson for ${category.name} day ${day}`);

  return {
    id: day,
    topicId: topicId,
    topic: isReviewDay ? `${category.name} - CHECKPOINT ${day / 5}` : `${category.name} - Day ${day}`,
    isReviewDay,
    vocab: [
      { term: "Safety", meaning: "Being safe; not dangerous", example: "Safety is our priority.", ipa: "/ˈseɪf.ti/" },
      { term: category.name, meaning: `Related to ${category.name}`, example: `Learn about ${category.name}.`, ipa: "//" }
    ],
    dialogue: [
      { speaker: "Tom", role: "Worker", text: `Tell me about ${category.name}.` },
      { speaker: "Sam", role: "Safety Officer", text: "It's very important for safety." }
    ],
    scenario: {
      title: `${category.name} - Day ${day}`,
      description: `A situation involving ${category.name.toLowerCase()}.`,
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
