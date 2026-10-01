
import { db } from "./firebase-config.js";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const studentSelect = document.getElementById("studentSelect");
const registrationForm = document.getElementById("registrationForm");
const statusMessage = document.getElementById("registrationStatus");

// ================= LOAD ACTIVE STUDENTS =================

async function loadStudents() {
  try {
    const studentsSnapshot = await getDocs(
      collection(db, "students")
    );

    studentSelect.innerHTML =
      '<option value="">Select a student</option>';

    studentsSnapshot.forEach((studentDoc) => {
      const student = studentDoc.data();

      if (student.active !== true) return;

      const option = document.createElement("option");

      option.value = studentDoc.id;

      option.textContent =
        `${student.roll_no} - ${student.name}`;

      studentSelect.appendChild(option);
    });

  } catch (error) {
    console.error("Error loading students:", error);

    statusMessage.textContent =
      "Failed to load students.";

    studentSelect.innerHTML =
      '<option value="">Unable to load students</option>';
  }
}

// ================= CREATE REGISTRATION REQUEST =================

registrationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const studentId = studentSelect.value;

  if (!studentId) {
    statusMessage.textContent =
      "Please select a student.";

    return;
  }

  const selectedOption =
    studentSelect.options[studentSelect.selectedIndex];

  const selectedStudentName =
    selectedOption.textContent;

  try {
    statusMessage.textContent =
      "Creating RFID registration request...";

    console.log(
      "Selected student ID:",
      studentId
    );

    console.log(
      "Selected student:",
      selectedStudentName
    );

    const requestData = {
      student_id: studentId,
      status: "pending",
      created_at: serverTimestamp()
    };

    const requestReference = await addDoc(
      collection(db, "registration_requests"),
      requestData
    );

    console.log(
      "Registration request created successfully."
    );

    console.log(
      "Request document ID:",
      requestReference.id
    );

    console.log(
      "Student ID:",
      studentId
    );

    statusMessage.textContent =
      "Request created. Scan RFID card using ESP32.";

    // Do NOT reset the form.
    // The selected student will remain visible.

  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    statusMessage.textContent =
      "Failed to create registration request.";
  }
});

// ================= INITIALIZE =================

loadStudents();