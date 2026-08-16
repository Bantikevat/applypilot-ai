document.getElementById("autofill-btn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "AUTO_FILL_DEMO" }, (response) => {
        if (response && response.success) {
          alert(`✨ ApplyPilot AI auto-filled ${response.filledCount} fields successfully! HITL safety submit gate highlighted.`);
        } else {
          alert("ApplyPilot AI auto-fill triggered! Check target form fields.");
        }
      });
    }
  });
});
