// #main-content > devsite-content > article

function renderShoppingTotal(body) {
    alert("renderShoppingTotal called with:", body);
    const allElements = Array.from(document.querySelectorAll("body *"));

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
        alert("No total price candidates found.");
    return null;
  }
}

// Try to run the shopping-total scanner when the page is ready.
// Prefer an <article> element if present, otherwise fall back to document.body.
function tryRenderShoppingTotal() {
  const target = document.querySelector('article') ?? document.querySelector('body');
  if (!target) {
    alert('renderShoppingTotal: no <article> or <body> found yet.');
    return;
  }
    try {
    const total = renderShoppingTotal(target);
    alert('renderShoppingTotal returned: ' + String(total));
  } catch (err) {
    alert('renderShoppingTotal threw an error: ' + String(err));
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

