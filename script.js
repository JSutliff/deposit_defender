/**
 * DEPOSIT DEFENDER - Logic Engine
 * CA Civil Code § 1950.5 Compliance
 */

// 1. APP STATE
let currentStep = 0;
const answers = {};

// 2. INITIALIZATION & SPLASH SCREEN
const checkbox = document.getElementById("legal-agree");
const startBtn = document.getElementById("start-btn");

// Listen for the legal disclaimer agreement
if (checkbox) {
  checkbox.addEventListener("change", function () {
    startBtn.disabled = !this.checked;
  });
}

function startApp() {
  document.getElementById("landing-page").classList.add("hidden");
  document.getElementById("quiz-container").classList.remove("hidden");
  document.getElementById("progress-bar-container").classList.remove("hidden");
  renderQuestion();
}

// 3. QUESTION DATA
const questions = [
  {
    id: "q1_possession",
    text: "When did you return the keys and vacate?",
    type: "date",
    next: "q2_address",
    purpose: "Starts the 21-day statutory clock.",
  },
  {
    id: "q2_address",
    text: "Did you provide a forwarding address?",
    type: "select",
    options: [
      { label: "Yes", value: "yes", next: "q3_received_status" },
      { label: "No", value: "no", next: "q3_received_status" },
    ],
    purpose: "Determines if the landlord had your contact info.",
  },
  {
    id: "q3_received_status",
    text: "What have you received from the landlord?",
    type: "select",
    options: [
      { label: "Full refund", value: "full", next: "q6_inspection_notice" },
      {
        label: "Partial refund + statement",
        value: "partial",
        next: "q4_21_day_check",
      },
      {
        label: "Nothing at all",
        value: "nothing",
        next: "q6_inspection_notice",
      },
    ],
    purpose: "Identifies if the 21-day deadline applies.",
  },
  {
    id: "q4_21_day_check",
    text: "Did you receive the statement within 21 days of moving out?",
    type: "select",
    options: [
      { label: "Yes", value: "yes", next: "q5_receipts" },
      { label: "No", value: "no", next: "q5_receipts" },
    ],
    purpose: "Checks compliance with §1950.5(g)(1).",
  },
  {
    id: "q5_receipts",
    text: "Were receipts attached for charges over $125?",
    type: "select",
    options: [
      { label: "Yes", value: "yes", next: "q6_inspection_notice" },
      { label: "No / Some missing", value: "no", next: "q6_inspection_notice" },
      {
        label: "N/A (Charges under $125)",
        value: "na",
        next: "q6_inspection_notice",
      },
    ],
    purpose: "Mandatory documentation per §1950.5(g)(2).",
  },
  {
    id: "q6_inspection_notice",
    text: "Did the landlord notify you in writing of your right to an 'Initial Inspection'?",
    type: "select",
    options: [
      { label: "Yes", value: "yes", next: "q7_inspection_list" },
      { label: "No", value: "no", next: "END" },
    ],
    purpose: "Required notice per §1950.5(f)(1).",
  },
  {
    id: "q7_inspection_list",
    text: "Did they give you an itemized list of proposed repairs after the inspection?",
    type: "select",
    options: [
      { label: "Yes", value: "yes", next: "END" },
      { label: "No / Never inspected", value: "no", next: "END" },
    ],
    purpose: "Right to remedy repairs per §1950.5(f)(2).",
  },
];

// 4. RENDERING ENGINE
function renderQuestion() {
  const q = questions[currentStep];
  const container = document.getElementById("answer-options");

  // Update Progress
  const progress = (currentStep / questions.length) * 100;
  document.getElementById("progress-bar").style.width = `${progress}%`;

  document.getElementById("question-text").innerText = q.text;
  document.getElementById("purpose-text").innerText = q.purpose;
  container.innerHTML = "";

  if (q.type === "date") {
    const input = document.createElement("input");
    input.type = "date";
    input.id = "date-input";
    const btn = document.createElement("button");
    btn.innerText = "Next Question";
    btn.className = "primary-btn";
    btn.onclick = () => {
      const val = document.getElementById("date-input").value;
      if (!val) return alert("Please select a date");
      handleAnswer(val, q.next);
    };
    container.appendChild(input);
    container.appendChild(btn);
  } else {
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.innerText = opt.label;
      btn.onclick = () => handleAnswer(opt.value, opt.next);
      container.appendChild(btn);
    });
  }
}

