// --- State Management ---
let queue = JSON.parse(localStorage.getItem("iti_queue")) || [];
let currentStudent = JSON.parse(localStorage.getItem("iti_current")) || null;
const MASTER_PIN = "0000"; // Instructor override code

// --- DOM Elements ---
const form = document.getElementById("join-form");
const queueListUl = document.getElementById("queue-list-ul");
const countVal = document.getElementById("count-val");
const timeVal = document.getElementById("time-val");
const currentDisplay = document.getElementById("current-display-content");
const emptyMsg = document.getElementById("empty-queue-msg");
const btnNext = document.getElementById("next-btn");
const btnReset = document.getElementById("reset-btn");
const clockEl = document.getElementById("live-clock");

// --- Functions ---

function updateStorage() {
  localStorage.setItem("iti_queue", JSON.stringify(queue));
  localStorage.setItem("iti_current", JSON.stringify(currentStudent));
  render();
}

function render() {
  renderQueue();
  renderCurrent();
  updateStats();
}

function renderQueue() {
  queueListUl.innerHTML = "";

  if (queue.length === 0) {
    emptyMsg.style.display = "block";
  } else {
    emptyMsg.style.display = "none";

    queue.forEach((student, index) => {
      const li = document.createElement("li");
      li.className = "queue-item";
      li.innerHTML = `
                <div class="queue-number">${index + 1}</div>
                <div class="student-info">
                    <span class="student-name">${student.name}</span>
                    <span class="student-time">${student.task}</span>
                </div>
                <button class="delete-btn" onclick="removeStudent(${index})" title="Cancel my turn">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;
      queueListUl.appendChild(li);
    });
  }
}

function renderCurrent() {
  if (currentStudent) {
    currentDisplay.innerHTML = `
            <h1 class="current-name">${currentStudent.name}</h1>
            <p class="current-id">${currentStudent.task}</p>
        `;
  } else {
    currentDisplay.innerHTML = `
            <h1 class="current-name empty-state">Lab is Ready</h1>
            <p class="current-id empty-state">Click "Call Next" to start</p>
        `;
  }
}

function updateStats() {
  countVal.textContent = queue.length;
  // Assuming 5 mins per student
  timeVal.textContent = queue.length * 5 + " min";
}

// --- Actions ---

function addStudent(e) {
  e.preventDefault();
  const nameInput = document.getElementById("studentName");
  const taskInput = document.getElementById("taskName");
  const pinInput = document.getElementById("studentPin");

  // Handle optional task name
  const taskValue =
    taskInput.value.trim() === "" ? "General Task" : taskInput.value;

  const newStudent = {
    id: Date.now(),
    name: nameInput.value,
    task: taskValue,
    pin: pinInput.value, // Save the PIN
    timestamp: new Date().toLocaleTimeString(),
  };

  queue.push(newStudent);
  updateStorage();

  // Reset form
  nameInput.value = "";
  taskInput.value = "";
  pinInput.value = "";
  nameInput.focus();
}

function callNext() {
  if (queue.length === 0) {
    alert("The queue is empty!");
    currentStudent = null;
  } else {
    // Move first in queue to current
    currentStudent = queue.shift();

    // Play sound
    try {
      const audio = new Audio(
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
      );
      audio.volume = 0.2;
      audio.play();
    } catch (e) {
      console.log("Audio play blocked");
    }
  }
  updateStorage();
}

// Exposed globally for the inline onclick handler in HTML
window.removeStudent = function (index) {
  const student = queue[index];
  const enteredPin = prompt(`Enter PIN for ${student.name} to remove:`);

  if (enteredPin === null) return; // User pressed Cancel

  if (enteredPin === student.pin || enteredPin === MASTER_PIN) {
    queue.splice(index, 1);
    updateStorage();
  } else {
    alert("Incorrect PIN! You cannot delete this entry.");
  }
};

function resetSystem() {
  if (
    confirm(
      "Are you sure you want to clear the WHOLE system? This cannot be undone."
    )
  ) {
    queue = [];
    currentStudent = null;
    updateStorage();
  }
}

function updateClock() {
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString();
}

// --- Event Listeners ---
form.addEventListener("submit", addStudent);
btnNext.addEventListener("click", callNext);
btnReset.addEventListener("click", resetSystem);

// --- Init ---
setInterval(updateClock, 1000);
updateClock();
render();
