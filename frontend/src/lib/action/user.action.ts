import { v4 as uuid } from "uuid";
import { DB_NAME, DB_STORE, DB_VERSION, SCORE_INC } from "../constants";
import { User } from "../../types";

export const addUser = async ({
  userName,
}: {
  userName: string;
}): Promise<User> => {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, DB_VERSION);

    open.onsuccess = () => {
      const db = open.result;
      const transaction = db.transaction(DB_STORE, "readwrite");
      const store = transaction.objectStore(DB_STORE);
      const userId = uuid();

      const newUser: User = {
        userName,
        userId,
        tic_tac_toe_high_score: 0,
      };

      const request = store.add(newUser);

      request.onsuccess = () => {
        resolve(newUser);
      };

      request.onerror = () => {
        reject(new Error("Error adding user to IndexedDB"));
      };
    };

    open.onerror = () => {
      reject(new Error("Error opening IndexedDB"));
    };
  });
};

export const getUser = async () => {
  return new Promise<User | null>((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, DB_VERSION);

    open.onupgradeneeded = () => {
      const db = open.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE, { keyPath: "userId" });
      }
    };

    open.onsuccess = () => {
      const db = open.result;
      const transaction = db.transaction(DB_STORE, "readonly");
      const store = transaction.objectStore(DB_STORE);

      store.getAll().onsuccess = (event) => {
        const users = (event.target as IDBRequest).result as User[];
        if (users.length > 0) {
          resolve(users[0]);
        } else {
          resolve(null);
        }
      };

      transaction.onerror = () => {
        reject(new Error("Error getting user from IndexedDB"));
      };
    };

    open.onerror = () => {
      reject(new Error("Error opening IndexedDB"));
    };
  });
};

export const updateUser = async (user: User): Promise<void> => {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, DB_VERSION);

    open.onsuccess = () => {
      const db = open.result;
      const transaction = db.transaction(DB_STORE, "readwrite");
      const store = transaction.objectStore(DB_STORE);

      const request = store.put(user);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error("Error updating user in IndexedDB"));
      };
    };

    open.onerror = () => {
      reject(new Error("Error opening IndexedDB"));
    };
  });
};

export const increaseHighScore = async (): Promise<User> => {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, DB_VERSION);

    open.onsuccess = async () => {
      const db = open.result;
      const transaction = db.transaction(DB_STORE, "readwrite");
      const store = transaction.objectStore(DB_STORE);

      store.getAll().onsuccess = async (event) => {
        const users = (event.target as IDBRequest).result as User[];
        if (users.length > 0) {
          const user = users[0];
          const updatedUser = {
            ...user,
            tic_tac_toe_high_score: user?.tic_tac_toe_high_score + SCORE_INC,
          };

          store.put(updatedUser);
          resolve(updatedUser);
        }
      };

      transaction.onerror = () => {
        reject(
          new Error(
            "Error increasing high score in IndexedDB || " + transaction.error,
          ),
        );
      };

      transaction.onerror = () => {
        reject(
          new Error(
            "Error increasing high score in IndexedDB ||" + transaction.error,
          ),
        );
      };
    };

    open.onerror = () => {
      reject(new Error("Error opening IndexedDB ||" + open.error));
    };
  });
};
