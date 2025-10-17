
import { getDaysInMonth, getStartDay, getWeeksNeeded } from "./calendar-utils.mjs";
import { getEventsForMonth, getMonths } from "./common.mjs";

//Dom references
let monthsDropdown;
let yearsDropdown;
let calendarBody;
let prevMonthBtn;
let nextMonthBtn;
let modal;
let modalClose;
let modalTitle;
let modalDescription;

//State variables
const today = new Date();
let currentMonth = today.getMonth(); // Current month (0-11)
let currentYear = today.getFullYear(); // Current year (e.g., 2024)

// Populate months dropdown
function populateMonthsDropdown() {
  const months = getMonths(); // get month names from common.mjs

  monthsDropdown.innerHTML = ""; // Clear existing options';

  // Add month options to dropdown
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
  const startYear = currentYear - 125; // start from 125 years ago
  const endYear = currentYear + 25; // up to 25 years in the future

  yearsDropdown.innerHTML = ""; // Clear existing options

  // Add year options to dropdown
  for (let year = startYear; year <= endYear; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearsDropdown.appendChild(option);
  }

  //set default to current year
  yearsDropdown.value = currentYear;
}

// Function  displays a modal with the event details of the calendar event 
async function showEventModal(event) {
  modalTitle.textContent = event.name; // set modal title
  modalDescription.textContent = "Loading...";  // Shows a loading placeholder while fetching content.
  modal.style.display = "flex"; // Makes modal visible

  modalClose.style.display = "block"; // or "inline-block" to show close button

  // Fetch content from descriptionURL
  if (event.descriptionURL) { // Fetch if the event has a descriptionURL
    try {
      const response = await fetch(event.descriptionURL); 
      const html = await response.text();

      // Parses the HTML string into a DOM object so we can query it like a webpage.
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Get page title
      const pageTitle = doc.querySelector("title")?.textContent || event.name;

      // Extract the element from common elements
      let content = "";
      const contentSelectors = [
        "article",
        "main",
        ".content",
        "#content",
        "body",
      ];

      // Search for content in typical elements
      for (const selector of contentSelectors) {
        const element = doc.querySelector(selector);
        if (element) {
          // Remove script and style tags
          element
            .querySelectorAll("script, style, nav, header, footer") // remove unnecessary elements like scripts, styles, nav, header, footer
            .forEach((el) => el.remove());
          content = element.textContent.trim();  // take the first block of meaningful text
          if (content.length > 100) break;
        }
      }

      // Display the fetched content
      // shows up to 500 characters of content 
      // provides a link to the full page 
      modalDescription.innerHTML = ` 
        <p>${content.slice(0, 500)}${content.length > 500 ? "..." : ""}</p>
        <a href="${
          event.descriptionURL
        }" target="_blank" style="color: #4CAF50; text-decoration:</a>
      `;
    } catch (error) {
      modalDescription.innerHTML = `  
        <p>Unable to load content.</p>
        <a href="${event.descriptionURL}" target="_blank" style="color: #4CAF50; text-decoration: underline;">View on website</a>
      `;
    }
  } else if (event.description) { // if no URL, use event.description
    modalDescription.textContent = event.description;
  } else {                        // if neither is available, "No description available."
    modalDescription.textContent = "No description available.";  
  }

}

// Close modal
function closeModal() {
  modal.style.display = "none";
}

// Generate calendar grid
async function generateCalendar(year, month) {
  calendarBody.innerHTML = "";

  const daysInMonth = getDaysInMonth(year, month); // total days in the month
  const startDay = getStartDay(year, month); // first day of the month (0-6)
  const weeksNeeded = getWeeksNeeded(year, month); // total weeks needed for the month
  

  const events = await getEventsForMonth(year, month);
  // console.log("Events for month:", events.descriptionURL);

  let date = 1;

  for (let week = 0; week < weeksNeeded; week++) {
    const row = document.createElement("tr");

    for (let day = 0; day < 7; day++) {
      const cell = document.createElement("td");

      if (week === 0 && day < startDay) {
        cell.textContent = "";
      } else if (date > daysInMonth) {
        cell.textContent = "";
      } else {
        const currentDate = date;
        const event = events.find((e) => e.day === currentDate);

        if (event) {
          cell.innerHTML = `${currentDate}<br><small class="event-name">${event.name}</small>`;
          cell.style.cursor = "pointer";
          cell.classList.add("has-event");

          // Add click handler to show modal
          cell.addEventListener("click", () => showEventModal(event));
        } else {
          cell.textContent = currentDate;
        }

        date++;
      }
      row.appendChild(cell);
    }
    calendarBody.appendChild(row);
  }
}

async function refreshCalendar() {
  // Update header
  const months = getMonths();
  const header = document.querySelector("h1 b");
  header.textContent = `${months[currentMonth]} ${currentYear}`;

  // Update dropdowns
  monthsDropdown.value = currentMonth;
  yearsDropdown.value = currentYear;

  // Generate calendar grid
  await generateCalendar(currentYear, currentMonth);
}

async function handlePreviousBtn() {
  closeModal();
  if (currentMonth === 0) {
    currentMonth = 11;
    currentYear--;
  } else {
    currentMonth--;
  }

  await refreshCalendar();
}

async function handleNextBtn() {
  closeModal();
  if (currentMonth === 11) {
    currentMonth = 0;
    currentYear++;
  } else {
    currentMonth++;
  }

  await refreshCalendar();
}

async function handleMonthChange(event) {
  currentMonth = Number(event.target.value);
  await refreshCalendar();
  closeModal(); // Close modal when month changes
}

async function handleYearChange(event) {
  currentYear = Number(event.target.value);
  await refreshCalendar();
  closeModal(); // Close modal when year changes
}

// Initialize application
async function setup() {
  monthsDropdown = document.getElementById("months-dropdown");
  yearsDropdown = document.getElementById("years-dropdown");
  calendarBody = document.getElementById("calendar-body");
  prevMonthBtn = document.getElementById("previous-month");
  nextMonthBtn = document.getElementById("next-month");
  modal = document.getElementById("event-modal");
  modalClose = document.getElementById("modal-close");
  modalTitle = document.getElementById("modal-title");
  modalDescription = document.getElementById("modal-description");

  prevMonthBtn.addEventListener("click", handlePreviousBtn);
  nextMonthBtn.addEventListener("click", handleNextBtn);
  monthsDropdown.addEventListener("change", handleMonthChange);
  yearsDropdown.addEventListener("change", handleYearChange);
  modalClose.addEventListener("click", closeModal);

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  populateMonthsDropdown();
  populateYearsDropdown();
  await refreshCalendar();
}

window.onload = setup;
