console.log('[background] service worker loaded');

// Helper to open the popup URL with a tab fallback
function proceedOpenPopup(message, respond) {
  const url = chrome.runtime.getURL(`popup.html?minutes=${encodeURIComponent(message.minutes)}`);
  console.log('[background] opening popup url', url);
  try {
    chrome.windows.create({ url, type: 'popup', width: 420, height: 380 }, (win) => {
      if (chrome.runtime.lastError) {
        console.error('[background] chrome.windows.create failed', chrome.runtime.lastError);
        // Fallback to a tab
        chrome.tabs.create({ url }, (tab) => {
          if (chrome.runtime.lastError) {
            console.error('[background] chrome.tabs.create also failed', chrome.runtime.lastError);
            if (respond) respond({ ok: false, error: chrome.runtime.lastError.message });
          } else {
            console.log('[background] opened tab as fallback', tab && tab.id);
            if (respond) respond({ ok: true, fallback: 'tab', tabId: tab && tab.id });
          }
        });
      } else {
        console.log('[background] opened window', win && win.id);
        if (respond) respond({ ok: true, windowId: win && win.id });
      }
    });
  } catch (err) {
    console.error('[background] exception calling chrome.windows.create', err);
    if (respond) respond({ ok: false, error: String(err) });
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('[background] onMessage received', msg, sender && sender.id);
  if (!msg || !msg.type) return false;

  if (msg.type === 'SHOW_READING_TIME' && typeof msg.minutes === 'number') {
    // We'll reply asynchronously.
    let responded = false;
    const sendOnce = (resp) => {
      if (responded) return; responded = true;
      try { sendResponse(resp); } catch (e) { console.warn('[background] sendResponse failed', e); }
    };

    // Attempt to set storage, then open popup.
    if (chrome.storage && chrome.storage.local && chrome.storage.local.set) {
      chrome.storage.local.set({ lastTotal: msg.minutes }, () => {
        proceedOpenPopup(msg, sendOnce);
      });
    } else {
      console.warn('[background] chrome.storage.local unavailable; skipping storage set');
      proceedOpenPopup(msg, sendOnce);
    }

    return true; // indicate async response
  }

  return false;
});
