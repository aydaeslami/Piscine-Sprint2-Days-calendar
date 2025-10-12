// This is a placeholder file which shows how you can access functions and data defined in other files.
// It can be loaded into index.html.
// Note that when running locally, in order to open a web page which uses modules, you must serve the directory over HTTP e.g. with https://www.npmjs.com/package/http-server
// You can't open the index.html file using a file:// URL.

import { getGreeting } from "./common.mjs";
import daysData from "./days.json" with { type: "json" };
import { getMonths } from "./common.mjs";

let monthsDropdown;
let yearsDropdown;
const today = new Date();
let currentMonth = today.getMonth(); // Current month (0-11)
let currentYear = today.getFullYear(); // Current year (e.g., 2024)


window.onload = function() {

  monthsDropdown = document.getElementById("months-dropdown");
  yearsDropdown = document.getElementById("years-dropdown");
  populateMonthsDropdown(); // Populate months dropdown
  populateYearsDropdown(); // Populate years dropdown
  updateCalendar(); // Initial calendar display

}


// Populate months dropdown
function populateMonthsDropdown() {
    const months = getMonths();
    
    monthsDropdown.innerHTML = ''; // Clear existing options';
  
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

    yearsDropdown.innerHTML = ''; // Clear existing options

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
  function  updateCalendar() {
     const months = getMonths();
     const header = document.querySelector("h1 b");
     header.textContent = `${months[currentMonth]} ${currentYear}`;
  }

