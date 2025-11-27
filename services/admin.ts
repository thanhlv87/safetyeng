import { db } from './firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { generateLessonWithAI } from './gemini';
import { setDoc } from 'firebase/firestore';

/**
 * Admin utility to regenerate all lessons with AI
 * WARNING: This will delete all existing lessons and regenerate them
 * Use only when you need to update all lesson content
 */

export async function deleteAllLessons() {
  console.log('🗑️ Deleting all existing lessons...');
  const lessonsRef = collection(db, 'lessons');
  const snapshot = await getDocs(lessonsRef);

  let count = 0;
  for (const docSnapshot of snapshot.docs) {
    await deleteDoc(doc(db, 'lessons', docSnapshot.id));
    count++;
  }

  console.log(`✅ Deleted ${count} lessons`);
  return count;
}

export async function regenerateAllLessons() {
  console.log('🤖 Starting to regenerate all 60 lessons with AI...');
  const results = { success: 0, failed: 0, errors: [] as string[] };

  for (let day = 1; day <= 60; day++) {
    try {
      console.log(`Generating Day ${day}/60...`);
      const lessonData = await generateLessonWithAI(day);
      const lessonRef = doc(db, 'lessons', `day_${day}`);
      await setDoc(lessonRef, lessonData);
      results.success++;
      console.log(`✅ Day ${day} complete`);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error: any) {
      results.failed++;
      results.errors.push(`Day ${day}: ${error.message}`);
      console.error(`❌ Day ${day} failed:`, error);
    }
  }

  console.log(`
🎉 Regeneration complete!
✅ Success: ${results.success}
❌ Failed: ${results.failed}
  `);

  if (results.errors.length > 0) {
    console.error('Errors:', results.errors);
  }

  return results;
}

// For testing individual days
export async function regenerateLesson(dayId: number) {
  console.log(`🤖 Regenerating Day ${dayId}...`);
  try {
    const lessonData = await generateLessonWithAI(dayId);
    const lessonRef = doc(db, 'lessons', `day_${dayId}`);
    await setDoc(lessonRef, lessonData);
    console.log(`✅ Day ${dayId} regenerated successfully`);
    return lessonData;
  } catch (error) {
    console.error(`❌ Failed to regenerate Day ${dayId}:`, error);
    throw error;
  }
}
