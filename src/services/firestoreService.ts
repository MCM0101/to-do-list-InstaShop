import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DailyTodos, WorkProcess } from '@/types/todo';

// User ID - in a real app, this would come from authentication
const USER_ID = 'user_instashop_2024';

// Collections
const TODOS_COLLECTION = 'todos';
const PROCESSES_COLLECTION = 'processes';
const SETTINGS_COLLECTION = 'settings';
const ALL_PROCESSES_COLLECTION = 'allProcesses';

export class FirestoreService {
  // ==================== TODOS ====================
  
  static async saveDailyTodos(dailyTodos: DailyTodos[]): Promise<void> {
    try {
      const docRef = doc(db, TODOS_COLLECTION, USER_ID);
      await setDoc(docRef, {
        userId: USER_ID,
        dailyTodos,
        lastUpdated: new Date().toISOString()
      });
      console.log('✅ Daily todos saved to Firestore');
    } catch (error) {
      console.error('❌ Error saving daily todos:', error);
      throw error;
    }
  }

  static async getDailyTodos(): Promise<DailyTodos[]> {
    try {
      const docRef = doc(db, TODOS_COLLECTION, USER_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('✅ Daily todos loaded from Firestore');
        return data.dailyTodos || [];
      } else {
        console.log('📝 No daily todos found, returning empty array');
        return [];
      }
    } catch (error) {
      console.error('❌ Error loading daily todos:', error);
      return [];
    }
  }

  // ==================== CUSTOM PROCESSES ====================
  
  static async saveCustomProcesses(processes: WorkProcess[]): Promise<void> {
    try {
      const docRef = doc(db, PROCESSES_COLLECTION, USER_ID);
      await setDoc(docRef, {
        userId: USER_ID,
        customProcesses: processes,
        lastUpdated: new Date().toISOString()
      });
      console.log('✅ Custom processes saved to Firestore');
    } catch (error) {
      console.error('❌ Error saving custom processes:', error);
      throw error;
    }
  }

  static async getCustomProcesses(): Promise<WorkProcess[]> {
    try {
      const docRef = doc(db, PROCESSES_COLLECTION, USER_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('✅ Custom processes loaded from Firestore');
        return data.customProcesses || [];
      } else {
        console.log('📝 No custom processes found, returning empty array');
        return [];
      }
    } catch (error) {
      console.error('❌ Error loading custom processes:', error);
      return [];
    }
  }

  // ==================== ALL PROCESSES ====================
  
  static async saveAllProcesses(processes: WorkProcess[]): Promise<void> {
    try {
      const docRef = doc(db, ALL_PROCESSES_COLLECTION, USER_ID);
      await setDoc(docRef, {
        userId: USER_ID,
        allProcesses: processes,
        lastUpdated: new Date().toISOString()
      });
      console.log('✅ All processes saved to Firestore');
    } catch (error) {
      console.error('❌ Error saving all processes:', error);
      throw error;
    }
  }

  static async getAllProcesses(): Promise<WorkProcess[]> {
    try {
      const docRef = doc(db, ALL_PROCESSES_COLLECTION, USER_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('✅ All processes loaded from Firestore');
        return data.allProcesses || [];
      } else {
        console.log('📝 No processes found in Firestore, will use default processes');
        return []; // Return empty array, let the hook handle the fallback
      }
    } catch (error) {
      console.error('❌ Error loading all processes:', error);
      return [];
    }
  }

  // ==================== HIDDEN PROCESSES ====================
  
  static async saveHiddenProcesses(hiddenIds: string[]): Promise<void> {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, USER_ID);
      await setDoc(docRef, {
        userId: USER_ID,
        hiddenProcesses: hiddenIds,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      console.log('✅ Hidden processes saved to Firestore');
    } catch (error) {
      console.error('❌ Error saving hidden processes:', error);
      throw error;
    }
  }

  static async getHiddenProcesses(): Promise<string[]> {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, USER_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('✅ Hidden processes loaded from Firestore');
        return data.hiddenProcesses || [];
      } else {
        console.log('📝 No hidden processes found, returning empty array');
        return [];
      }
    } catch (error) {
      console.error('❌ Error loading hidden processes:', error);
      return [];
    }
  }

  // ==================== SYNC METHODS ====================
  
  static async syncAllData(): Promise<{
    dailyTodos: DailyTodos[];
    customProcesses: WorkProcess[];
    hiddenProcesses: string[];
  }> {
    try {
      console.log('🔄 Syncing all data from Firestore...');
      
      const [dailyTodos, customProcesses, hiddenProcesses] = await Promise.all([
        this.getDailyTodos(),
        this.getCustomProcesses(),
        this.getHiddenProcesses()
      ]);

      console.log('✅ All data synced from Firestore');
      return { dailyTodos, customProcesses, hiddenProcesses };
    } catch (error) {
      console.error('❌ Error syncing data:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================
  
  static async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        deleteDoc(doc(db, TODOS_COLLECTION, USER_ID)),
        deleteDoc(doc(db, PROCESSES_COLLECTION, USER_ID)),
        deleteDoc(doc(db, SETTINGS_COLLECTION, USER_ID))
      ]);
      console.log('✅ All data cleared from Firestore');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw error;
    }
  }
}
