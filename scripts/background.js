chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SHOW_READING_TIME" && typeof msg.minutes === "number") {
    // Open the extension popup page and pass the total via query string.
    // popup.html contains an element with id `totalDisplay` and loads `readingTime.js`
    // which reads the `minutes` query parameter and updates the DOM.
    const url = chrome.runtime.getURL(`popup.html?minutes=${encodeURIComponent(msg.minutes)}`);

    chrome.windows.create({
      url,
      type: "popup",
      width: 420,
      height: 380
    });
  }
});
