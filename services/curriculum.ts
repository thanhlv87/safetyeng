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

// Topic-Based Dictionary Data - 20 starter words per topic
import { DictionaryTerm } from '../types';

export const DICTIONARY_TERMS: DictionaryTerm[] = [
  // General Safety (20 terms)
  { term: "PPE", def: "Personal Protective Equipment like helmets, gloves, and safety boots", ipa: "/piː.piː.iː/", vietnamese: "Thiết bị bảo hộ cá nhân", topicId: "general-safety", level: "basic" },
  { term: "Hazard", def: "Anything that can cause harm or injury", ipa: "/ˈhæz.ərd/", vietnamese: "Mối nguy hiểm", topicId: "general-safety", level: "basic" },
  { term: "Risk", def: "The chance that a hazard will cause harm", ipa: "/rɪsk/", vietnamese: "Rủi ro", topicId: "general-safety", level: "basic" },
  { term: "Safety Sign", def: "Visual warning or instruction to prevent accidents", ipa: "/ˈseɪf.ti saɪn/", vietnamese: "Biển báo an toàn", topicId: "general-safety", level: "basic" },
  { term: "Hard Hat", def: "Protective helmet worn on construction sites", ipa: "/hɑːrd hæt/", vietnamese: "Mũ bảo hiểm", topicId: "general-safety", level: "basic" },
  { term: "Safety Boots", def: "Protective footwear with steel toe caps", ipa: "/ˈseɪf.ti buːts/", vietnamese: "Giày bảo hộ", topicId: "general-safety", level: "basic" },
  { term: "Safety Glasses", def: "Eye protection to prevent injury from flying particles", ipa: "/ˈseɪf.ti ˈɡlæs.ɪz/", vietnamese: "Kính bảo hộ", topicId: "general-safety", level: "basic" },
  { term: "Gloves", def: "Hand protection from cuts, chemicals, or heat", ipa: "/ɡlʌvz/", vietnamese: "Găng tay", topicId: "general-safety", level: "basic" },
  { term: "High-Vis Vest", def: "Reflective clothing to make workers visible", ipa: "/haɪ vɪz vest/", vietnamese: "Áo phản quang", topicId: "general-safety", level: "basic" },
  { term: "Evacuation", def: "Leaving a dangerous place to go to a safe place", ipa: "/ɪˌvæk.juˈeɪ.ʃən/", vietnamese: "Sơ tán", topicId: "general-safety", level: "basic" },
  { term: "Emergency Exit", def: "Special door used to leave building during emergency", ipa: "/ɪˈmɜː.dʒən.si ˈek.sɪt/", vietnamese: "Lối thoát hiểm", topicId: "general-safety", level: "intermediate" },
  { term: "First Aid", def: "Immediate help given to injured person", ipa: "/fɜːst eɪd/", vietnamese: "Sơ cứu", topicId: "general-safety", level: "basic" },
  { term: "Fire Extinguisher", def: "Device to put out small fires", ipa: "/ˈfaɪər ɪkˈstɪŋ.ɡwɪ.ʃər/", vietnamese: "Bình chữa cháy", topicId: "general-safety", level: "basic" },
  { term: "Assembly Point", def: "Safe meeting place during emergency evacuation", ipa: "/əˈsem.bli pɔɪnt/", vietnamese: "Điểm tập trung", topicId: "general-safety", level: "intermediate" },
  { term: "Incident Report", def: "Written record of an accident or near-miss", ipa: "/ˈɪn.sɪ.dənt rɪˈpɔːrt/", vietnamese: "Báo cáo sự cố", topicId: "general-safety", level: "intermediate" },
  { term: "Near Miss", def: "An accident that almost happened but didn't", ipa: "/nɪər mɪs/", vietnamese: "Suýt xảy ra tai nạn", topicId: "general-safety", level: "intermediate" },
  { term: "Safety Inspection", def: "Regular check to find and fix hazards", ipa: "/ˈseɪf.ti ɪnˈspek.ʃən/", vietnamese: "Kiểm tra an toàn", topicId: "general-safety", level: "intermediate" },
  { term: "Toolbox Talk", def: "Short safety meeting before starting work", ipa: "/ˈtuːl.bɒks tɔːk/", vietnamese: "Họp an toàn ngắn", topicId: "general-safety", level: "intermediate" },
  { term: "Permit to Work", def: "Authorization required for high-risk tasks", ipa: "/pərˈmɪt tə wɜːrk/", vietnamese: "Giấy phép làm việc", topicId: "general-safety", level: "advanced" },
  { term: "Risk Assessment", def: "Process of identifying and evaluating risks", ipa: "/rɪsk əˈses.mənt/", vietnamese: "Đánh giá rủi ro", topicId: "general-safety", level: "advanced" },

  // Chemical Safety (20 terms)
  { term: "SDS", def: "Safety Data Sheet - document with chemical hazard info", ipa: "/es.diː.es/", vietnamese: "Phiếu dữ liệu an toàn", topicId: "chemicals", level: "basic" },
  { term: "Flammable", def: "Material that can easily catch fire", ipa: "/ˈflæm.ə.bəl/", vietnamese: "Dễ cháy", topicId: "chemicals", level: "basic" },
  { term: "Corrosive", def: "Chemical that can destroy or damage materials", ipa: "/kəˈroʊ.sɪv/", vietnamese: "Ăn mòn", topicId: "chemicals", level: "basic" },
  { term: "Toxic", def: "Poisonous substance harmful to health", ipa: "/ˈtɑːk.sɪk/", vietnamese: "Độc hại", topicId: "chemicals", level: "basic" },
  { term: "Spill Kit", def: "Equipment to clean up chemical spills safely", ipa: "/spɪl kɪt/", vietnamese: "Bộ dụng cụ xử lý tràn", topicId: "chemicals", level: "basic" },
  { term: "Ventilation", def: "Air circulation to remove harmful fumes", ipa: "/ˌven.təlˈeɪ.ʃən/", vietnamese: "Thông gió", topicId: "chemicals", level: "basic" },
  { term: "Respirator", def: "Breathing protection from harmful gases", ipa: "/ˈres.pə.reɪ.tər/", vietnamese: "Mặt nạ phòng độc", topicId: "chemicals", level: "intermediate" },
  { term: "Chemical Gloves", def: "Specialized gloves resistant to chemicals", ipa: "/ˈkem.ɪ.kəl ɡlʌvz/", vietnamese: "Găng tay hóa chất", topicId: "chemicals", level: "basic" },
  { term: "Fume Hood", def: "Enclosed workspace with ventilation for chemicals", ipa: "/fjuːm hʊd/", vietnamese: "Tủ hút khí độc", topicId: "chemicals", level: "intermediate" },
  { term: "Acid", def: "Corrosive liquid with low pH value", ipa: "/ˈæs.ɪd/", vietnamese: "Axit", topicId: "chemicals", level: "basic" },
  { term: "Base", def: "Alkaline substance with high pH", ipa: "/beɪs/", vietnamese: "Bazơ", topicId: "chemicals", level: "basic" },
  { term: "Neutralize", def: "Make a chemical harmless by balancing pH", ipa: "/ˈnuː.trə.laɪz/", vietnamese: "Trung hòa", topicId: "chemicals", level: "intermediate" },
  { term: "Storage Cabinet", def: "Special cabinet for storing hazardous chemicals", ipa: "/ˈstɔːr.ɪdʒ ˈkæb.ɪ.nət/", vietnamese: "Tủ chứa hóa chất", topicId: "chemicals", level: "intermediate" },
  { term: "Incompatible", def: "Chemicals that react dangerously when mixed", ipa: "/ˌɪn.kəmˈpæt.ə.bəl/", vietnamese: "Không tương thích", topicId: "chemicals", level: "intermediate" },
  { term: "Emergency Shower", def: "Quick wash station for chemical exposure", ipa: "/ɪˈmɜː.dʒən.si ˈʃaʊ.ər/", vietnamese: "Vòi tắm khẩn cấp", topicId: "chemicals", level: "intermediate" },
  { term: "Eye Wash Station", def: "Emergency equipment to rinse eyes exposed to chemicals", ipa: "/aɪ wɑːʃ ˈsteɪ.ʃən/", vietnamese: "Bồn rửa mắt khẩn cấp", topicId: "chemicals", level: "intermediate" },
  { term: "PPE for Chemicals", def: "Complete protective equipment for chemical work", ipa: "/piː.piː.iː fɔːr ˈkem.ɪ.kəlz/", vietnamese: "Đồ bảo hộ hóa chất", topicId: "chemicals", level: "basic" },
  { term: "Hazard Label", def: "Warning sticker showing chemical dangers", ipa: "/ˈhæz.ərd ˈleɪ.bəl/", vietnamese: "Nhãn cảnh báo", topicId: "chemicals", level: "basic" },
  { term: "GHS Symbol", def: "Globally Harmonized System pictogram for hazards", ipa: "/dʒiː.eɪtʃ.es ˈsɪm.bəl/", vietnamese: "Ký hiệu GHS", topicId: "chemicals", level: "advanced" },
  { term: "Exposure Limit", def: "Maximum safe concentration of chemical in air", ipa: "/ɪkˈspoʊ.ʒər ˈlɪm.ɪt/", vietnamese: "Giới hạn phơi nhiễm", topicId: "chemicals", level: "advanced" },

  // Electrical Safety (20 terms)
  { term: "Live Wire", def: "Electrical wire carrying current", ipa: "/laɪv waɪər/", vietnamese: "Dây điện có điện", topicId: "electrical", level: "basic" },
  { term: "Circuit Breaker", def: "Switch that stops electricity when overloaded", ipa: "/ˈsɜː.kɪt ˈbreɪ.kər/", vietnamese: "Cầu dao tự động", topicId: "electrical", level: "basic" },
  { term: "Ground Wire", def: "Safety wire to prevent electric shock", ipa: "/ɡraʊnd waɪər/", vietnamese: "Dây tiếp địa", topicId: "electrical", level: "intermediate" },
  { term: "Lockout/Tagout", def: "Procedure to isolate energy before maintenance", ipa: "/ˈlɑːk.aʊt ˈtæɡ.aʊt/", vietnamese: "Khóa và gắn thẻ", topicId: "electrical", level: "advanced" },
  { term: "Insulated Gloves", def: "Rubber gloves protecting from electric shock", ipa: "/ˈɪn.sjə.leɪ.tɪd ɡlʌvz/", vietnamese: "Găng tay cách điện", topicId: "electrical", level: "basic" },
  { term: "Voltage Tester", def: "Device to check if circuit is live", ipa: "/ˈvoʊl.tɪdʒ ˈtes.tər/", vietnamese: "Bút thử điện", topicId: "electrical", level: "basic" },
  { term: "Arc Flash", def: "Explosive electrical discharge", ipa: "/ɑːrk flæʃ/", vietnamese: "Hồ quang điện", topicId: "electrical", level: "advanced" },
  { term: "De-energize", def: "Turn off and isolate electrical power", ipa: "/diːˈen.ər.dʒaɪz/", vietnamese: "Ngắt điện", topicId: "electrical", level: "intermediate" },
  { term: "Electrical Panel", def: "Box containing circuit breakers and fuses", ipa: "/ɪˈlek.trɪ.kəl ˈpæn.əl/", vietnamese: "Tủ điện", topicId: "electrical", level: "basic" },
  { term: "Extension Cord", def: "Temporary electrical cable", ipa: "/ɪkˈsten.ʃən kɔːrd/", vietnamese: "Dây điện nối dài", topicId: "electrical", level: "basic" },
  { term: "Overload", def: "Too much current flowing through circuit", ipa: "/ˈoʊ.vər.loʊd/", vietnamese: "Quá tải", topicId: "electrical", level: "basic" },
  { term: "Short Circuit", def: "Unintended path for electricity causing danger", ipa: "/ʃɔːrt ˈsɜː.kɪt/", vietnamese: "Đoản mạch", topicId: "electrical", level: "intermediate" },
  { term: "Shock Hazard", def: "Risk of receiving electric current through body", ipa: "/ʃɑːk ˈhæz.ərd/", vietnamese: "Nguy cơ điện giật", topicId: "electrical", level: "basic" },
  { term: "Electrical Fire", def: "Fire caused by electrical equipment", ipa: "/ɪˈlek.trɪ.kəl ˈfaɪər/", vietnamese: "Cháy do điện", topicId: "electrical", level: "intermediate" },
  { term: "GFCI", def: "Ground Fault Circuit Interrupter - safety device", ipa: "/dʒiː.ef.siː.aɪ/", vietnamese: "Cầu dao chống rò điện", topicId: "electrical", level: "advanced" },
  { term: "Insulation", def: "Material preventing electricity from escaping", ipa: "/ˌɪn.sjəˈleɪ.ʃən/", vietnamese: "Cách điện", topicId: "electrical", level: "basic" },
  { term: "Power Tool", def: "Electric-powered equipment", ipa: "/ˈpaʊ.ər tuːl/", vietnamese: "Dụng cụ điện", topicId: "electrical", level: "basic" },
  { term: "Qualified Electrician", def: "Trained person authorized to work with electricity", ipa: "/ˈkwɑː.lɪ.faɪd ɪˌlek.ˈtrɪʃ.ən/", vietnamese: "Thợ điện có chứng chỉ", topicId: "electrical", level: "intermediate" },
  { term: "Warning Sign", def: "Notice indicating electrical hazard present", ipa: "/ˈwɔː.nɪŋ saɪn/", vietnamese: "Biển cảnh báo", topicId: "electrical", level: "basic" },
  { term: "Safe Distance", def: "Minimum clearance from live electrical parts", ipa: "/seɪf ˈdɪs.təns/", vietnamese: "Khoảng cách an toàn", topicId: "electrical", level: "intermediate" },

  // Work at Height (20 terms)
  { term: "Scaffold", def: "Temporary platform for working at height", ipa: "/ˈskæf.əld/", vietnamese: "Giàn giáo", topicId: "height-work", level: "basic" },
  { term: "Harness", def: "Safety belt attached to prevent falls", ipa: "/ˈhɑːr.nəs/", vietnamese: "Dây đai an toàn", topicId: "height-work", level: "basic" },
  { term: "Lanyard", def: "Safety rope connecting harness to anchor", ipa: "/ˈlæn.jərd/", vietnamese: "Dây neo", topicId: "height-work", level: "basic" },
  { term: "Anchor Point", def: "Secure attachment for fall protection", ipa: "/ˈæŋ.kər pɔɪnt/", vietnamese: "Điểm neo", topicId: "height-work", level: "intermediate" },
  { term: "Guardrail", def: "Barrier preventing falls from edges", ipa: "/ˈɡɑːrd.reɪl/", vietnamese: "Lan can bảo vệ", topicId: "height-work", level: "basic" },
  { term: "Ladder", def: "Equipment with rungs for climbing", ipa: "/ˈlæd.ər/", vietnamese: "Thang", topicId: "height-work", level: "basic" },
  { term: "Fall Arrest", def: "System to stop a falling worker", ipa: "/fɔːl əˈrest/", vietnamese: "Chống rơi", topicId: "height-work", level: "intermediate" },
  { term: "Toe Board", def: "Low barrier preventing objects from falling off edge", ipa: "/toʊ bɔːrd/", vietnamese: "Tấm chắn chân", topicId: "height-work", level: "intermediate" },
  { term: "Safety Net", def: "Mesh to catch falling workers or objects", ipa: "/ˈseɪf.ti net/", vietnamese: "Lưới an toàn", topicId: "height-work", level: "basic" },
  { term: "Platform", def: "Flat working surface at height", ipa: "/ˈplæt.fɔːrm/", vietnamese: "Sàn làm việc", topicId: "height-work", level: "basic" },
  { term: "Free Fall Distance", def: "Distance worker falls before system activates", ipa: "/friː fɔːl ˈdɪs.təns/", vietnamese: "Khoảng cách rơi tự do", topicId: "height-work", level: "advanced" },
  { term: "Competent Person", def: "Qualified individual inspecting height work", ipa: "/ˈkɑːm.pɪ.tənt ˈpɜː.sən/", vietnamese: "Người có năng lực", topicId: "height-work", level: "intermediate" },
  { term: "Scaffold Tag", def: "Label showing inspection status of scaffold", ipa: "/ˈskæf.əld tæɡ/", vietnamese: "Thẻ giàn giáo", topicId: "height-work", level: "intermediate" },
  { term: "Three Points of Contact", def: "Safety rule for climbing - always keep 3 limbs attached", ipa: "/θriː pɔɪnts əv ˈkɑːn.tækt/", vietnamese: "Ba điểm tựa", topicId: "height-work", level: "basic" },
  { term: "Leading Edge", def: "Unprotected edge where fall hazard exists", ipa: "/ˈliː.dɪŋ edʒ/", vietnamese: "Mép dẫn", topicId: "height-work", level: "advanced" },
  { term: "D-ring", def: "Metal ring on harness for attaching lanyard", ipa: "/diː rɪŋ/", vietnamese: "Vòng chữ D", topicId: "height-work", level: "intermediate" },
  { term: "Self-Retracting Lifeline", def: "Automatic fall arrest device", ipa: "/self rɪˈtræk.tɪŋ ˈlaɪf.laɪn/", vietnamese: "Dây cứu sinh tự rút", topicId: "height-work", level: "advanced" },
  { term: "Working Load", def: "Maximum weight scaffold can safely hold", ipa: "/ˈwɜː.kɪŋ loʊd/", vietnamese: "Tải trọng làm việc", topicId: "height-work", level: "intermediate" },
  { term: "Fall Protection Plan", def: "Written procedure for preventing falls", ipa: "/fɔːl prəˈtek.ʃən plæn/", vietnamese: "Kế hoạch chống rơi", topicId: "height-work", level: "advanced" },
  { term: "Mobile Scaffold", def: "Scaffold on wheels that can be moved", ipa: "/ˈmoʊ.bəl ˈskæf.əld/", vietnamese: "Giàn giáo di động", topicId: "height-work", level: "intermediate" },

  // Equipment & Machinery (20 terms)
  { term: "Forklift", def: "Vehicle for lifting and moving heavy loads", ipa: "/ˈfɔːrk.lɪft/", vietnamese: "Xe nâng", topicId: "equipment", level: "basic" },
  { term: "Crane", def: "Large machine for lifting heavy objects", ipa: "/kreɪn/", vietnamese: "Cần cẩu", topicId: "equipment", level: "basic" },
  { term: "Emergency Stop Button", def: "Red button to immediately halt machinery", ipa: "/ɪˈmɜː.dʒən.si stɑːp ˈbʌt.ən/", vietnamese: "Nút dừng khẩn cấp", topicId: "equipment", level: "basic" },
  { term: "Machine Guard", def: "Barrier protecting workers from moving parts", ipa: "/məˈʃiːn ɡɑːrd/", vietnamese: "Tấm chắn máy", topicId: "equipment", level: "basic" },
  { term: "Maintenance", def: "Regular service to keep equipment working safely", ipa: "/ˈmeɪn.tən.əns/", vietnamese: "Bảo trì", topicId: "equipment", level: "basic" },
  { term: "Operating Manual", def: "Book with instructions for using equipment", ipa: "/ˈɑː.pə.reɪ.tɪŋ ˈmæn.ju.əl/", vietnamese: "Sách hướng dẫn", topicId: "equipment", level: "basic" },
  { term: "Load Capacity", def: "Maximum weight equipment can safely handle", ipa: "/loʊd kəˈpæs.ə.ti/", vietnamese: "Sức chứa", topicId: "equipment", level: "intermediate" },
  { term: "Pinch Point", def: "Area where body parts can get caught", ipa: "/pɪntʃ pɔɪnt/", vietnamese: "Điểm kẹp", topicId: "equipment", level: "intermediate" },
  { term: "Blind Spot", def: "Area operator cannot see from vehicle", ipa: "/blaɪnd spɑːt/", vietnamese: "Điểm mù", topicId: "equipment", level: "basic" },
  { term: "Spotter", def: "Person guiding equipment operator", ipa: "/ˈspɑː.tər/", vietnamese: "Người hướng dẫn", topicId: "equipment", level: "intermediate" },
  { term: "Pre-Use Inspection", def: "Safety check before operating equipment", ipa: "/priː juːz ɪnˈspek.ʃən/", vietnamese: "Kiểm tra trước khi dùng", topicId: "equipment", level: "basic" },
  { term: "Certification", def: "Official license to operate machinery", ipa: "/ˌsɜː.tɪ.fɪˈkeɪ.ʃən/", vietnamese: "Chứng chỉ", topicId: "equipment", level: "intermediate" },
  { term: "Moving Parts", def: "Components that rotate or move during operation", ipa: "/ˈmuː.vɪŋ pɑːrts/", vietnamese: "Bộ phận chuyển động", topicId: "equipment", level: "basic" },
  { term: "Safety Interlock", def: "Device preventing machine from operating unsafely", ipa: "/ˈseɪf.ti ˈɪn.tər.lɑːk/", vietnamese: "Khóa liên động an toàn", topicId: "equipment", level: "advanced" },
  { term: "Hydraulic System", def: "Fluid-powered mechanism for lifting", ipa: "/haɪˈdrɔː.lɪk ˈsɪs.təm/", vietnamese: "Hệ thống thủy lực", topicId: "equipment", level: "intermediate" },
  { term: "Warning Alarm", def: "Sound alerting people of machinery movement", ipa: "/ˈwɔː.nɪŋ əˈlɑːrm/", vietnamese: "Còi báo động", topicId: "equipment", level: "basic" },
  { term: "Overhead Load", def: "Heavy object lifted above ground level", ipa: "/ˈoʊ.vər.hed loʊd/", vietnamese: "Tải trọng trên cao", topicId: "equipment", level: "intermediate" },
  { term: "Barricade", def: "Barrier keeping people away from machinery", ipa: "/ˈbær.ɪ.keɪd/", vietnamese: "Rào chắn", topicId: "equipment", level: "basic" },
  { term: "Operator's Cabin", def: "Enclosed space where equipment is controlled", ipa: "/ˈɑː.pə.reɪ.tərz ˈkæb.ɪn/", vietnamese: "Cabin điều khiển", topicId: "equipment", level: "basic" },
  { term: "Tag-Out Procedure", def: "Process of labeling equipment as unsafe to use", ipa: "/tæɡ aʊt prəˈsiː.dʒər/", vietnamese: "Quy trình gắn thẻ", topicId: "equipment", level: "advanced" },

  // Emergency Response (20 terms)
  { term: "First Aid Kit", def: "Box with medical supplies for emergencies", ipa: "/fɜːst eɪd kɪt/", vietnamese: "Hộp sơ cứu", topicId: "emergency", level: "basic" },
  { term: "CPR", def: "Cardiopulmonary Resuscitation - life-saving technique", ipa: "/siː.piː.ɑːr/", vietnamese: "Hồi sức tim phổi", topicId: "emergency", level: "intermediate" },
  { term: "Fire Drill", def: "Practice evacuation for fire emergency", ipa: "/ˈfaɪər drɪl/", vietnamese: "Diễn tập cháy", topicId: "emergency", level: "basic" },
  { term: "Muster Point", def: "Designated meeting spot during evacuation", ipa: "/ˈmʌs.tər pɔɪnt/", vietnamese: "Điểm tập trung", topicId: "emergency", level: "basic" },
  { term: "AED", def: "Automated External Defibrillator for heart emergencies", ipa: "/eɪ.iː.diː/", vietnamese: "Máy sốc điện tự động", topicId: "emergency", level: "intermediate" },
  { term: "Burn Treatment", def: "First aid for thermal injuries", ipa: "/bɜːrn ˈtriːt.mənt/", vietnamese: "Xử trí bỏng", topicId: "emergency", level: "intermediate" },
  { term: "Bleeding Control", def: "Stopping blood loss from injury", ipa: "/ˈbliː.dɪŋ kənˈtroʊl/", vietnamese: "Cầm máu", topicId: "emergency", level: "basic" },
  { term: "Emergency Contact", def: "Phone number to call in crisis", ipa: "/ɪˈmɜː.dʒən.si ˈkɑːn.tækt/", vietnamese: "Liên lạc khẩn cấp", topicId: "emergency", level: "basic" },
  { term: "Fire Blanket", def: "Cloth to smother small fires", ipa: "/ˈfaɪər ˈblæŋ.kɪt/", vietnamese: "Chăn chữa cháy", topicId: "emergency", level: "basic" },
  { term: "Smoke Detector", def: "Alarm that sounds when smoke is detected", ipa: "/smoʊk dɪˈtek.tər/", vietnamese: "Báo khói", topicId: "emergency", level: "basic" },
  { term: "Stretcher", def: "Device for carrying injured person", ipa: "/ˈstretʃ.ər/", vietnamese: "Cáng", topicId: "emergency", level: "basic" },
  { term: "Triage", def: "Prioritizing treatment based on injury severity", ipa: "/ˈtriː.ɑːʒ/", vietnamese: "Phân loại thương tật", topicId: "emergency", level: "advanced" },
  { term: "Shock Position", def: "Laying injured person flat with legs elevated", ipa: "/ʃɑːk pəˈzɪʃ.ən/", vietnamese: "Tư thế sốc", topicId: "emergency", level: "intermediate" },
  { term: "Recovery Position", def: "Side-lying position for unconscious breathing person", ipa: "/rɪˈkʌv.ər.i pəˈzɪʃ.ən/", vietnamese: "Tư thế hồi phục", topicId: "emergency", level: "intermediate" },
  { term: "Hazmat Spill", def: "Hazardous material leak requiring special response", ipa: "/ˈhæz.mæt spɪl/", vietnamese: "Tràn hóa chất nguy hiểm", topicId: "emergency", level: "advanced" },
  { term: "Evacuation Route", def: "Planned path to exit building safely", ipa: "/ɪˌvæk.juˈeɪ.ʃən ruːt/", vietnamese: "Lối thoát hiểm", topicId: "emergency", level: "basic" },
  { term: "Fire Warden", def: "Person responsible for evacuation coordination", ipa: "/ˈfaɪər ˈwɔːr.dən/", vietnamese: "Quản lý phòng cháy", topicId: "emergency", level: "intermediate" },
  { term: "Alarm System", def: "Warning devices for emergencies", ipa: "/əˈlɑːrm ˈsɪs.təm/", vietnamese: "Hệ thống báo động", topicId: "emergency", level: "basic" },
  { term: "Incident Commander", def: "Leader managing emergency response", ipa: "/ˈɪn.sɪ.dənt kəˈmæn.dər/", vietnamese: "Chỉ huy sự cố", topicId: "emergency", level: "advanced" },
  { term: "Medical Emergency", def: "Situation requiring immediate medical attention", ipa: "/ˈmed.ɪ.kəl ɪˈmɜː.dʒən.si/", vietnamese: "Cấp cứu y tế", topicId: "emergency", level: "basic" },
];