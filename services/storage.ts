import { UserProgress, DailyLesson, TopicProgress, DictionaryTerm, FlashcardProgress } from '../types';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection } from "firebase/firestore";
import { getLessonForDay as generateLessonLocally } from './curriculum';
import { generateLessonWithAI } from './gemini';

// --- Default Data ---
const INITIAL_USER: UserProgress = {
  isLoggedIn: false,
  name: "",
  email: "",
  jobTitle: "",
  company: "",
  streak: 0,
  lastLoginDate: new Date().toISOString(),
  topics: {} // No topics started initially
};

const INITIAL_TOPIC_PROGRESS: TopicProgress = {
  currentDay: 1,
  completedDays: [],
  quizScores: {}
};

// --- Auth Functions ---

export const subscribeToAuth = (callback: (user: UserProgress | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
    if (firebaseUser) {
      // User is signed in, fetch data from Firestore
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as any;

        // Migrate old data structure to new topic-based structure
        let topics = data.topics || {};

        // If old structure exists (currentDay, completedDays, quizScores at root level), migrate it
        if (data.currentDay !== undefined && Object.keys(topics).length === 0) {
          console.log("Migrating old user data to new topic-based structure");
          // This was the old single-track system - we can't migrate it meaningfully
          // Just start fresh with new structure
          topics = {};
        }

        const updatedUser: UserProgress = {
          isLoggedIn: true,
          name: firebaseUser.displayName || data.name || "",
          email: firebaseUser.email || data.email || "",
          jobTitle: data.jobTitle,
          company: data.company,
          streak: data.streak || 0,
          lastLoginDate: data.lastLoginDate || new Date().toISOString(),
          topics: topics,
          flashcards: data.flashcards || {}
        };

        // Only set photoURL if it exists
        if (firebaseUser.photoURL) {
          updatedUser.photoURL = firebaseUser.photoURL;
        } else if (data.photoURL) {
          updatedUser.photoURL = data.photoURL;
        }

        callback(updatedUser);
      } else {
        // New User -> Create Document
        const newUser: UserProgress = {
          ...INITIAL_USER,
          isLoggedIn: true,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User",
          email: firebaseUser.email || ""
        };

        // Only add photoURL if it exists (for Google login compatibility)
        if (firebaseUser.photoURL) {
          newUser.photoURL = firebaseUser.photoURL;
        }

        await setDoc(userRef, newUser);
        callback(newUser);
      }
    } else {
      // User is signed out
      callback(null);
    }
  });
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Signed in:", userCredential.user.email);
    return userCredential.user;
  } catch (error: any) {
    console.error("❌ Login failed:", error.code, error.message);

    // User-friendly error messages in Vietnamese
    if (error.code === 'auth/user-not-found') {
      throw new Error('Tài khoản không tồn tại');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Mật khẩu không đúng');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Email không hợp lệ');
    } else if (error.code === 'auth/invalid-credential') {
      throw new Error('Email hoặc mật khẩu không đúng');
    } else {
      throw new Error('Đăng nhập thất bại: ' + error.message);
    }
  }
};

export const logoutUser = async () => {
  await firebaseSignOut(auth);
};

// --- Data Functions ---

export const saveUserProfile = async (uid: string, data: Partial<UserProgress>) => {
  if (!uid) return;
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
};

export const refreshUserData = async (uid: string): Promise<UserProgress | null> => {
  if (!uid) return null;
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as UserProgress;
  }
  return null;
};

export const markDayCompleteInDb = async (uid: string, currentData: UserProgress, topicId: string, dayId: number, score: number) => {
  if (!uid) return { user: currentData, passed: false };

  const userRef = doc(db, "users", uid);
  // IMPORTANT: All days require 80% to unlock next day, not just review days
  const passed = score >= 80;

  const topicProgress = currentData.topics[topicId] || INITIAL_TOPIC_PROGRESS;

  const updates: any = {
    [`topics.${topicId}.quizScores.${dayId}`]: score
  };

  // Check streak
  const today = new Date().toDateString();
  const lastLogin = new Date(currentData.lastLoginDate).toDateString();
  if (today !== lastLogin) {
    updates.streak = (currentData.streak || 0) + 1;
    updates.lastLoginDate = new Date().toISOString();
  }

  if (passed) {
    // Only update completedDays if not already there
    if (!topicProgress.completedDays.includes(dayId)) {
      updates[`topics.${topicId}.completedDays`] = arrayUnion(dayId);
    }

    // Unlock logic - advance to next day within this topic
    if (dayId === topicProgress.currentDay && topicProgress.currentDay < 60) {
      updates[`topics.${topicId}.currentDay`] = topicProgress.currentDay + 1;
    }
  }

  await updateDoc(userRef, updates);

  // Return optimistically updated user object
  const updatedUser = { ...currentData };
  const updatedTopicProgress = { ...topicProgress };
  updatedTopicProgress.quizScores = { ...updatedTopicProgress.quizScores, [dayId]: score };
  if (passed && !updatedTopicProgress.completedDays.includes(dayId)) {
    updatedTopicProgress.completedDays = [...updatedTopicProgress.completedDays, dayId];
  }
  if (passed && dayId === updatedTopicProgress.currentDay && updatedTopicProgress.currentDay < 60) {
    updatedTopicProgress.currentDay += 1;
  }

  updatedUser.topics = { ...updatedUser.topics, [topicId]: updatedTopicProgress };

  if (today !== lastLogin) {
     updatedUser.streak += 1;
     updatedUser.lastLoginDate = updates.lastLoginDate;
  }

  return { user: updatedUser, passed };
};

// --- Topic Management ---

