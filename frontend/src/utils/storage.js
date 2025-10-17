/**
 * IndexedDB utility for STARK fitness data persistence
 * Provides robust storage with automatic backups
 */

const DB_NAME = 'STARK_Fitness_DB';
const DB_VERSION = 1;
const STORES = {
  USER_DATA: 'userData',
  BACKUPS: 'backups',
  APP_STATE: 'appState'
};

const BACKUP_SLOTS = ['current', 'backup1', 'backup2'];

// Initialize IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // User data store
      if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
        const userDataStore = db.createObjectStore(STORES.USER_DATA, { keyPath: 'id' });
        userDataStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Backups store
      if (!db.objectStoreNames.contains(STORES.BACKUPS)) {
        const backupsStore = db.createObjectStore(STORES.BACKUPS, { keyPath: 'id' });
        backupsStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // App state store
      if (!db.objectStoreNames.contains(STORES.APP_STATE)) {
        db.createObjectStore(STORES.APP_STATE, { keyPath: 'key' });
      }
    };
  });
};

// Generic database operation
const dbOperation = async (storeName, operation, data = null) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    let request;

    switch (operation) {
      case 'get':
        request = store.get(data);
        break;
      case 'put':
        request = store.put(data);
        break;
      case 'delete':
        request = store.delete(data);
        break;
      case 'getAll':
        request = store.getAll();
        break;
      case 'clear':
        request = store.clear();
        break;
      default:
        reject(new Error(`Unknown operation: ${operation}`));
        return;
    }

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

// User Data Operations
export const saveUserData = async (userData) => {
  try {
    // First, create backups by rotating existing data
    await rotateBackups();

    // Save current data
    const dataToSave = {
      id: 'current',
      data: userData,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    await dbOperation(STORES.USER_DATA, 'put', dataToSave);
    console.log('User data saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save user data:', error);
    return false;
  }
};

export const loadUserData = async () => {
  try {
    const result = await dbOperation(STORES.USER_DATA, 'get', 'current');
    return result ? result.data : null;
  } catch (error) {
    console.error('Failed to load user data:', error);
    return null;
  }
};

// Backup Operations
const rotateBackups = async () => {
  try {
    // Move current to backup1, backup1 to backup2
    const currentData = await dbOperation(STORES.USER_DATA, 'get', 'current');

    if (currentData) {
      // Move backup1 to backup2
      const backup1Data = await dbOperation(STORES.USER_DATA, 'get', 'backup1');
      if (backup1Data) {
        const backup2Data = {
          id: 'backup2',
          data: backup1Data.data,
          timestamp: backup1Data.timestamp,
          version: backup1Data.version
        };
        await dbOperation(STORES.USER_DATA, 'put', backup2Data);
      }

      // Move current to backup1
      const newBackup1Data = {
        id: 'backup1',
        data: currentData.data,
        timestamp: currentData.timestamp,
        version: currentData.version
      };
      await dbOperation(STORES.USER_DATA, 'put', newBackup1Data);
    }
  } catch (error) {
    console.error('Failed to rotate backups:', error);
  }
};

export const getBackupData = async (slot) => {
  try {
    if (!BACKUP_SLOTS.includes(slot)) {
      throw new Error(`Invalid backup slot: ${slot}`);
    }

    const result = await dbOperation(STORES.USER_DATA, 'get', slot);
    return result ? result.data : null;
  } catch (error) {
    console.error(`Failed to load backup ${slot}:`, error);
    return null;
  }
};

export const restoreFromBackup = async (slot) => {
  try {
    const backupData = await getBackupData(slot);
    if (backupData) {
      await saveUserData(backupData);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Failed to restore from backup ${slot}:`, error);
    return false;
  }
};

export const getAllBackups = async () => {
  try {
    const allData = await dbOperation(STORES.USER_DATA, 'getAll');
    return allData.filter(item => BACKUP_SLOTS.includes(item.id));
  } catch (error) {
    console.error('Failed to get all backups:', error);
    return [];
  }
};

// App State Operations
export const saveAppState = async (key, value) => {
  try {
    const dataToSave = {
      key,
      value,
      timestamp: new Date().toISOString()
    };

    await dbOperation(STORES.APP_STATE, 'put', dataToSave);
    return true;
  } catch (error) {
    console.error('Failed to save app state:', error);
    return false;
  }
};

export const loadAppState = async (key) => {
  try {
    const result = await dbOperation(STORES.APP_STATE, 'get', key);
    return result ? result.value : null;
  } catch (error) {
    console.error('Failed to load app state:', error);
    return null;
  }
};

// Export/Import Operations
export const exportAllData = async () => {
  try {
    const userData = await loadUserData();
    const backups = await getAllBackups();
    const appState = await loadAppState('onboardingComplete');

    return {
      userData,
      backups,
      appState: { onboardingComplete: appState },
      exportTimestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  } catch (error) {
    console.error('Failed to export data:', error);
    return null;
  }
};

export const importData = async (data) => {
  try {
    // Validate data structure
    if (!data || !data.userData) {
      throw new Error('Invalid import data structure');
    }

    // Save imported user data
    await saveUserData(data.userData);

    // Save onboarding state if present
    if (data.appState && data.appState.onboardingComplete !== undefined) {
      await saveAppState('onboardingComplete', data.appState.onboardingComplete);
    }

    console.log('Data imported successfully');
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
};

// Utility functions
export const clearAllData = async () => {
  try {
    await dbOperation(STORES.USER_DATA, 'clear');
    await dbOperation(STORES.APP_STATE, 'clear');
    console.log('All data cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear data:', error);
    return false;
  }
};

export const getStorageInfo = async () => {
  try {
    const userData = await dbOperation(STORES.USER_DATA, 'getAll');
    const appState = await dbOperation(STORES.APP_STATE, 'getAll');

    return {
      userDataCount: userData.length,
      appStateCount: appState.length,
      totalEntries: userData.length + appState.length,
      backupSlots: BACKUP_SLOTS.length,
      availableSlots: BACKUP_SLOTS.filter(slot => {
        return userData.some(item => item.id === slot);
      }).length
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return null;
  }
};