import React from "react";
import { db } from "@/lib/firebase"; // We created this earlier

export const FirestoreContext = React.createContext(db);

export function FirestoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <FirestoreContext.Provider value={db}>
      {children}
    </FirestoreContext.Provider>
  );
}

export function useFirestore() {
  return React.useContext(FirestoreContext);
}
