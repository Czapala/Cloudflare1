// Generic transactional read-modify-write for a single Firestore document.
//
// Runs mutateFn against the doc's current data, read fresh from the server —
// not the local cache — inside a Firestore transaction, so the write only
// commits if nothing else changed the doc in between (Firestore retries
// automatically on conflict). This closes the lost-update race that a plain
// read-then-write has when two people act on the same document at once.
//
// mutateFn(currentData) returns the full new document to write, or a falsy
// value to skip writing (e.g. the doc's in a state where this action no
// longer applies).
//
// If provided, onCommitted(newData) fires with the just-written result —
// use it to echo the result straight into your own local cache, since an
// onSnapshot listener on the same doc has no ordering guarantee relative to
// this function returning, and rendering from a stale cache right after your
// own write can visibly revert whatever the user just did.
export async function mutateDocTransactional(db, firestoreMod, ref, mutateFn, { onCommitted } = {}){
  const { runTransaction } = firestoreMod;
  let committed = null;
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists() ? snap.data() : null;
    const updated = mutateFn(current);
    committed = updated;
    if (updated) tx.set(ref, updated);
  });
  if (committed && onCommitted) onCommitted(committed);
  return committed;
}
