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
    purpose: "Landlords must mail to this address or your last known one.",
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
    purpose: "Determines if the 21-day rule was triggered.",
  },
  {
    id: "q4_21_day_check",
    text: "Did you receive the statement within 21 days of moving out?",
    type: "select",
    options: [
      { label: "Yes", value: "yes", next: "q5_receipts" },
      { label: "No", value: "no", next: "q5_receipts" },
    ],
    purpose: "Strict deadline under §1950.5(g).",
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
    purpose: "Required documentation for repair costs.",
  },
  {
    id: "q6_inspection_notice",
    text: "Did the landlord notify you in writing of your right to an 'Initial Inspection'?",
    type: "select",
    options: [
      { label: "Yes", value: "yes", next: "q7_inspection_list" },
      { label: "No", value: "no", next: "END" },
    ],
    purpose: "Required notice under §1950.5(f)(1).",
  },
  {
    id: "q7_inspection_list",
    text: "If an inspection happened, did they give you an itemized list of proposed repairs?",
    type: "select",
    options: [
      { label: "Yes", value: "yes", next: "END" },
      { label: "No / Never inspected", value: "no", next: "END" },
    ],
    purpose: "Allows you to clean/repair before move-out.",
  },
];

let currentStep = 0;
const answers = {};

function renderQuestion() {
  const q = questions[currentStep];
  const container = document.getElementById("answer-options");
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
    btn.innerText = "Next";
    btn.onclick = () =>
      handleAnswer(document.getElementById("date-input").value);
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

function handleAnswer(value, nextOverride) {
  const currentQ = questions[currentStep];
  answers[currentQ.id] = value;

  if (nextOverride === "END" || currentStep === questions.length - 1) {
    showResults();
  } else {
    currentStep++;
    renderQuestion();
  }
}

function showResults() {
  document.getElementById("quiz-container").classList.add("hidden");
  const results = document.getElementById("results-container");
  const flagsDiv = document.getElementById("flags-list");
  const letterText = document.getElementById("letter-text");
  results.classList.remove("hidden");

  let violations = [];

  // --- RULE ENGINE LOGIC ---

  // 1. 21-Day Deadline
  if (
    answers.q3_received_status === "nothing" ||
    answers.q4_21_day_check === "no"
  ) {
    violations.push(
      "Failure to provide a refund or itemized statement within 21 days (§1950.5(g)(1))",
    );
    flagsDiv.innerHTML += `<div class="flag-item"><strong>Deadline Violation:</strong> The 21-day window for your deposit return has been missed.</div>`;
  }

  // 2. Receipt Requirements
  if (answers.q5_receipts === "no") {
    violations.push(
      "Failure to provide required receipts/documentation for deductions exceeding $125 (§1950.5(g)(2))",
    );
    flagsDiv.innerHTML += `<div class="flag-item"><strong>Documentation Violation:</strong> Landlords must provide copies of receipts or invoices for most repairs over $125.</div>`;
  }

  // 3. Pre-Move-Out Inspection Notice
  if (answers.q6_inspection_notice === "no") {
    violations.push(
      "Failure to notify tenant in writing of the right to an initial inspection (§1950.5(f)(1))",
    );
    flagsDiv.innerHTML += `<div class="flag-item"><strong>Inspection Right Violation:</strong> You were not given notice of your right to a walk-through to identify potential deductions.</div>`;
  }

  // 4. Proposed Deduction List
  if (
    answers.q6_inspection_notice === "yes" &&
    answers.q7_inspection_list === "no"
  ) {
    violations.push(
      "Failure to provide an itemized statement of repairs required following the initial inspection (§1950.5(f)(2))",
    );
    flagsDiv.innerHTML += `<div class="flag-item"><strong>Procedural Violation:</strong> If an inspection occurs, the landlord must provide a list of repairs to allow the tenant an opportunity to remedy them.</div>`;
  }

  // Generate Letter
  if (violations.length > 0) {
    document.getElementById("letter-section").classList.remove("hidden");
    const vText = violations.map((v) => `* ${v}`).join("\n");

    letterText.value = `To: [Landlord Name]\nFrom: [Your Name]\nDate: ${new Date().toLocaleDateString()}\n\nRE: Security Deposit Return Compliance (Civil Code §1950.5)\n\nDear [Landlord Name],\n\nI am writing regarding the security deposit for [Address]. Based on my records, the following procedural requirements of California Civil Code §1950.5 were not met:\n\n${vText}\n\nPlease return the full security deposit amount of $[Amount] to me at [Address] within 10 days of this notice. If this is not resolved, I may seek the full amount plus statutory damages in Small Claims Court.\n\nSincerely,\n\n[Your Name]`;
  } else {
    flagsDiv.innerHTML =
      "<p>No significant procedural violations detected based on your answers.</p>";
  }
}

// Helper to copy text
function copyLetter() {
  const text = document.getElementById("letter-text");
  text.select();
  navigator.clipboard.writeText(text.value);

  const status = document.getElementById("copy-status");
  status.innerText = "Copied successfully!";
  setTimeout(() => (status.innerText = ""), 3000);
}

// Init
renderQuestion();
