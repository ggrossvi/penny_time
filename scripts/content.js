// #main-content > devsite-content > article

function renderReadingTime(article) {
  console.log("renderReadingTime called with:", article);

  // If we weren't provided an article, we don't need to render anything.
  if (!article) {
    return;
  }

  const text = article.textContent || "";
  const wordMatchRegExp = /[^\s]+/g; // Regular expression
  const words = text.matchAll(wordMatchRegExp);

  // matchAll returns an iterator, convert to array to get word count
  const wordCount = [...words].length;

  // If no words, don't bother
  if (wordCount === 0) {
    console.log("No words found in article.");
    return;
  }

  const readingTime = Math.round(wordCount / 200) || 1;

  // 🔸 Send message to background to open popup window
  if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
    chrome.runtime.sendMessage({
      type: "SHOW_READING_TIME",
      minutes: readingTime
    });
  }

  // Create inline badge in article
  const badge = document.createElement("p");
  // Use the same styling as the publish information in an article's header
  badge.classList.add("color-secondary-text", "type--caption");
  badge.textContent = `⏱️ ${readingTime} min read`;

  // Support for API reference docs
  const heading = article.querySelector("h1");
  // Support for article docs with date
  const date = article.querySelector("time")?.parentNode;

  // Fallback to article if there is no date or heading
  const target = date ?? heading ?? article;
  target.insertAdjacentElement("afterend", badge);

  console.log("wordCount:", wordCount, "readingTime:", readingTime);
  console.log("badge:", badge);
}

// Run immediately for existing article
renderReadingTime(document.querySelector("article"));


// Watch for new articles (SPA support)
const observerTarget =
  document.querySelector("devsite-content") || document.body;

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node instanceof Element && node.tagName === "ARTICLE") {
        console.log("New <article> detected:", node);
        renderReadingTime(node);
      }
    }
  }
});

observer.observe(observerTarget, {
  childList: true,
  subtree: true
});
