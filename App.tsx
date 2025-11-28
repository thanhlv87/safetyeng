import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { Tab, UserProgress, DailyLesson, TopicCategory } from './types';
import { DICTIONARY_TERMS, TOPIC_CATEGORIES, DAY_CATEGORY_MAP } from './services/curriculum';
import { subscribeToAuth, loginWithEmail, logoutUser, saveUserProfile, markDayCompleteInDb, fetchLesson, refreshUserData } from './services/storage';
import { generateCertificate } from './services/certificate';
import { auth } from './services/firebase';

// --- Reusable Components ---

const Button: React.FC<{ 
  onClick?: () => void; 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'google';
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}> = ({ onClick, children, variant = 'primary', className = '', disabled = false, type = "button" }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-safetyBlue text-white hover:bg-blue-800 disabled:opacity-50 disabled:bg-gray-400",
    secondary: "bg-safetyYellow text-safetyBlue hover:bg-yellow-400 disabled:opacity-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    outline: "border-2 border-safetyBlue text-safetyBlue hover:bg-blue-50",
    google: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
  };
  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
    {children}
  </div>
);

const AudioButton: React.FC<{ text: string }> = ({ text }) => {
  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; 
    window.speechSynthesis.speak(utterance);
  };
  return (
    <button onClick={speak} className="text-safetyBlue hover:text-safetyYellow transition-colors p-2 rounded-full hover:bg-blue-50">
      <i className="fas fa-volume-up text-lg"></i>
    </button>
  );
};

