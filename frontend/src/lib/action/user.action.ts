import { v4 as uuid } from "uuid";
import { DB_NAME, DB_STORE, DB_VERSION } from "../constants";
import { User } from "../../types";

export const addUser = async ({
  userName,
}: {
  userName: string;
}): Promise<User> => {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, DB_VERSION);

    open.onupgradeneeded = () => {
      const db = open.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE, { keyPath: "userId" });
      }
    };

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
  const open = indexedDB.open(DB_NAME, DB_VERSION);

  open.onsuccess = () => {
    const db = open.result;
    const transaction = db.transaction(DB_STORE, "readonly");
    const store = transaction.objectStore(DB_STORE);

    store.getAll().onsuccess = (event) => {
      const users = (event.target as IDBRequest).result as User[];
      return users[0];
    };

    transaction.onerror = () => {
      throw new Error("Error getting user from IndexedDB");
    };
  };
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
