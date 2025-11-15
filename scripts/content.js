// #main-content > devsite-content > article

function renderShoppingTotal(root = document.body) {
  // Accept an optional root element to scope the search (defaults to document.body)
  if (!root) return null;
  //alert("renderShoppingTotal called with: " + (root && root.nodeName ? root.nodeName : String(root)));
  const allElements = Array.from((root.querySelectorAll && root.querySelectorAll('*')) || []);

    //Define key word matching pattern using Regex for variations of total
    const keywordRegex = /(grand total|order total|estimated total|est\.?\s?total|subtotal|sub total|final total|final price|total due|total amount|amount due|amount to pay|due today|checkout total|payment total|item total|estimate|total)/i;

    //Define a pattern for matching text or elements that might be the price using regex
    const priceRegex = /(\$|USD)?\s?\d{1,5}(\.\d{2})?/;

    //This list stores every element that might be our total price
    let candidates = [];

    //Loop through every element in the body
    allElements.forEach(el => {
        const text = el.textContent.trim(); //change to text

        //Check if element contains both price and text for total
        if (keywordRegex.test(text) && priceRegex.test(text)) {

            const priceMatch = text.match(priceRegex)[0];
            const price = parseFloat(priceMatch.replace(/[^0-9.]/g, ""));

            let score = 0;

            if (/grand total/i.test(text)) score += 5;
            if (/estimated total|est\.?\s?total/i.test(text)) score += 4;
            if (/order total/i.test(text)) score += 3;
            if (/final total|final price/i.test(text)) score += 3;
            if (/subtotal|sub total/i.test(text)) score += 1;
            if (/total/i.test(text)) score += 1;

            score += price / 100;

            candidates.push({ el, text, price, score });
        }
    });

    if (candidates.length > 0) {

        candidates.sort((a, b) => b.score - a.score);
        const best = candidates[0];
        const total = best.price.toFixed(2);
        const totalPriceNum = Number(total);
        alert("Identified total price: " + total + " from element: " + best.el + " with text: " + best.text);
    return totalPriceNum;
  } else {
        //alert("No total price candidates found.");
    return null;
  }
}

// Try to run the shopping-total scanner when the page is ready.
// Prefer an <article> element if present, otherwise fall back to document.body.
// Wait for an element matching `selector` to appear under `root` and be stable
// (no DOM mutations for `stableMs` milliseconds). Rejects after `timeout` ms.
function waitForStableElement(selector, root = document, { timeout = 5000, stableMs = 200 } = {}) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    function startStabilityCheck(el) {
      let lastChange = Date.now();
      const observer = new MutationObserver(() => { lastChange = Date.now(); });
      observer.observe(el, { childList: true, subtree: true, attributes: true });

      const checkInterval = setInterval(() => {
        if (Date.now() - lastChange >= stableMs) {
          clearInterval(checkInterval);
          observer.disconnect();
          resolve(el);
        } else if (Date.now() - start > timeout) {
          clearInterval(checkInterval);
          observer.disconnect();
          reject(new Error('waitForStableElement: timed out waiting for stable element'));
        }
      }, Math.max(50, Math.floor(stableMs / 3)));
    }

    // If already present, start stability check immediately
    const existing = root.querySelector && root.querySelector(selector);
    if (existing) return startStabilityCheck(existing);

    // Otherwise observe additions under root (or document.body) until element appears
    const parentToObserve = root === document ? document.body : root;
    if (!parentToObserve) return reject(new Error('waitForStableElement: no parent to observe'));

    const outerObserver = new MutationObserver(() => {
      const el = root.querySelector && root.querySelector(selector);
      if (el) {
        outerObserver.disconnect();
        startStabilityCheck(el);
      } else if (Date.now() - start > timeout) {
        outerObserver.disconnect();
        reject(new Error('waitForStableElement: timed out waiting for element'));
      }
    });

    outerObserver.observe(parentToObserve, { childList: true, subtree: true });

    // overall timeout fallback
    setTimeout(() => {
      try { outerObserver.disconnect(); } catch (e) {}
      reject(new Error('waitForStableElement: timed out (fallback)'));
    }, timeout + 50);
  });
}

async function tryRenderShoppingTotal() {
  // Prefer an <article> when present and wait for it to stabilize (useful on SPAs).
  let target = null;
  try {
    target = await waitForStableElement('article', document, { timeout: 4000, stableMs: 200 });
  } catch (err) {
    // No stable article found in time; fall back to waiting for full load then use body
    if (document.readyState !== 'complete') {
      await new Promise(r => window.addEventListener('load', r, { once: true }));
    }
    target = document.body;
  }

  if (!target) {
    //alert('renderShoppingTotal: no target found to scan.');
    return;
  }

  // Try multiple times in case the page continues updating after the article
  // appears (some SPAs modify content after insertion). This retries the
  // scanner a few times with a short delay before giving up.
  const maxAttempts = 6;
  const delayMs = 500;
  let total = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      total = renderShoppingTotal(target);
      if (total !== null && typeof total !== 'undefined') {
        alert('renderShoppingTotal returned: ' + String(total));
        break;
      }
      // Not found yet — wait and retry (unless this was the last attempt)
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    } catch (err) {
      alert('renderShoppingTotal threw an error: ' + String(err));
      break;
    }
  }

  if (total === null || typeof total === 'undefined') {
    alert('renderShoppingTotal: no total found after retries.');
  }
}

// Run when DOM is ready, on load, and immediately as a best-effort.
document.addEventListener('DOMContentLoaded', tryRenderShoppingTotal);
window.addEventListener('load', tryRenderShoppingTotal);
tryRenderShoppingTotal();
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getShoppingTotal") {
    const total = renderShoppingTotal(document.body);
    sendResponse({ total });
  }
});

