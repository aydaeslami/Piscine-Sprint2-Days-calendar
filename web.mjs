import { getGreeting, getEventsForMonth, getMonths } from "./common.mjs";
import daysData from "./days.json" with { type: "json" };

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
let modalLink;

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
  const startYear = currentYear - 125;
  const endYear = currentYear + 25;

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

// Show modal with event details
async function showEventModal(event) {
  modalTitle.textContent = event.name;
  modalDescription.textContent = "Loading...";
  modal.style.display = "flex";
  
  // Fetch content from descriptionURL
  if (event.descriptionURL) {
    try {
      const response = await fetch(event.descriptionURL);
      const html = await response.text();
      
      // Parse HTML to extract title and text content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Get page title
      const pageTitle = doc.querySelector('title')?.textContent || event.name;
      
      // Get main text content (try common content selectors)
      let content = '';
      const contentSelectors = [
        'article',
        'main',
        '.content',
        '#content',
        'body'
      ];
      
      for (const selector of contentSelectors) {
        const element = doc.querySelector(selector);
        if (element) {
          // Remove script and style tags
          element.querySelectorAll('script, style, nav, header, footer').forEach(el => el.remove());
          content = element.textContent.trim();
          if (content.length > 100) break;
        }
      }
      
      // Display the fetched content
      modalDescription.innerHTML = `
        <p>${content.slice(0, 500)}${content.length > 500 ? '...' : ''}</p>
        <a href="${event.descriptionURL}" target="_blank" style="color: #4CAF50; text-decoration:</a>
      `;
      
    } catch (error) {
      modalDescription.innerHTML = `
        <p>Unable to load content.</p>
        <a href="${event.descriptionURL}" target="_blank" style="color: #4CAF50; text-decoration: underline;">View on website</a>
      `;
    }
  } else if (event.description) {
    modalDescription.textContent = event.description;
  } else {
    modalDescription.textContent = "No description available.";
  }
  
  modalLink.style.display = "none";
}

// Close modal
function closeModal() {
  modal.style.display = "none";
}

// Generate calendar grid
async function generateCalendar(year, month) {
  calendarBody.innerHTML = "";

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const startDay = (firstDay + 6) % 7;
  
  // Calculate exact weeks needed
  const totalCells = startDay + daysInMonth;
  const weeksNeeded = Math.ceil(totalCells / 7);
  
  const events = await getEventsForMonth(year, month);

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
  if (currentMonth === 0) {
    currentMonth = 11;
    currentYear--;
  } else {
    currentMonth--;
  }

  await refreshCalendar();
}

async function handleNextBtn() {
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
}

async function handleYearChange(event) {
  currentYear = Number(event.target.value);
  await refreshCalendar();
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
  modalLink = document.getElementById("modal-link");

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