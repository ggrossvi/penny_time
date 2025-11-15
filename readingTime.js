// readingTime.js
const params = new URLSearchParams(window.location.search);
const minutesParam = params.get("minutes");
const minutes = Number(minutesParam);

const timeEl = document.getElementById("time");

if (!minutes || Number.isNaN(minutes)) {
  timeEl.textContent = "Couldn't determine reading time.";
} else {
  timeEl.textContent = `⏱️ ${minutes} minute(s) to read`;
}