const PronunciationTest: React.FC<{ targetPhrase: string }> = ({ targetPhrase }) => {
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<'idle' | 'match' | 'mismatch'>('idle');
  const [spokenText, setSpokenText] = useState('');

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser. Please use Chrome.");
      return;
    }
    
    setIsListening(true);
    setResult('idle');
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSpokenText(transcript);
      if (transcript.toLowerCase().includes(targetPhrase.toLowerCase().replace(/[.,]/g, ''))) {
        setResult('match');
      } else {
        setResult('mismatch');
      }
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="mt-2 flex items-center gap-3">
      <Button variant={isListening ? 'danger' : 'outline'} onClick={startListening} className="text-sm">
        <i className={`fas ${isListening ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
        {isListening ? 'Listening...' : 'Speak Test'}
      </Button>
      {result === 'match' && <span className="text-green-600 font-bold"><i className="fas fa-check-circle"></i> Good!</span>}
      {result === 'mismatch' && <span className="text-red-500 text-sm">Heard: "{spokenText}"</span>}
    </div>
  );
};

// --- Login / Profile View ---

const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      // Auth state listener will handle the rest
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-safetyBlue p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-safetyBlue font-bold text-3xl mx-auto mb-3">S</div>
          <h1 className="text-2xl font-bold text-white">SafetySpeak</h1>
          <p className="text-blue-100">60-Day English Challenge</p>
        </div>

        <form onSubmit={handleLogin} className="p-10 space-y-6">
          <p className="text-gray-600 text-center">Login to track your progress and earn your certificate.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safetyBlue focus:border-transparent"
              placeholder="your-email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-safetyBlue focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            className="w-full justify-center py-3 text-base"
            disabled={loading}
          >
            {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i> Đang đăng nhập...</> : 'Đăng nhập'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Liên hệ admin để được cấp tài khoản
          </p>
        </form>
      </div>
    </div>
  );
};

const ProfileSetup: React.FC<{ user: UserProgress; onComplete: () => void }> = ({ user, onComplete }) => {
  const [formData, setFormData] = useState({
    jobTitle: user.jobTitle || '',
    company: user.company || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(auth.currentUser) {
        setSaving(true);
        try {
          await saveUserProfile(auth.currentUser.uid, formData);
          // Force a small delay to ensure Firestore updates propagate
          await new Promise(resolve => setTimeout(resolve, 500));
          onComplete();
        } catch (error) {
          console.error("Failed to save profile", error);
          alert("Failed to save profile. Please try again.");
        } finally {
          setSaving(false);
        }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full">
         <h2 className="text-2xl font-bold text-safetyBlue mb-4">Complete Profile</h2>
         <p className="text-gray-500 mb-6">We need this info for your certificate.</p>
         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-gray-700">Job Title</label>
               <input 
                 type="text" 
                 required
                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safetyBlue focus:ring-safetyBlue p-2 border"
                 placeholder="Safety Engineer"
                 value={formData.jobTitle}
                 onChange={e => setFormData({...formData, jobTitle: e.target.value})}
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700">Company</label>
               <input 
                 type="text" 
                 required
                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-safetyBlue focus:ring-safetyBlue p-2 border"
                 placeholder="Company Name"
                 value={formData.company}
                 onChange={e => setFormData({...formData, company: e.target.value})}
               />
            </div>
            <Button type="submit" className="w-full justify-center mt-4" disabled={saving}>
              {saving ? <><i className="fas fa-spinner fa-spin mr-2"></i> Saving...</> : 'Save & Continue'}
            </Button>
         </form>
      </Card>
    </div>
  );
};

// --- Page Views ---

const HomeView: React.FC<{ user: UserProgress }> = ({ user }) => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<1 | 2>(user.currentDay > 30 ? 2 : 1);
  const progressPercent = Math.round((user.completedDays.length / 60) * 100);

  const weeks = phase === 1 ? [1, 2, 3, 4, 5, 6] : [7, 8, 9, 10, 11, 12]; 

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-safetyBlue to-blue-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 right-20 w-20 h-20 bg-safetyYellow opacity-10 rounded-full"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center gap-4">
             {user.photoURL && <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full border-2 border-white" />}
             <div>
                <h1 className="text-2xl font-bold">Hi, {user.name}</h1>
                <p className="opacity-90 text-sm">{user.jobTitle} @ {user.company}</p>
                <div className="mt-2 text-xs font-semibold bg-blue-800 inline-block px-2 py-1 rounded">
                   Current: Day {user.currentDay} / 60
                </div>
             </div>
          </div>
          
          <div className="w-full md:w-1/3">
             <div className="flex justify-between text-sm mb-1 font-semibold">
               <span>Overall Progress</span>
               <span>{progressPercent}%</span>
             </div>
             <div className="w-full bg-blue-950 rounded-full h-3">
               <div 
                  className="bg-safetyYellow h-3 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${progressPercent}%` }}
               ></div>
             </div>
             <div className="mt-4 flex gap-3">
                <Button variant="secondary" className="text-sm w-full" onClick={() => navigate(`/day/${user.currentDay}`)}>
                  <i className="fas fa-play"></i> Continue
                </Button>
                {progressPercent >= 100 && (
                  <Button variant="success" className="text-sm w-full" onClick={() => navigate('/certificate')}>
                    Certificate
                  </Button>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Phase Tabs */}
      <div className="flex rounded-lg bg-gray-200 p-1">
        <button
          onClick={() => setPhase(1)}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${phase === 1 ? 'bg-white shadow text-safetyBlue' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Phase 1: Foundation (Days 1-30)
        </button>
        <button
          onClick={() => setPhase(2)}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${phase === 2 ? 'bg-white shadow text-safetyBlue' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Phase 2: Application (Days 31-60)
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {weeks.map((weekIdx, i) => {
          const blockStart = (weekIdx - 1) * 5 + 1;
          
          return (
            <Card key={weekIdx} className="border-t-4 border-safetyBlue relative">
              <div className="absolute top-0 right-0 p-2 opacity-10 text-5xl font-bold text-gray-300">{weekIdx}</div>
              <h3 className="font-bold text-lg mb-4 text-gray-800">Block {weekIdx}</h3>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }, (_, d) => {
                  const dayNum = blockStart + d;
                  const isReview = dayNum % 5 === 0;
                  const isCompleted = user.completedDays.includes(dayNum);
                  const isLocked = dayNum > user.currentDay;
                  const isCurrent = dayNum === user.currentDay;

                  let bgClass = "bg-gray-100 text-gray-400"; // Locked
                  if (isCompleted) bgClass = isReview ? "bg-green-600 text-white" : "bg-green-100 text-green-700 border border-green-200";
                  if (isCurrent) bgClass = "bg-safetyYellow text-safetyBlue font-bold shadow-md ring-2 ring-safetyBlue ring-offset-2";
                  if (!isLocked && !isCompleted && !isCurrent) bgClass = isReview ? "bg-red-50 border border-red-200 text-red-600" : "bg-white border border-gray-300 text-gray-700 hover:bg-blue-50";

                  return (
                    <button
                      key={dayNum}
                      disabled={isLocked}
                      onClick={() => navigate(`/day/${dayNum}`)}
                      className={`h-10 w-full rounded-lg flex flex-col items-center justify-center text-sm transition-all ${bgClass}`}
                    >
                      {isCompleted ? <i className="fas fa-check"></i> : (
                        <>
                          <span className={isReview ? 'font-bold' : ''}>{dayNum}</span>
                          {isReview && <i className="fas fa-star text-[8px]"></i>}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                {user.completedDays.filter(d => d >= blockStart && d < blockStart + 5).length}/5 Completed
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const LessonView: React.FC<{ user: UserProgress; onUpdate: (u: UserProgress) => void }> = ({ user, onUpdate }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dayId = parseInt(id || '1');
  
  const [lesson, setLesson] = useState<DailyLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'vocab' | 'dialogue' | 'scenario' | 'quiz' | 'complete'>('vocab');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);
  const [testFailed, setTestFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showVietnamese, setShowVietnamese] = useState<Record<string, boolean>>({});
  
  // Fetch lesson async
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Check if URL has ?regenerate=true to force regeneration
    const urlParams = new URLSearchParams(window.location.search);
    const forceRegenerate = urlParams.get('regenerate') === 'true';

    if (forceRegenerate) {
      console.log('🔄 Force regenerating lesson...');
    }

    fetchLesson(dayId, forceRegenerate).then(data => {
       if (isMounted) {
          setLesson(data);
          setLoading(false);
          setStep('vocab');
          setQuizAnswers({});
          setTestFailed(false);
       }
    });
    return () => { isMounted = false; };
  }, [dayId]);

  if (loading || !lesson) {
    return (
      <div className="p-10 text-center">
        <i className="fas fa-spinner fa-spin text-4xl text-safetyBlue mb-4"></i>
        <p className="text-lg text-gray-600 font-medium">🤖 Generating your lesson with AI...</p>
        <p className="text-sm text-gray-400 mt-2">This may take 10-20 seconds</p>
      </div>
    );
  }

  const handleQuizSubmit = async () => {
    let correct = 0;
    lesson.quiz.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) correct++;
    });
    const finalScore = Math.round((correct / lesson.quiz.length) * 100);
    setScore(finalScore);
    setSubmitting(true);

    if (auth.currentUser) {
        const result = await markDayCompleteInDb(auth.currentUser.uid, user, dayId, finalScore);
        onUpdate(result.user);
        // Set testFailed if score < 80% (applies to ALL days, not just review days)
        if (!result.passed) {
          setTestFailed(true);
        }
    }
    setSubmitting(false);
    setStep('complete');
  };

  const isReview = lesson.isReviewDay;

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-safetyBlue">
          <i className="fas fa-arrow-left mr-1"></i> Back
        </button>
        <div>
           <h1 className="text-xl md:text-2xl font-bold text-safetyBlue">
             {isReview ? <span className="text-red-600"><i className="fas fa-star"></i> CHECKPOINT TEST</span> : `Day ${dayId}: ${lesson.topic}`}
           </h1>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="flex mb-8 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className={`h-full transition-all w-1/4 ${step === 'vocab' ? 'bg-safetyBlue' : 'bg-safetyBlue'}`}></div>
        <div className={`h-full transition-all w-1/4 ${['dialogue', 'scenario', 'quiz', 'complete'].includes(step) ? 'bg-safetyBlue' : 'bg-gray-200'}`}></div>
        <div className={`h-full transition-all w-1/4 ${['scenario', 'quiz', 'complete'].includes(step) ? 'bg-safetyBlue' : 'bg-gray-200'}`}></div>
        <div className={`h-full transition-all w-1/4 ${['quiz', 'complete'].includes(step) ? 'bg-safetyBlue' : 'bg-gray-200'}`}></div>
      </div>

      {step === 'vocab' && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <i className="fas fa-font mr-2 text-safetyYellow"></i> {isReview ? 'Review Vocabulary' : 'New Words'}
          </h2>
          {lesson.vocab.map((v, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow border-l-4 border-safetyBlue">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{v.term} <span className="text-gray-400 font-normal text-sm font-mono">{v.ipa}</span></h3>
                  <p className="text-gray-600 italic mb-2">{v.meaning}</p>
                  <p className="text-safetyBlue text-sm bg-blue-50 p-2 rounded mb-2">
                    <i className="fas fa-quote-left mr-2 opacity-50"></i>{v.example}
                  </p>
                  {v.vietnamese && (
                    <div className="mt-2">
                      <button
                        onClick={() => setShowVietnamese((prev: Record<string, boolean>) => ({ ...prev, [`vocab-${idx}`]: !prev[`vocab-${idx}`] }))}
                        className="text-xs text-gray-500 hover:text-safetyBlue flex items-center gap-1"
                      >
                        <i className={`fas fa-language`}></i>
                        {showVietnamese[`vocab-${idx}`] ? 'Ẩn bản dịch' : 'Hiện bản dịch'}
                      </button>
                      {showVietnamese[`vocab-${idx}`] && (
                        <p className="text-sm text-green-700 bg-green-50 p-2 rounded mt-1 border border-green-200">
                          🇻🇳 {v.vietnamese}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center ml-4">
                  <AudioButton text={v.term} />
                  {!isReview && <PronunciationTest targetPhrase={v.term} />}
                </div>
              </div>
            </Card>
          ))}
          <div className="flex justify-end mt-6">
            <Button onClick={() => setStep('dialogue')}>Next <i className="fas fa-arrow-right ml-2"></i></Button>
          </div>
        </div>
      )}

      {step === 'dialogue' && (
        <div className="space-y-4 animate-fade-in">
           <h2 className="text-xl font-bold mb-4 flex items-center"><i className="fas fa-comments mr-2 text-safetyYellow"></i> Conversation</h2>
           <Card className="bg-blue-50">
             <div className="space-y-6">
               {lesson.dialogue.map((line, idx) => (
                 <div key={idx} className={`flex gap-4 ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${idx % 2 === 0 ? 'bg-safetyBlue' : 'bg-safetyYellow'}`}>
                     {line.speaker[0]}
                   </div>
                   <div className={`bg-white p-4 rounded-xl shadow-sm max-w-[80%] relative`}>
                     <p className="text-xs text-gray-400 font-bold mb-1">{line.role}</p>
                     <p className="text-gray-800 mb-2">{line.text}</p>
                     {line.vietnamese && (
                       <div className="mt-2">
                         <button
                           onClick={() => setShowVietnamese((prev: Record<string, boolean>) => ({ ...prev, [`dialogue-${idx}`]: !prev[`dialogue-${idx}`] }))}
                           className="text-xs text-gray-500 hover:text-green-600 flex items-center gap-1"
                         >
                           <i className="fas fa-language"></i>
                           {showVietnamese[`dialogue-${idx}`] ? 'Ẩn' : 'Xem dịch'}
                         </button>
                         {showVietnamese[`dialogue-${idx}`] && (
                           <p className="text-sm text-green-700 bg-green-50 p-2 rounded mt-1 border border-green-200">
                             🇻🇳 {line.vietnamese}
                           </p>
                         )}
                       </div>
                     )}
                     <div className="absolute -right-3 top-2">
                       <AudioButton text={line.text} />
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </Card>
           <div className="flex justify-end mt-6">
            <Button onClick={() => setStep('scenario')}>Next <i className="fas fa-arrow-right ml-2"></i></Button>
          </div>
        </div>
      )}

      {step === 'scenario' && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-xl font-bold mb-4 flex items-center"><i className="fas fa-exclamation-triangle mr-2 text-safetyYellow"></i> {isReview ? 'Exam Scenario' : 'Safety Scenario'}</h2>
          <Card>
            <div className="relative h-48 w-full bg-gray-200 rounded-lg mb-4 overflow-hidden">
               <img src={lesson.scenario.imgPlaceholder} alt="Scenario" className="w-full h-full object-cover opacity-80" />
               <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                 Risk Level: {lesson.scenario.dangerLevel}
               </div>
            </div>
            <h3 className="text-xl font-bold mb-2">{lesson.scenario.title}</h3>
            <p className="text-gray-700 leading-relaxed mb-4">{lesson.scenario.description}</p>
            {lesson.scenario.vietnamese && (
              <div className="mt-4">
                <button
                  onClick={() => setShowVietnamese((prev: Record<string, boolean>) => ({ ...prev, 'scenario': !prev['scenario'] }))}
                  className="text-sm text-gray-500 hover:text-safetyBlue flex items-center gap-1"
                >
                  <i className="fas fa-language"></i>
                  {showVietnamese['scenario'] ? 'Ẩn bản dịch' : 'Hiện bản dịch'}
                </button>
                {showVietnamese['scenario'] && (
                  <div className="text-sm text-green-700 bg-green-50 p-3 rounded mt-2 border border-green-200">
                    <p className="font-bold mb-1">🇻🇳 {lesson.scenario.titleVietnamese || 'Tình huống an toàn'}</p>
                    <p>{lesson.scenario.vietnamese}</p>
                  </div>
                )}
              </div>
            )}
            <div className={`p-3 text-sm font-bold border rounded mt-4 ${isReview ? 'bg-red-100 text-red-700 border-red-300' : 'bg-blue-100 text-blue-700 border-blue-300'}`}>
              <i className="fas fa-info-circle mr-2"></i>
              {isReview ? 'CHECKPOINT TEST: You need 80% to unlock the next block.' : 'You need 80% to unlock the next day.'}
            </div>
          </Card>
          <div className="flex justify-end mt-6">
            <Button onClick={() => setStep('quiz')}>{isReview ? 'Start Exam' : 'Start Quiz'} <i className="fas fa-arrow-right ml-2"></i></Button>
          </div>
        </div>
      )}

      {step === 'quiz' && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-xl font-bold mb-4 flex items-center"><i className="fas fa-question-circle mr-2 text-safetyYellow"></i> Knowledge Check</h2>
          {lesson.quiz.map((q) => (
            <Card key={q.id}>
              <p className="font-bold text-lg mb-4">{q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: idx }))}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      quizAnswers[q.id] === idx 
                      ? 'bg-blue-100 border-safetyBlue text-safetyBlue font-semibold' 
                      : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <span className="inline-block w-6 font-bold">{String.fromCharCode(65 + idx)}.</span> {opt}
                  </button>
                ))}
              </div>
            </Card>
          ))}
          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleQuizSubmit} 
              disabled={Object.keys(quizAnswers).length < lesson.quiz.length || submitting}
            >
              {submitting ? <i className="fas fa-spinner fa-spin"></i> : <span>Submit & Finish <i className="fas fa-check ml-2"></i></span>}
            </Button>
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center py-10 space-y-6 animate-fade-in">
           <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto text-4xl ${testFailed ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
             <i className={`fas ${testFailed ? 'fa-times' : 'fa-trophy'}`}></i>
           </div>
           <h2 className="text-3xl font-bold text-gray-800">{testFailed ? 'Not Passed' : 'Day Completed!'}</h2>
           <p className="text-gray-600">
             You scored <span className="font-bold">{score}%</span>.
             {!testFailed && score >= 80 && " Great job! You can continue to the next day."}
             {testFailed && " You need 80% to unlock the next day. Please review and try again."}
           </p>

           {/* Answer Review Section */}
           <div className="mt-8 text-left max-w-2xl mx-auto">
             <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center">
               <i className="fas fa-clipboard-check mr-2 text-safetyBlue"></i> Answer Review
             </h3>
             <div className="space-y-4">
               {lesson.quiz.map((q) => {
                 const userAnswer = quizAnswers[q.id];
                 const isCorrect = userAnswer === q.correctAnswer;
                 return (
                   <Card key={q.id} className={`${isCorrect ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
                     <div className="flex items-start gap-3">
                       <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                         <i className={`fas ${isCorrect ? 'fa-check' : 'fa-times'}`}></i>
                       </div>
                       <div className="flex-1">
                         <p className="font-bold text-gray-900 mb-2">{q.question}</p>
                         <div className="space-y-1 text-sm">
                           {q.options.map((opt, idx) => {
                             const isUserChoice = userAnswer === idx;
                             const isCorrectAnswer = q.correctAnswer === idx;
                             let optClass = 'text-gray-600';
                             if (isCorrectAnswer) optClass = 'text-green-600 font-semibold';
                             if (isUserChoice && !isCorrect) optClass = 'text-red-600 font-semibold line-through';

                             return (
                               <div key={idx} className={`flex items-center gap-2 ${optClass}`}>
                                 <span className="font-bold">{String.fromCharCode(65 + idx)}.</span>
                                 <span>{opt}</span>
                                 {isCorrectAnswer && <i className="fas fa-check-circle text-green-600"></i>}
                                 {isUserChoice && !isCorrect && <i className="fas fa-times-circle text-red-600"></i>}
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     </div>
                   </Card>
                 );
               })}
             </div>
           </div>

           <div className="flex justify-center gap-4 mt-8">
             <Button variant="outline" onClick={() => navigate('/')}>Back Home</Button>

             {testFailed ? (
               <Button variant="danger" onClick={() => {
                   setStep('vocab');
                   setQuizAnswers({});
                   setTestFailed(false);
               }}>Try Again</Button>
             ) : (
               <Button onClick={() => {
                  if(dayId < 60) {
                     navigate('/');
                     // Small hack to ensure data sync before navigating again, or just let Home refresh
                     setTimeout(() => navigate(`/day/${dayId + 1}`), 100);
                  } else {
                    navigate('/certificate');
                  }
               }}>
                 {dayId < 60 ? 'Next Day' : 'Get Certificate'}
               </Button>
             )}
           </div>
        </div>
      )}
    </div>
  );
};

const TopicsOverview: React.FC<{ user: UserProgress }> = ({ user }) => {
  const navigate = useNavigate();

  // Calculate stats for each topic
  const getTopicStats = (categoryId: string) => {
    const daysList = Object.entries(DAY_CATEGORY_MAP)
      .filter(([_, catId]) => catId === categoryId)
      .map(([day, _]) => parseInt(day));

    const completedDays = daysList.filter(day => user.completedDays.includes(day));
    const scores = completedDays.map(day => user.quizScores[day] || 0);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    return {
      totalDays: daysList.length,
      completedDays: completedDays.length,
      avgScore,
      daysList
    };
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="bg-gradient-to-r from-safetyBlue to-blue-900 rounded-2xl p-6 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">
          <i className="fas fa-layer-group mr-3"></i>
          Học theo Chuyên đề
        </h1>
        <p className="opacity-90">Chọn chuyên đề an toàn bạn muốn học</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOPIC_CATEGORIES.map((topic) => {
          const stats = getTopicStats(topic.id);
          const progressPercent = Math.round((stats.completedDays / stats.totalDays) * 100);

          return (
            <Card key={topic.id} className="border-t-4 hover:shadow-lg transition-shadow">
              <div className={`w-16 h-16 rounded-full ${topic.color} flex items-center justify-center text-white text-2xl mb-4`}>
                <i className={`fas ${topic.icon}`}></i>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-1">{topic.name}</h3>
              <p className="text-sm text-gray-600 mb-1">{topic.nameVietnamese}</p>
              <p className="text-sm text-gray-500 mb-4">{topic.description}</p>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    <i className="fas fa-book-open mr-2"></i>
                    Số bài học
                  </span>
                  <span className="font-bold text-gray-900">{stats.totalDays} ngày</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    <i className="fas fa-check-circle mr-2"></i>
                    Đã hoàn thành
                  </span>
                  <span className="font-bold text-green-600">{stats.completedDays}/{stats.totalDays}</span>
                </div>

                {stats.avgScore > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      <i className="fas fa-star mr-2"></i>
                      Điểm trung bình
                    </span>
                    <span className="font-bold text-blue-600">{stats.avgScore}%</span>
                  </div>
                )}

                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`${topic.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate(`/topics/${topic.id}`)}
              >
                <i className="fas fa-play mr-2"></i>
                Bắt đầu học
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const TopicDetailView: React.FC<{ user: UserProgress }> = ({ user }) => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const topic = TOPIC_CATEGORIES.find(t => t.id === topicId);

  if (!topic) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Không tìm thấy chuyên đề</p>
        <Button variant="outline" onClick={() => navigate('/topics')} className="mt-4">
          Quay lại
        </Button>
      </div>
    );
  }

  const daysList = Object.entries(DAY_CATEGORY_MAP)
    .filter(([_, catId]) => catId === topicId)
    .map(([day, _]) => parseInt(day))
    .sort((a, b) => a - b);

  const completedCount = daysList.filter(d => user.completedDays.includes(d)).length;
  const totalScore = daysList.reduce((sum, d) => sum + (user.quizScores[d] || 0), 0);
  const avgScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className={`${topic.color} bg-gradient-to-r rounded-2xl p-6 text-white shadow-xl`}>
        <Button
          variant="outline"
          className="mb-4 !text-white !border-white hover:!bg-white/20"
          onClick={() => navigate('/')}
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Quay lại Chuyên đề
        </Button>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl">
            <i className={`fas ${topic.icon}`}></i>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{topic.name}</h1>
            <p className="text-lg opacity-90">{topic.nameVietnamese}</p>
          </div>
        </div>

        <p className="opacity-90 mb-4">{topic.description}</p>

        <div className="grid grid-cols-3 gap-4 bg-white/10 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{daysList.length}</div>
            <div className="text-sm opacity-80">Tổng bài học</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{completedCount}</div>
            <div className="text-sm opacity-80">Đã hoàn thành</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{avgScore}%</div>
            <div className="text-sm opacity-80">Điểm TB</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {daysList.map(dayNum => {
          const isCompleted = user.completedDays.includes(dayNum);
          const isLocked = dayNum > user.currentDay;
          const isCurrent = dayNum === user.currentDay;
          const score = user.quizScores[dayNum];

          let bgClass = "bg-gray-100 text-gray-400"; // Locked
          if (isCompleted) bgClass = "bg-green-100 text-green-700 border-2 border-green-300";
          if (isCurrent) bgClass = "bg-safetyYellow text-safetyBlue font-bold shadow-md ring-2 ring-safetyBlue";
          if (!isLocked && !isCompleted && !isCurrent) bgClass = "bg-white border-2 border-gray-300 text-gray-700 hover:bg-blue-50";

          return (
            <button
              key={dayNum}
              disabled={isLocked}
              onClick={() => navigate(`/day/${dayNum}`)}
              className={`p-4 rounded-lg flex flex-col items-center justify-center transition-all ${bgClass}`}
            >
              <div className="text-2xl font-bold mb-1">
                {isCompleted ? <i className="fas fa-check-circle"></i> : dayNum}
              </div>
              <div className="text-xs">Day {dayNum}</div>
              {score !== undefined && (
                <div className="text-xs font-semibold mt-1">
                  {score}%
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const DictionaryView: React.FC = () => {
  const [search, setSearch] = useState('');
  const filtered = DICTIONARY_TERMS.filter(t =>
    t.term.toLowerCase().includes(search.toLowerCase()) ||
    t.def.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-20">
      <h1 className="text-2xl font-bold text-safetyBlue mb-6">Occupational Safety Dictionary</h1>
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search for OSHA terms, hazards..."
          className="w-full p-4 pl-12 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-safetyBlue focus:outline-none"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
      </div>
      <div className="grid gap-4">
        {filtered.map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-safetyBlue">
            <div className="flex justify-between items-start">
              <div>
                 <h3 className="font-bold text-lg text-gray-900">{item.term}</h3>
                 <p className="text-gray-600">{item.def}</p>
              </div>
              <AudioButton text={item.term} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-gray-500 mt-10">No terms found.</p>}
      </div>
    </div>
  );
};

const CertificateView: React.FC<{ user: UserProgress }> = ({ user }) => {
  const percent = Math.round((user.completedDays.length / 60) * 100);
  
  return (
    <div className="text-center py-10 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-safetyBlue mb-2">Certificate of Completion</h1>
      <p className="text-gray-600 mb-8">English for Occupational Safety</p>
      
      <Card className="mb-8 border-4 border-double border-safetyYellow bg-slate-50 relative overflow-hidden">
         <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <i className="fas fa-hard-hat text-9xl"></i>
         </div>
         <div className="relative z-10">
            <i className="fas fa-award text-6xl text-safetyBlue mb-4"></i>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-500">{user.jobTitle} - {user.company}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 my-4">
               <div className="bg-green-500 h-2 rounded-full" style={{width: `${percent}%`}}></div>
            </div>
            <p className="text-sm text-gray-500 mb-4">{percent}% Completed</p>
            
            {percent < 100 ? (
              <div className="p-4 bg-yellow-100 text-yellow-800 rounded mb-4 text-sm text-left">
                <i className="fas fa-lock mr-2"></i> 
                <strong>Requirement:</strong> Complete all 60 days including the Final Certification Exam to unlock the official PDF download.
              </div>
            ) : (
              <div className="p-4 bg-green-100 text-green-800 rounded mb-4 text-sm">
                <i className="fas fa-check-circle mr-2"></i> Certificate Ready!
              </div>
            )}
         </div>
      </Card>

      <Button 
        onClick={() => generateCertificate(user)} 
        disabled={percent < 100}
        className="w-full justify-center py-3 text-lg"
      >
        <i className="fas fa-file-pdf mr-2"></i> Download PDF
      </Button>
    </div>
  );
};

// --- Layout & Main App ---

const BottomNav: React.FC = () => {
  const navItems = [
    { id: 'topics', icon: 'fa-layer-group', label: 'Topics', path: '/' },
    { id: Tab.HOME, icon: 'fa-chart-line', label: 'Progress', path: '/dashboard' },
    { id: Tab.DICTIONARY, icon: 'fa-book', label: 'Dict', path: '/dictionary' },
    { id: Tab.PROFILE, icon: 'fa-user', label: 'Profile', path: '/certificate' },
  ];
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center z-50 md:hidden shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
       {navItems.map(item => (
         <Link key={item.id} to={item.path} className="flex flex-col items-center text-gray-400 hover:text-safetyBlue active:text-safetyBlue">
            <i className={`fas ${item.icon} text-xl mb-1`}></i>
            <span className="text-xs font-medium">{item.label}</span>
         </Link>
       ))}
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase Auth state
    const unsubscribe = subscribeToAuth((userData) => {
      console.log("Auth state changed:", userData ? "logged in" : "logged out");
      setUser(userData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <i className="fas fa-circle-notch fa-spin text-4xl text-safetyBlue"></i>
      </div>
    );
  }

  // Login Check
  if (!user || !user.isLoggedIn) {
    return <LoginView />;
  }

  // Force profile setup if missing essential info for certificate
  if (!user.jobTitle || !user.company) {
    return <ProfileSetup user={user} onComplete={async () => {
      // Refresh user data from Firestore
      if (auth.currentUser) {
        const updatedUser = await refreshUserData(auth.currentUser.uid);
        if (updatedUser) {
          setUser({
            ...updatedUser,
            isLoggedIn: true,
            name: auth.currentUser.displayName || updatedUser.name,
            email: auth.currentUser.email || updatedUser.email,
            photoURL: auth.currentUser.photoURL || undefined
          });
        }
      }
    }} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-16 md:pb-0">
        {/* Desktop Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40 hidden md:block">
          <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-safetyBlue rounded flex items-center justify-center text-white font-bold">S</div>
              <span className="text-xl font-bold text-safetyBlue">SafetySpeak</span>
            </div>
            <nav className="flex gap-6">
              <Link to="/" className="font-medium hover:text-safetyBlue">Dashboard</Link>
              <Link to="/dictionary" className="font-medium hover:text-safetyBlue">Dictionary</Link>
              <Link to="/certificate" className="font-medium hover:text-safetyBlue">Certificate</Link>
            </nav>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{user.name}</span>
              {user.photoURL ? (
                <img src={user.photoURL} className="w-8 h-8 rounded-full" alt="User" />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                  <i className="fas fa-user"></i>
                </div>
              )}
              <button onClick={logoutUser} className="text-xs text-red-500 hover:underline ml-2">Sign Out</button>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <div className="md:hidden bg-safetyBlue text-white p-4 sticky top-0 z-40 shadow-lg flex justify-between items-center">
           <span className="font-bold text-lg">SafetySpeak</span>
           <div className="flex gap-3 items-center">
             <div className="flex items-center gap-2 text-sm bg-blue-800 px-2 py-1 rounded">
               <i className="fas fa-fire text-safetyYellow"></i> {user.streak}
             </div>
             <button onClick={logoutUser} className="text-white"><i className="fas fa-sign-out-alt"></i></button>
           </div>
        </div>

        <main className="max-w-5xl mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<TopicsOverview user={user} />} />
            <Route path="/dashboard" element={<HomeView user={user} />} />
            <Route path="/day/:id" element={<LessonView user={user} onUpdate={setUser} />} />
            <Route path="/topics/:topicId" element={<TopicDetailView user={user} />} />
            <Route path="/dictionary" element={<DictionaryView />} />
            <Route path="/certificate" element={<CertificateView user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <BottomNav />
      </div>
    </Router>
  );
};

export default App;