import { getGreeting, getEventsForMonth, getMonths } from "./common.mjs";
import daysData from "./days.json" with { type: "json" };

//Dom references
let monthsDropdown;
let yearsDropdown;
let calendarBody;
let prevMonthBtn;
let nextMonthBtn;

//State variables
const today = new Date();
let currentMonth = today.getMonth(); // Current month (0-11)
let currentYear = today.getFullYear(); // Current year (e.g., 2024)

// Populate months dropdown
function populateMonthsDropdown() {
  const months = getMonths();

  monthsDropdown.innerHTML = ""; // Clear existing options';

  months.forEach((month, index) => {
    const option = document.createElement("option");
    option.value = index; // Use index as value (0-11)
    option.textContent = month;
    monthsDropdown.appendChild(option);
  });

  monthsDropdown.value = currentMonth; // Set current month as selected
}

// Populate years dropdown
function populateYearsDropdown() {
  const startYear = currentYear - 30;
  const endYear = currentYear + 30;

  yearsDropdown.innerHTML = ""; // Clear existing options

  for (let year = startYear; year <= endYear; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearsDropdown.appendChild(option);
  }

  //set default to current year
  yearsDropdown.value = currentYear;
}

// Update the calendar display
function updateCalendar() {
  const months = getMonths();
  const header = document.querySelector("h1 b");
  header.textContent = `${months[currentMonth]} ${currentYear}`;
}

// Generate calendar grid
async function generateCalendar(year, month) {
  calendarBody.innerHTML = "";

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const startDay = (firstDay + 6) % 7;
  //////////////////Aida 
  const events = await getEventsForMonth(year, month);
  //////////////////Aida

  let date = 1;

  for (let week = 0; week < 6; week++) {
    const row = document.createElement("tr");

    for (let day = 0; day < 7; day++) {
      const cell = document.createElement("td");

      if (week === 0 && day < startDay) {
        cell.textContent = "";
      } else if (date > daysInMonth) {
        cell.textContent = "";
      } else {
        cell.textContent = date;
        const event = events.find((e) => e.day === date);
        if (event) {
          cell.innerHTML = `${date}<br><small> ${event.name}</small>`;
        }
        date++;
      }
      row.appendChild(cell);
    }
    calendarBody.appendChild(row);
  }
}
function refreshCalendar() {
  generateCalendar(currentYear, currentMonth);
  updateCalendar();
  monthsDropdown.value = currentMonth;
  yearsDropdown.value = currentYear;
}

function handlePreviousBtn() {
  if (currentMonth === 0) {
    currentMonth = 11;
    currentYear--;
  } else {
    currentMonth--;
  }

  refreshCalendar();
}

function handleNextBtn() {
  if (currentMonth === 11) {
    currentMonth = 0;
    currentYear++;
  } else {
    currentMonth++;
  }

  refreshCalendar();
}

function handleMonthChange(event) {
  currentMonth = Number(event.target.value);
  refreshCalendar();
}
function handleYearChange(event) {
  currentYear = Number(event.target.value);
  refreshCalendar();
}

// Initialize application
function setup() {
  monthsDropdown = document.getElementById("months-dropdown");
  yearsDropdown = document.getElementById("years-dropdown");
  calendarBody = document.getElementById("calendar-body");
  prevMonthBtn = document.getElementById("previous-month");
  nextMonthBtn = document.getElementById("next-month");

  prevMonthBtn.addEventListener("click", handlePreviousBtn);
  nextMonthBtn.addEventListener("click", handleNextBtn);
  monthsDropdown.addEventListener("change", handleMonthChange);
  yearsDropdown.addEventListener("change", handleYearChange);

  populateMonthsDropdown();
  populateYearsDropdown();
  updateCalendar();
  generateCalendar(currentYear, currentMonth);
}

window.onload = setup;
