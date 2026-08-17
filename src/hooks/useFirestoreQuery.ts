import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useFirestoreQuery<T>(collectionName: string) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, collectionName));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        _id: doc.id,
        ...doc.data(),
      })) as T[];
      setData(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionName]);

  return { data, loading };
}
