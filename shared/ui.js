// Shared UI helpers for czapala.com pages.

// Disables a button and swaps its label immediately on click, so a tap always
// gives instant feedback and can't be double-fired while the action is in flight.
// Catches and logs errors rather than letting them propagate — an error partway
// through a write must never silently stop the caller's follow-up render from
// running (that's what caused requests/attendance to appear stuck until a
// manual page refresh, before this was fixed).
export async function withBusy(btn, busyText, action){
  if (!btn) {
    try { await action(); } catch (e) { console.error("Action failed:", e); }
    return;
  }
  const originalText = btn.textContent;
  const originalDisabled = btn.disabled;
  btn.disabled = true;
  btn.textContent = busyText;
  try {
    await action();
  } catch (e) {
    console.error("Action failed:", e);
  } finally {
    btn.disabled = originalDisabled;
    btn.textContent = originalText;
  }
}

export function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
