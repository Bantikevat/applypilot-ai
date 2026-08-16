// ApplyPilot AI — Content Script for Auto-Fill & DOM Inspection
console.log("ApplyPilot AI Browser Assistant Extension Content Script Loaded.");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "AUTO_FILL_DEMO" || request.action === "AUTO_FILL_FORM") {
    const demoData = request.data || {
      fullName: "Banti Kumar",
      email: "banti@applypilot.ai",
      phone: "+91 9876543210",
      dob: "1998-05-15",
      address: "Central Secretariat Colony, New Delhi",
    };

    let filledCount = 0;
    const inputs = document.querySelectorAll("input, textarea, select");

    inputs.forEach((input) => {
      const key = (input.name || input.id || input.placeholder || "").toLowerCase();

      if (key.includes("name") || key.includes("fullname")) {
        input.value = demoData.fullName;
        filledCount++;
      } else if (key.includes("email")) {
        input.value = demoData.email;
        filledCount++;
      } else if (key.includes("phone") || key.includes("mobile")) {
        input.value = demoData.phone;
        filledCount++;
      } else if (key.includes("dob") || key.includes("date")) {
        input.value = demoData.dob;
        filledCount++;
      } else if (key.includes("address") || key.includes("location")) {
        input.value = demoData.address;
        filledCount++;
      }

      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    const submitBtn = document.querySelector('button[type="submit"], input[type="submit"]');
    if (submitBtn) {
      submitBtn.style.border = "3px solid #6366f1";
      submitBtn.style.boxShadow = "0 0 20px rgba(99, 102, 241, 0.9)";
      submitBtn.style.transform = "scale(1.02)";
    }

    sendResponse({ success: true, filledCount });
  }

  if (request.action === "HIGHLIGHT_HITL_SUBMIT") {
    const submitBtn = document.querySelector('button[type="submit"], input[type="submit"]');
    if (submitBtn) {
      submitBtn.style.border = "3px solid #6366f1";
      submitBtn.style.boxShadow = "0 0 20px rgba(99, 102, 241, 0.9)";
    }
    sendResponse({ success: true });
  }
  return true;
});
