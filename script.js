/**
 * DEPOSIT DEFENDER - Logic Engine
 * CA Civil Code § 1950.5 Compliance
 */

// 1. APP STATE
let currentStep = 0;
const answers = {};

// 2. INITIALIZATION (Mobile & Desktop)
document.addEventListener("DOMContentLoaded", () => {
  const checkbox = document.getElementById("legal-agree");
  const startBtn = document.getElementById("start-btn");

  if (checkbox && startBtn) {
    checkbox.addEventListener("change", () => {
      startBtn.disabled = !checkbox.checked;
    });

    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!startBtn.disabled) startApp();
    });
  }
});

function startApp() {
  document.getElementById("landing-page").classList.add("hidden");
  document.getElementById("quiz-container").classList.remove("hidden");
  document.getElementById("progress-bar-container").classList.remove("hidden");
  window.scrollTo(0, 0);
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
      { label: "Partial refund + statement", value: "partial", next: "q4_21_day_check" },
      { label: "Nothing at all", value: "nothing", next: "q6_inspection_notice" },
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
      { label: "N/A (Charges under $125)", value: "na", next: "q6_inspection_notice" },
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
  }
];

// 4. RENDERING ENGINE
function renderQuestion() {
  const q = questions[currentStep];
  const container = document.getElementById("answer-options");
  const progress = (currentStep / questions.length) * 100;

  document.getElementById("progress-bar").style.width = `${progress}%`;
  document.getElementById("question-text").innerText = q.text