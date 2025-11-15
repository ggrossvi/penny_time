// readingTime.js
const params = new URLSearchParams(window.location.search);
const minutesParam = params.get("minutes");
const minutes = Number(minutesParam);

const timeEl = document.getElementById("totalDisplay");

if (!timeEl) {
  console.warn('readingTime.js: element with id "totalDisplay" not found in DOM. Skipping text update.');
} else {
  if (!minutes || Number.isNaN(minutes)) {
    timeEl.textContent = "Couldn't determine cart total.";
  } else {
    timeEl.textContent = `⏱️ ${minutes} minute(s) to read`;
  }
}