// 5. NAVIGATION & BRANCHING
function handleAnswer(value, nextId) {
  answers[questions[currentStep].id] = value;

  if (nextId === "END") {
    showResults();
  } else {
    // Find the index of the next question ID
    const nextIndex = questions.findIndex((q) => q.id === nextId);
    if (nextIndex !== -1) {
      currentStep = nextIndex;
      renderQuestion();
    } else {
      showResults();
    }
  }
}

// 6. RULE ENGINE & RESULTS
function showResults() {
  document.getElementById("quiz-container").classList.add("hidden");
  document.getElementById("progress-bar-container").classList.add("hidden");

  const results = document.getElementById("results-container");
  const flagsDiv = document.getElementById("flags-list");
  const letterText = document.getElementById("letter-text");

  results.classList.remove("hidden");
  flagsDiv.innerHTML = ""; // Reset
  let violations = [];

  // Rule 1: 21-Day Deadline
  if (
    answers.q3_received_status === "nothing" ||
    answers.q4_21_day_check === "no"
  ) {
    violations.push(
      "Failure to provide a refund or itemized statement within 21 days (§1950.5(g)(1))",
    );
    flagsDiv.innerHTML += `<div class="flag-item"><strong>Deadline Violation:</strong> The 21-day window has been missed.</div>`;
  }

  // Rule 2: Receipts
  if (answers.q5_receipts === "no") {
    violations.push(
      "Failure to provide receipts for deductions over $125 (§1950.5(g)(2))",
    );
    flagsDiv.innerHTML += `<div class="flag-item"><strong>Documentation Violation:</strong> Missing required repair receipts.</div>`;
  }

  // Rule 3: Inspection Notice
  if (answers.q6_inspection_notice === "no") {
    violations.push(
      "Failure to notify in writing of right to initial inspection (§1950.5(f)(1))",
    );
    flagsDiv.innerHTML += `<div class="flag-item"><strong>Procedural Violation:</strong> No notice of inspection rights given.</div>`;
  }

  // Rule 4: Repair List
  if (
    answers.q6_inspection_notice === "yes" &&
    answers.q7_inspection_list === "no"
  ) {
    violations.push(
      "Failure to provide itemized list of repairs after inspection (§1950.5(f)(2))",
    );
    flagsDiv.innerHTML += `<div class="flag-item"><strong>Procedural Violation:</strong> No list of repairs provided after walk-through.</div>`;
  }

  // Generate Letter Template
  if (violations.length > 0) {
    document.getElementById("letter-section").classList.remove("hidden");
    const vText = violations.map((v) => `* ${v}`).join("\n");

    letterText.value = `To: [Landlord Name]\nFrom: [Your Name]\nDate: ${new Date().toLocaleDateString()}\n\nRE: Security Deposit Demand (CA Civil Code §1950.5)\n\nDear [Landlord Name],\n\nI am writing regarding the deposit for [Address]. Possession was returned on ${answers.q1_possession || "[Date]"}. The following procedural violations were noted:\n\n${vText}\n\nPlease return the full amount of $[Amount] to [Forwarding Address] within 10 days. If not resolved, I will seek all legal remedies including statutory damages.\n\nSincerely,\n\n[Your Name]`;
  } else {
    flagsDiv.innerHTML =
      "<p>No significant procedural violations detected.</p>";
  }
}

// 7. UTILS
function copyLetter() {
  const text = document.getElementById("letter-text");
  text.select();
  navigator.clipboard.writeText(text.value);
  const status = document.getElementById("copy-status");
  status.innerText = "Copied to clipboard!";
  setTimeout(() => (status.innerText = ""), 3000);
}
