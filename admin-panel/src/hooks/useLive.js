import { useEffect, useState } from 'react';
import { ref, onValue, limitToLast } from 'firebase/database';
import { db } from '../firebase.js';

// Live list. Returns [rows, error] where rows === undefined until first load.
// The effect cleanup unsubscribes, so re-mounts can never stack listeners.
export function useLiveList(path, limit) {
  const [rows, setRows] = useState(undefined);
  const [error, setError] = useState(null);

  useEffect(() => {
    let q = ref(db, path);
    if (limit) q = limitToLast(q, limit);

    const unsub = onValue(
      q,
      (snap) => {
        const list = [];
        snap.forEach((child) => list.push({ key: child.key, ...child.val() }));
        setRows(list);
        setError(null);
      },
      (err) => setError(err)
    );

    return unsub;
  }, [path, limit]);

  return [rows, error];
}

// Live single record. Returns [value, error]; value === undefined while loading.
export function useLiveRecord(path) {
  const [value, setValue] = useState(undefined);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!path) return;

    const unsub = onValue(
      ref(db, path),
      (snap) => { setValue(snap.val()); setError(null); },
      (err) => setError(err)
    );

    return unsub;
  }, [path]);

  return [value, error];
}