// Initialize a topic when user starts learning it
export const initializeTopic = async (uid: string, currentData: UserProgress, topicId: string) => {
  if (!uid) return currentData;

  // Check if topic already initialized
  if (currentData.topics[topicId]) {
    return currentData;
  }

  const userRef = doc(db, "users", uid);
  const newTopicProgress = { ...INITIAL_TOPIC_PROGRESS };

  await updateDoc(userRef, {
    [`topics.${topicId}`]: newTopicProgress
  });

  const updatedUser = { ...currentData };
  updatedUser.topics = { ...updatedUser.topics, [topicId]: newTopicProgress };

  console.log(`✅ Initialized topic ${topicId} for user`);
  return updatedUser;
};

// --- Lesson Fetching with Lazy Seeding ---
// This satisfies the requirement to have lessons in Firestore.
// If a lesson is missing in DB, we generate it locally and save it ("Seed") automatically.

export const fetchLesson = async (topicId: string, dayId: number, forceRegenerate = false): Promise<DailyLesson> => {
  const lessonRef = doc(db, "lessons", `${topicId}_day_${dayId}`);

  try {
    const lessonSnap = await getDoc(lessonRef);

    // Check if we should use cached version
    if (lessonSnap.exists() && !forceRegenerate) {
       console.log(`📚 Loading cached lesson ${topicId} Day ${dayId} from Firestore`);
       return lessonSnap.data() as DailyLesson;
    } else {
       // Generate lesson with AI and cache it to Firestore
       console.log(`🤖 Generating lesson ${topicId} Day ${dayId} with AI...`);
       const lessonData = await generateLessonWithAI(topicId, dayId);
       await setDoc(lessonRef, lessonData);
       console.log(`✅ Lesson ${topicId} Day ${dayId} generated and cached to Firestore`);
       return lessonData;
    }
  } catch (err) {
    console.warn("AI generation failed, using fallback", err);
    return generateLessonLocally(dayId);
  }
};

// --- Dictionary Vocabulary Management ---

// Save generated vocabulary terms to Firestore
export const saveGeneratedVocabulary = async (topicId: string, terms: DictionaryTerm[]): Promise<void> => {
  try {
    const vocabRef = doc(db, "vocabulary", topicId);
    const vocabSnap = await getDoc(vocabRef);

    if (vocabSnap.exists()) {
      // Append to existing terms
      const existingData = vocabSnap.data();
      const existingTerms = existingData.terms || [];
      const combinedTerms = [...existingTerms, ...terms];

      await updateDoc(vocabRef, {
        terms: combinedTerms,
        lastUpdated: new Date().toISOString()
      });
    } else {
      // Create new document
      await setDoc(vocabRef, {
        topicId,
        terms,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    }

    console.log(`✅ Saved ${terms.length} vocabulary terms for ${topicId}`);
  } catch (error) {
    console.error("Failed to save vocabulary:", error);
    throw error;
  }
};

// Load all generated vocabulary for a topic from Firestore
export const loadGeneratedVocabulary = async (topicId: string): Promise<DictionaryTerm[]> => {
  try {
    const vocabRef = doc(db, "vocabulary", topicId);
    const vocabSnap = await getDoc(vocabRef);

    if (vocabSnap.exists()) {
      const data = vocabSnap.data();
      return data.terms || [];
    }

    return [];
  } catch (error) {
    console.error("Failed to load vocabulary:", error);
    return [];
  }
};

// Load all vocabulary across all topics
export const loadAllVocabulary = async (): Promise<DictionaryTerm[]> => {
  try {
    const topicIds = ['general-safety', 'chemicals', 'electrical', 'height-work', 'equipment', 'emergency'];
    const allTerms: DictionaryTerm[] = [];

    for (const topicId of topicIds) {
      const terms = await loadGeneratedVocabulary(topicId);
      allTerms.push(...terms);
    }

    return allTerms;
  } catch (error) {
    console.error("Failed to load all vocabulary:", error);
    return [];
  }
};

// --- Flashcard Progress Management ---

// Mark a term as learned
export const markTermAsLearned = async (uid: string, topicId: string, term: string): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const flashcards = data.flashcards || {};
      const topicProgress = flashcards[topicId] || { learned: [], reviewing: [], lastStudied: {} };

      // Add to learned if not already there
      if (!topicProgress.learned.includes(term)) {
        topicProgress.learned.push(term);
      }

      // Remove from reviewing if present
      topicProgress.reviewing = topicProgress.reviewing.filter((t: string) => t !== term);

      // Update last studied timestamp
      topicProgress.lastStudied[term] = new Date().toISOString();

      await updateDoc(userRef, {
        [`flashcards.${topicId}`]: topicProgress
      });

      console.log(`✅ Marked "${term}" as learned in ${topicId}`);
    }
  } catch (error) {
    console.error("Failed to mark term as learned:", error);
    throw error;
  }
};

// Mark a term for review
export const markTermForReview = async (uid: string, topicId: string, term: string): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const flashcards = data.flashcards || {};
      const topicProgress = flashcards[topicId] || { learned: [], reviewing: [], lastStudied: {} };

      // Add to reviewing if not already there
      if (!topicProgress.reviewing.includes(term)) {
        topicProgress.reviewing.push(term);
      }

      // Update last studied timestamp
      topicProgress.lastStudied[term] = new Date().toISOString();

      await updateDoc(userRef, {
        [`flashcards.${topicId}`]: topicProgress
      });

      console.log(`✅ Marked "${term}" for review in ${topicId}`);
    }
  } catch (error) {
    console.error("Failed to mark term for review:", error);
    throw error;
  }
};