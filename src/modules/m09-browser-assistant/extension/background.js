// ApplyPilot AI — Service Worker Background Script
chrome.runtime.onInstalled.addListener(() => {
  console.log("ApplyPilot AI Extension installed successfully.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "FETCH_APPLYPILOT_SESSION") {
    fetch("http://localhost:3000/api/v1/assistant/start-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: request.jobId }),
    })
      .then((res) => res.json())
      .then((data) => sendResponse(data))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});
