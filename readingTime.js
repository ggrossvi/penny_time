// readingTime.js
// readingTime.js: update popup UI from query param OR from chrome.storage.local
const params = new URLSearchParams(window.location.search);
const minutesParam = params.get("minutes");
let minutes = Number(minutesParam);

const timeEl = document.getElementById("totalDisplay");

function updateDisplay(value) {
  if (!timeEl) return;
  const n = Number(value);
  if (!n || Number.isNaN(n)) {
    timeEl.textContent = "Couldn't determine cart total.";
  } else {
    //timeEl.textContent = `⏱️ ${n} minute(s) to read`;
    timeEl.textContent = `$${n}`;
  }
  // TEMPORARY: show a modal alert for testing to confirm popup receives the value
  try {
    //alert('Popup total: ' + (n && !Number.isNaN(n) ? n : 'unknown'));
  } catch (e) {
    // ignore in non-window contexts
  }
}

// Promise-based wrappers for chrome.storage.local (small and easy to use)
function storageGet(key) {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      resolve({});
      return;
    }
    chrome.storage.local.get(key, (res) => resolve(res || {}));
  });
}

function storageSet(obj) {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      resolve();
      return;
    }
    chrome.storage.local.set(obj, () => resolve());
  });
}

// Async init: prefer query param; otherwise await storage read
(async () => {
  if (minutes && !Number.isNaN(minutes)) {
    updateDisplay(minutes);
    return;
  }

  // Try to read from storage using the promise wrapper
  const res = await storageGet('lastTotal');
  if (res && res.lastTotal) {
    minutes = Number(res.lastTotal);
    updateDisplay(minutes);
  } else {
    updateDisplay(undefined);
  }
})();

// Listen for storage changes so the popup updates while open
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.lastTotal) {
      updateDisplay(changes.lastTotal.newValue);
    }
  });
}
