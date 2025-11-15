chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SHOW_READING_TIME" && typeof msg.minutes === "number") {
    const url = chrome.runtime.getURL(`readingTime.html?minutes=${msg.minutes}`);

    chrome.windows.create({
      url,
      type: "popup",
      width: 400,
      height: 300
    });
  }
});
