import {
  getDaysInMonth,
  getStartDay,
  getWeeksNeeded,
} from "./calendar-utils.mjs";
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
  modalDescription.textContent = "Loading..."; // Shows a loading placeholder while fetching content.
  modal.style.display = "flex"; // Makes modal visible

  modalClose.style.display = "block"; // or "inline-block" to show close button

  // Fetch content from descriptionURL
  if (event.descriptionURL) {
    // Fetch if the event has a descriptionURL
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
          content = element.textContent.trim(); // take the first block of meaningful text
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
  } else if (event.description) {
    // if no URL, use event.description
    modalDescription.textContent = event.description;
  } else {
    // if neither is available, "No description available."
    modalDescription.textContent = "No description available.";
  }
}

// Close modal
function closeModal() {
  modal.style.display = "none";
}

/**
 * Generate and display the calendar grid for a specific month and year.
 * This function:
 * 1. Clears the existing calendar
 * 2. Calculates how many weeks/rows are needed
 * 3. Creates table cells for each day
 * 4. Adds event information to cells that have commemorative days
 * 5. Makes event cells clickable to open a modal with details
 */
async function generateCalendar(year, month) {
  // Clear any existing calendar content before rebuilding
  calendarBody.innerHTML = "";
  // Calculate calendar dimensions using utility functions
  const daysInMonth = getDaysInMonth(year, month); // Total days in this month (28-31)
  const startDay = getStartDay(year, month); // Which column the 1st falls on (0=Mon, 6=Sun)
  const weeksNeeded = getWeeksNeeded(year, month); // How many rows we need (4-6 weeks)

  // Fetch all commemorative days for this month/year
  const events = await getEventsForMonth(year, month);

  // Track which date number we're currently placing (1, 2, 3, etc.)
  let date = 1;

  // Outer loop: Create one row for each week
  for (let week = 0; week < weeksNeeded; week++) {
    const row = document.createElement("tr");

    // Inner loop: Create 7 cells (one for each day of the week: Mon-Sun)
    for (let day = 0; day < 7; day++) {
      const cell = document.createElement("td");

      // First week: Leave cells blank before the month starts
      // Example: if month starts on Wednesday, leave Mon & Tue blank

      if (week === 0 && day < startDay) {
        cell.textContent = "";
      } // After the month ends: Leave remaining cells blank
      // Example: if month has 30 days, cells after day 30 are blank
      else if (date > daysInMonth) {
        cell.textContent = "";
      } // Regular day: Add the date number and check for events
      else {
        const currentDate = date;

        // Check if this date has a commemorative day
        const event = events.find((e) => e.day === currentDate);

        if (event) {
          // Cell HAS an event: Display date + event name
          cell.innerHTML = `${currentDate}<br><small class="event-name">${event.name}</small>`;
          cell.style.cursor = "pointer"; // Change cursor to indicate it's clickable
          cell.classList.add("has-event"); // Add CSS class for styling

          // Add click handler to show modal
          // Cell has NO event: Just display the date number
          cell.addEventListener("click", () => showEventModal(event));
        } else {
          cell.textContent = currentDate;
        }
        // Move to the next date number for the next iteration
        date++;
      }
      // Add this cell to the current row
      row.appendChild(cell);
    }

    // Add this completed row to the calendar table body
    calendarBody.appendChild(row);
  }
}

/**
 * Refresh the entire calendar display.
 * Called whenever the user changes month/year via buttons or dropdowns.
 * Updates:
 * - The header showing current month/year
 * - The dropdown values
 * - The calendar grid itself
 */

async function refreshCalendar() {
  // Update the page header to show current month and year
  const months = getMonths();
  const header = document.querySelector("h1 b");
  header.textContent = `${months[currentMonth]} ${currentYear}`;

  // Sync the dropdown menus to match current month/year
  // (Important when navigation happens via Previous/Next buttons)
  monthsDropdown.value = currentMonth;
  yearsDropdown.value = currentYear;

  // Regenerate the calendar grid with updated month/year
  await generateCalendar(currentYear, currentMonth);
}

/**
 * Handle "Previous Month" button click.
 * Moves backward one month, wrapping to December of previous year if needed.
 */
async function handlePreviousBtn() {
  // Close any open modal before navigating (better UX)
  closeModal();

  // Check if we're at January - if so, wrap to December of previous year
  if (currentMonth === 0) {
    currentMonth = 11; // December
    currentYear--; // Previous year
  } else {
    // Otherwise, just go back one month
    currentMonth--;
  }
  // Refresh calendar to show the new month
  await refreshCalendar();
}

/**
 * Handle "Next Month" button click.
 * Moves forward one month, wrapping to January of next year if needed.
 */

async function handleNextBtn() {
  // Close any open modal before navigating (better UX)
  closeModal();

  // Check if we're at December - if so, wrap to January of next year
  if (currentMonth === 11) {
    currentMonth = 0; // January
    currentYear++; // Next year
  } else {
    // Otherwise, just go forward one month
    currentMonth++;
  }
  // Refresh calendar to show the new month
  await refreshCalendar();
}
/**
 * Handle month dropdown change.
 * Allows user to jump directly to any month.
 */

async function handleMonthChange(event) {
  // Get selected month from dropdown (comes as string, convert to number)
  currentMonth = Number(event.target.value);
  // Refresh calendar to show the selected month
  await refreshCalendar();
  closeModal(); // Close modal when month changes
}

/**
 * Handle year dropdown change.
 * Allows user to jump directly to any year.
 */

async function handleYearChange(event) {
  // Get selected year from dropdown (comes as string, convert to number)
  currentYear = Number(event.target.value);

  // Refresh calendar to show the selected year
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
