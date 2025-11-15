console.log('[background] service worker loaded');

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('[background] onMessage received', msg, sender && sender.id);
  if (msg.type === "SHOW_READING_TIME" && typeof msg.minutes === "number") {
    // Store the last total so popup pages can read it from storage.
    if (chrome.storage && chrome.storage.local && chrome.storage.local.set) {
      chrome.storage.local.set({ lastTotal: msg.minutes }, () => {
        proceedOpenPopup(msg, sendResponse);
      });
    } else {
      console.warn('[background] chrome.storage.local unavailable; skipping storage set');
      proceedOpenPopup(msg, sendResponse);
    }
    // (opening popup handled in proceedOpenPopup)
    });
    // Return true to indicate we'll send a response asynchronously
    return true;
  }
  // No async response expected for other message types
  return false;
});
