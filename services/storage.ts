import { UserProgress, DailyLesson } from '../types';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { getLessonForDay as generateLessonLocally } from './curriculum';

// --- Default Data ---
const INITIAL_USER: UserProgress = {
  isLoggedIn: false,
  currentDay: 1,
  completedDays: [],
  quizScores: {},
  name: "",
  email: "",
  jobTitle: "",
  company: "",
  streak: 0,
  lastLoginDate: new Date().toISOString()
};

// --- Auth Functions ---

export const subscribeToAuth = (callback: (user: UserProgress | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
    if (firebaseUser) {
      // User is signed in, fetch data from Firestore
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProgress;
        // Update local auth fields just in case
        const updatedUser: UserProgress = {
          ...data,
          isLoggedIn: true,
          name: firebaseUser.displayName || data.name,
          email: firebaseUser.email || data.email
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

export const markDayCompleteInDb = async (uid: string, currentData: UserProgress, dayId: number, score: number) => {
  if (!uid) return { user: currentData, passed: false };

  const userRef = doc(db, "users", uid);
  const isReviewDay = dayId % 5 === 0;
  const passed = isReviewDay ? score >= 80 : true;

  const updates: any = {
    [`quizScores.${dayId}`]: score
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
    if (!currentData.completedDays.includes(dayId)) {
      updates.completedDays = arrayUnion(dayId);
    }

    // Unlock logic
    if (dayId === currentData.currentDay && currentData.currentDay < 60) {
      updates.currentDay = currentData.currentDay + 1;
    }
  }

  await updateDoc(userRef, updates);

  // Return optimistically updated user object
  const updatedUser = { ...currentData };
  updatedUser.quizScores = { ...updatedUser.quizScores, [dayId]: score };
  if (passed && !updatedUser.completedDays.includes(dayId)) {
    updatedUser.completedDays.push(dayId);
  }
  if (passed && dayId === updatedUser.currentDay && updatedUser.currentDay < 60) {
    updatedUser.currentDay += 1;
  }
  if (today !== lastLogin) {
     updatedUser.streak += 1;
     updatedUser.lastLoginDate = updates.lastLoginDate;
  }

  return { user: updatedUser, passed };
};

// --- Lesson Fetching with Lazy Seeding ---
// This satisfies the requirement to have lessons in Firestore.
// If a lesson is missing in DB, we generate it locally and save it ("Seed") automatically.

export const fetchLesson = async (dayId: number): Promise<DailyLesson> => {
  const lessonRef = doc(db, "lessons", `day_${dayId}`);
  
  try {
    const lessonSnap = await getDoc(lessonRef);
    if (lessonSnap.exists()) {
       return lessonSnap.data() as DailyLesson;
    } else {
       // Seed the DB on demand
       console.log(`Seeding lesson ${dayId} to Firestore...`);
       const lessonData = generateLessonLocally(dayId);
       await setDoc(lessonRef, lessonData);
       return lessonData;
    }
  } catch (err) {
    console.warn("Firestore fetch failed (offline?), falling back to local generation", err);
    return generateLessonLocally(dayId);
  }
};